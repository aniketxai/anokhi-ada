import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signCustomerToken, signResetToken, verifyToken } from '../utils/customerAuth.js';
import { generateOtp, hashOtp, getOtpExpiry, isOtpExpired, OTP_CONFIG } from '../utils/otp.js';
import { sendCustomEmail } from '../utils/mailer.js';

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    zipCode: user.zipCode || '',
    isVerified: user.isVerified,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt,
  };
}

function otpEmailHtml({ name, code, purpose }) {
  const heading = purpose === 'signup_verification' ? 'Verify your email' : 'Reset your password';
  const intro =
    purpose === 'signup_verification'
      ? 'Use the code below to verify your email and activate your account.'
      : 'Use the code below to reset your password. If you did not request this, you can safely ignore this email.';

  return `
    <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;color:#111827;">
      <div style="max-width:480px;margin:auto;background:white;border-radius:16px;overflow:hidden;">
        <div style="background:#111827;color:white;padding:24px;text-align:center;">
          <h1 style="margin:0;font-size:22px;">${heading}</h1>
        </div>
        <div style="padding:24px;text-align:center;">
          <p>Hi ${name || 'there'},</p>
          <p>${intro}</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:6px;margin:24px 0;color:#111827;">${code}</p>
          <p style="color:#6b7280;font-size:13px;">This code expires in ${OTP_CONFIG.OTP_EXPIRY_MINUTES} minutes.</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * POST /api/customer-auth/register
 * body: { name, email, phone, password }
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body || {};

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    res.status(409);
    throw new Error('An account with this email already exists. Please log in instead.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone?.trim() || '',
    passwordHash,
    isVerified: true,
  });

  sendCustomEmail({
    to: user.email,
    subject: 'Welcome to Anokhi Ada 🎉',
    html: `<div style="font-family:Arial,sans-serif;padding:24px;"><p>Hi ${user.name},</p><p>Your account has been created successfully. Happy shopping!</p></div>`,
  }).catch(() => {});

  const token = signCustomerToken(user);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: publicUser(user),
  });
});

/**
 * POST /api/customer-auth/login
 * body: { email, password }
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.isBlocked) {
    res.status(403);
    throw new Error('This account has been blocked. Please contact support.');
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signCustomerToken(user);

  res.json({ success: true, message: 'Login successful', token, user: publicUser(user) });
});

/**
 * GET /api/customer-auth/me  (requires Authorization: Bearer <token>)
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    res.status(404);
    throw new Error('Account not found');
  }
  res.json({ success: true, data: publicUser(user) });
});

/**
 * PUT /api/customer-auth/me  (requires Authorization: Bearer <token>)
 * body: { name, phone, address, city, state, zipCode }
 */
export const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, city, state, zipCode } = req.body || {};
  const user = await User.findById(req.user.userId);
  if (!user) {
    res.status(404);
    throw new Error('Account not found');
  }

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (address !== undefined) user.address = address.trim();
  if (city !== undefined) user.city = city.trim();
  if (state !== undefined) user.state = state.trim();
  if (zipCode !== undefined) user.zipCode = zipCode.trim();

  await user.save();
  res.json({ success: true, message: 'Profile updated successfully', data: publicUser(user) });
});

/**
 * GET /api/customer-auth/orders  (requires Authorization: Bearer <token>)
 * Returns all orders placed by this customer.
 */
export const getCustomerOrders = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    res.status(404);
    throw new Error('Account not found');
  }

  const orders = await Order.find({
    $or: [{ 'shipping.email': user.email.toLowerCase() }, { user: user._id }],
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: orders });
});

/**
 * STEP 1 — POST /api/customer-auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (user) {
    const code = generateOtp();
    user.otp = {
      codeHash: hashOtp(code),
      purpose: 'password_reset',
      expiresAt: getOtpExpiry(),
      attempts: 0,
      verified: false,
    };
    await user.save();

    await sendCustomEmail({
      to: user.email,
      subject: 'Your password reset code — Anokhi Ada',
      html: otpEmailHtml({ name: user.name, code, purpose: 'password_reset' }),
    });
  }

  res.json({
    success: true,
    message: 'If an account exists for that email, a verification code has been sent.',
  });
});

/**
 * STEP 2 — POST /api/customer-auth/verify-otp
 */
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body || {};
  if (!email || !otp) {
    res.status(400);
    throw new Error('Email and OTP are required');
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (!user || !user.otp?.codeHash) {
    res.status(400);
    throw new Error('Invalid or expired code. Please request a new one.');
  }

  if (isOtpExpired(user.otp.expiresAt)) {
    res.status(400);
    throw new Error('This code has expired. Please request a new one.');
  }

  if (user.otp.attempts >= OTP_CONFIG.MAX_OTP_ATTEMPTS) {
    res.status(429);
    throw new Error('Too many incorrect attempts. Please request a new code.');
  }

  if (hashOtp(otp) !== user.otp.codeHash) {
    user.otp.attempts += 1;
    await user.save();
    res.status(400);
    throw new Error('Incorrect code. Please try again.');
  }

  user.otp.verified = true;
  const resetToken = signResetToken(user);
  user.resetToken = resetToken;
  user.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  res.json({ success: true, message: 'Code verified', resetToken });
});

/**
 * STEP 3 — POST /api/customer-auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, resetToken, newPassword } = req.body || {};
  if (!email || !resetToken || !newPassword) {
    res.status(400);
    throw new Error('Email, reset token and new password are required');
  }
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (!user || !user.otp?.verified || user.resetToken !== resetToken) {
    res.status(400);
    throw new Error('Invalid or expired reset request. Please start again.');
  }

  if (!user.resetTokenExpiresAt || isOtpExpired(user.resetTokenExpiresAt)) {
    res.status(400);
    throw new Error('This reset session has expired. Please start again.');
  }

  try {
    verifyToken(resetToken);
  } catch {
    res.status(400);
    throw new Error('Invalid or expired reset token. Please start again.');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.otp = { codeHash: '', purpose: 'password_reset', expiresAt: null, attempts: 0, verified: false };
  user.resetToken = '';
  user.resetTokenExpiresAt = null;
  await user.save();

  sendCustomEmail({
    to: user.email,
    subject: 'Your password was changed — Anokhi Ada',
    html: `<div style="font-family:Arial,sans-serif;padding:24px;"><p>Hi ${user.name},</p><p>Your account password was just changed. If this wasn't you, please contact support immediately.</p></div>`,
  }).catch(() => {});

  res.json({ success: true, message: 'Password reset successfully. Please log in with your new password.' });
});

/**
 * ADMIN — GET /api/admin/users
 */
export const adminListUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const filter = q
    ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') }] }
    : {};

  const users = await User.find(filter).select('-passwordHash -otp -resetToken').sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

/**
 * ADMIN — PATCH /api/admin/users/:id/status
 */
export const adminUpdateUserStatus = asyncHandler(async (req, res) => {
  const { isBlocked } = req.body || {};
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: !!isBlocked }, { new: true }).select(
    '-passwordHash -otp -resetToken'
  );
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, message: `User ${isBlocked ? 'blocked' : 'unblocked'}`, data: publicUser(user) });
});
