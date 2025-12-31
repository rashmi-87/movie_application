import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Movie from '../models/Movie.js';
import ImdbId from '../models/ImdbId.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { movieQueue } from '../services/queue.js';
import mongoose from 'mongoose';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Get all movies with pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    console.log('📋 GET /api/movies - Fetching movies from MongoDB...');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log(`📋 Query params: page=${page}, limit=${limit}, skip=${skip}`);

    const movies = await Movie.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Movie.countDocuments();

    console.log(`📋 Found ${movies.length} movies on page ${page}, total: ${total}`);
    console.log('📋 Movie titles:', movies.map(m => m.title));

    res.json({
      movies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ GET /api/movies failed:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/import-seed', authenticate, authorize('admin'), async (req, res) => {
  try {
    const idsPath = join(__dirname, '../data/top250-ids.json');
    const idsData = fs.readFileSync(idsPath, 'utf8');
    const list = JSON.parse(idsData);
    let inserted = 0;
    for (let i = 0; i < list.length; i++) {
      const imdbID = list[i];
      await ImdbId.updateOne(
        { imdbID },
        { $setOnInsert: { imdbID, rank: i + 1, imported: false } },
        { upsert: true }
      );
      inserted++;
    }
    try {
      fs.unlinkSync(idsPath);
    } catch (_) {}
    res.json({ message: 'Seeded IMDb IDs and deleted source JSON', count: inserted });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/import', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Bootstrap IDs from JSON if collection empty
    const idsCount = await ImdbId.countDocuments();
    if (idsCount === 0) {
      const idsPath = join(__dirname, '../data/top250-ids.json');
      if (fs.existsSync(idsPath)) {
        const idsData = fs.readFileSync(idsPath, 'utf8');
        const list = JSON.parse(idsData);
        for (let i = 0; i < list.length; i++) {
          const imdbID = list[i];
          await ImdbId.updateOne(
            { imdbID },
            { $setOnInsert: { imdbID, rank: i + 1, imported: false } },
            { upsert: true }
          );
        }
        try { fs.unlinkSync(idsPath); } catch (_) {}
      }
    }
    const importedIds = await Movie.find({}, 'imdbID').lean();
    const importedSet = new Set(importedIds.map(m => m.imdbID).filter(Boolean));
    const nextIds = await ImdbId.find({ imported: false }).sort({ rank: 1 }).limit(10).lean();
    const toQueue = nextIds.filter(x => !importedSet.has(x.imdbID));
    for (let i = 0; i < toQueue.length; i++) {
      const id = toQueue[i].imdbID;
      await movieQueue.add('importOmdb', { imdbID: id }, {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        timeout: 15000
      });
    }
    res.json({ message: 'Queued import jobs', count: toQueue.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sorted movies
router.get('/sorted', [
  query('sortBy').isIn(['title', 'rating', 'releaseDate', 'duration']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sortBy, order = 'asc' } = req.query;
    const sortOrder = order === 'desc' ? -1 : 1;

    const movies = await Movie.find().sort({ [sortBy]: sortOrder });

    res.json({ movies });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search movies
router.get('/search', [
  query('q').trim().isLength({ min: 1 }).withMessage('Search query is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q } = req.query;

    const movies = await Movie.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    });

    res.json({ movies });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add movie (admin only)
router.post('/', authenticate, authorize('admin'), [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('rating').isFloat({ min: 0, max: 10 }).withMessage('Rating must be between 0 and 10'),
  body('releaseDate').isISO8601().withMessage('Invalid release date'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('genre').isArray({ min: 1 }).withMessage('At least one genre is required'),
  body('director').trim().isLength({ min: 1 }).withMessage('Director is required'),
  body('cast').isArray({ min: 1 }).withMessage('At least one cast member is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Add to queue for processing
    await movieQueue.add('createMovie', req.body);

    res.status(202).json({ message: 'Movie creation queued successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update movie (admin only)
router.put('/:id', authenticate, authorize('admin'), [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('rating').optional().isFloat({ min: 0, max: 10 }).withMessage('Rating must be between 0 and 10'),
  body('releaseDate').optional().isISO8601().withMessage('Invalid release date'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({ movie });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete movie (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Import Status (Admin Only)
router.get('/import-status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const importedCount = await ImdbId.countDocuments({ imported: true });
    const totalCount = await ImdbId.countDocuments({});
    const remainingCount = totalCount - importedCount;

    // Get queue counts
    const queueCounts = await movieQueue.getJobCounts();

    res.json({
      imported: importedCount,
      total: totalCount,
      remaining: remainingCount,
      progress: Math.round((importedCount / totalCount) * 100),
      queue: queueCounts,
      recentMovies: await Movie.find().sort({ createdAt: -1 }).limit(5).select('title imdbID')
    });
  } catch (error) {
    console.error('❌ Status check failed:', error.message);
    res.status(500).json({ message: 'Server error during status check' });
  }
});


// Get single movie by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json({ movie });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid ID' });
  }
});

// Diagnostics: quick counts and samples (no auth)
router.get('/debug/count', async (req, res) => {
  try {
    const total = await Movie.countDocuments();
    const latest = await Movie.find().sort({ createdAt: -1 }).limit(5);
    const dbName = (mongoose.connection && mongoose.connection.name) || 'unknown';
    const collection = Movie.collection.collectionName;
    res.json({
      ok: true,
      dbName,
      collection,
      total,
      latestSampleCount: latest.length,
      latest,
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Debug count failed', error: err.message });
  }
});

// Diagnostics: raw IDs and titles (no auth)
router.get('/debug/ids', async (req, res) => {
  try {
    const docs = await Movie.find({}, { _id: 1, title: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(20);
    const dbName = (mongoose.connection && mongoose.connection.name) || 'unknown';
    const collection = Movie.collection.collectionName;
    res.json({ ok: true, dbName, collection, count: docs.length, docs });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Debug ids failed', error: err.message });
  }
});

// Diagnostics: queue job counts
router.get('/debug/queue', async (req, res) => {
  try {
    const counts = await movieQueue.getJobCounts();
    res.json({ ok: true, counts });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Debug queue failed', error: err.message });
  }
});

export default router;
