import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const shippingSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, required: true },
    apartment: { type: String, default: '' },
    landmark: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    zipCode: { type: String, required: true },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    method: { type: String, default: 'card' },
    last4: { type: String, default: '' },
    reference: { type: String, default: '' },
    screenshotUrl: { type: String, default: '' },
    screenshotName: { type: String, default: '' },
    verified: { type: Boolean, default: false },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    items: { type: [orderItemSchema], required: true },
    shipping: { type: shippingSchema, required: true },
    payment: { type: paymentSchema, default: {} },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    codCharge: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
