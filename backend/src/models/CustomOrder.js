import mongoose from 'mongoose';

const customOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    description: { type: String, required: true },
    specifications: { type: String, default: '' },
    quantity: { type: Number, default: 1, min: 1 },
    budget: { type: String, default: '' },
    deadline: { type: Date, default: null },
    fileUrl: { type: String, default: null },
    fileName: { type: String, default: null },
    fileSize: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['new', 'in-review', 'quoted', 'accepted', 'completed', 'rejected'],
      default: 'new',
    },
    quote: {
      price: { type: Number, default: null },
      estimatedDelivery: { type: Date, default: null },
      details: { type: String, default: '' },
    },
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const CustomOrder = mongoose.model('CustomOrder', customOrderSchema);
