import mongoose from 'mongoose';

const ScoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  wpm: {
    type: Number,
    required: true,
    min: 0,
    max: 500
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Score || mongoose.model('Score', ScoreSchema);