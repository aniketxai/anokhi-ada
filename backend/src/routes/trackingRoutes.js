import { Router } from 'express';
import {
  publicTrackOrder,
  shadowfaxWebhook,
  checkPincodeServiceability,
} from '../controllers/shipmentController.js';

const router = Router();

// Customer-facing order tracking (order number + email/phone required).
router.post('/lookup', publicTrackOrder);

// Webhook endpoint (maintained for backward compatibility)
router.post('/webhook/shadowfax', shadowfaxWebhook);

// Check delivery serviceability to pincode
router.get('/serviceability/:pincode', checkPincodeServiceability);

export default router;
