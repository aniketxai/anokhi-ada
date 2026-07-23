import mongoose from 'mongoose';

import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { CustomOrder } from '../models/CustomOrder.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { QuoteRequest } from '../models/QuoteRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCustomEmail } from '../utils/mailer.js';

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  if (typeof value === 'number') return value === 1;
  return fallback;
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function deriveStockQty(product) {
  if (typeof product.stockQty === 'number') return product.stockQty;
  return product.inStock ? 25 : 0;
}

function getFeaturedValue(product) {
  if (typeof product.featured === 'boolean') return product.featured;
  return ['best seller', 'popular', 'featured'].includes(String(product.badge || '').toLowerCase());
}

function toProductPayload(body = {}) {
  const images = normalizeList(body.images ?? body.imageUrls);
  const features = normalizeList(body.features);

  return {
    id: String(body.id || '').trim(),
    name: String(body.name || '').trim(),
    category: String(body.category || 'Uncategorized').trim(),
    price: normalizeNumber(body.price),
    originalPrice: body.originalPrice === null || body.originalPrice === '' ? null : normalizeNumber(body.originalPrice),
    rating: normalizeNumber(body.rating),
    reviews: normalizeNumber(body.reviews),
    description: String(body.description || '').trim(),
    features,
    specifications: body.specifications && typeof body.specifications === 'object' ? body.specifications : {},
    images,
    badge: body.badge ? String(body.badge).trim() : null,
    inStock: normalizeBoolean(body.inStock, true),
    stockQty: normalizeNumber(body.stockQty, 0),
    featured: normalizeBoolean(body.featured, false),
    netWeight: typeof body.netWeight === 'undefined' || body.netWeight === '' ? null : normalizeNumber(body.netWeight),
    netWeightUnit: body.netWeightUnit ? String(body.netWeightUnit).trim() : 'g',
  };
}

function buildProductFilter(query = {}) {
  const filter = {};

  if (query.category && query.category !== 'All') {
    filter.category = query.category;
  }

  if (query.inStock === 'true') {
    filter.inStock = true;
  } else if (query.inStock === 'false') {
    filter.inStock = false;
  }

  if (query.featured === 'true') {
    filter.featured = true;
  } else if (query.featured === 'false') {
    filter.featured = false;
  }

  if (query.search) {
    const search = escapeRegex(query.search);
    filter.$or = [
      { id: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  return filter;
}

function buildSort(sort = 'newest') {
  switch (sort) {
    case 'price-asc':
      return { price: 1 };
    case 'price-desc':
      return { price: -1 };
    case 'rating':
      return { rating: -1, reviews: -1 };
    case 'stock':
      return { stockQty: 1, createdAt: -1 };
    case 'featured':
      return { featured: -1, rating: -1, reviews: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

async function loadProducts(query = {}) {
  const filter = buildProductFilter(query);
  const sort = buildSort(query.sort);

  return Product.find(filter).sort(sort).lean();
}

export const getDashboardSummary = asyncHandler(async (req, res) => {
  if (!isDatabaseReady()) {
    res.json({
      success: true,
      data: {
        stats: [],
        revenue: 0,
        recentOrders: [],
        recentQuotes: [],
        recentContacts: [],
        recentActivity: [],
      },
    });
    return;
  }

  const [products, orders, quotes, contacts] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).lean(),
    Order.find().sort({ createdAt: -1 }).limit(8).lean(),
    QuoteRequest.find().sort({ createdAt: -1 }).limit(8).lean(),
    ContactMessage.find().sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const pendingOrders = orders.filter((order) => ['pending', 'paid', 'processing'].includes(order.status)).length;
  const lowStockProducts = products.filter((product) => deriveStockQty(product) <= 5);

  res.json({
    success: true,
    data: {
      stats: [
        { label: 'Products', value: products.length },
        { label: 'Orders', value: orders.length },
        { label: 'Revenue', value: revenue },
        { label: 'Pending Orders', value: pendingOrders },
        { label: 'Low Stock', value: lowStockProducts.length },
        { label: 'Quotes', value: quotes.length },
      ],
      revenue,
      recentOrders: orders.slice(0, 5),
      recentQuotes: quotes.slice(0, 5),
      recentContacts: contacts.slice(0, 5),
      recentActivity: [
        ...orders.slice(0, 3).map((order) => ({
          type: 'order',
          title: `Order ${order.orderNumber} ${order.status}`,
          time: order.createdAt,
        })),
        ...quotes.slice(0, 3).map((quote) => ({
          type: 'quote',
          title: `Quote from ${quote.name}`,
          time: quote.createdAt,
        })),
        ...contacts.slice(0, 3).map((message) => ({
          type: 'contact',
          title: `Message from ${message.name}`,
          time: message.createdAt,
        })),
      ].slice(0, 8),
      lowStockProducts: lowStockProducts.map((product) => ({
        ...product,
        stockQty: deriveStockQty(product),
        featured: getFeaturedValue(product),
      })),
    },
  });
});

export const listAdminProducts = asyncHandler(async (req, res) => {
  const products = await loadProducts(req.query);

  res.json({
    success: true,
    count: products.length,
    data: products.map((product) => ({
      ...product,
      stockQty: deriveStockQty(product),
      featured: getFeaturedValue(product),
    })),
  });
});

export const createAdminProduct = asyncHandler(async (req, res) => {
  const payload = toProductPayload(req.body);

  if (!payload.name || !payload.category || !payload.description || !Number.isFinite(payload.price)) {
    res.status(400);
    throw new Error('Name, category, description, and price are required');
  }

  const existingId = payload.id || `${payload.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-5)}`;
  const duplicate = await Product.findOne({ id: existingId }).lean();

  if (duplicate) {
    res.status(409);
    throw new Error('Product with this ID already exists');
  }

  const product = await Product.create({
    ...payload,
    id: existingId,
    stockQty: payload.stockQty,
    featured: payload.featured,
    inStock: payload.stockQty > 0 ? payload.inStock : false,
  });

  res.status(201).json({ success: true, message: 'Product created', data: product });
});

export const updateAdminProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = toProductPayload(req.body);

  if (!id) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  const existing = await Product.findOne({ id });
  if (!existing) {
    res.status(404);
    throw new Error('Product not found');
  }

  const updated = await Product.findOneAndUpdate(
    { id },
    {
      $set: {
        ...payload,
        id,
        inStock: payload.stockQty > 0 ? payload.inStock : false,
      },
    },
    { new: true, runValidators: true }
  ).lean();

  res.json({ success: true, message: 'Product updated', data: updated });
});

export const deleteAdminProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await Product.deleteOne({ id });

  if (!result.deletedCount) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, message: 'Product deleted' });
});

export const listAdminOrders = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status && req.query.status !== 'All') {
    filter.status = req.query.status;
  }

  if (req.query.search) {
    const search = escapeRegex(req.query.search);
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'shipping.firstName': { $regex: search, $options: 'i' } },
      { 'shipping.lastName': { $regex: search, $options: 'i' } },
      { 'shipping.email': { $regex: search, $options: 'i' } },
    ];
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

  res.json({ success: true, count: orders.length, data: orders });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const updated = await Order.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({ success: true, message: 'Order status updated', data: updated });
});

export const updateOrderPaymentVerification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { verified, screenshotUrl, screenshotName, reference } = req.body;

  const update = {
    ...(typeof verified !== 'undefined' ? { 'payment.verified': Boolean(verified) } : {}),
    ...(typeof screenshotUrl === 'string' ? { 'payment.screenshotUrl': screenshotUrl.trim() } : {}),
    ...(typeof screenshotName === 'string' ? { 'payment.screenshotName': screenshotName.trim() } : {}),
    ...(typeof reference === 'string' ? { 'payment.reference': reference.trim() } : {}),
  };

  if (!Object.keys(update).length) {
    res.status(400);
    throw new Error('No payment fields provided');
  }

  const updated = await Order.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({ success: true, message: 'Payment updated', data: updated });
});

export const listAdminQuotes = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status && req.query.status !== 'All') {
    filter.status = req.query.status;
  }

  if (req.query.search) {
    const search = escapeRegex(req.query.search);
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { material: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
    ];
  }

  const quotes = await QuoteRequest.find(filter).sort({ createdAt: -1 }).lean();

  res.json({ success: true, count: quotes.length, data: quotes });
});

export const updateQuoteStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const updated = await QuoteRequest.findByIdAndUpdate(id, { $set: { status } }, { new: true, runValidators: true }).lean();

  if (!updated) {
    res.status(404);
    throw new Error('Quote request not found');
  }

  res.json({ success: true, message: 'Quote status updated', data: updated });
});

export const listAdminContacts = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status && req.query.status !== 'All') {
    filter.status = req.query.status;
  }

  if (req.query.search) {
    const search = escapeRegex(req.query.search);
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
    ];
  }

  const contacts = await ContactMessage.find(filter).sort({ createdAt: -1 }).lean();

  res.json({ success: true, count: contacts.length, data: contacts });
});

export const updateContactStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const updated = await ContactMessage.findByIdAndUpdate(id, { $set: { status } }, { new: true, runValidators: true }).lean();

  if (!updated) {
    res.status(404);
    throw new Error('Contact message not found');
  }

  res.json({ success: true, message: 'Contact status updated', data: updated });
});

export const replyToContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject, body } = req.body;

  if (!subject || !body) {
    res.status(400);
    throw new Error('Subject and body are required');
  }

  const contact = await ContactMessage.findById(id).lean();

  if (!contact) {
    res.status(404);
    throw new Error('Contact message not found');
  }

  if (!contact.email) {
    res.status(400);
    throw new Error('Contact has no email address');
  }

  // send email to the contact's email
  const sent = await sendCustomEmail({
    to: contact.email,
    subject,
    text: body,
    html: `<pre style="white-space:pre-wrap;">${body}</pre>`,
    replyTo: process.env.SMTP_USER,
  });

  if (!sent) {
    res.status(500);
    throw new Error('Failed to send reply email');
  }

  const updated = await ContactMessage.findByIdAndUpdate(id, { $set: { status: 'replied' } }, { new: true, runValidators: true }).lean();

  res.json({ success: true, message: 'Reply sent', data: updated });
});
export const listAdminCustomOrders = asyncHandler(async (req, res) => {
  const { status, sort = '-createdAt' } = req.query;

  const query = {};
  if (status && status !== 'all' && status !== 'All') {
    query.status = status;
  }

  

  const orders = await CustomOrder.find(query)
    .sort(sort)
    .lean()
    .maxTimeMS(5000);

  

  res.json({ success: true, data: orders || [] });
});

export const updateCustomOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const validStatuses = ['new', 'in-review', 'quoted', 'accepted', 'completed', 'rejected'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Allowed: ${validStatuses.join(', ')}`);
  }

  const updated = await CustomOrder.findByIdAndUpdate(id, { $set: { status } }, { new: true, runValidators: true }).lean();

  if (!updated) {
    res.status(404);
    throw new Error('Custom order not found');
  }

  res.json({ success: true, message: 'Custom order status updated', data: updated });
});

export const replyToCustomOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject, body } = req.body;

  if (!subject || !body) {
    res.status(400);
    throw new Error('Subject and body are required');
  }

  const order = await CustomOrder.findById(id).lean();

  if (!order) {
    res.status(404);
    throw new Error('Custom order not found');
  }

  if (!order.email) {
    res.status(400);
    throw new Error('Custom order has no email address');
  }

  const sent = await sendCustomEmail({
    to: order.email,
    subject: `${subject}`,
    text: body,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h3>${subject}</h3>
        <pre style="white-space:pre-wrap; font-family: Arial, sans-serif;">${body}</pre>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">
          This is a response to your custom order request. Please review and get back to us if you have any questions.
        </p>
      </div>
    `,
    replyTo: process.env.SMTP_USER,
  });

  if (!sent) {
    res.status(500);
    throw new Error('Failed to send reply email');
  }

  const updated = await CustomOrder.findByIdAndUpdate(id, { $set: { status: 'quoted' } }, { new: true, runValidators: true }).lean();

  res.json({ success: true, message: 'Quote sent successfully', data: updated });
});
export const replyToQuote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject, body } = req.body;

  if (!subject || !body) {
    res.status(400);
    throw new Error('Subject and body are required');
  }

  const quote = await QuoteRequest.findById(id).lean();

  if (!quote) {
    res.status(404);
    throw new Error('Quote request not found');
  }

  if (!quote.email) {
    res.status(400);
    throw new Error('Quote request has no email address');
  }

  const sent = await sendCustomEmail({
    to: quote.email,
    subject,
    text: body,
    html: `<pre style="white-space:pre-wrap;">${body}</pre>`,
    replyTo: process.env.SMTP_USER,
  });

  if (!sent) {
    res.status(500);
    throw new Error('Failed to send reply email');
  }

  const updated = await QuoteRequest.findByIdAndUpdate(id, { $set: { status: 'quoted' } }, { new: true, runValidators: true }).lean();

  res.json({ success: true, message: 'Reply sent', data: updated });
});