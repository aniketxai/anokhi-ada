import { Router } from 'express';
import { createOrder, cancelOrder } from '../controllers/orderController.js';

const router = Router();

router.post('/', createOrder);
router.patch('/:orderId/cancel', cancelOrder);

export default router;
