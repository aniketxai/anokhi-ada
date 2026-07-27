import crypto from 'crypto';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);
const MAX_OTP_ATTEMPTS = 5;

export function generateOtp() {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  const code = crypto.randomInt(min, max + 1).toString();
  return code;
}

export function hashOtp(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

export function getOtpExpiry() {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

export function isOtpExpired(expiresAt) {
  return !expiresAt || new Date(expiresAt).getTime() < Date.now();
}

export const OTP_CONFIG = { OTP_LENGTH, OTP_EXPIRY_MINUTES, MAX_OTP_ATTEMPTS };
