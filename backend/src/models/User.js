import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    codeHash: { type: String, default: '' },
    purpose: { type: String, enum: ['signup_verification', 'password_reset'], default: 'password_reset' },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    zipCode: { type: String, default: '', trim: true },
    passwordHash: { type: String, required: true },

    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    otp: { type: otpSchema, default: () => ({}) },

    resetToken: { type: String, default: '' },
    resetTokenExpiresAt: { type: Date },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
