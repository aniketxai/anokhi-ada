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
import { hotSelling, customPackaging, somethingForHer, somethingForHim } from '../data/categories';

export default function Home() {
  const [products, setProducts] = useState(() => api.getCachedProducts());
  const [loading, setLoading] = useState(() => api.getCachedProducts().length === 0);
  const [siteContent, setSiteContent] = useState(null);

  useEffect(() => {
    let active = true;
    api.fetchProducts().then(({ items }) => {
      if (active) setProducts(items || []);
    }).finally(() => {
      if (active) setLoading(false);
    });

    api.fetchSiteContent().then((content) => {
      if (active && content) setSiteContent(content);
    });

    return () => { active = false; };
  }, []);

  const getSubcollectionStrip = (key, fallbackItems, defaultEyebrow, defaultTitle, defaultSubtitle, defaultLink) => {
    const found = siteContent?.subcollectionStrips?.find((s) => s.key === key);
    if (found) {
      return {
        eyebrow: found.eyebrow || defaultEyebrow,
        title: found.title || defaultTitle,
        subtitle: found.subtitle || defaultSubtitle,
        items: found.items?.length ? found.items : fallbackItems,
        viewAllHref: found.viewAllHref || defaultLink,
      };
    }
    return {
      eyebrow: defaultEyebrow,
      title: defaultTitle,
      subtitle: defaultSubtitle,
      items: fallbackItems,
      viewAllHref: defaultLink,
    };
  };

  const hotSellingStrip = getSubcollectionStrip('hotSelling', hotSelling, 'Trending now', 'Hot Selling', 'Our most-loved picks, chosen by our customers.', '/products');
  const customPackagingStrip = getSubcollectionStrip('customPackaging', customPackaging, 'Make it yours', 'Custom Packaging', 'Themed boxes & wraps for every celebration.', '/products?category=custom-packaging');
  const forHerStrip = getSubcollectionStrip('forHer', somethingForHer, 'Curated for her', 'Something For Her', 'Thoughtful gifts, hampers & more.', '/products?category=luxury-hampers');
  const forHimStrip = getSubcollectionStrip('forHim', somethingForHim, 'Curated for him', 'Something For Him', 'Thoughtful gifts, hampers & more.', '/products?category=curated-for-him');
  const getTags = (p) => p.tags || [];
  const newArrivals = products.filter((p) => getTags(p).includes('new'));
  const bestSellers = products.filter((p) => getTags(p).includes('bestseller') || p.badge === 'Best Seller');
  const hotProducts = products.slice(0, 8);

  return (
    <>
      <Hero slides={siteContent?.heroSlides} />
      <FeatureSection />
      <Collections items={siteContent?.collections} />

      <SubcollectionStrip
        eyebrow={hotSellingStrip.eyebrow}
        title={hotSellingStrip.title}
        subtitle={hotSellingStrip.subtitle}
        items={hotSellingStrip.items}
        viewAllHref={hotSellingStrip.viewAllHref}
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
        eyebrow={customPackagingStrip.eyebrow}
        title={customPackagingStrip.title}
        subtitle={customPackagingStrip.subtitle}
        items={customPackagingStrip.items}
        viewAllHref={customPackagingStrip.viewAllHref}
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
        eyebrow={forHerStrip.eyebrow}
        title={forHerStrip.title}
        subtitle={forHerStrip.subtitle}
        items={forHerStrip.items}
        viewAllHref={forHerStrip.viewAllHref}
      />

      <SubcollectionStrip
        eyebrow={forHimStrip.eyebrow}
        title={forHimStrip.title}
        subtitle={forHimStrip.subtitle}
        items={forHimStrip.items}
        viewAllHref={forHimStrip.viewAllHref}
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

      <AboutBrand aboutData={siteContent?.aboutSection} />
      <Reviews />
      <InstagramGallery posts={siteContent?.instagramPosts} />
      <Newsletter />
      {!loading && products.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-10">
          Products will appear here once your backend returns catalog data.
        </p>
      )}
    </>
  );
}
