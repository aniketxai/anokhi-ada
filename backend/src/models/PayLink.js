import mongoose from 'mongoose';

const PayLinkSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  usedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-expire documents from MongoDB after expiry (cleanup)
PayLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('PayLink', PayLinkSchema);