import mongoose from 'mongoose';

const specificationSchema = new mongoose.Schema({}, { _id: false, strict: false });

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: null },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 1 },
    description: { type: String, required: true },
    features: [{ type: String }],
    specifications: { type: specificationSchema, default: {} },
    // Net weight is admin-only metadata used for price calculations
    netWeight: { type: Number, default: null },
    netWeightUnit: { type: String, default: 'g' },
    images: [{ type: String }],
    badge: { type: String, default: null },
    inStock: { type: Boolean, default: true },
    stockQty: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
