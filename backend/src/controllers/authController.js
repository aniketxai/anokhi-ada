import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'shiv@123';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const adminLogin = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  if (password !== ADMIN_PASSWORD) {
    res.status(401);
    throw new Error('Invalid password');
  }

  // Create JWT token
  const token = jwt.sign(
    { admin: true, timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    message: 'Login successful',
    token,
  });
});

export const verifyAdminToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    res.status(401);
    throw new Error('No token provided');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Invalid or expired token');
  }
});
