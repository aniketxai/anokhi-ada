import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getMyProfile,
  updateMyProfile,
  getCustomerOrders,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/customerAuthController.js';
import { protectCustomer } from '../utils/customerAuth.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protectCustomer, getMyProfile);
router.put('/me', protectCustomer, updateMyProfile);
router.get('/orders', protectCustomer, getCustomerOrders);

// Forgot password — 3 step OTP flow
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;
