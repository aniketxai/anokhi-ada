import { useEffect, useState } from 'react';
import api from '../api';

import Hero from '../components/home/Hero';
import FeatureSection from '../components/home/FeatureSection';
import Collections from '../components/home/Collections';
import SubcollectionStrip from '../components/home/SubcollectionStrip';
import ProductSection from '../components/home/ProductSection';
import FeaturedCategories from '../components/home/FeaturedCategories';
import AboutBrand from '../components/home/AboutBrand';
import Reviews from '../components/home/Reviews';
import InstagramGallery from '../components/home/InstagramGallery';
import Newsletter from '../components/home/Newsletter';
import { hotSelling, customPackaging, somethingForHer } from '../data/categories';

export default function Home() {
  const [products, setProducts] = useState(() => api.getCachedProducts());
  const [loading, setLoading] = useState(() => api.getCachedProducts().length === 0);

  useEffect(() => {
    let active = true;
    api.fetchProducts().then(({ items }) => {
      if (active) setProducts(items || []);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const getTags = (p) => p.tags || [];
  const newArrivals = products.filter((p) => getTags(p).includes('new'));
  const bestSellers = products.filter((p) => getTags(p).includes('bestseller') || p.badge === 'Best Seller');
  const hotProducts = products.slice(0, 8);

  return (
    <>
      <Hero />
      <FeatureSection />
      <Collections />

      <SubcollectionStrip
        eyebrow="Trending now"
        title="Hot Selling"
        subtitle="Our most-loved picks, chosen by our customers."
        items={hotSelling}
        viewAllHref="/products"
      />

      <ProductSection
        eyebrow="Straight from the catalog"
        title="Hot Selling Products"
        subtitle="Fresh favourites, curated just for you."
        products={hotProducts}
        viewAllHref="/products"
      />

      <FeaturedCategories />

      <SubcollectionStrip
        eyebrow="Make it yours"
        title="Custom Packaging"
        subtitle="Themed boxes & wraps for every celebration."
        items={customPackaging}
        viewAllHref="/products?category=custom-packaging"
      />

      {newArrivals.length > 0 && (
        <ProductSection
          eyebrow="Just landed"
          title="New Arrivals"
          subtitle="Fresh additions to the catalog."
          products={newArrivals}
          viewAllHref="/products"
        />
      )}

      <SubcollectionStrip
        eyebrow="Curated for her"
        title="Something For Her"
        subtitle="Thoughtful gifts, hampers & more."
        items={somethingForHer}
        viewAllHref="/products?category=luxury-hampers"
      />

      {bestSellers.length > 0 && (
        <ProductSection
          eyebrow="Customer favourites"
          title="Best Sellers"
          subtitle="Tried, tested and loved by our customers."
          products={bestSellers}
          viewAllHref="/products"
        />
      )}

      <AboutBrand />
      <Reviews />
      <InstagramGallery />
      <Newsletter />
      {!loading && products.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-10">
          Products will appear here once your backend returns catalog data.
        </p>
      )}
    </>
  );
}
