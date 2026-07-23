import mongoose from 'mongoose';

const quoteRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '' },
    material: { type: String, default: '' },
    quantity: { type: Number, default: 1, min: 1 },
    notes: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    status: { type: String, enum: ['new', 'in-review', 'quoted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

export const QuoteRequest = mongoose.model('QuoteRequest', quoteRequestSchema);
