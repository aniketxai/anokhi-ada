import { motion } from 'framer-motion';
import { ShieldCheck, Database, Target, Lock, Share2, Cookie, UserCheck, Phone, RefreshCw } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import BlurBlob from '../components/BlurBlob';
import { BRAND } from '../data/brand';

export default function PrivacyPolicy() {
  return (
    <div className="pt-24 pb-20 min-h-screen relative">
      <BlurBlob className="w-80 h-80 top-20 left-6 bg-secondary-container opacity-40" />
      <BlurBlob className="w-72 h-72 bottom-20 right-0 bg-accent-glow opacity-30" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        <SectionHeading
          label="Data Protection & Security"
          title="Privacy Policy"
          description="At Anokhi Ada, we value your privacy and are committed to protecting your personal information."
          center={true}
        />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container rounded-3xl p-6 sm:p-8 border border-border space-y-8"
        >
          {/* Introduction */}
          <p className="text-sm text-secondary-text leading-relaxed">
            This Privacy Policy explains how <strong>{BRAND.name}</strong> collects, uses, and safeguards your personal data when you visit our website or make purchases.
          </p>

          {/* Information We Collect */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg">
              <Database className="w-5 h-5" />
              <h2>📌 Information We Collect</h2>
            </div>
            <p className="text-sm text-secondary-text">We may collect the following information when you interact with our website:</p>
            <ul className="space-y-2 text-sm text-secondary-text list-disc pl-5">
              <li><strong>Personal Details:</strong> Name, phone number, and delivery shipping address.</li>
              <li><strong>Contact Info:</strong> Email address (if provided during checkout or enquiry).</li>
              <li><strong>Payment Data:</strong> Payment details processed securely via certified third-party payment gateways (Razorpay).</li>
              <li><strong>Technical Data:</strong> Device, IP address, and browsing interaction information for analytics and performance enhancement.</li>
            </ul>
          </div>

          {/* How We Use Information */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg">
              <Target className="w-5 h-5" />
              <h2>🎯 How We Use Your Information</h2>
            </div>
            <ul className="space-y-2 text-sm text-secondary-text list-disc pl-5">
              <li>Process, fulfill, and deliver your orders accurately.</li>
              <li>Provide customer service and respond to queries via WhatsApp.</li>
              <li>Enhance and optimize our website experience.</li>
              <li>Send order status updates and essential notifications.</li>
            </ul>
          </div>

          {/* Data Protection */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-lg">
              <Lock className="w-5 h-5" />
              <h2>🔐 Data Protection</h2>
            </div>
            <p className="text-sm text-secondary-text leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal data. <strong>Your payment credentials are handled using 256-bit encrypted SSL payment gateways and are never stored on our servers.</strong>
            </p>
          </div>

          {/* Sharing of Information */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg">
              <Share2 className="w-5 h-5" />
              <h2>🤝 Sharing of Information</h2>
            </div>
            <p className="text-sm text-secondary-text leading-relaxed">
              We do <strong>not</strong> sell, rent, or trade your personal information to third parties for marketing purposes. Data is shared exclusively with:
            </p>
            <ul className="space-y-2 text-sm text-secondary-text list-disc pl-5">
              <li><strong>Delivery Partners:</strong> For order fulfillment and logistics tracking (e.g. {BRAND.courier}).</li>
              <li><strong>Payment Gateways:</strong> For secure payment verification and processing.</li>
            </ul>
          </div>

          {/* Cookies */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-amber-600 font-bold text-lg">
              <Cookie className="w-5 h-5" />
              <h2>🍪 Cookies</h2>
            </div>
            <p className="text-sm text-secondary-text leading-relaxed">
              Our website may use browser cookies to enhance your shopping experience, preserve cart state, and analyze website traffic.
            </p>
          </div>

          {/* Your Rights */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg">
              <UserCheck className="w-5 h-5" />
              <h2>👤 Your Rights</h2>
            </div>
            <p className="text-sm text-secondary-text leading-relaxed">You have the right to access, request corrections, or request deletion of your personal data stored with us.</p>
          </div>

          {/* Contact Us */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-lg">
              <Phone className="w-5 h-5" />
              <h2>📞 Contact Us</h2>
            </div>
            <p className="text-sm text-secondary-text">For any privacy-related questions or data deletion requests, contact us on WhatsApp:</p>
            <a
              href={BRAND.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-sm hover:bg-emerald-700 transition-colors"
            >
              📱 WhatsApp Support: {BRAND.whatsapp}
            </a>
          </div>

          {/* Policy Updates */}
          <div className="space-y-2 pt-4 border-t border-border text-xs text-outline">
            <p><strong>ℹ️ Policy Updates:</strong> {BRAND.name} reserves the right to update this Privacy Policy at any time. Changes will be reflected on this page. By using our website, you agree to this Privacy Policy.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
