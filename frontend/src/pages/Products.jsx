import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
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

export default function Products() {
  const [searchParams] = useSearchParams();
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
  const [siteContent, setSiteContent] = useState(() => api.getCachedSiteContent());
  const [loading, setLoading] = useState(() => api.getCachedProducts().length === 0);

  const categories = useMemo(
    () => [...new Set((products || []).map(product => product.category).filter(Boolean))],
    [products]
  );

  const subCategoryPills = useMemo(() => {
    if (activeCategory === 'All') return [];
    const normCat = activeCategory.toLowerCase().trim().replace(/[-_]/g, ' ');

    let list = [];

    // 1. Check siteContent collections (Admin Panel homepage collections) first
    const siteMatch = (siteContent?.collections || []).find(
      (c) =>
        (c.name || '').toLowerCase().trim().replace(/[-_]/g, ' ') === normCat ||
        (c.slug || '').toLowerCase().trim().replace(/[-_]/g, ' ') === normCat
    );
    if (siteMatch && Array.isArray(siteMatch.subCategories) && siteMatch.subCategories.length > 0) {
      list = siteMatch.subCategories.map((s) => (typeof s === 'string' ? s : s.name));
    }

    // 2. Check static CATEGORY_SUBCATEGORIES fallback
    if (list.length === 0) {
      for (const [k, v] of Object.entries(CATEGORY_SUBCATEGORIES)) {
        if (k.toLowerCase().trim() === normCat || normCat.includes(k.toLowerCase().trim())) {
          list = [...v];
          break;
        }
      }
    }

    // 3. Extract subcategories from matching products
    const fromProds = (products || [])
      .filter((p) => (p.category || '').toLowerCase().trim().replace(/[-_]/g, ' ').includes(normCat))
      .map((p) => p.subCategory)
      .filter(Boolean);

    const combined = [...list, ...fromProds];

    // Case-insensitive deduplication
    const seen = new Set();
    const result = [];
    for (const sub of combined) {
      if (!sub) continue;
      const key = sub.toLowerCase().trim().replace(/[-_]/g, ' ');
      if (!seen.has(key)) {
        seen.add(key);
        result.push(sub);
      }
    }

    return result;
  }, [activeCategory, products, siteContent]);

  const showCategoryPills = activeCategory === 'All';

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
      const targetCat = activeCategory.toLowerCase().replace(/[-_]/g, ' ');
      result = result.filter(p => {
        const cat = (p.category || '').toLowerCase().replace(/[-_]/g, ' ');
        return cat === targetCat || cat.includes(targetCat);
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

    Promise.all([
      api.fetchProducts().catch(() => ({ items: [] })),
      api.fetchSiteContent().catch(() => null),
    ])
      .then(([prodRes, siteRes]) => {
        if (!active) return;
        if (prodRes?.items) setProducts(prodRes.items);
        if (siteRes) setSiteContent(siteRes);
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
          label={activeCategory !== 'All' ? 'Category' : 'Catalogue'}
          title={
            activeCategory !== 'All'
              ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1).replace(/[-_]/g, ' ')
              : 'Products'
          }
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
                {showCategoryPills && (
                  <div className="flex flex-wrap gap-2">
                    {['All', ...categories].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-material cursor-pointer ${
                          activeCategory === cat
                            ? 'bg-primary text-white'
                            : 'bg-background text-secondary-text hover:bg-surface-muted'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category pills - shown on main products page (/products) */}
        {showCategoryPills ? (
          <div className="hidden sm:flex flex-wrap gap-2 mb-8">
            {['All', ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-material cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container text-secondary-text hover:bg-surface-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : (
          /* Subcategory pills - shown when a specific category is selected */
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-text mr-1">
              Subcategories:
            </span>
            <button
              onClick={() => setActiveSubCategory('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeSubCategory === 'All'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-surface-container text-secondary-text hover:bg-surface-muted'
              }`}
            >
              All {activeCategory}
            </button>
            {subCategoryPills.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubCategory(sub)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeSubCategory.toLowerCase().replace(/[-_]/g, ' ') === sub.toLowerCase().replace(/[-_]/g, ' ')
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-surface-container text-secondary-text hover:bg-surface-muted border border-border/60'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-outline font-medium">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
          {activeCategory !== 'All' && (
            <button
              onClick={() => {
                setActiveCategory('All');
                setActiveSubCategory('All');
              }}
              className="text-xs text-primary font-bold hover:underline"
            >
              Reset Category Filters
            </button>
          )}
        </div>

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
