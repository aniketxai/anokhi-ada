import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import SectionHeader from '../common/SectionHeader';

export default function SubcollectionStrip({ eyebrow, title, subtitle, items, viewAllHref }) {
  if (!items?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} viewAllHref={viewAllHref} />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mt-6">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
          >
            <Link
              to={`/products?category=${encodeURIComponent(item.slug)}`}
              className="group relative flex flex-col justify-end aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-surface-container border border-black/5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 select-none"
            >
              {/* Background Image */}
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-300" />
              )}

              {/* Gradient Scrim for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent group-hover:from-black/90 transition-colors" />

              {/* Card Label & Action Icon */}
              <div className="relative z-10 p-3 sm:p-4 flex items-end justify-between w-full">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-2 leading-tight drop-shadow-md group-hover:text-amber-300 transition-colors">
                  {item.name}
                </span>

                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110 ml-1">
                  <FiArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
