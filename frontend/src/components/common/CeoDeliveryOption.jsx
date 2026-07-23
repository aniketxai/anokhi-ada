import { Crown, Sparkles, Check } from 'lucide-react';
import { useApp } from '../../context/useApp';
import { formatINR } from '../../utils/currency';

export default function CeoDeliveryOption({ className = '' }) {
  const { isCeoDelivery, toggleCeoDelivery } = useApp();

  return (
    <div
      onClick={toggleCeoDelivery}
      className={`relative cursor-pointer rounded-3xl p-4 sm:p-5 border transition-all duration-300 select-none ${
        isCeoDelivery
          ? 'border-amber-500 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 shadow-md ring-2 ring-amber-500/30'
          : 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60'
      } ${className}`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox */}
        <div
          className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
            isCeoDelivery
              ? 'border-amber-600 bg-amber-500 text-black'
              : 'border-amber-500/50 bg-transparent'
          }`}
        >
          {isCeoDelivery && <Check size={16} strokeWidth={3} />}
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Crown size={16} />
              </span>
              <h4 className="font-extrabold text-foreground text-sm sm:text-base flex items-center gap-1.5">
                Delivery by CEO
                <Sparkles size={14} className="text-amber-500 fill-amber-500 inline-block" />
              </h4>
            </div>

            <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-3 py-1 rounded-full">
              +{formatINR(5000)}
            </span>
          </div>

          <p className="text-xs text-secondary-text leading-relaxed">
            Our Founder & CEO will personally deliver your package to your doorstep with a luxury VIP gift package & personalized handwritten note.
          </p>
        </div>
      </div>
    </div>
  );
}
