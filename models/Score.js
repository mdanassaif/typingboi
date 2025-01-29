import mongoose from 'mongoose';

const ScoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  },
  wpm: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    required: true
  },
  rawWpm: {
    type: Number,
    required: true
  },
  submissionId: {
    type: String,
    required: true,
    unique: true  // Add unique constraint
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Score || mongoose.model('Score', ScoreSchema);