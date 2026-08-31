import mongoose from 'mongoose';

const adminAuthSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'admin', unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const AdminAuth = mongoose.model('AdminAuth', adminAuthSchema);
