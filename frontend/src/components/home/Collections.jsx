import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiFolder } from 'react-icons/fi';
import SectionHeader from '../common/SectionHeader';
import { collections as fallbackCollections, CATEGORY_SUBCATEGORIES } from '../../data/categories';

export default function Collections({ items, loading = false }) {
  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <SectionHeader
          eyebrow="Curated for you"
          title="Our Collections"
          subtitle="Explore our features and sub-collections for every project."
          viewAllHref="/products"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[1.5rem] aspect-[4/5] bg-slate-200/70 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  const activeCollections = Array.isArray(items) && items.length > 0 ? items : fallbackCollections;

  const getSubFolders = (catName) => {
    if (!catName) return [];
    if (CATEGORY_SUBCATEGORIES[catName]) return CATEGORY_SUBCATEGORIES[catName];
    // Find case-insensitive match
    const found = Object.keys(CATEGORY_SUBCATEGORIES).find(
      (k) => k.toLowerCase() === catName.toLowerCase() || catName.toLowerCase().includes(k.toLowerCase())
    );
    return found ? CATEGORY_SUBCATEGORIES[found] : [];
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
      <SectionHeader
        eyebrow="Curated for you"
        title="Our Collections"
        subtitle="Explore our sub-folders & categories designed for every requirement."
        viewAllHref="/products"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {activeCollections.map((c, i) => {
          const subFolders = c.subCategories && c.subCategories.length > 0
            ? c.subCategories
            : getSubFolders(c.name);

          const targetLink = `/collections/${encodeURIComponent(c.slug || c.name.toLowerCase().replace(/\s+/g, '-'))}`;

          return (
            <motion.div
              key={c.id || c.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col"
            >
              <div className="group relative flex flex-col overflow-hidden rounded-[1.5rem] bg-card border border-border/80 shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 flex-1">
                {/* Image header */}
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    <FiFolder className="w-3.5 h-3.5 text-primary-light" />
                    Collection
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 className="font-serif text-2xl font-bold tracking-tight drop-shadow-md">
                      {c.name}
                    </h3>
                  </div>
                </div>

                {/* Sub-folder features section */}
                <div className="flex-1 p-5 flex flex-col justify-between bg-card">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/60">
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary-text">
                        Sub-folder Features
                      </span>
                      <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {subFolders.length} Categories
                      </span>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {subFolders.map((sub, idx) => (
                        <li key={sub}>
                          <Link
                            to={`/products?category=${encodeURIComponent(c.name)}&subCategory=${encodeURIComponent(sub)}`}
                            className="group/item flex items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-foreground bg-surface-muted hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                                {idx + 1}
                              </span>
                              {sub}
                            </span>
                            <FiArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-primary" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to={targetLink}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 transition-all group-hover:shadow-md"
                  >
                    View All Subcategories <FiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
