/**
 * Shadowfax Unified API client
 * Docs: https://sfxunifiedapi.docs.apiary.io/
 *
 * IMPORTANT — please read before going live:
 * Shadowfax's documentation page is a JavaScript-rendered Apiary site that is only
 * fully browsable once you're logged in with the Staging/Production API token they
 * email you. Because of that, the exact field names below were built from Shadowfax's
 * publicly documented conventions (Token auth, JSON body, `shipmenttype` F/R for
 * forward/reverse, `payMode` C/P for COD/prepaid, pincode-serviceability endpoint).
 * Everything in this file is centralized so that if Shadowfax's onboarding team gives
 * you slightly different field names or paths in your Postman collection, you only
 * need to edit this ONE file — nothing else in the app needs to change.
 *
 * Required environment variables (see backend/.env.example):
 *   SHADOWFAX_BASE_URL        e.g. https://api.shadowfax.in (staging URL differs)
 *   SHADOWFAX_API_TOKEN       the Token Shadowfax emails you
 *   SHADOWFAX_PICKUP_PINCODE  your warehouse/pickup pincode
 *   SHADOWFAX_WEBHOOK_SECRET  optional shared secret to validate incoming webhooks
 */

import fetch from 'node-fetch';

const BASE_URL = (process.env.SHADOWFAX_BASE_URL || 'https://api.shadowfax.in').replace(/\/+$/, '');
const API_TOKEN = process.env.SHADOWFAX_API_TOKEN || '';
const PICKUP_PINCODE = process.env.SHADOWFAX_PICKUP_PINCODE || '';

function isConfigured() {
  return Boolean(API_TOKEN);
}

async function sfxRequest(path, { method = 'GET', body } = {}) {
  if (!isConfigured()) {
    throw new Error(
      'Shadowfax is not configured. Set SHADOWFAX_API_TOKEN (and SHADOWFAX_BASE_URL) in the backend .env file.'
    );
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${API_TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const message = data?.message || data?.error || `Shadowfax API error (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.response = data;
    throw err;
  }

  return data;
}

/**
 * Check whether Shadowfax delivers to a given pincode.
 */
export async function checkServiceability(pincode) {
  return sfxRequest(`/api/pincode/serviceability/?pincode=${encodeURIComponent(pincode)}`);
}

/**
 * Create a forward shipment for an order.
 * `order` is our internal Order mongoose document (or plain object) with .shipping, .items, .payment, .total
 */
export async function createForwardShipment(order, { weightGrams = 500, dimensionsCm = { length: 10, width: 10, height: 10 } } = {}) {
  const isCOD = order.payment?.method === 'cod';

  const payload = {
    order_id: order.orderNumber,
    order_date: order.createdAt || new Date(),
    shipmenttype: 'F',
    payMode: isCOD ? 'C' : 'P',
    amount: order.total,

    pickup_pincode: PICKUP_PINCODE,

    customer: {
      name: `${order.shipping.firstName} ${order.shipping.lastName}`.trim(),
      phone: order.shipping.phone,
      email: order.shipping.email,
      address: [order.shipping.address, order.shipping.apartment, order.shipping.landmark]
        .filter(Boolean)
        .join(', '),
      city: order.shipping.city,
      state: order.shipping.state,
      pincode: order.shipping.zipCode,
      country: order.shipping.country || 'India',
    },

    package: {
      weight: weightGrams,
      length: dimensionsCm.length,
      width: dimensionsCm.width,
      height: dimensionsCm.height,
    },

    items: (order.items || []).map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
    })),
  };

  const response = await sfxRequest('/api/orders/create/', { method: 'POST', body: payload });
  return { payload, response };
}

/**
 * Fetch the latest tracking status for a shipment from Shadowfax.
 */
export async function trackShipment({ waybill, referenceNumber }) {
  const identifier = waybill || referenceNumber;
  if (!identifier) throw new Error('waybill or referenceNumber is required to track a shipment');
  return sfxRequest(`/api/orders/track/?tracking_id=${encodeURIComponent(identifier)}`);
}

/**
 * Cancel a shipment that hasn't been picked up yet.
 */
export async function cancelShipment({ waybill, referenceNumber, reason }) {
  return sfxRequest('/api/orders/cancel/', {
    method: 'POST',
    body: { waybill, reference_number: referenceNumber, reason },
  });
}

/**
 * Normalize a raw Shadowfax status string into our internal status enum
 * used on the Shipment model. Extend this map as you learn Shadowfax's
 * exact status vocabulary from real responses/webhooks.
 */
export function normalizeStatus(rawStatus = '') {
  const s = String(rawStatus).toLowerCase();
  if (s.includes('deliver') && !s.includes('out for') && !s.includes('fail')) return 'delivered';
  if (s.includes('out for delivery')) return 'out_for_delivery';
  if (s.includes('rto') || s.includes('return')) return 'rto';
  if (s.includes('ndr') || s.includes('undelivered') || s.includes('failed attempt')) return 'ndr';
  if (s.includes('picked') || s.includes('pickup complete')) return 'picked_up';
  if (s.includes('pickup')) return 'pickup_scheduled';
  if (s.includes('transit') || s.includes('in-transit') || s.includes('shipped')) return 'in_transit';
  if (s.includes('cancel')) return 'cancelled';
  return 'created';
}

export function isShadowfaxConfigured() {
  return isConfigured();
}

export default {
  checkServiceability,
  createForwardShipment,
  trackShipment,
  cancelShipment,
  normalizeStatus,
  isShadowfaxConfigured,
};
