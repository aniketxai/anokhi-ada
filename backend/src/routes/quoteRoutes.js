import { Router } from 'express';
import { createQuoteRequest } from '../controllers/quoteController.js';

const router = Router();

router.post('/', createQuoteRequest);

export default router;
