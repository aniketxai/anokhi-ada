import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customOrderRoutes from './routes/customOrderRoutes.js';
import payLinksRouter from './routes/payLinks.js';
import adminRoutes from './routes/adminRoutes.js';
import importRoutes from './routes/importRoutes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

const allowedOrigins = [
  ...(process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean) || []),
  ...(process.env.NODE_ENV === 'production' ? ['https://anokhiada.vercel.app', 'https://anokhi-ada.vercel.app'] : ['*']),
];

function isAllowedOrigin(origin) {
  if (!origin) return true;

  // In development, allow any origin via the '*' wildcard.
  return allowedOrigins.includes('*') || allowedOrigins.includes(origin);
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    console.warn('Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'request-id', 'x-rtb-fingerprint-id'],
  exposedHeaders: ['request-id', 'x-rtb-fingerprint-id', 'Authorization', 'Content-Type'],
  optionsSuccessStatus: 200,
};

/* =========================
  CORS SETUP
========================= */

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

/* =========================
   MIDDLEWARE & SECURITY HEADERS
========================= */
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=*, gyroscope=*, magnetometer=*, payment=*'
  );
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

/* =========================
   HEALTH ROUTES
========================= */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Anokhi Ada API is running',
    health: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Anokhi Ada API is running',
  });
});

/* =========================
   API ROUTES
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom-orders', customOrderRoutes);
app.use('/api/admin', importRoutes);
app.use('/api/pay-links', payLinksRouter);

/* =========================
   ERROR HANDLERS
========================= */
app.use(notFound);
app.use(errorHandler);

export default app;