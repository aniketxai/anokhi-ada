import { Router } from 'express';
import {
  createAdminProduct,
  deleteAdminProduct,
  getDashboardSummary,
  listAdminContacts,
  listAdminOrders,
  listAdminProducts,
  listAdminQuotes,
  updateContactStatus,
  updateOrderStatus,
  updateOrderPaymentVerification,
  updateAdminProduct,
  updateQuoteStatus,
  replyToContact,
  replyToQuote,
  listAdminCustomOrders,
  updateCustomOrderStatus,
  replyToCustomOrder,
} from '../controllers/adminController.js';

const router = Router();

router.get('/summary', getDashboardSummary);

router.get('/products', listAdminProducts);
router.post('/products', createAdminProduct);
router.put('/products/:id', updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);

router.get('/orders', listAdminOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.patch('/orders/:id/payment', updateOrderPaymentVerification);

router.get('/custom-orders', listAdminCustomOrders);
router.patch('/custom-orders/:id/status', updateCustomOrderStatus);
router.post('/custom-orders/:id/reply', replyToCustomOrder);

router.get('/quotes', listAdminQuotes);
router.patch('/quotes/:id/status', updateQuoteStatus);

router.get('/contacts', listAdminContacts);
router.patch('/contacts/:id/status', updateContactStatus);
router.post('/contacts/:id/reply', replyToContact);
router.post('/quotes/:id/reply', replyToQuote);

export default router;