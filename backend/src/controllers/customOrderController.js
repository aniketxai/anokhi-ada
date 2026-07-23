import FormData from 'form-data';
import fetch from 'node-fetch';
import { CustomOrder } from '../models/CustomOrder.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCustomOrderNotificationEmail } from '../utils/mailer.js';

const CLOUDINARY_CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function makeOrderNumber() {
  return `CUSTOM-${Date.now()
    .toString()
    .slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;
}

/**
 * Upload file buffer to Cloudinary
 */
async function uploadToCloudinary(fileBuffer, fileName) {
  try {
    const form = new FormData();
    form.append('file', fileBuffer, { filename: fileName });
    form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
      {
        method: 'POST',
        body: form,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cloudinary upload failed: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Submit a custom order
 * POST /api/custom-orders
 */
export const submitCustomOrder = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    description,
    specifications = '',
    quantity = 1,
    budget = '',
    deadline = '',
  } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !description) {
    res.status(400);
    throw new Error('Name, email, phone, and description are required');
  }

  let fileUrl = null;
  let fileName = null;
  let fileSize = 0;

  // Handle file upload if provided
  if (req.file) {
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      fileUrl = uploadResult.url;
      fileName = req.file.originalname;
      fileSize = req.file.size;
    } catch (uploadError) {
      console.error('File upload error:', uploadError);
      res.status(500);
      throw new Error(`File upload failed: ${uploadError.message}`);
    }
  }

  // Create custom order
  const orderNumber = makeOrderNumber();
  const customOrder = new CustomOrder({
    orderNumber,
    name,
    email,
    phone,
    description,
    specifications,
    quantity,
    budget,
    deadline: deadline ? new Date(deadline) : null,
    fileUrl,
    fileName,
    fileSize,
    status: 'new',
  });

  const savedOrder = await customOrder.save();

  // Send notification emails
  try {
    await sendCustomOrderNotificationEmail(savedOrder);
  } catch (emailError) {
    console.error('Failed to send notification email:', emailError);
    // Don't throw, email is not critical
  }

  res.status(201).json({
    success: true,
    message: 'Custom order submitted successfully',
    orderId: savedOrder._id,
    orderNumber: savedOrder.orderNumber,
  });
});

/**
 * Get all custom orders (admin)
 * GET /api/custom-orders
 */
export const getCustomOrders = asyncHandler(async (req, res) => {
  const { status, sort = '-createdAt' } = req.query;

  let filter = {};
  if (status) {
    filter.status = status;
  }

  const orders = await CustomOrder.find(filter).sort(sort).lean();

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

/**
 * Get custom order by ID
 * GET /api/custom-orders/:id
 */
export const getCustomOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await CustomOrder.findById(id);

  if (!order) {
    res.status(404);
    throw new Error('Custom order not found');
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

/**
 * Update custom order status and quote (admin)
 * PATCH /api/custom-orders/:id
 */
export const updateCustomOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, quote, notes } = req.body;

  const order = await CustomOrder.findById(id);

  if (!order) {
    res.status(404);
    throw new Error('Custom order not found');
  }

  // Update fields if provided
  if (status) order.status = status;
  if (notes) order.notes = notes;

  if (quote) {
    order.quote = {
      price: quote.price,
      estimatedDelivery: quote.estimatedDelivery
        ? new Date(quote.estimatedDelivery)
        : null,
      details: quote.details || '',
    };
  }

  order.updatedAt = new Date();
  const updatedOrder = await order.save();

  res.status(200).json({
    success: true,
    message: 'Custom order updated successfully',
    data: updatedOrder,
  });
});

/**
 * Cancel custom order
 * PATCH /api/custom-orders/:id/cancel
 */
export const cancelCustomOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await CustomOrder.findByIdAndUpdate(
    id,
    { status: 'cancelled', updatedAt: new Date() },
    { new: true }
  );

  if (!order) {
    res.status(404);
    throw new Error('Custom order not found');
  }

  res.status(200).json({
    success: true,
    message: 'Custom order cancelled successfully',
    data: order,
  });
});

/**
 * Delete custom order (admin)
 * DELETE /api/custom-orders/:id
 */
export const deleteCustomOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await CustomOrder.findByIdAndDelete(id);

  if (!order) {
    res.status(404);
    throw new Error('Custom order not found');
  }

  res.status(200).json({
    success: true,
    message: 'Custom order deleted successfully',
  });
});
