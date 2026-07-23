import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

const MONGO_URI = process.env.MONGO_URI;

// Ensure DB connection is established
let dbConnected = false;

async function ensureConnected() {
  if (!dbConnected && MONGO_URI) {
    try {
      await connectDB(MONGO_URI);
      dbConnected = true;
    } catch (error) {
      console.error('Failed to connect to database:', error);
      // Do not re-throw: let Express handle request errors so middleware
      // (including CORS) can still add headers to responses.
    }
  }
}

// Export the app for Vercel serverless
export default async (req, res) => {
  try {
    await ensureConnected();
  } catch (error) {
    // ensureConnected should not throw, but guard anyway
    console.error('Unexpected error in ensureConnected:', error);
  }

  // Always pass the request to the Express app so middleware (CORS, logging,
  // error handlers) run and responses include proper headers.
  return app(req, res);
};
