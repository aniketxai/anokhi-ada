import jwt from 'jsonwebtoken';

const CUSTOMER_JWT_SECRET =
  process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET || 'your-customer-secret-change-in-production';

export function signCustomerToken(user) {
  return jwt.sign({ userId: user._id.toString(), email: user.email }, CUSTOMER_JWT_SECRET, {
    expiresIn: '30d',
  });
}

export function signResetToken(user) {
  return jwt.sign({ userId: user._id.toString(), purpose: 'password_reset' }, CUSTOMER_JWT_SECRET, {
    expiresIn: '15m',
  });
}

export function verifyToken(token) {
  return jwt.verify(token, CUSTOMER_JWT_SECRET);
}

/**
 * Express middleware — protects routes that require a logged-in customer
 * (e.g. viewing order history, profile).
 */
export function protectCustomer(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    res.status(401);
    return next(new Error('Please log in to continue'));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401);
    next(new Error('Your session has expired. Please log in again.'));
  }
}
