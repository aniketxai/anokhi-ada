import { motion } from 'framer-motion';
import { FiTruck, FiShield, FiGift, FiHeadphones } from 'react-icons/fi';
import { BRAND } from '../../data/brand';

const features = [
  {
    icon: FiTruck,
    title: 'Free Shipping',
    desc: `On orders above ₹${BRAND.freeShippingThreshold}`,
  },
  { icon: FiShield, title: 'Secure Packaging', desc: 'Every order packed with care' },
  { icon: FiGift, title: 'Premium Gifting', desc: 'Handcrafted with love' },
  { icon: FiHeadphones, title: 'Support', desc: BRAND.supportTime },
];

export default function FeatureSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex items-center gap-3 rounded-2xl bg-card border border-border p-3.5 sm:p-4 transition-all duration-300 hover:premium-shadow hover:border-primary/30"
          >
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-accent/60 flex items-center justify-center text-primary shrink-0">
              <f.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium line-clamp-1">{f.title}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
