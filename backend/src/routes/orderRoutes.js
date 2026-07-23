import { Router } from 'express';
import {
  createOrder,
  cancelOrder,
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  markOrderPaymentFailed,
} from '../controllers/orderController.js';

const router = Router();

router.get('/razorpay-key', getRazorpayKey);
router.post('/create-razorpay-order', createRazorpayOrder);
router.post('/verify-razorpay-payment', verifyRazorpayPayment);
router.post('/razorpay-webhook', handleRazorpayWebhook);
router.post('/mark-failed', markOrderPaymentFailed);

router.post('/', createOrder);
router.patch('/:orderId/cancel', cancelOrder);

export default router;
