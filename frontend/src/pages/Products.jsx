import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import ProductsPageSkeleton from '../components/ProductsPageSkeleton';
import SectionHeading from '../components/SectionHeading';
import api from '../api';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

export default function Products() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(() => searchParams.get('category') || 'All');

  useEffect(() => {
    const fromUrl = searchParams.get('category');
    if (fromUrl) setActiveCategory(fromUrl);
    const q = searchParams.get('q');
    if (q) setSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const [sort, setSort] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState(() => api.getCachedProducts());
  const [loading, setLoading] = useState(() => api.getCachedProducts().length === 0);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== 'All') {
      const target = activeCategory.toLowerCase().replace(/[-_]/g, ' ');
      result = result.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const sub = (p.subCategory || '').toLowerCase();
        const name = (p.name || '').toLowerCase();

        if (activeCategory === 'packing-material' || target === 'packing material') {
          return cat === 'packing material';
        }
        if (activeCategory === 'polybag' || target === 'polybag') {
          return sub === 'polybag' || name.includes('polybag');
        }
        if (activeCategory === 'corrugated-box' || target === 'corrugated box') {
          return sub === 'corrugated box' || name.includes('corrugated');
        }
        if (activeCategory === 'tape' || target === 'tape') {
          return sub === 'tape' || name.includes('tape');
        }

        return cat === target || cat.includes(target) || sub === target || sub.includes(target);
      });
    }

    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest':
        result.sort((a, b) => {
          if (a.badge === 'New' && b.badge !== 'New') return -1;
          if (b.badge === 'New' && a.badge !== 'New') return 1;
          return 0;
        });
        break;
      default: break;
    }

    return result;
  }, [products, search, activeCategory, sort]);

  useEffect(() => {
    let active = true;

    api.fetchProducts()
      .then(result => {
        if (!active) return;
        setProducts(result.items || []);
      })
      .catch(() => {
        if (!active) return;
        setProducts(api.getCachedProducts());
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <ProductsPageSkeleton />;
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Catalogue"
          title="Products"
          description="Precision-engineered components and accessories for every build."
        />

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface-container rounded-2xl text-sm text-foreground placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 transition-material"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-foreground transition-material"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="relative hidden sm:block">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-surface-container rounded-2xl text-sm text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 transition-material"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 bg-surface-container rounded-2xl text-sm text-foreground"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden overflow-hidden mb-6"
            >
              <div className="bg-surface-container rounded-3xl p-4 space-y-4">
                <div className="relative">
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-3 bg-background rounded-2xl text-sm text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 transition-material"
                  >
                    {sortOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-sm text-outline mb-6">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </motion.div>
          ) : (
            filtered.length > 0 ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
              >
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <p className="text-secondary-text text-lg mb-2">No products found</p>
                <p className="text-outline text-sm">Try adjusting your search or filters.</p>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
