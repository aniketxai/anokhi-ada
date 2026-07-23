import { motion } from 'framer-motion';
import SectionHeading from '../components/SectionHeading';
import BlurBlob from '../components/BlurBlob';

export default function About() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <BlurBlob className="w-[24rem] h-[24rem] sm:w-[32rem] sm:h-[32rem] top-0 left-0 bg-primary" />
      <BlurBlob className="w-[18rem] h-[18rem] sm:w-[25rem] sm:h-[25rem] bottom-20 right-0 bg-secondary-container" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        <SectionHeading
          label="About"
          title="Welcome to Anokhi Ada – Where Every Detail Tells Your Story"
          description="Founded in 2022, we curate elegant fashion accessories and unique gifting essentials that combine quality, style, and affordability."
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-surface-container rounded-3xl p-8 sm:p-12"
        >
          <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
          <p className="text-secondary-text leading-relaxed">
            To help make every moment unforgettable by providing stylish, high‑quality, and affordable products that bring happiness to our customers.
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Choose Anokhi Ada?</h3>
          <ul className="list-disc list-inside text-secondary-text space-y-2">
            <li>✨ Premium Quality Products</li>
            <li>🚚 Fast &amp; Secure Delivery Across India</li>
            <li>💝 Unique &amp; Trendy Collections</li>
            <li>❤️ Customer‑First Support</li>
            <li>🔒 Safe &amp; Secure Shopping</li>
          </ul>
          <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">Our Promise</h3>
          <p className="text-secondary-text leading-relaxed">
            We are committed to quality, transparency, and exceptional service. Your trust inspires us to keep improving and bringing you products that truly stand out.
          </p>
        </motion.div>
      </div>
    </div>
  );
}