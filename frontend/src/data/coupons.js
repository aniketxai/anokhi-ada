// Coupon definitions with tier thresholds and discounts
export const COUPONS = [
  {
    code: 'SAVE5',
    discountPercent: 5,
    minCartValue: 499,
    title: '5% OFF',
    description: 'Applicable on cart value of ₹499 or more',
  },
  {
    code: 'SAVE10',
    discountPercent: 10,
    minCartValue: 999,
    title: '10% OFF',
    description: 'Applicable on cart value of ₹999 or more',
  },
  {
    code: 'SAVE15',
    discountPercent: 15,
    minCartValue: 1499,
    title: '15% OFF',
    description: 'Applicable on cart value of ₹1499 or more',
  },
  {
    code: 'SAVE20',
    discountPercent: 20,
    minCartValue: 1999,
    title: '20% OFF',
    description: 'Applicable on cart value of ₹1999 or more',
  },
];

export function findCoupon(code) {
  if (!code) return null;
  const clean = String(code).trim().toUpperCase();
  return COUPONS.find((c) => c.code === clean) || null;
}

export function getDiscountAmount(coupon, cartTotal) {
  if (!coupon || !coupon.discountPercent || !coupon.minCartValue) return 0;
  if (cartTotal < coupon.minCartValue) return 0;
  return Math.round((cartTotal * coupon.discountPercent) / 100);
}
