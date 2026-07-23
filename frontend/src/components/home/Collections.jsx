import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import SectionHeader from '../common/SectionHeader';
import { collections } from '../../data/categories';

export default function Collections() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
      <SectionHeader
        eyebrow="Curated for you"
        title="Our Collections"
        subtitle="Thoughtfully curated edits for every project and occasion."
        viewAllHref="/products"
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
        {collections.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link
              to={`/products?category=${encodeURIComponent(c.slug)}`}
              className="group block relative overflow-hidden rounded-[1.25rem] aspect-[3/4] bg-muted transition-all duration-300 hover:premium-shadow-lg hover:-translate-y-1"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
                <h3 className="font-serif text-lg sm:text-xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]">
                  {c.name}
                </h3>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm shadow-sm group-hover:gap-2 transition-all">
                  View more <FiArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
