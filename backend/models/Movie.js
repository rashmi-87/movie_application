import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  imdbID: {
    type: String,
    index: true,
    unique: true,
    sparse: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  releaseDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  genre: {
    type: [String],
    required: true
  },
  director: {
    type: String,
    required: true
  },
  cast: {
    type: [String],
    required: true
  },
  poster: {
    type: String,
    default: ''
  },
  imdbRank: {
    type: Number,
    default: null
  },
}, {
  timestamps: true
});

movieSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Movie', movieSchema);
