import { Order } from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOrderNotificationEmail, sendOrderCancellationEmail } from '../utils/mailer.js';

function makeOrderNumber() {
  return `SBX-${Date.now()
    .toString()
    .slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;
}

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

  // Send cancellation email to customer
  await sendOrderCancellationEmail(order, cancellationReason);

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
});

export { createOrder, cancelOrder };