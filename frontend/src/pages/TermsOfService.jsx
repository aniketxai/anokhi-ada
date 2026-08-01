import { motion } from 'framer-motion';
import { FileText, Shield, ShoppingBag, CreditCard, Truck, RefreshCw, AlertCircle, Lock, Phone, Mail } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import BlurBlob from '../components/BlurBlob';
import { BRAND } from '../data/brand';

export default function TermsOfService() {
  return (
    <div className="pt-24 pb-20 min-h-screen relative">
      <BlurBlob className="w-80 h-80 top-20 left-6 bg-secondary-container opacity-40" />
      <BlurBlob className="w-72 h-72 bottom-20 right-0 bg-accent-glow opacity-30" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        <SectionHeading
          label="Terms & Conditions"
          title="Terms of Service"
          description="Welcome to Anokhi Ada. Please read these terms carefully before accessing or using our website and services."
          center={true}
        />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container rounded-3xl p-6 sm:p-8 border border-border space-y-8"
        >
          {/* General Conditions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg">
              <Shield className="w-5 h-5" />
              <h2>📌 General Conditions</h2>
            </div>
            <ul className="space-y-2 text-sm text-secondary-text list-disc pl-5">
              <li>By using this website, you confirm that you are at least 18 years old or using it under the supervision of a parent or legal guardian.</li>
              <li>We reserve the right to refuse service to anyone for any reason at any time.</li>
              <li>Content on this website must not be misused, copied, duplicated, or exploited without express written permission from {BRAND.name}.</li>
            </ul>
          </div>

          {/* Products & Orders */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg">
              <ShoppingBag className="w-5 h-5" />
              <h2>🛍️ Products & Orders</h2>
            </div>
            <ul className="space-y-2 text-sm text-secondary-text list-disc pl-5">
              <li>All products shown on our site are subject to stock availability.</li>
              <li>We reserve the right to limit quantities or cancel any order at our sole discretion.</li>
              <li>Product images are for reference and display purposes; slight variations in color or packaging details may occur.</li>
            </ul>
          </div>

          {/* Pricing & Payments */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg">
              <CreditCard className="w-5 h-5" />
              <h2>💰 Pricing & Payments</h2>
            </div>
            <ul className="space-y-2 text-sm text-secondary-text list-disc pl-5">
              <li>All prices on {BRAND.name} are listed in INR (₹) and are subject to change without prior notice.</li>
              <li>We accept secure payments through verified payment gateways (Razorpay, UPI, Cards, NetBanking).</li>
              <li>Orders are processed only upon successful payment confirmation.</li>
            </ul>
          </div>

          {/* Shipping Policy */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg">
              <Truck className="w-5 h-5" />
              <h2>🚚 Shipping Policy</h2>
            </div>
            <ul className="space-y-2 text-sm text-secondary-text list-disc pl-5">
              <li>Orders are processed within 1–2 business days.</li>
              <li>Standard delivery time is 3–7 business days across India.</li>
              <li><strong>FREE Shipping</strong> on all orders above ₹499.</li>
              <li>Orders below ₹499 incur a flat ₹80 shipping fee.</li>
            </ul>
          </div>

          {/* Returns & Refunds */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg">
              <RefreshCw className="w-5 h-5" />
              <h2>🔄 Returns & Refunds</h2>
            </div>
            <ul className="space-y-2 text-sm text-secondary-text list-disc pl-5">
              <li>Return requests must be raised within 24 hours of delivery.</li>
              <li>A clear, uncut, and continuous unboxing video is strictly mandatory for any return or refund consideration.</li>
              <li>Approved refunds are processed to the original payment method within 5–7 working days after inspection.</li>
            </ul>
          </div>

          {/* Limitation of Liability */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-amber-600 font-bold text-lg">
              <AlertCircle className="w-5 h-5" />
              <h2>⚠️ Limitation of Liability</h2>
            </div>
            <p className="text-sm text-secondary-text leading-relaxed">
              {BRAND.name} shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products, services, or website platform.
            </p>
          </div>

          {/* Privacy */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg">
              <Lock className="w-5 h-5" />
              <h2>🔒 Privacy</h2>
            </div>
            <p className="text-sm text-secondary-text leading-relaxed">
              Your personal details are collected and handled strictly in accordance with our <a href="/privacy-policy" className="text-primary font-semibold underline">Privacy Policy</a>.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-lg">
              <Mail className="w-5 h-5" />
              <h2>✉️ Contact Information & Support</h2>
            </div>
            <p className="text-sm text-secondary-text leading-relaxed">
              For any queries, terms clarification, support, or order concerns, please feel free to reach out to us:
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={`mailto:${BRAND.email}`}
                className="inline-flex items-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-sm hover:bg-rose-700 transition-colors"
              >
                <Mail className="w-4 h-4" /> Email: {BRAND.email}
              </a>
              <a
                href={BRAND.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-sm hover:bg-emerald-700 transition-colors"
              >
                📱 WhatsApp: {BRAND.whatsapp}
              </a>
            </div>
          </div>

          {/* Changes to Terms */}
          <div className="space-y-2 pt-4 border-t border-border text-xs text-outline">
            <p><strong>ℹ️ Changes to Terms:</strong> We reserve the right to update or modify these Terms & Conditions at any time without prior notice. Continued use of the website confirms your acceptance of any revised terms.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
