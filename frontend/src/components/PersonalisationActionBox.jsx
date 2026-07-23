import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, X, Gift, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/useApp';

export default function PersonalisationActionBox({ product, onAddToCart, onBuyNow, className = '' }) {
  const [isGiftOrder, setIsGiftOrder] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const { showNotification } = useApp() || {};

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, { isGiftOrder });
    } else if (showNotification) {
      showNotification(
        isGiftOrder
          ? 'Added to cart with Gift Order (@ ₹99)'
          : 'Added to cart successfully!'
      );
    }
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product, { isGiftOrder });
    } else if (onAddToCart) {
      onAddToCart(product, { isGiftOrder });
      window.location.href = '/checkout';
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto space-y-4 font-sans select-none ${className}`}>
      {/* 1. Header: Personalisation | Learn more */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[#555555] text-lg font-medium tracking-tight">
          Personalisation
        </h3>
        <button
          type="button"
          onClick={() => setShowLearnMore(true)}
          className="text-[#555555] text-sm font-semibold underline underline-offset-2 hover:text-black transition-colors cursor-pointer"
        >
          Learn more
        </button>
      </div>

      {/* 2. Gift Order Banner */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        onClick={() => setIsGiftOrder(!isGiftOrder)}
        className="relative overflow-hidden cursor-pointer rounded-[24px] p-4 sm:p-[18px] flex items-center justify-between transition-all duration-300 shadow-sm"
        style={{
          background: 'linear-gradient(100deg, #FDE6C4 0%, #F8DAA8 50%, #ECC382 100%)',
        }}
      >
        {/* Left content: Checkbox + Text */}
        <div className="flex items-center gap-3 z-10">
          {/* Custom Checkbox */}
          <div
            className={`w-[22px] h-[22px] rounded-[6px] border-2 border-[#5C4217] flex items-center justify-center transition-all duration-200 ${
              isGiftOrder ? 'bg-[#5C4217] text-white' : 'bg-transparent'
            }`}
          >
            {isGiftOrder && <Check size={14} strokeWidth={3} />}
          </div>

          {/* Text */}
          <span className="text-[#3E2909] font-semibold text-[15px] sm:text-[16px] tracking-tight">
            Make it a gift order <span className="font-normal">@</span> <span className="font-bold">₹99</span>
          </span>
        </div>

        {/* Decorative accent curve peeking out at bottom right */}
        <div className="absolute -bottom-1.5 right-6 w-20 h-[18px] bg-[#E3384D] rounded-t-full z-0 transform translate-y-[2px]" />
      </motion.div>

      {/* 3. ADD TO CART Button */}
      <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCart}
        className="w-full h-[58px] rounded-full bg-white border-2 border-black flex flex-col items-center justify-center transition-all shadow-sm hover:bg-gray-50 cursor-pointer active:bg-gray-100"
      >
        <span className="text-black font-extrabold text-[15px] tracking-wider uppercase leading-none">
          ADD TO CART
        </span>
        <span className="text-[#4B5563] text-[10px] font-bold tracking-widest uppercase mt-1 flex items-center gap-0.5">
          <span className="font-extrabold">%</span> ADDITIONAL OFFERS
        </span>
      </motion.button>

      {/* 4. BUY NOW Button */}
      <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleBuyNow}
        className="w-full h-[58px] rounded-full bg-[#111111] text-white flex flex-col items-center justify-center transition-all shadow-md hover:bg-black cursor-pointer active:bg-gray-900"
      >
        <span className="text-white font-extrabold text-[15px] tracking-wider uppercase leading-none">
          BUY NOW
        </span>
        <span className="text-white/90 text-[10px] font-bold tracking-widest uppercase mt-1 flex items-center gap-1">
          <Zap size={11} className="fill-amber-400 text-amber-400 inline-block" />
          FASTER CHECKOUT
        </span>
      </motion.button>

      {/* Learn More Modal */}
      <AnimatePresence>
        {showLearnMore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowLearnMore(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4 text-[#5C4217]">
                <div className="p-3 rounded-2xl bg-[#FDE6C4]">
                  <Gift size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Gift Packaging Service</h4>
                  <p className="text-xs text-gray-500">Make every unboxing unforgettable</p>
                </div>
              </div>

              <div className="space-y-3 my-5 text-sm text-gray-600">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/60">
                  <Sparkles size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p><strong className="text-gray-900">Premium Wrapping:</strong> Elegant satin ribbon & handcrafted wrapping paper.</p>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/60">
                  <Tag size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p><strong className="text-gray-900">Personalized Card:</strong> Include your custom warm message printed on a luxury note card.</p>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/60">
                  <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p><strong className="text-gray-900">Invoice Hidden:</strong> Price tags and invoice values are omitted from package.</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsGiftOrder(true);
                  setShowLearnMore(false);
                }}
                className="w-full py-3 rounded-full bg-[#111111] text-white font-bold text-sm tracking-wide uppercase hover:bg-black transition-colors"
              >
                Add Gift Packaging (@ ₹99)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
