import { QuoteRequest } from '../models/QuoteRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createQuoteRequest = asyncHandler(async (req, res) => {
  const { name, email, phone = '', material = '', quantity = 1, notes = '', fileUrl = '' } = req.body;

  if (!name || !email) {
    res.status(400);
    throw new Error('Name and email are required');
  }

  const quoteRequest = await QuoteRequest.create({
    name,
    email,
    phone,
    material,
    quantity,
    notes,
    fileUrl,
  });

  res.status(201).json({
    success: true,
    message: 'Quote request submitted',
    data: quoteRequest,
  });
});
