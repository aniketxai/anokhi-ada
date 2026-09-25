import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, Folder } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import ProductsPageSkeleton from '../components/ProductsPageSkeleton';
import SectionHeading from '../components/SectionHeading';
import api from '../api';
import { CATEGORY_SUBCATEGORIES } from '../data/categories';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

const mainCategories = ['All', 'Packing Material', 'Earrings', 'Hair Accessories'];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(() => searchParams.get('category') || 'All');
  const [activeSubCategory, setActiveSubCategory] = useState(() => searchParams.get('subCategory') || 'All');

  useEffect(() => {
    const fromUrlCat = searchParams.get('category');
    if (fromUrlCat) {
      if (fromUrlCat.toLowerCase() === 'packing-material') setActiveCategory('Packing Material');
      else if (fromUrlCat.toLowerCase() === 'earrings') setActiveCategory('Earrings');
      else if (fromUrlCat.toLowerCase() === 'hair-accessories') setActiveCategory('Hair Accessories');
      else setActiveCategory(fromUrlCat);
    }
    const fromUrlSub = searchParams.get('subCategory') || searchParams.get('slug');
    if (fromUrlSub) {
      setActiveSubCategory(fromUrlSub);
    }
    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, [searchParams]);

  const [sort, setSort] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState(() => api.getCachedProducts());
  const [loading, setLoading] = useState(() => api.getCachedProducts().length === 0);

  // Available sub-categories for current active main category
  const availableSubCategories = useMemo(() => {
    if (activeCategory === 'All') {
      return Object.values(CATEGORY_SUBCATEGORIES).flat();
    }
    return CATEGORY_SUBCATEGORIES[activeCategory] || [];
  }, [activeCategory]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== 'All') {
      const targetCat = activeCategory.toLowerCase();
      result = result.filter(p => {
        const cat = (p.category || '').toLowerCase();
        return cat === targetCat;
      });
    }

    if (activeSubCategory !== 'All') {
      const targetSub = activeSubCategory.toLowerCase().replace(/[-_]/g, ' ');
      result = result.filter(p => {
        const sub = (p.subCategory || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return sub === targetSub || sub.includes(targetSub) || name.includes(targetSub);
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
  }, [products, search, activeCategory, activeSubCategory, sort]);

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

  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
    setActiveSubCategory('All');
  };

  if (loading) {
    return <ProductsPageSkeleton />;
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Catalogue"
          title="Products"
          description="Browse products organized by folder categories & subfolders."
        />

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Search products, polybag, earrings, claws..."
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

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {mainCategories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleSelectCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md scale-105'
                    : 'bg-surface-container text-foreground/70 hover:bg-surface-container/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sub-Category / Folder Tabs */}
        {availableSubCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-border/50">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <Folder size={13} /> Subfolders:
            </span>
            <button
              onClick={() => setActiveSubCategory('All')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeSubCategory === 'All'
                  ? 'bg-foreground text-background font-bold'
                  : 'bg-surface-muted text-foreground/60 hover:text-foreground'
              }`}
            >
              All Subfolders
            </button>
            {availableSubCategories.map((sub) => {
              const isActive = activeSubCategory.toLowerCase() === sub.toLowerCase();
              return (
                <button
                  key={sub}
                  onClick={() => setActiveSubCategory(sub)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-primary/10 text-primary font-bold border border-primary/30'
                      : 'bg-surface-muted text-foreground/60 hover:text-foreground'
                  }`}
                >
                  <Folder size={12} /> {sub}
                </button>
              );
            })}
          </div>
        )}

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
                <p className="text-secondary-text text-lg mb-2">No products found in this folder</p>
                <p className="text-outline text-sm">Try selecting a different subfolder or clear your search.</p>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
