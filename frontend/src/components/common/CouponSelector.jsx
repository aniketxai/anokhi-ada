import { useState } from 'react';
import { Tag, Check, X, Sparkles, Percent, AlertCircle } from 'lucide-react';
import { COUPONS } from '../../data/coupons';
import { useApp } from '../../context/useApp';
import { formatINR } from '../../utils/currency';

export default function CouponSelector({ className = '' }) {
  const { cartTotal, appliedCoupon, discountAmount, applyCoupon, removeCoupon } = useApp();
  const [inputCode, setInputCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleApplyManual = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setErrorMessage('');
    const res = applyCoupon(inputCode);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setInputCode('');
    }
  };

  const handleApplyTier = (coupon) => {
    setErrorMessage('');
    const res = applyCoupon(coupon.code);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className={`bg-surface-container rounded-3xl p-5 border border-border/40 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Tag size={18} />
          </div>
          <h3 className="font-bold text-foreground text-sm sm:text-base">Offers & Coupons</h3>
        </div>
        {appliedCoupon && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Check size={12} strokeWidth={3} />
            Saving {formatINR(discountAmount)}
          </span>
        )}
      </div>

      {/* Applied Coupon Banner */}
      {appliedCoupon ? (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-xs shrink-0">
              {appliedCoupon.discountPercent}%
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span className="uppercase tracking-wider">{appliedCoupon.code}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">({appliedCoupon.discountPercent}% OFF)</span>
              </p>
              <p className="text-[11px] text-secondary-text truncate">
                Saved {formatINR(discountAmount)} on this order
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            className="p-1.5 rounded-full hover:bg-red-500/10 text-secondary-text hover:text-red-500 transition-colors shrink-0 cursor-pointer"
            title="Remove Coupon"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        /* Manual Code Input */
        <form onSubmit={handleApplyManual} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Coupon Code (e.g. SAVE10)"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value.toUpperCase());
              setErrorMessage('');
            }}
            className="flex-1 px-3.5 py-2.5 bg-background rounded-xl text-xs sm:text-sm text-foreground uppercase tracking-wider font-semibold border border-surface-muted focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={!inputCode.trim()}
            className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 hover:bg-primary-light transition-colors cursor-pointer"
          >
            Apply
          </button>
        </form>
      )}

      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Available Coupon Tiers */}
      <div className="space-y-2 pt-1">
        <p className="text-xs font-semibold text-secondary-text flex items-center gap-1">
          <Sparkles size={13} className="text-amber-500" /> Available Tier Discounts
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {COUPONS.map((c) => {
            const isEligible = cartTotal >= c.minCartValue;
            const isApplied = appliedCoupon?.code === c.code;
            const remaining = Math.max(0, c.minCartValue - cartTotal);

            return (
              <div
                key={c.code}
                className={`p-3 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isApplied
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : isEligible
                    ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500'
                    : 'border-surface-muted bg-background/50 opacity-80'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div>
                    <span className="text-xs font-extrabold tracking-wider uppercase text-foreground bg-surface-muted px-2 py-0.5 rounded-md">
                      {c.code}
                    </span>
                    <h4 className="text-xs font-bold text-foreground mt-1 flex items-center gap-1">
                      <Percent size={12} className="text-amber-600 dark:text-amber-400" />
                      {c.title}
                    </h4>
                  </div>

                  {isApplied ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                      APPLIED
                    </span>
                  ) : isEligible ? (
                    <button
                      type="button"
                      onClick={() => handleApplyTier(c)}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      Apply
                    </button>
                  ) : (
                    <span className="text-[10px] text-secondary-text font-medium">
                      Min {formatINR(c.minCartValue)}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-secondary-text leading-tight">
                  {c.description}
                </p>

                {!isEligible && (
                  <div className="mt-2 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    Add {formatINR(remaining)} more to unlock
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
