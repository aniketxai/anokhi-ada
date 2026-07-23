import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../context/useApp';
import Button from '../components/Button';
import SectionHeading from '../components/SectionHeading';
import { formatINR } from '../utils/currency';
import { sanitizeImageUrl } from '../utils/image';

import CouponSelector from '../components/common/CouponSelector';
import CeoDeliveryOption from '../components/common/CeoDeliveryOption';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, appliedCoupon, discountAmount, isCeoDelivery } = useApp();

  if (cart.length === 0) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={48} className="text-surface-muted mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground font-display mb-2">Your cart is empty</h2>
          <p className="text-secondary-text text-sm mb-6">Add some products to get started.</p>
          <Link to="/products">
            <Button icon={ArrowRight}>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const shippingFee = cartTotal < 399 ? 80 : 0;
  const ceoDeliveryFee = isCeoDelivery ? 5000 : 0;
  const grandTotal = Math.max(0, cartTotal - discountAmount) + shippingFee + ceoDeliveryFee;
  const remainingForFreeShipping = Math.max(0, 399 - cartTotal);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading label="Shopping Cart" title="Your Cart" center={false} />

        {/* Free Shipping & COD Eligibility Nudge Banner */}
        <div className="mb-6 rounded-2xl p-4 border bg-surface-container/70">
          {remainingForFreeShipping > 0 ? (
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-foreground mb-1.5">
                <span className="text-amber-600 dark:text-amber-400">
                  Add {formatINR(remainingForFreeShipping)} more for FREE Shipping & Cash on Delivery (COD)!
                </span>
                <span>{formatINR(cartTotal)} / {formatINR(399)}</span>
              </div>
              <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (cartTotal / 399) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-secondary-text mt-1.5">
                Orders below ₹399 incur a flat ₹80 shipping fee and are strictly online payment only (No COD).
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>🎉 Congratulations! You have unlocked FREE Shipping & Cash on Delivery.</span>
            </div>
          )}
        </div>

        <div className="space-y-4 mb-8">
          {cart.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-surface-container rounded-3xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center"
            >
              <img
                src={sanitizeImageUrl(item.images?.[0] || item.image || item.img)}
                alt={item.name}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=600';
                }}
                className="w-full sm:w-20 h-40 sm:h-20 rounded-2xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <Link to={`/products/${item.id}`} className="font-semibold text-foreground text-sm hover:text-primary transition-material line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-xs text-outline mt-0.5">{item.category}</p>
                <p className="text-lg font-bold text-foreground mt-1">{formatINR(item.price)}</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-foreground hover:bg-surface-dim transition-material"
                >
                  <Minus size={14} />
                </motion.button>
                <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-foreground hover:bg-surface-dim transition-material"
                >
                  <Plus size={14} />
                </motion.button>
              </div>
              <p className="text-sm font-bold text-foreground w-full sm:w-24 text-center sm:text-right">
                {formatINR(item.price * item.quantity)}
              </p>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => removeFromCart(item.id)}
                className="p-2 rounded-full hover:bg-error/10 text-outline hover:text-error transition-material self-center sm:self-auto"
              >
                <Trash2 size={16} />
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* CEO VIP Delivery Option */}
        <CeoDeliveryOption className="mb-6" />

        {/* Coupon Selector */}
        <CouponSelector className="mb-8" />

        {/* Summary */}
        <div className="bg-surface-container rounded-3xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-secondary-text text-sm">Subtotal</span>
            <span className="font-semibold text-foreground">{formatINR(cartTotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between mb-3 text-emerald-600 dark:text-emerald-400">
              <span className="text-sm font-medium flex items-center gap-1">
                Coupon Discount ({appliedCoupon?.code})
              </span>
              <span className="font-bold">-{formatINR(discountAmount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <span className="text-secondary-text text-sm">Shipping Charge</span>
            {shippingFee > 0 ? (
              <span className="text-sm font-semibold text-foreground">{formatINR(shippingFee)}</span>
            ) : (
              <span className="text-sm text-success font-medium">Free</span>
            )}
          </div>

          {isCeoDelivery && (
            <div className="flex items-center justify-between mb-3 text-amber-600 dark:text-amber-400 font-semibold">
              <span className="text-sm flex items-center gap-1">
                👑 VIP Delivery by CEO
              </span>
              <span className="font-extrabold">+{formatINR(5000)}</span>
            </div>
          )}
          <div className="border-t border-surface-muted pt-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-lg">Total</span>
              <span className="font-bold text-foreground text-2xl">{formatINR(grandTotal)}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/checkout" className="flex-1">
              <Button size="lg" icon={ArrowRight} className="w-full">
                Checkout
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
