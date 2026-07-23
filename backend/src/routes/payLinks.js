/**
 * Pay Links Routes
 *
 * POST   /api/pay-links              → Admin: generate a new pay link
 * GET    /api/pay-links/:token       → Frontend: verify token and get details
 * POST   /api/pay-links/:token/order → Frontend: place order using this token
 */

import express from 'express';
import crypto from 'crypto';
import PayLink from '../models/PayLink.js';

const router = express.Router();

// ── Admin auth middleware ─────────────────────────────────────────────────────
// Replace with your real auth (JWT etc.) if you have one
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_SECRET_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  next();
}

// ── POST /api/pay-links ───────────────────────────────────────────────────────
// Admin generates a new pay link
router.post('/', requireAdmin, async (req, res) => {
  const { amount, note, ttlHours = 24 } = req.body;

  const parsedAmount = parseFloat(amount);
  if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number.' });
  }
  if (note && note.length > 200) {
    return res.status(400).json({ error: 'note must be under 200 characters.' });
  }

  // Generate a secure random token
  const token     = crypto.randomBytes(32).toString('hex');
  const ttlMs     = Math.min(Number(ttlHours) || 24, 168) * 3600_000; // max 7 days
  const expiresAt = new Date(Date.now() + ttlMs);

  try {
    await PayLink.create({
      token,
      amount: parsedAmount,
      note:   note?.trim() || '',
      expiresAt,
    });

    const SITE_URL = process.env.SITE_URL || 'https://sambx.in';
    const url      = `${SITE_URL}/pay/link/${token}`;
    const expires  = expiresAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    return res.status(201).json({ url, expires, token });
  } catch (err) {
    console.error('[pay-links] create error:', err);
    return res.status(500).json({ error: 'Failed to generate pay link.' });
  }
});

// ── GET /api/pay-links/:token ─────────────────────────────────────────────────
// Frontend verifies the token is valid before showing payment page
router.get('/:token', async (req, res) => {
  try {
    const link = await PayLink.findOne({ token: req.params.token });

    if (!link) {
      return res.status(404).json({ error: 'Pay link not found.' });
    }
    if (link.used) {
      return res.status(410).json({ error: 'This pay link has already been used.' });
    }
    if (new Date() > link.expiresAt) {
      return res.status(410).json({ error: 'This pay link has expired.' });
    }

    // Return only what the frontend needs — never expose internals
    return res.json({
      amount:    link.amount,
      note:      link.note,
      expiresAt: link.expiresAt,
    });
  } catch (err) {
    console.error('[pay-links] verify error:', err);
    return res.status(500).json({ error: 'Failed to verify pay link.' });
  }
});

// ── POST /api/pay-links/:token/order ─────────────────────────────────────────
// Frontend places order — re-verifies token then marks it used atomically
router.post('/:token/order', async (req, res) => {
  const { screenshotUrl, screenshotName, paymentReference } = req.body;

  if (!screenshotUrl) {
    return res.status(400).json({ error: 'Payment screenshot is required.' });
  }

  try {
    // findOneAndUpdate with used:false guard — atomic, prevents double-use
    const link = await PayLink.findOneAndUpdate(
      {
        token:     req.params.token,
        used:      false,
        expiresAt: { $gt: new Date() },
      },
      {
        used:   true,
        usedAt: new Date(),
      },
      { new: true }
    );

    if (!link) {
      // Could be: not found, already used, or expired
      const existing = await PayLink.findOne({ token: req.params.token });
      if (!existing)   return res.status(404).json({ error: 'Pay link not found.' });
      if (existing.used) return res.status(410).json({ error: 'Pay link already used.' });
      return res.status(410).json({ error: 'Pay link has expired.' });
    }

    // Build and save the order in your existing orders collection
    // ── Replace this block with your actual Order model ──────────────────
    // Example using a generic orders collection:
    const db          = req.app.get('db'); // or import your Order model directly
    const orderNumber = `SAMBX-${Date.now()}`;

    // If you have an Order model, replace the lines below:
    // await Order.create({ ... });
    //
    // For now we store in MongoDB directly via the db instance.
    // Swap this out for your real Order.create() call:
    if (db) {
      await db.collection('orders').insertOne({
        orderNumber,
        type:       'pay-link',
        amount:     link.amount,
        note:       link.note,
        payment: {
          method:         'online',
          reference:      paymentReference?.trim() || '',
          screenshotUrl,
          screenshotName: screenshotName || '',
          verified:       false,
        },
        createdAt: new Date(),
      });
    }
    // ─────────────────────────────────────────────────────────────────────

    return res.status(201).json({ success: true, data: { orderNumber } });
  } catch (err) {
    console.error('[pay-links] place order error:', err);
    return res.status(500).json({ error: 'Failed to place order. Please try again.' });
  }
});

export default router;