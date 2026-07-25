import { motion } from 'framer-motion';
import { Scale, ShieldAlert, Copyright, Building2, Phone } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import BlurBlob from '../components/BlurBlob';
import { BRAND } from '../data/brand';

export default function LegalNotice() {
  return (
    <div className="pt-24 pb-20 min-h-screen relative">
      <BlurBlob className="w-80 h-80 top-20 left-6 bg-secondary-container opacity-40" />
      <BlurBlob className="w-72 h-72 bottom-20 right-0 bg-accent-glow opacity-30" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        <SectionHeading
          label="Legal Documentation"
          title="Legal Notice"
          description="Official legal terms and copyright disclosures for Anokhi Ada."
          center={true}
        />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container rounded-3xl p-6 sm:p-8 border border-border space-y-8"
        >
          {/* Intellectual Property */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg">
              <Copyright className="w-5 h-5" />
              <h2>Intellectual Property & Copyright</h2>
            </div>
            <p className="text-sm text-secondary-text leading-relaxed">
              All content published on this website — including product designs, text, photographs, graphic elements, trademarks, logos, and brand assets — is the exclusive property of <strong>{BRAND.name}</strong>.
            </p>
            <p className="text-sm text-secondary-text leading-relaxed">
              Unauthorized use, reproduction, modification, distribution, or copying of any material without explicit prior written authorization from {BRAND.name} is strictly prohibited and subject to legal enforcement under Indian intellectual property laws.
            </p>
          </div>

          {/* Disclaimer & Limitation of Liability */}
          <div className="space-y-3 pt-6 border-t border-border">
            <div className="flex items-center gap-2.5 text-amber-600 font-bold text-lg">
              <ShieldAlert className="w-5 h-5" />
              <h2>Limitation of Liability</h2>
            </div>
            <p className="text-sm text-secondary-text leading-relaxed">
              {BRAND.name} makes every effort to ensure the accuracy of product images, pricing, and descriptions. However, we are not liable for any indirect, special, or incidental damages arising from the use or inability to use our products or website.
            </p>
          </div>

          {/* Business & Support Details */}
          <div className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-lg">
              <Building2 className="w-5 h-5" />
              <h2>Business Details & Contact</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-surface-muted border border-border">
                <p className="text-xs text-outline font-medium">Business Name</p>
                <p className="font-bold text-foreground text-base mt-0.5">{BRAND.name}</p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-muted border border-border">
                <p className="text-xs text-outline font-medium">Location</p>
                <p className="font-bold text-foreground text-base mt-0.5">{BRAND.city}</p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={BRAND.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp Legal Contact: {BRAND.whatsapp}</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
