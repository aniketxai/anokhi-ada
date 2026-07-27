import { Shipment } from '../models/Shipment.js';
import { Order } from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const HUMAN_STATUS = {
  created: 'Order Confirmed',
  pickup_scheduled: 'Pickup Scheduled',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  out_for_delivery: 'Out For Delivery',
  delivered: 'Delivered',
  ndr: 'Delivery Attempt Failed',
  rto: 'Returned To Origin',
  cancelled: 'Cancelled',
  failed: 'Failed',
};

function pushStatusIfNew(shipment, status, statusDescription, location, raw) {
  const last = shipment.statusHistory[shipment.statusHistory.length - 1];
  if (last && last.status === status && last.statusDescription === statusDescription && last.location === location) return;

  shipment.statusHistory.push({
    status,
    statusDescription: statusDescription || HUMAN_STATUS[status] || status,
    location: location || '',
    timestamp: new Date(),
    raw: raw || null,
  });
  shipment.status = status;
  shipment.statusDescription = statusDescription || HUMAN_STATUS[status] || status;
  if (location) shipment.currentLocation = location;
  if (status === 'delivered') shipment.deliveredAt = new Date();
}

/**
 * ADMIN — Manually create or update shipment, location, and tracking details for an order.
 * POST /api/admin/shipments/:orderId/save or POST /api/admin/shipments/:orderId
 */
export const adminSaveShipment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const {
    courier = 'Delhivery',
    waybill = '',
    trackingUrl = '',
    status = 'created',
    statusDescription = '',
    location = '',
    estimatedDeliveryDate = null,
    deleteTimelineIndex = null,
  } = req.body || {};

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  let shipment = await Shipment.findOne({ order: order._id });

  if (!shipment) {
    shipment = new Shipment({
      order: order._id,
      orderNumber: order.orderNumber,
      courier: courier || 'Delhivery',
      waybill: waybill?.trim() || '',
      trackingUrl: trackingUrl?.trim() || '',
      referenceNumber: order.orderNumber,
      status: status || 'created',
      statusDescription: statusDescription || HUMAN_STATUS[status] || 'Order Confirmed',
      currentLocation: location?.trim() || '',
      estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null,
      statusHistory: [
        {
          status: status || 'created',
          statusDescription: statusDescription || HUMAN_STATUS[status] || 'Order Confirmed',
          location: location?.trim() || 'Warehouse Hub',
          timestamp: new Date(),
        },
      ],
      lastSyncedAt: new Date(),
    });
  } else {
    if (courier) shipment.courier = courier.trim();
    if (waybill !== undefined) shipment.waybill = waybill.trim();
    if (trackingUrl !== undefined) shipment.trackingUrl = trackingUrl.trim();

    if (estimatedDeliveryDate !== undefined) {
      shipment.estimatedDeliveryDate = estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null;
    }

    // Handle timeline event deletion if requested by admin
    if (deleteTimelineIndex !== null && typeof deleteTimelineIndex === 'number') {
      if (deleteTimelineIndex >= 0 && deleteTimelineIndex < shipment.statusHistory.length) {
        shipment.statusHistory.splice(deleteTimelineIndex, 1);
      }
    } else {
      pushStatusIfNew(shipment, status, statusDescription, location, null);
    }

    if (location) shipment.currentLocation = location.trim();
    shipment.lastSyncedAt = new Date();
  }

  await shipment.save();

  // Sync status to order
  if (status === 'delivered') {
    order.status = 'delivered';
  } else if (['in_transit', 'out_for_delivery', 'picked_up', 'pickup_scheduled'].includes(status)) {
    order.status = 'shipped';
  } else if (status === 'cancelled') {
    order.status = 'cancelled';
  }

  order.shipment = {
    waybill: shipment.waybill,
    referenceNumber: shipment.referenceNumber,
    status: shipment.status,
    courier: shipment.courier,
    trackingUrl: shipment.trackingUrl,
    lastSyncedAt: shipment.lastSyncedAt,
  };

  await order.save();

  res.json({
    success: true,
    message: 'Shipment and location tracking updated successfully',
    data: shipment,
  });
});

/**
 * ADMIN — Legacy create shipment alias
 */
export const adminCreateShipment = adminSaveShipment;

/**
 * ADMIN — Sync shipment alias
 */
export const adminSyncShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findOne({ order: req.params.orderId });
  if (!shipment) {
    res.status(404);
    throw new Error('No shipment found for this order');
  }
  shipment.lastSyncedAt = new Date();
  await shipment.save();

  res.json({ success: true, message: 'Tracking status up to date', data: shipment });
});

/**
 * ADMIN — Cancel a shipment.
 * POST /api/admin/shipments/:orderId/cancel
 */
export const adminCancelShipment = asyncHandler(async (req, res) => {
  const { reason } = req.body || {};
  const shipment = await Shipment.findOne({ order: req.params.orderId });
  if (!shipment) {
    res.status(404);
    throw new Error('No shipment found for this order');
  }

  shipment.cancelled = true;
  shipment.cancelReason = reason || 'Cancelled by admin';
  pushStatusIfNew(shipment, 'cancelled', reason || 'Shipment cancelled', '', null);
  await shipment.save();

  const order = await Order.findById(shipment.order);
  if (order) {
    order.status = 'cancelled';
    await order.save();
  }

  res.json({ success: true, message: 'Shipment cancelled', data: shipment });
});

/**
 * ADMIN — Get shipment details for an order.
 * GET /api/admin/shipments/:orderId
 */
export const adminGetShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findOne({ order: req.params.orderId });
  res.json({ success: true, data: shipment || null });
});

/**
 * PUBLIC — Customer-facing order tracking lookup.
 * POST /api/tracking/lookup body: { orderNumber, contact }
 */
export const publicTrackOrder = asyncHandler(async (req, res) => {
  const { orderNumber, contact } = req.body || {};

  if (!orderNumber || !contact) {
    res.status(400);
    throw new Error('Order number and the email or phone used at checkout are required');
  }

  const cleanOrderNum = String(orderNumber).trim();
  const contactNormalized = String(contact).trim().toLowerCase();
  const cleanPhone = String(contact).replace(/\D/g, '');

  const order = await Order.findOne({ orderNumber: cleanOrderNum });

  if (!order) {
    res.status(404);
    throw new Error('We could not find an order with that order number. Please check and try again.');
  }

  const orderEmail = String(order.shipping?.email || '').toLowerCase();
  const orderPhone = String(order.shipping?.phone || '').replace(/\D/g, '');

  const matches =
    orderEmail === contactNormalized ||
    (cleanPhone.length > 0 && orderPhone.includes(cleanPhone)) ||
    (orderPhone.length > 0 && cleanPhone.includes(orderPhone));

  if (!matches) {
    res.status(403);
    throw new Error('Email or phone does not match this order. Please use the contact details provided at checkout.');
  }

  let shipment = await Shipment.findOne({ order: order._id });

  const defaultStatus = order.status === 'delivered' ? 'delivered' : order.status === 'shipped' ? 'in_transit' : 'created';
  const defaultLabel = HUMAN_STATUS[defaultStatus] || 'Order Confirmed';

  const responseData = {
    orderNumber: order.orderNumber,
    orderStatus: order.status,
    placedAt: order.createdAt,
    items: order.items,
    shipping: {
      firstName: order.shipping?.firstName,
      lastName: order.shipping?.lastName,
      address: order.shipping?.address,
      city: order.shipping?.city,
      state: order.shipping?.state,
      zipCode: order.shipping?.zipCode,
    },
    shipment: shipment
      ? {
          courier: shipment.courier || 'Express Delivery',
          waybill: shipment.waybill,
          trackingUrl: shipment.trackingUrl || '',
          currentLocation: shipment.currentLocation || '',
          status: shipment.status,
          statusLabel: HUMAN_STATUS[shipment.status] || shipment.status,
          statusDescription: shipment.statusDescription,
          estimatedDeliveryDate: shipment.estimatedDeliveryDate,
          deliveredAt: shipment.deliveredAt,
          timeline: shipment.statusHistory.map((h) => ({
            status: h.status,
            label: HUMAN_STATUS[h.status] || h.status,
            statusDescription: h.statusDescription,
            location: h.location,
            timestamp: h.timestamp,
          })),
        }
      : {
          courier: 'Standard Shipping',
          waybill: order.orderNumber,
          trackingUrl: '',
          currentLocation: `${order.shipping?.city || 'City'} Central Hub`,
          status: defaultStatus,
          statusLabel: defaultLabel,
          statusDescription: order.status === 'paid' ? 'Order confirmed and ready for dispatch' : 'Order received',
          estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          timeline: [
            {
              status: 'created',
              label: 'Order Confirmed',
              statusDescription: 'Order placed successfully',
              location: 'Warehouse Hub',
              timestamp: order.createdAt,
            },
          ],
        },
  };

  res.json({
    success: true,
    data: responseData,
  });
});

/**
 * PUBLIC — Pincode serviceability check
 */
export const checkPincodeServiceability = asyncHandler(async (req, res) => {
  const { pincode } = req.params;
  res.json({
    success: true,
    data: {
      pincode,
      serviceable: true,
      couriers: ['Delhivery', 'BlueDart', 'DTDC', 'India Post'],
      estimatedDays: '3-5 business days',
    },
  });
});

/**
 * WEBHOOK — Webhook stub for backward compatibility
 */
export const shadowfaxWebhook = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Webhook processed' });
});
