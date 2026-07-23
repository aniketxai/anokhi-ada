# SAMBX Backend

Express + MongoDB API for the SAMBX Forge frontend.

## Setup

1. Install dependencies:
   - `npm install`
2. Create a `.env` file from `.env.example`
3. Start MongoDB locally or set a cloud `MONGO_URI`
4. Run the server:
   - `npm run dev`

## Deployment

For a separate backend deployment, set these environment variables in your hosting provider:

- `MONGO_URI`
- `CORS_ORIGIN` - include your deployed frontend URL, for example `https://your-frontend.vercel.app`
- `ORDER_NOTIFICATION_EMAIL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`

The backend health check is available at `/api/health`.

## Order notifications

To send an email after each order is created, configure SMTP settings in `.env`:

- `ORDER_NOTIFICATION_EMAIL` defaults to `aniketxai@gmail.com`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- Optional: `SMTP_SECURE` and `MAIL_FROM`

If SMTP is not configured, orders will still be saved to MongoDB, but email notifications will be skipped.

### SMTP process

1. Create an SMTP account or use a provider such as Gmail, SendGrid, Mailgun, or Outlook.
2. Generate an app password or SMTP password from the provider dashboard.
3. Fill these values in `.env`:
   - `SMTP_HOST` - SMTP server host
   - `SMTP_PORT` - usually `465` for secure or `587` for STARTTLS
   - `SMTP_SECURE` - `true` for port `465`, otherwise `false`
   - `SMTP_USER` - your sending email address
   - `SMTP_PASS` - app password or SMTP password
   - `MAIL_FROM` - sender name and email
4. Restart the backend server.
5. Place an order from the frontend.
6. The backend saves the order in MongoDB and then sends an email to `ORDER_NOTIFICATION_EMAIL`.

### Simplest option

If you want the quickest setup, use Gmail:

1. Turn on 2-step verification on the Gmail account.
2. Create an app password.
3. Set:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=465`
   - `SMTP_SECURE=true`
   - `SMTP_USER=your-gmail-address`
   - `SMTP_PASS=your-16-char-app-password`

This is usually the fastest option for local testing.

## Seed data

- Replace all existing products with a JSON export:
   - `npm run seed -- /absolute/path/to/products.json`

## API

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/categories`
- `GET /api/products/home`
- `POST /api/contact`
- `POST /api/quotes`
- `POST /api/orders`
