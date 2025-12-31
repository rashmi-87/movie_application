import mongoose from 'mongoose';

const imdbIdSchema = new mongoose.Schema({
  imdbID: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  rank: {
    type: Number,
    default: null,
    index: true
  },
  imported: {
    type: Boolean,
    default: false,
    index: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastError: {
    type: String,
    default: ''
  },
  lastProcessedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('ImdbId', imdbIdSchema);

