import Queue from 'bull';
import Movie from '../models/Movie.js';
import ImdbId from '../models/ImdbId.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const OMDB_API_KEY = '7a97f24c';

// Build Redis configuration from env, with optional TLS support
const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  lazyConnect: false,
  // Enable TLS for providers that require it (e.g., some Redis Cloud setups)
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined
};

// Allow using a single REDIS_URL (e.g., rediss://:password@host:port) if provided
const redisOption = process.env.REDIS_URL ? process.env.REDIS_URL : redisConfig;

// Safe config log (do not print secrets)
try {
  const logPayload = process.env.REDIS_URL
    ? { url: 'REDIS_URL', tls: !!(redisConfig.tls) }
    : { host: redisConfig.host, port: redisConfig.port, hasPassword: !!redisConfig.password, tls: !!(redisConfig.tls) };
  console.log('🔗 Redis config:', logPayload);
} catch (_) {}

export const movieQueue = new Queue('movie processing', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 10,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  },
  settings: {
    stalledInterval: 30 * 1000,
    maxStalledCount: 1,
  }
});

movieQueue.client.on('connect', () => {
  console.log('✅ Redis connected successfully!');
});

movieQueue.client.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

// Process jobs with high concurrency for fast 10-movie processing
movieQueue.process('createMovie', async (job) => {
  let movieData = job.data;
  console.log(`🎬 QUEUE WORKER: Processing job ${job.id}`);
  
  try {
    // If we have an IMDb ID but no title, fetch from OMDb
    if (movieData.imdbID && !movieData.title) {
      console.log(`🌍 QUEUE WORKER: Fetching details for ${movieData.imdbID} from OMDb...`);
      const response = await axios.get("http://www.omdbapi.com/", {
        params: {
          i: movieData.imdbID,
          apikey: OMDB_API_KEY
        },
        timeout: 10000 // 10 second timeout
      });
      const data = response.data;

      if (data.Response === 'False') {
        throw new Error(`OMDb Error: ${data.Error}`);
      }

      movieData = {
        title: data.Title,
        description: data.Plot,
        rating: parseFloat(data.imdbRating) || 0,
        releaseDate: new Date(data.Released),
        duration: parseInt(data.Runtime) || 0,
        genre: data.Genre ? data.Genre.split(',').map(g => g.trim()) : [],
        director: data.Director,
        cast: data.Actors ? data.Actors.split(',').map(a => a.trim()) : [],
        poster: data.Poster !== 'N/A' ? data.Poster : '',
        imdbRank: movieData.rank || null,
        imdbID: movieData.imdbID
      };
    }

    console.log(`🎬 QUEUE WORKER: Processing movie "${movieData.title}"`);

    // Fast database check without retries for speed
    const existingMovie = await Movie.findOne({ imdbID: movieData.imdbID }).maxTimeMS(3000);
    
    if (existingMovie) {
      console.log(`⏭️  QUEUE WORKER: Movie "${movieData.title}" already exists, skipping`);
      return { skipped: true, movie: existingMovie };
    }

    console.log(`💾 QUEUE WORKER: Creating new movie "${movieData.title}" in MongoDB...`);
    const movie = new Movie(movieData);
    await movie.save();
    
    console.log(`✅ QUEUE WORKER: Successfully saved "${movie.title}" to MongoDB (ID: ${movie._id})`);
    return { created: true, movie };
  } catch (error) {
    console.error(`❌ QUEUE WORKER: Error processing movie:`, error.message);
    throw error;
  }
});

movieQueue.process('importOmdb', 2, async (job) => {
  const { imdbID } = job.data;
  console.log(`🎬 QUEUE WORKER: Importing ${imdbID}`);
  const client = axios.create({
    baseURL: 'http://www.omdbapi.com/',
    timeout: 8000
  });
  try {
    let attempt = 0;
    let data = null;
    while (attempt < 3) {
      try {
        const res = await client.get('', { params: { i: imdbID, apikey: OMDB_API_KEY } });
        data = res.data;
        if (data && data.Response !== 'False') break;
        throw new Error(data?.Error || 'OMDb error');
      } catch (e) {
        attempt++;
        await new Promise(r => setTimeout(r, 1000 * attempt));
        if (attempt >= 3) throw e;
      }
    }
    const title = data.Title || 'Untitled';
    const plot = data.Plot && data.Plot !== 'N/A' ? data.Plot : 'No description available';
    const director = data.Director && data.Director !== 'N/A' ? data.Director : 'Unknown';
    const actors = data.Actors && data.Actors !== 'N/A' ? data.Actors.split(',').map(s => s.trim()).filter(Boolean) : ['Unknown'];
    const genres = data.Genre && data.Genre !== 'N/A' ? data.Genre.split(',').map(s => s.trim()).filter(Boolean) : ['Unknown'];
    let duration = 90;
    if (data.Runtime && data.Runtime !== 'N/A') {
      const num = parseInt(String(data.Runtime), 10);
      duration = Number.isFinite(num) && num > 0 ? num : 90;
    }
    const released = data.Released && data.Released !== 'N/A' ? new Date(data.Released) : new Date();
    const rating = data.imdbRating && data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : 0;
    const poster = data.Poster && data.Poster !== 'N/A' ? data.Poster : '';
    const payload = {
      imdbID,
      title,
      description: plot,
      rating,
      releaseDate: released,
      duration,
      genre: genres,
      director,
      cast: actors,
      poster
    };
    const movie = await Movie.findOneAndUpdate(
      { imdbID },
      { $set: payload },
      { upsert: true, new: true }
    );
    await ImdbId.updateOne(
      { imdbID },
      { $set: { imported: true, lastProcessedAt: new Date(), lastError: '', attempts: 0 } }
    );
    console.log(`✅ QUEUE WORKER: Imported ${imdbID} -> ${movie.title}`);
    return { created: true, movie };
  } catch (err) {
    await ImdbId.updateOne(
      { imdbID },
      { $inc: { attempts: 1 }, $set: { lastError: err.message } }
    );
    console.error(`❌ QUEUE WORKER: Failed import ${imdbID}: ${err.message}`);
    throw err;
  }
});

movieQueue.on('completed', (job, result) => {
  if (result.created) {
    console.log(`🎉 QUEUE JOB COMPLETED: Movie "${result.movie.title}" successfully added to database`);
  } else if (result.skipped) {
    console.log(`⏭️  QUEUE JOB COMPLETED: Movie "${result.movie.title}" was skipped (already exists)`);
  }
});

movieQueue.on('failed', (job, err) => {
  console.error(`💥 QUEUE JOB FAILED: Job ${job.id} failed for movie "${job.data.title}":`, err.message);
});

movieQueue.on('active', (job) => {
  console.log(`🔄 QUEUE JOB ACTIVE: Processing job ${job.id} for movie "${job.data.title}"`);
});

console.log('✅ Movie queue setup complete!');
