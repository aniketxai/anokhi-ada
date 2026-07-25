import { motion } from 'framer-motion';
import { Truck, Clock, CheckCircle2, ShieldCheck, MessageCircle } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import BlurBlob from '../components/BlurBlob';
import { BRAND } from '../data/brand';

export default function ShippingPolicy() {
  return (
    <div className="pt-24 pb-20 min-h-screen relative">
      <BlurBlob className="w-80 h-80 top-20 left-6 bg-secondary-container opacity-40" />
      <BlurBlob className="w-72 h-72 bottom-20 right-0 bg-accent-glow opacity-30" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        <SectionHeading
          label="Delivery Details"
          title="Shipping Policy"
          description="At Anokhi Ada, we aim to deliver your orders quickly, safely, and efficiently across India."
          center={true}
        />

        {/* Feature Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container rounded-3xl p-5 border border-border flex items-center gap-3"
          >
            <div className="p-3 bg-primary/10 text-primary rounded-2xl shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-outline font-medium">Processing Time</p>
              <p className="font-bold text-foreground text-sm">1–2 Business Days</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-container rounded-3xl p-5 border border-border flex items-center gap-3"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-outline font-medium">Delivery Duration</p>
              <p className="font-bold text-foreground text-sm">3–7 Business Days</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container rounded-3xl p-5 border border-border flex items-center gap-3"
          >
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-outline font-medium">Delivery Coverage</p>
              <p className="font-bold text-foreground text-sm">PAN India Shipping</p>
            </div>
          </motion.div>
        </div>

        {/* Detailed Shipping Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-container rounded-3xl p-6 sm:p-8 border border-border space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Truck className="w-6 h-6 text-primary" />
            <h2 className="font-bold text-xl text-foreground">🚚 Shipping Charges & Rates</h2>
          </div>

          <ul className="space-y-4 text-sm text-secondary-text">
            <li className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">FREE Shipping on all orders above ₹499:</strong> No extra delivery fees applied at checkout for orders meeting this value.
              </div>
            </li>

            <li className="flex items-start gap-3 p-3 rounded-2xl bg-surface-muted border border-border">
              <span className="text-primary font-bold text-lg">•</span>
              <div>
                <strong className="text-foreground">Orders below ₹499:</strong> Incur a flat shipping charge of ₹80 across all standard deliveries in India.
              </div>
            </li>

            <li className="flex items-start gap-3 p-3 rounded-2xl bg-surface-muted border border-border">
              <span className="text-primary font-bold text-lg">•</span>
              <div>
                <strong className="text-foreground">Pan India Coverage:</strong> We partner with trusted courier networks like <em>{BRAND.courier}</em> to ensure safe and trackable doorstep delivery.
              </div>
            </li>
          </ul>

          <div className="pt-2 text-xs text-outline leading-relaxed border-t border-border">
            Please double-check your shipping address and active mobile number during checkout to prevent any transit or delivery delays.
          </div>
        </motion.div>

        {/* Need Help CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface-container rounded-3xl p-6 text-center space-y-3 border border-border"
        >
          <p className="font-bold text-foreground text-base">Have questions about your package delivery?</p>
          <p className="text-sm text-secondary-text">For any shipping queries or order tracking updates, contact our team via WhatsApp.</p>
          
          <a
            href={BRAND.social.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:bg-emerald-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Support: {BRAND.whatsapp}</span>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
