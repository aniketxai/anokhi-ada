# What's changed — read this first

## 1. Homepage/banner "stale data + slow load" bug — FIXED
Cause: Express sends weak ETags by default, and none of your API routes set
Cache-Control headers. Combined with the browser's default fetch caching,
admin edits could keep showing old data until a hard refresh.
- `backend/src/app.js`: disabled ETags, added `Cache-Control: no-store` to
  every `/api/*` response.
- `frontend/src/api/index.js`: added `cache: 'no-store'` to the site-content,
  home-data, and general request calls.
No env vars needed — this just works after you redeploy.

## 2. Shadowfax courier tracking — BUILT, needs your API token
New files:
- `backend/src/models/Shipment.js`, `backend/src/services/shadowfaxService.js`,
  `backend/src/controllers/shipmentController.js`, `backend/src/routes/trackingRoutes.js`
- Frontend: `frontend/src/pages/OrderTracking.jsx` (new "Track Order" page/nav link),
  admin order modal now has a "Courier & Tracking" panel to create/sync/cancel
  a Shadowfax shipment (`frontend/src/pages/AdminComponents/ShipmentPanel.jsx`).
- A webhook endpoint for real-time status pushes:
  `POST /api/tracking/webhook/shadowfax` — give this URL to Shadowfax.

**Important:** Shadowfax's Apiary docs page only fully renders once you're
logged in with your account's API token, so I couldn't scrape the exact
field names. I built `shadowfaxService.js` from Shadowfax's publicly known
conventions (Token auth, `shipmenttype` F/R, `payMode` C/P). Once Shadowfax
gives you your Postman collection / staging token, you may need to tweak
field names in that ONE file — nothing else in the app needs to change.

Add to `backend/.env`:
```
SHADOWFAX_BASE_URL=https://api.shadowfax.in
SHADOWFAX_API_TOKEN=your-token-from-shadowfax
SHADOWFAX_PICKUP_PINCODE=your-warehouse-pincode
SHADOWFAX_WEBHOOK_SECRET=any-random-string
```

## 3. Customer accounts + forgot-password OTP — BUILT, works out of the box
New pages: `/signup`, `/login`, `/forgot-password` (3-step: email → OTP →
new password), plus a "Customers" tab in the admin panel to view/block users.
Uses your existing email (nodemailer) setup — no new env vars required beyond:
```
CUSTOMER_JWT_SECRET=change-this-to-a-long-random-string
OTP_EXPIRY_MINUTES=10
```
Signup logs the user in immediately (no email verification gate); forgot
password requires the emailed OTP as you asked.

## Before you deploy — please also fix these
1. **`.env` had live secrets in `.env.example`** (Razorpay live key/secret,
   Gmail app password). I scrubbed the example file, but if the real `.env`
   with those values was ever pushed to a public repo, rotate those keys now.
2. **Your admin API had no backend-side auth check** — `verifyAdminToken`
   existed but wasn't applied to any route, so anyone with the URL could call
   admin endpoints directly. I protected the *new* routes I added, but the
   rest of `adminRoutes.js` is still open and should be locked down.

## Setup
```
cd backend && npm install && cp .env.example .env   # fill in real values
cd frontend && npm install
```
Then run both dev servers as usual. The zip excludes `node_modules` to keep
the download small.
