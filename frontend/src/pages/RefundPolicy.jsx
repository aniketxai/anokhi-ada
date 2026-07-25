import { motion } from 'framer-motion';
import { PackageCheck, AlertTriangle, XCircle, RefreshCw, MessageSquare, ShieldAlert } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import BlurBlob from '../components/BlurBlob';
import { BRAND } from '../data/brand';

export default function RefundPolicy() {
  return (
    <div className="pt-24 pb-20 min-h-screen relative">
      <BlurBlob className="w-80 h-80 top-20 left-6 bg-secondary-container opacity-40" />
      <BlurBlob className="w-72 h-72 bottom-20 right-0 bg-accent-glow opacity-30" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        <SectionHeading
          label="Legal & Policies"
          title="Return & Refund Policy"
          description="At Anokhi Ada, we ensure quality products, but if you face any issue, we offer a limited return policy."
          center={true}
        />

        {/* Highlight Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg mb-1">
                Mandatory Unboxing Video Policy
              </h3>
              <p className="text-secondary-text text-sm leading-relaxed">
                An unboxing video is <strong>strictly mandatory</strong> for any return or refund request. The video must be clear, continuous, and uncut showing the full opening of the package.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Grid Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Return Eligibility */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-container rounded-3xl p-6 border border-border"
          >
            <div className="flex items-center gap-3 mb-4 text-emerald-600">
              <PackageCheck className="w-6 h-6" />
              <h2 className="font-bold text-lg text-foreground">📦 Return Eligibility</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-secondary-text">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Return request must be raised within <strong>24 hours</strong> of delivery.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>An <strong>unboxing video (mandatory)</strong> is required for any return request.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>The video must be clear, continuous, and uncut showing the full opening of the package.</span>
              </li>
            </ul>
          </motion.div>

          {/* Important Conditions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container rounded-3xl p-6 border border-border"
          >
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="font-bold text-lg text-foreground">⚠️ Important Conditions</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-secondary-text">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Without an unboxing video, no return or refund will be accepted.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Product must be unused, undamaged, and in original packaging.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Any damage or wrong item must be clearly visible in the unboxing video.</span>
              </li>
            </ul>
          </motion.div>

          {/* Non-Returnable Cases */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-container rounded-3xl p-6 border border-border"
          >
            <div className="flex items-center gap-3 mb-4 text-rose-600">
              <XCircle className="w-6 h-6" />
              <h2 className="font-bold text-lg text-foreground">❌ Non-Returnable Cases</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-secondary-text">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Used or worn products.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Requests made after 24 hours of delivery.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Missing or edited/cut unboxing video.</span>
              </li>
            </ul>
          </motion.div>

          {/* Refund Process */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-surface-container rounded-3xl p-6 border border-border"
          >
            <div className="flex items-center gap-3 mb-4 text-sky-600">
              <RefreshCw className="w-6 h-6" />
              <h2 className="font-bold text-lg text-foreground">💰 Refund Process</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-secondary-text">
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">•</span>
                <span>Once your return is approved, refund will be processed within <strong>5–7 working days</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">•</span>
                <span>Refund will be issued via original payment method or store credit (if applicable).</span>
              </li>
            </ul>
          </motion.div>

        </div>

        {/* Contact to Request Return */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent rounded-3xl p-6 sm:p-8 border border-emerald-500/20 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-600 font-bold">
              <MessageSquare className="w-5 h-5" />
              <span>📞 How to Request Return</span>
            </div>
            <p className="text-secondary-text text-sm max-w-xl">
              To initiate a return, contact us on WhatsApp with your <strong>Order details</strong> and <strong>Unboxing video proof</strong>.
            </p>
          </div>

          <a
            href={BRAND.social.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:bg-emerald-700 transition-colors shrink-0"
          >
            <span>WhatsApp Support: {BRAND.whatsapp}</span>
          </a>
        </motion.div>

        {/* Note */}
        <p className="text-xs text-outline text-center">
          ℹ️ <strong>Note:</strong> {BRAND.name} reserves the right to reject any return request that does not meet the above conditions.
        </p>

      </div>
    </div>
  );
}
