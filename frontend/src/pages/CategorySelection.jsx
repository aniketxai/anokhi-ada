import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Folder, ArrowRight, Grid } from 'lucide-react';
import api from '../api';
import {
  categories as fallbackCategories,
  CATEGORY_SUBCATEGORIES,
  SUBCATEGORY_IMAGES,
} from '../data/categories';

const DEFAULT_CATEGORY_IMAGES = {
  'packing material': 'https://images.pexels.com/photos/4464819/pexels-photo-4464819.jpeg?auto=compress&cs=tinysrgb&w=900',
  'earrings': 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=900',
  'hair accessories': 'https://images.pexels.com/photos/6068943/pexels-photo-6068943.jpeg?auto=compress&cs=tinysrgb&w=900',
};

function normalizeSlug(str = '') {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ');
}

export default function CategorySelection() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const [dbCategories, setDbCategories] = useState([]);
  const [products, setProducts] = useState(() => api.getCachedProducts());
  const [siteContent, setSiteContent] = useState(() => api.getCachedSiteContent());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([
      api.fetchAdminCategories().catch(() => ({ data: [] })),
      api.fetchProducts().catch(() => ({ items: [] })),
      api.fetchSiteContent().catch(() => ({})),
    ]).then(([catRes, prodRes, siteRes]) => {
      if (!active) return;
      if (catRes?.data) setDbCategories(catRes.data);
      if (prodRes?.items) setProducts(prodRes.items);
      if (siteRes) setSiteContent(siteRes);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  // Match current category name
  const categoryName = useMemo(() => {
    const raw = normalizeSlug(categorySlug);
    if (!raw) return 'Category';

    if (raw === 'packing material' || raw.includes('packing')) return 'Packing Material';
    if (raw === 'earrings' || raw.includes('earring')) return 'Earrings';
    if (raw === 'hair accessories' || raw.includes('hair')) return 'Hair Accessories';

    // Try finding in Site Content collections
    const foundSite = siteContent?.collections?.find(
      (c) => normalizeSlug(c.name) === raw || normalizeSlug(c.slug) === raw
    );
    if (foundSite) return foundSite.name;

    // Try finding in DB
    const foundDb = dbCategories.find(
      (c) => normalizeSlug(c.name) === raw || normalizeSlug(c.name).includes(raw)
    );
    if (foundDb) return foundDb.name;

    // Capitalize as title
    return categorySlug
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [categorySlug, dbCategories, siteContent]);

  // Subcategories list (returns objects with name and photo if set in Admin)
  const subCategoriesList = useMemo(() => {
    const norm = normalizeSlug(categoryName);
    let rawList = [];

    // 1. Check Site Content collections (Featured Homepage Collections) first
    if (siteContent?.collections) {
      const siteMatch = siteContent.collections.find(
        (c) => normalizeSlug(c.name) === norm || normalizeSlug(c.slug) === norm
      );
      if (siteMatch && Array.isArray(siteMatch.subCategories) && siteMatch.subCategories.length > 0) {
        rawList = siteMatch.subCategories.map((sub) =>
          typeof sub === 'string' ? { name: sub, image: '' } : sub
        );
      }
    }

    // 2. Check DB Categories second
    if (rawList.length === 0) {
      const dbMatch = dbCategories.find((c) => normalizeSlug(c.name) === norm);
      if (dbMatch && Array.isArray(dbMatch.subCategories) && dbMatch.subCategories.length > 0) {
        rawList = dbMatch.subCategories.map((sub) =>
          typeof sub === 'string' ? { name: sub, image: '' } : sub
        );
      }
    }

    // 3. Check static dictionary mapping
    if (rawList.length === 0) {
      for (const [key, subs] of Object.entries(CATEGORY_SUBCATEGORIES)) {
        if (normalizeSlug(key) === norm || norm.includes(normalizeSlug(key))) {
          rawList = subs.map((sub) => ({ name: sub, image: '' }));
          break;
        }
      }
    }

    // 4. Extract unique subCategories from products matching this category
    if (rawList.length === 0) {
      const distinctSubs = [
        ...new Set(
          products
            .filter((p) => normalizeSlug(p.category) === norm)
            .map((p) => p.subCategory)
            .filter(Boolean)
        ),
      ];

      rawList = (distinctSubs.length > 0 ? distinctSubs : ['All Products']).map((sub) => ({
        name: sub,
        image: '',
      }));
    }

    // Case-insensitive deduplication to prevent duplicate pills/cards like "Earrings box" & "Earrings Box"
    const seen = new Set();
    const result = [];
    for (const item of rawList) {
      const name = typeof item === 'string' ? item : item?.name;
      if (!name) continue;
      const key = normalizeSlug(name);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }

    return result;
  }, [categoryName, dbCategories, siteContent, products]);

  // Get image for subcategory
  const getSubCategoryImg = (subItem) => {
    if (typeof subItem === 'object' && subItem.image) {
      return subItem.image;
    }

    const subName = typeof subItem === 'object' ? subItem.name : subItem;
    const normSub = normalizeSlug(subName);

    // Check Site Content collection subcategories for custom photo matching this name
    if (siteContent?.collections) {
      for (const col of siteContent.collections) {
        if (Array.isArray(col.subCategories)) {
          const matchedSub = col.subCategories.find(
            (s) => typeof s === 'object' && s.image && normalizeSlug(s.name) === normSub
          );
          if (matchedSub?.image) return matchedSub.image;
        }
      }
    }

    // Check known static subcategory images
    if (SUBCATEGORY_IMAGES[normSub]) return SUBCATEGORY_IMAGES[normSub];
    for (const [k, v] of Object.entries(SUBCATEGORY_IMAGES)) {
      if (normSub.includes(k) || k.includes(normSub)) return v;
    }

    // Find product image matching this subcategory
    const matchingProd = products.find(
      (p) =>
        normalizeSlug(p.category) === normalizeSlug(categoryName) &&
        normalizeSlug(p.subCategory) === normSub &&
        p.images?.[0]
    );
    if (matchingProd?.images?.[0]) return matchingProd.images[0];

    // Fallback main category image
    const categoryImg =
      DEFAULT_CATEGORY_IMAGES[normalizeSlug(categoryName)] ||
      'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=600';
    return categoryImg;
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </button>

          <Link
            to={`/products?category=${encodeURIComponent(categoryName)}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
          >
            View All {categoryName} Products <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Page Header */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-r from-primary/15 via-accent/10 to-primary/5 p-8 sm:p-12 border border-border/80 shadow-md">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-3.5 py-1 text-xs font-bold text-primary mb-4">
              <Folder className="h-3.5 w-3.5" /> Our Collections
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              {categoryName}
            </h1>
            <p className="mt-3 text-sm sm:text-base font-medium text-secondary-text">
              Select a subcategory below to explore curated items in {categoryName}.
            </p>
          </div>
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        </div>

        {/* Subcategories Header */}
        <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Subcategories
            </h2>
            <p className="text-xs text-secondary-text mt-0.5">
              Click any circle to view filtered products
            </p>
          </div>
          <span className="rounded-full bg-surface-muted border border-border px-3 py-1 text-xs font-semibold text-secondary-text">
            {subCategoriesList.length} Options
          </span>
        </div>

        {/* CIRCLE TYPE DESIGN GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 justify-items-center">
          {subCategoriesList.map((sub, index) => {
            const subName = typeof sub === 'object' ? sub.name : sub;
            const imgUrl = getSubCategoryImg(sub);
            const targetUrl = `/products?category=${encodeURIComponent(categoryName)}&subCategory=${encodeURIComponent(subName)}`;

            return (
              <motion.div
                key={`${subName}-${index}`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group flex flex-col items-center text-center cursor-pointer w-full max-w-[180px]"
                onClick={() => navigate(targetUrl)}
              >
                {/* CIRCLE CARD THUMBNAIL */}
                <div className="relative mb-4">
                  {/* Outer glowing ring effect */}
                  <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />

                  {/* Main Circle Container */}
                  <div className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-full overflow-hidden border-4 border-card shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105 bg-muted">
                    <img
                      src={imgUrl}
                      alt={subName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Numeric Badge (e.g. 1, 2, 3) */}
                    <div className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground shadow-md">
                      {index + 1}
                    </div>

                    {/* Quick view indicator on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/20 backdrop-blur-[2px]">
                      <span className="rounded-full bg-white/90 text-foreground text-[10px] font-bold px-2.5 py-1 shadow-md">
                        Shop Now
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subcategory Label */}
                <div className="space-y-1">
                  <h3 className="font-serif text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {index + 1}. {subName}
                  </h3>
                  <p className="text-[11px] font-semibold text-secondary-text group-hover:text-foreground transition-colors flex items-center justify-center gap-1">
                    Explore <ArrowRight className="h-3 w-3 inline opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick link banner to all products */}
        <div className="mt-16 text-center">
          <Link
            to={`/products?category=${encodeURIComponent(categoryName)}`}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-xs font-bold text-foreground hover:border-primary hover:bg-muted transition-all shadow-sm"
          >
            <Grid className="h-4 w-4 text-primary" /> View All {categoryName} Catalog Items
          </Link>
        </div>
      </div>
    </div>
  );
}
