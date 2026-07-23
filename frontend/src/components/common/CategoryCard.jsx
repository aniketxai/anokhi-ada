import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';

export default function CategoryCard({ category, index = 0, size = 'md' }) {
  const h = size === 'lg' ? 'aspect-[16/10]' : 'aspect-square';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className="h-full"
    >
      <Link
        to={`/products?category=${encodeURIComponent(category.slug)}`}
        className="group block relative h-full rounded-[1.25rem] overflow-hidden bg-muted transition-all duration-300 hover:premium-shadow-lg hover:-translate-y-1"
      >
        <div className={`relative overflow-hidden ${h} h-full`}>
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
            <h3 className="font-serif text-lg sm:text-xl lg:text-2xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]">
              {category.name}
            </h3>
            {category.blurb && (
              <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-sm text-white/90 line-clamp-1 drop-shadow-sm">
                {category.blurb}
              </p>
            )}
            <span className="mt-2 sm:mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm shadow-sm group-hover:gap-2 transition-all">
              Shop now <FiChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
