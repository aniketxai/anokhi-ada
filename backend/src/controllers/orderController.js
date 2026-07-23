import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOrderNotificationEmail, sendOrderCancellationEmail } from '../utils/mailer.js';
import { razorpayInstance, isRazorpayConfigured, key_id, key_secret } from '../config/razorpay.js';

function makeOrderNumber() {
  return `SBX-${Date.now()
    .toString()
    .slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;
}

const getRazorpayKey = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    keyId: key_id || '',
    isConfigured: isRazorpayConfigured,
  });
});

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shipping,
    shippingFee = 0,
    isCeoDelivery = false,
    ceoDeliveryFee = 0,
    appliedCoupon = null,
    discountAmount = 0,
    notes = '',
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Order items are required');
  }

  if (
    !shipping?.firstName ||
    !shipping?.lastName ||
    !shipping?.phone ||
    !shipping?.address ||
    !shipping?.city ||
    !shipping?.state ||
    !shipping?.zipCode
  ) {
    res.status(400);
    throw new Error('Shipping information is incomplete');
  }

  const normalizedItems = items.map((item) => ({
    productId: String(item.productId ?? item.id ?? ''),
    name: String(item.name ?? ''),
    price: Number(item.price),
    quantity: Number(item.quantity),
    image: String(item.image ?? item.images?.[0] ?? ''),
  }));

  const normalizedShipping = {
    firstName: String(shipping.firstName).trim(),
    lastName: String(shipping.lastName).trim(),
    email: String(shipping.email ?? '').trim(),
    phone: String(shipping.phone ?? '').trim(),
    address: String(shipping.address).trim(),
    apartment: String(shipping.apartment ?? '').trim(),
    landmark: String(shipping.landmark ?? '').trim(),
    city: String(shipping.city).trim(),
    state: String(shipping.state).trim(),
    country: String(shipping.country ?? 'India').trim(),
    zipCode: String(shipping.zipCode).trim(),
  };

  const subtotal = normalizedItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const calculatedBaseShipping = subtotal < 399 ? 80 : 0;
  const calculatedCeoFee = isCeoDelivery ? 5000 : 0;
  const calculatedShippingFee = calculatedBaseShipping + calculatedCeoFee;
  const calculatedDiscount = Math.max(0, Number(discountAmount) || 0);

  const total = Math.max(0, subtotal - calculatedDiscount) + calculatedShippingFee;
  const amountInPaise = Math.round(total * 100);

  const orderNumber = makeOrderNumber();

  const order = await Order.create({
    orderNumber,
    items: normalizedItems,
    shipping: normalizedShipping,
    payment: {
      method: 'razorpay',
      status: 'pending',
      verified: false,
    },
    subtotal,
    shippingFee: calculatedShippingFee,
    codCharge: 0,
    total,
    status: 'pending',
    notes: String(notes ?? '').trim(),
  });

  let razorpayOrderId = '';

  if (isRazorpayConfigured && razorpayInstance) {
    try {
      const rzpOrder = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          orderId: order._id.toString(),
          orderNumber,
          customerEmail: normalizedShipping.email,
        },
      });

      razorpayOrderId = rzpOrder.id;
    } catch (err) {
      console.error('[Razorpay] Order creation failed:', err);
      order.payment.status = 'failed';
      order.payment.failureReason = err.message || 'Razorpay order creation failed';
      await order.save();
      res.status(500);
      throw new Error(`Razorpay Order creation failed: ${err.message}`);
    }
  } else {
    razorpayOrderId = `rzp_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  order.payment.razorpayOrderId = razorpayOrderId;
  await order.save();

  res.status(201).json({
    success: true,
    message: 'Razorpay order created successfully',
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: key_id || 'rzp_test_mock',
      isConfigured: isRazorpayConfigured,
      total,
      shipping: normalizedShipping,
    },
  });
});

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    res.status(400);
    throw new Error('Payment verification details missing');
  }

  const order = await Order.findOne({
    $or: [{ _id: orderId }, { 'payment.razorpayOrderId': razorpayOrderId }],
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found for verification');
  }

  if (order.payment.status === 'paid' && order.payment.verified) {
    return res.status(200).json({
      success: true,
      message: 'Payment already verified',
      data: order,
    });
  }

  let isValidSignature = false;

  if (isRazorpayConfigured && key_secret) {
    const generatedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    try {
      isValidSignature = crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpaySignature)
      );
    } catch {
      isValidSignature = false;
    }
  } else {
    isValidSignature = true;
  }

  if (!isValidSignature) {
    order.payment.status = 'failed';
    order.payment.failureReason = 'Invalid Razorpay HMAC signature';
    await order.save();

    res.status(400);
    throw new Error('Payment verification failed: Invalid signature');
  }

  order.payment.status = 'paid';
  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.payment.razorpaySignature = razorpaySignature;
  order.payment.verified = true;
  order.payment.paidAt = new Date();
  order.payment.reference = razorpayPaymentId;
  order.status = 'paid';

  await order.save();

  sendOrderNotificationEmail(order).catch((err) =>
    console.error('[Mailer] Failed to send order notification:', err)
  );

  res.status(200).json({
    success: true,
    message: 'Payment verified and order placed successfully',
    data: order,
  });
});

const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  const signature = req.headers['x-razorpay-signature'];

  if (webhookSecret && signature) {
    const rawBody = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      res.status(400);
      throw new Error('Invalid webhook signature');
    }
  }

  const { event, payload } = req.body;

  if (event === 'payment.captured' || event === 'order.paid') {
    const paymentEntity = payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id;
    const razorpayPaymentId = paymentEntity?.id;

    if (razorpayOrderId) {
      const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
      if (order && order.payment.status !== 'paid') {
        order.payment.status = 'paid';
        order.payment.razorpayPaymentId = razorpayPaymentId || order.payment.razorpayPaymentId;
        order.payment.verified = true;
        order.payment.paidAt = new Date();
        order.status = 'paid';
        await order.save();

        sendOrderNotificationEmail(order).catch((err) =>
          console.error('[Webhook Mailer] Error:', err)
        );
      }
    }
  } else if (event === 'payment.failed') {
    const paymentEntity = payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id;

    if (razorpayOrderId) {
      const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
      if (order && order.payment.status === 'pending') {
        order.payment.status = 'failed';
        order.payment.failureReason = paymentEntity?.error_description || 'Payment failed';
        await order.save();
      }
    }
  }

  res.status(200).json({ status: 'ok' });
});

const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shipping,
    payment = {},
    notes = '',
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Order items are required');
  }

  if (
    !shipping?.firstName ||
    !shipping?.lastName ||
    !shipping?.phone ||
    !shipping?.address ||
    !shipping?.city ||
    !shipping?.state ||
    !shipping?.zipCode
  ) {
    res.status(400);
    throw new Error('Shipping information is incomplete');
  }

  const normalizedItems = items.map((item) => ({
    productId: String(item.productId ?? item.id ?? ''),
    name: String(item.name ?? ''),
    price: Number(item.price),
    quantity: Number(item.quantity),
    image: String(item.image ?? item.images?.[0] ?? ''),
  }));

  const normalizedShipping = {
    firstName: String(shipping.firstName).trim(),
    lastName: String(shipping.lastName).trim(),
    email: String(shipping.email ?? '').trim(),
    phone: String(shipping.phone ?? '').trim(),
    address: String(shipping.address).trim(),
    apartment: String(shipping.apartment ?? '').trim(),
    landmark: String(shipping.landmark ?? '').trim(),
    city: String(shipping.city).trim(),
    state: String(shipping.state).trim(),
    country: String(shipping.country ?? 'India').trim(),
    zipCode: String(shipping.zipCode).trim(),
  };

  const paymentMethod = String(
    payment.method ?? 'online'
  ).toLowerCase();

  const paymentReference = String(payment.reference ?? payment.paymentReference ?? '').trim();
  const paymentScreenshotUrl = String(payment.screenshotUrl ?? payment.screenshot ?? '').trim();
  const paymentScreenshotName = String(payment.screenshotName ?? payment.paymentScreenshotName ?? '').trim();
  const paymentVerified = Boolean(payment.verified ?? false);

  const codCharge =
    paymentMethod === 'cod' ? 100 : 0;

  const subtotal = normalizedItems.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
        Number(item.quantity),
    0
  );

  const shippingFee = 0;

  const total =
    subtotal +
    shippingFee +
    codCharge;

  const order = await Order.create({
    orderNumber: makeOrderNumber(),
    items: normalizedItems,
    shipping: normalizedShipping,
    payment: {
      method: paymentMethod,
      last4: String(payment.last4 ?? '').trim(),
      reference: paymentReference,
      screenshotUrl: paymentScreenshotUrl,
      screenshotName: paymentScreenshotName,
      verified: paymentVerified,
      status: paymentMethod === 'cod' ? 'pending' : (paymentVerified ? 'paid' : 'pending'),
    },
    subtotal,
    shippingFee,
    codCharge,
    total,
    status: 'pending',
    notes: String(notes ?? '').trim(),
  });

  await sendOrderNotificationEmail(order);

  res.status(201).json({
    success: true,
    message: 'Order created',
    data: order,
  });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { cancellationReason = '' } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.status === 'cancelled') {
    res.status(400);
    throw new Error('Order is already cancelled');
  }

  if (order.status === 'delivered') {
    res.status(400);
    throw new Error('Cannot cancel a delivered order');
  }

  order.status = 'cancelled';
  await order.save();

  await sendOrderCancellationEmail(order, cancellationReason);

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
});

export {
  createOrder,
  cancelOrder,
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
};