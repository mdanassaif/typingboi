import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  rawWpm: { type: Number, required: false }, // Make it optional
  createdAt: { type: Date, default: Date.now },
});

const Score = mongoose.models.Score || mongoose.model('Score', scoreSchema);

export default Score;