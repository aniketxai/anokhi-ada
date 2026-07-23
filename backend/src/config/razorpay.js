import Razorpay from 'razorpay';

const key_id = process.env.RAZORPAY_KEY_ID?.trim() || '';
const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim() || '';

const isRazorpayConfigured = Boolean(
  key_id &&
  key_secret &&
  !key_id.includes('your_key_id') &&
  !key_secret.includes('your_razorpay_key_secret')
);

let razorpayInstance = null;

if (isRazorpayConfigured) {
  try {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
    console.log('[Razorpay] Initialized successfully with configured key credentials.');
  } catch (error) {
    console.error('[Razorpay] Initialization error:', error.message);
  }
} else {
  console.warn(
    '[Razorpay] Credentials missing or using placeholder values. Operating in Fallback/Development mode.'
  );
}

export { razorpayInstance, isRazorpayConfigured, key_id, key_secret };
