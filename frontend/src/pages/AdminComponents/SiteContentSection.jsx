import { useState, useEffect } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  Save,
  Loader,
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Link as LinkIcon,
  FolderHeart,
  Layers,
} from 'lucide-react';
import { uploadImageCloudinary } from '../../api';

const DEFAULT_SITE_CONTENT = {
  heroSlides: [
    {
      id: 'beauty-essentials',
      title: 'Beauty Essentials',
      subtitle: 'Beauty That Inspires · Elevate Your Everyday',
      cta: 'Shop Beauty Essentials',
      href: '/products?category=cosmetics',
      image: '/images/hero/user_banner_beauty.jpg',
    },
    {
      id: 'jewellery-accessories',
      title: 'Jewellery & Hair Accessories',
      subtitle: 'Elegance In Every Detail · Designed To Make You Shine',
      cta: 'Shop Jewellery & Hair',
      href: '/products?category=jewellery',
      image: '/images/hero/user_banner_jewellery.jpg',
    },
    {
      id: 'birthday-hampers',
      title: 'Happy Birthday Hampers',
      subtitle: 'Surprise Gift Boxes Packed With Love',
      cta: 'Shop Gift Hampers',
      href: '/products?category=luxury-hampers',
      image: '/images/hero/user_banner_hamper.jpg',
    },
    {
      id: 'something-for-her',
      title: 'Something For Her',
      subtitle: 'Special Gift Hampers & Beauty Curations For Her',
      cta: 'Shop For Her',
      href: '/products?category=luxury-hampers',
      image: 'https://images.pexels.com/photos/1303082/pexels-photo-1303082.jpeg?auto=compress&cs=tinysrgb&w=900',
    },
    {
      id: 'something-for-him',
      title: 'Something For Him',
      subtitle: 'Luxury Hampers & Premium Essentials For Him',
      cta: 'Shop For Him',
      href: '/products?category=curated-for-him',
      image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=900',
    },
  ],
  announcement: {
    enabled: true,
    text: '✨ Free shipping on orders above ₹499 | Handcrafted with Love',
    link: '/products',
  },
  aboutSection: {
    heading: "We don't just deliver gifts — we deliver moments.",
    story: "At Anokhi Ada, every hamper, every wrap, every little detail is chosen with love. Founded by Sana, we've delivered 5000+ orders to customers across India. Our mission is simple: make gifting feel personal again.",
    promise: "Gifting, reimagined with love.",
    image: "https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=900",
    founder: 'Sana',
    foundedYear: 2022,
    ordersDelivered: '5000+',
    city: 'Patna, Bihar',
  },
  instagramPosts: [
    { id: 'ig1', image: 'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 1284 },
    { id: 'ig2', image: 'https://images.pexels.com/photos/6211641/pexels-photo-6211641.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 982 },
    { id: 'ig3', image: 'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 1543 },
    { id: 'ig4', image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 1102 },
    { id: 'ig5', image: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 876 },
    { id: 'ig6', image: 'https://images.pexels.com/photos/4467687/pexels-photo-4467687.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 1330 },
  ],
  collections: [
    { id: 'cosmetics', name: 'Cosmetics', slug: 'cosmetics', image: 'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=900' },
    { id: 'custom-packaging', name: 'Custom Packaging', slug: 'custom-packaging', image: 'https://images.pexels.com/photos/6211263/pexels-photo-6211263.jpeg?auto=compress&cs=tinysrgb&w=900' },
    { id: 'luxury-hampers', name: 'Luxury Hampers', slug: 'luxury-hampers', image: 'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=900' },
    { id: 'gift-collection', name: 'Gift Collection', slug: 'gift-collection', image: 'https://images.pexels.com/photos/6211641/pexels-photo-6211641.jpeg?auto=compress&cs=tinysrgb&w=900' },
  ],
  subcollectionStrips: [
    {
      key: 'hotSelling',
      eyebrow: 'Trending now',
      title: 'Hot Selling',
      subtitle: 'Our most-loved picks, chosen by our customers.',
      viewAllHref: '/products',
      items: [
        { id: 'hs1', name: 'Velvet Birthday Box', slug: 'luxury-hampers', image: 'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 'hs2', name: 'Golden Glow Set', slug: 'cosmetics', image: 'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 'hs3', name: 'Floral Custom Ribbon Wrap', slug: 'custom-packaging', image: 'https://images.pexels.com/photos/6211263/pexels-photo-6211263.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 'hs4', name: 'Pearl Hair Clip Hamper', slug: 'jewellery', image: 'https://images.pexels.com/photos/6211641/pexels-photo-6211641.jpeg?auto=compress&cs=tinysrgb&w=600' },
      ],
    },
    {
      key: 'customPackaging',
      eyebrow: 'Make it yours',
      title: 'Custom Packaging',
      subtitle: 'Themed boxes & wraps for every celebration.',
      viewAllHref: '/products?category=custom-packaging',
      items: [
        { id: 'cp1', name: 'Satin Ribbon Boxes', slug: 'custom-packaging', image: 'https://images.pexels.com/photos/6211263/pexels-photo-6211263.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 'cp2', name: 'Golden Foil Wraps', slug: 'custom-packaging', image: 'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 'cp3', name: 'Personalized Gift Tag Box', slug: 'custom-packaging', image: 'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=600' },
      ],
    },
    {
      key: 'forHer',
      eyebrow: 'Curated for her',
      title: 'Something For Her',
      subtitle: 'Thoughtful gifts, hampers & more for her.',
      viewAllHref: '/products?category=luxury-hampers',
      items: [
        { id: 'fh1', name: 'Luxury Hampers', slug: 'luxury-hampers', image: 'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 'fh2', name: 'Gifts Under ₹699', slug: 'gifts-699', image: 'https://images.pexels.com/photos/1303082/pexels-photo-1303082.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 'fh3', name: 'Gifts Under ₹499', slug: 'gifts-499', image: 'https://images.pexels.com/photos/1666067/pexels-photo-1666067.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 'fh4', name: 'Custom Gifts', slug: 'custom-gifts', image: 'https://images.pexels.com/photos/6211316/pexels-photo-6211316.jpeg?auto=compress&cs=tinysrgb&w=600' },
      ],
    },
    {
      key: 'forHim',
      eyebrow: 'Curated for him',
      title: 'Something For Him',
      subtitle: 'Thoughtful gifts, hampers & more for him.',
      viewAllHref: '/products?category=curated-for-him',
      items: [
        { id: 'fhim1', name: 'Luxury Hampers for Him', slug: 'luxury-hampers', image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 'fhim2', name: 'Perfumes for Him', slug: 'perfume', image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 'fhim3', name: 'Grooming Essentials', slug: 'cosmetics', image: 'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 'fhim4', name: 'Custom Gifts for Him', slug: 'custom-gifts', image: 'https://images.pexels.com/photos/6211316/pexels-photo-6211316.jpeg?auto=compress&cs=tinysrgb&w=600' },
      ],
    },
  ],
  brandInfo: {
    name: 'Anokhi Ada',
    tagline: 'Gifting, reimagined with love.',
    whatsapp: '+91 9942085352',
    email: 'anokhiada01@gmail.com',
    instagram: 'https://www.instagram.com/anokhiada_01/',
    supportTime: '10:00 AM – 6:00 PM (Monday to Saturday)',
  },
};

export function SiteContentSection({ siteContent, onSaveSiteContent, saving }) {
  const mergeDefaults = (input) => {
    let strips = input?.subcollectionStrips?.length ? [...input.subcollectionStrips] : [...DEFAULT_SITE_CONTENT.subcollectionStrips];
    DEFAULT_SITE_CONTENT.subcollectionStrips.forEach((defStrip) => {
      if (!strips.some((s) => s.key === defStrip.key)) {
        strips.push(defStrip);
      }
    });

    return {
      ...DEFAULT_SITE_CONTENT,
      ...(input || {}),
      heroSlides: input?.heroSlides?.length ? input.heroSlides : DEFAULT_SITE_CONTENT.heroSlides,
      collections: input?.collections?.length ? input.collections : DEFAULT_SITE_CONTENT.collections,
      subcollectionStrips: strips,
      instagramPosts: input?.instagramPosts?.length ? input.instagramPosts : DEFAULT_SITE_CONTENT.instagramPosts,
      aboutSection: { ...DEFAULT_SITE_CONTENT.aboutSection, ...(input?.aboutSection || {}) },
      announcement: { ...DEFAULT_SITE_CONTENT.announcement, ...(input?.announcement || {}) },
      brandInfo: { ...DEFAULT_SITE_CONTENT.brandInfo, ...(input?.brandInfo || {}) },
    };
  };

  const [content, setContent] = useState(() => mergeDefaults(siteContent));
  const [uploadingField, setUploadingField] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (siteContent && Object.keys(siteContent).length > 0) {
      setContent(mergeDefaults(siteContent));
    }
  }, [siteContent]);

  const activeContent = content;

  // Cloudinary image upload helper
  const handleFileUpload = async (file, updateCallback, fieldKey) => {
    if (!file) return;
    try {
      setUploadingField(fieldKey);
      const imageUrl = await uploadImageCloudinary(file);
      updateCallback(imageUrl);
    } catch (err) {
      alert(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingField(null);
    }
  };

  // Helper to update state safely
  const updateNested = (category, field, value) => {
    setContent((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  // Hero Slide Handlers
  const updateHeroSlide = (index, field, value) => {
    setContent((prev) => {
      const slides = [...(prev.heroSlides || [])];
      slides[index] = { ...slides[index], [field]: value };
      return { ...prev, heroSlides: slides };
    });
  };

  const addHeroSlide = () => {
    setContent((prev) => ({
      ...prev,
      heroSlides: [
        ...(prev.heroSlides || []),
        {
          id: `slide-${Date.now()}`,
          title: 'New Featured Collection',
          subtitle: 'Curated hampers & beautiful gifts for your loved ones',
          cta: 'Shop Collection',
          href: '/products',
          image: 'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=900',
        },
      ],
    }));
  };

  const addForHerSlide = () => {
    setContent((prev) => ({
      ...prev,
      heroSlides: [
        ...(prev.heroSlides || []),
        {
          id: `slide-her-${Date.now()}`,
          title: 'Something For Her',
          subtitle: 'Special Gift Hampers & Beauty Curations For Her',
          cta: 'Shop For Her',
          href: '/products?category=luxury-hampers',
          image: 'https://images.pexels.com/photos/1303082/pexels-photo-1303082.jpeg?auto=compress&cs=tinysrgb&w=900',
        },
      ],
    }));
  };

  const addForHimSlide = () => {
    setContent((prev) => ({
      ...prev,
      heroSlides: [
        ...(prev.heroSlides || []),
        {
          id: `slide-him-${Date.now()}`,
          title: 'Something For Him',
          subtitle: 'Luxury Hampers & Premium Essentials For Him',
          cta: 'Shop For Him',
          href: '/products?category=curated-for-him',
          image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=900',
        },
      ],
    }));
  };

  const removeHeroSlide = (index) => {
    if ((activeContent.heroSlides || []).length <= 1) {
      alert('You must keep at least 1 hero banner slide.');
      return;
    }
    setContent((prev) => {
      const slides = [...(prev.heroSlides || [])];
      slides.splice(index, 1);
      return { ...prev, heroSlides: slides };
    });
  };

  // Collection Handlers
  const updateCollection = (index, field, value) => {
    setContent((prev) => {
      const items = [...(prev.collections || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, collections: items };
    });
  };

  const addCollection = () => {
    setContent((prev) => ({
      ...prev,
      collections: [
        ...(prev.collections || []),
        {
          id: `col-${Date.now()}`,
          name: 'New Collection',
          slug: 'new-collection',
          image: 'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=900',
        },
      ],
    }));
  };

  const removeCollection = (index) => {
    setContent((prev) => {
      const items = [...(prev.collections || [])];
      items.splice(index, 1);
      return { ...prev, collections: items };
    });
  };

  // Subcollection Strip Handlers
  const updateSubcollectionItem = (stripIndex, itemIndex, field, value) => {
    setContent((prev) => {
      const strips = [...(prev.subcollectionStrips || [])];
      if (!strips[stripIndex]) return prev;
      const items = [...(strips[stripIndex].items || [])];
      items[itemIndex] = { ...items[itemIndex], [field]: value };
      strips[stripIndex] = { ...strips[stripIndex], items };
      return { ...prev, subcollectionStrips: strips };
    });
  };

  const updateSubcollectionStripMeta = (stripIndex, field, value) => {
    setContent((prev) => {
      const strips = [...(prev.subcollectionStrips || [])];
      if (!strips[stripIndex]) return prev;
      strips[stripIndex] = { ...strips[stripIndex], [field]: value };
      return { ...prev, subcollectionStrips: strips };
    });
  };

  const addSubcollectionItem = (stripIndex) => {
    setContent((prev) => {
      const strips = [...(prev.subcollectionStrips || [])];
      if (!strips[stripIndex]) return prev;
      const items = [...(strips[stripIndex].items || [])];
      items.push({
        id: `sub-${Date.now()}`,
        name: 'New Item',
        slug: 'products',
        image: 'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=600',
      });
      strips[stripIndex] = { ...strips[stripIndex], items };
      return { ...prev, subcollectionStrips: strips };
    });
  };

  const removeSubcollectionItem = (stripIndex, itemIndex) => {
    setContent((prev) => {
      const strips = [...(prev.subcollectionStrips || [])];
      if (!strips[stripIndex]) return prev;
      const items = [...(strips[stripIndex].items || [])];
      items.splice(itemIndex, 1);
      strips[stripIndex] = { ...strips[stripIndex], items };
      return { ...prev, subcollectionStrips: strips };
    });
  };

  // Instagram Post Handlers
  const updateInstagramPost = (index, field, value) => {
    setContent((prev) => {
      const posts = [...(prev.instagramPosts || [])];
      posts[index] = { ...posts[index], [field]: value };
      return { ...prev, instagramPosts: posts };
    });
  };

  const addInstagramPost = () => {
    setContent((prev) => ({
      ...prev,
      instagramPosts: [
        ...(prev.instagramPosts || []),
        {
          id: `ig-${Date.now()}`,
          image: 'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=600',
          likes: 500,
        },
      ],
    }));
  };

  const removeInstagramPost = (index) => {
    setContent((prev) => {
      const posts = [...(prev.instagramPosts || [])];
      posts.splice(index, 1);
      return { ...prev, instagramPosts: posts };
    });
  };

  // Submit form handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSaveSiteContent(content);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-rose-500" />
            Homepage & Site Content Manager
          </h1>
          <p className="mt-1 text-sm text-secondary-text">
            Upload new images to Cloudinary, edit titles & banners, and customize your website easily without code.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-900/20 hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : savedSuccess ? (
            <CheckCircle className="w-4 h-4 text-emerald-300" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving Changes...' : savedSuccess ? 'Saved Live!' : 'Save All Changes'}
        </button>
      </div>

      {savedSuccess && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300 text-sm font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Homepage content saved! All changes are now live for your website visitors.</span>
        </div>
      )}

      {/* ── 1. Hero Carousel Banners ────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-rose-500" />
              Hero Banner Slider ({activeContent.heroSlides?.length || 0} Slides)
            </h2>
            <p className="text-xs text-secondary-text mt-0.5">
              These slides appear at the top of your homepage. Click &quot;Upload Image&quot; to pick from your device or Cloudinary.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addHeroSlide}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Slide
            </button>
            <button
              type="button"
              onClick={addForHerSlide}
              className="inline-flex items-center gap-1.5 rounded-full border border-purple-300 bg-purple-50 px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Add &quot;For Her&quot; Banner
            </button>
            <button
              type="button"
              onClick={addForHimSlide}
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Add &quot;For Him&quot; Banner
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {(activeContent.heroSlides || []).map((slide, idx) => (
            <div
              key={slide.id || idx}
              className="rounded-2xl border border-border bg-surface-muted p-5 space-y-4 relative group"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
                  Slide #{idx + 1}
                </span>

                <button
                  type="button"
                  onClick={() => removeHeroSlide(idx)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-100/50 transition-colors"
                  title="Remove Slide"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Image Preview & Cloudinary Upload */}
                <div className="space-y-3">
                  <span className="block text-xs font-bold uppercase tracking-wider text-foreground">
                    Banner Image
                  </span>
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted border border-border shadow-xs">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=900';
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-300 bg-card px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingField === `hero-${idx}` ? 'Uploading to Cloudinary...' : 'Upload Image to Cloudinary'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingField === `hero-${idx}`}
                        onChange={(e) =>
                          handleFileUpload(
                            e.target.files[0],
                            (url) => updateHeroSlide(idx, 'image', url),
                            `hero-${idx}`
                          )
                        }
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={slide.image || ''}
                    onChange={(e) => updateHeroSlide(idx, 'image', e.target.value)}
                    placeholder="Or paste image URL"
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-rose-500"
                  />
                </div>

                {/* Text Fields */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-foreground">
                        Title *
                      </span>
                      <input
                        type="text"
                        value={slide.title || ''}
                        onChange={(e) => updateHeroSlide(idx, 'title', e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-rose-500"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-foreground">
                        CTA Button Text *
                      </span>
                      <input
                        type="text"
                        value={slide.cta || 'Shop Now'}
                        onChange={(e) => updateHeroSlide(idx, 'cta', e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-rose-500"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-foreground">
                      Subtitle / Tagline
                    </span>
                    <input
                      type="text"
                      value={slide.subtitle || ''}
                      onChange={(e) => updateHeroSlide(idx, 'subtitle', e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-rose-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-foreground flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-rose-500" />
                      Target Link / Category URL
                    </span>
                    <input
                      type="text"
                      value={slide.href || '/products'}
                      onChange={(e) => updateHeroSlide(idx, 'href', e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-rose-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. Featured Collections Manager ───────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FolderHeart className="w-5 h-5 text-rose-500" />
              Featured Homepage Collections ({activeContent.collections?.length || 0})
            </h2>
            <p className="text-xs text-secondary-text mt-0.5">
              Change the collection cards and cover images shown on your home page.
            </p>
          </div>

          <button
            type="button"
            onClick={addCollection}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Collection
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(activeContent.collections || []).map((col, idx) => (
            <div key={col.id || idx} className="rounded-2xl border border-border bg-surface-muted p-4 space-y-3 relative group">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-xs font-bold text-foreground">Collection #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeCollection(idx)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 p-1"
                  title="Remove Collection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border">
                <img
                  src={col.image}
                  alt={col.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=900';
                  }}
                />
              </div>

              <label className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-rose-300 bg-card px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                {uploadingField === `col-${idx}` ? 'Uploading...' : 'Upload Image (Cloudinary)'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingField === `col-${idx}`}
                  onChange={(e) =>
                    handleFileUpload(
                      e.target.files[0],
                      (url) => updateCollection(idx, 'image', url),
                      `col-${idx}`
                    )
                  }
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold text-foreground">Name</span>
                <input
                  type="text"
                  value={col.name || ''}
                  onChange={(e) => updateCollection(idx, 'name', e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-rose-500"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold text-foreground">Category Slug</span>
                <input
                  type="text"
                  value={col.slug || ''}
                  onChange={(e) => updateCollection(idx, 'slug', e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-mono text-foreground outline-none focus:border-rose-500"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Subcollection Strips Manager ─────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="border-b border-border/60 pb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-500" />
            Homepage Curated Strips & Custom Cards
          </h2>
          <p className="text-xs text-secondary-text mt-0.5">
            Manage section banners like Hot Selling, Custom Packaging, Something For Her/Him, and their item images.
          </p>
        </div>

        <div className="space-y-6">
          {(activeContent.subcollectionStrips || []).map((strip, stripIdx) => (
            <div key={strip.key || stripIdx} className="rounded-2xl border border-border bg-surface-muted p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-border/40 pb-3">
                <label className="block">
                  <span className="text-xs font-bold text-foreground">Section Title</span>
                  <input
                    type="text"
                    value={strip.title || ''}
                    onChange={(e) => updateSubcollectionStripMeta(stripIdx, 'title', e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground outline-none focus:border-rose-500"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-foreground">Eyebrow Tag</span>
                  <input
                    type="text"
                    value={strip.eyebrow || ''}
                    onChange={(e) => updateSubcollectionStripMeta(stripIdx, 'eyebrow', e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs text-foreground outline-none focus:border-rose-500"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-foreground">Subtitle</span>
                  <input
                    type="text"
                    value={strip.subtitle || ''}
                    onChange={(e) => updateSubcollectionStripMeta(stripIdx, 'subtitle', e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs text-foreground outline-none focus:border-rose-500"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Strip Items ({strip.items?.length || 0})
                </span>
                <button
                  type="button"
                  onClick={() => addSubcollectionItem(stripIdx)}
                  className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Strip Card
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {(strip.items || []).map((item, itemIdx) => (
                  <div key={item.id || itemIdx} className="rounded-xl border border-border bg-card p-2.5 space-y-2 relative">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=600';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeSubcollectionItem(stripIdx, itemIdx)}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <label className="inline-flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-rose-300 bg-surface-muted px-2 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-50">
                      <Upload className="w-3 h-3" />
                      {uploadingField === `strip-${stripIdx}-${itemIdx}` ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingField === `strip-${stripIdx}-${itemIdx}`}
                        onChange={(e) =>
                          handleFileUpload(
                            e.target.files[0],
                            (url) => updateSubcollectionItem(stripIdx, itemIdx, 'image', url),
                            `strip-${stripIdx}-${itemIdx}`
                          )
                        }
                      />
                    </label>

                    <input
                      type="text"
                      value={item.name || ''}
                      onChange={(e) => updateSubcollectionItem(stripIdx, itemIdx, 'name', e.target.value)}
                      placeholder="Title"
                      className="w-full rounded-lg border border-border bg-card px-2 py-1 text-xs font-semibold text-foreground outline-none focus:border-rose-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. About Brand Section ────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="border-b border-border/60 pb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            About Brand & Founder Section
          </h2>
          <p className="text-xs text-secondary-text mt-0.5">
            Modify your brand story, founder details, and photo displayed on the homepage.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* About Image with Cloudinary Upload */}
          <div className="space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-foreground">
              About Brand Image
            </span>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted border border-border shadow-sm">
              <img
                src={activeContent.aboutSection?.image}
                alt="About Brand"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=900';
                }}
              />
            </div>

            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-300 bg-card px-3 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              {uploadingField === 'about-image' ? 'Uploading...' : 'Upload Photo to Cloudinary'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingField === 'about-image'}
                onChange={(e) =>
                  handleFileUpload(
                    e.target.files[0],
                    (url) => updateNested('aboutSection', 'image', url),
                    'about-image'
                  )
                }
              />
            </label>

            <input
              type="text"
              value={activeContent.aboutSection?.image || ''}
              onChange={(e) => updateNested('aboutSection', 'image', e.target.value)}
              placeholder="Image URL"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-rose-500"
            />
          </div>

          {/* About Details */}
          <div className="lg:col-span-2 space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-foreground">
                Main Heading *
              </span>
              <input
                type="text"
                value={activeContent.aboutSection?.heading || ''}
                onChange={(e) => updateNested('aboutSection', 'heading', e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-rose-500"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-foreground">
                Brand Story / Paragraph *
              </span>
              <textarea
                rows={4}
                value={activeContent.aboutSection?.story || ''}
                onChange={(e) => updateNested('aboutSection', 'story', e.target.value)}
                className="w-full rounded-xl border border-border bg-card p-3.5 text-sm text-foreground outline-none focus:border-rose-500 resize-none"
              />
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-foreground">
                  Founder Name
                </span>
                <input
                  type="text"
                  value={activeContent.aboutSection?.founder || ''}
                  onChange={(e) => updateNested('aboutSection', 'founder', e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-rose-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-foreground">
                  Founded Year
                </span>
                <input
                  type="number"
                  value={activeContent.aboutSection?.foundedYear || 2022}
                  onChange={(e) => updateNested('aboutSection', 'foundedYear', Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-rose-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-foreground">
                  Orders Delivered
                </span>
                <input
                  type="text"
                  value={activeContent.aboutSection?.ordersDelivered || '5000+'}
                  onChange={(e) => updateNested('aboutSection', 'ordersDelivered', e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-rose-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-foreground">
                  Location / City
                </span>
                <input
                  type="text"
                  value={activeContent.aboutSection?.city || 'Patna, Bihar'}
                  onChange={(e) => updateNested('aboutSection', 'city', e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-rose-500"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Instagram Gallery Manager ─────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-rose-500" />
              Instagram Gallery Posts ({activeContent.instagramPosts?.length || 0})
            </h2>
            <p className="text-xs text-secondary-text mt-0.5">
              Images displayed in the &quot;From Our Instagram&quot; gallery strip on the home page.
            </p>
          </div>

          <button
            type="button"
            onClick={addInstagramPost}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Post
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {(activeContent.instagramPosts || []).map((post, idx) => (
            <div
              key={post.id || idx}
              className="rounded-2xl border border-border bg-surface-muted p-3 space-y-2 relative group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border">
                <img
                  src={post.image}
                  alt={`IG Post ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=600';
                  }}
                />

                <button
                  type="button"
                  onClick={() => removeInstagramPost(idx)}
                  className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors"
                  title="Remove post"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <label className="inline-flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-rose-300 bg-card px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-50 transition-colors">
                <Upload className="w-3 h-3" />
                {uploadingField === `ig-${idx}` ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingField === `ig-${idx}`}
                  onChange={(e) =>
                    handleFileUpload(
                      e.target.files[0],
                      (url) => updateInstagramPost(idx, 'image', url),
                      `ig-${idx}`
                    )
                  }
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-bold text-secondary-text">Likes</span>
                <input
                  type="number"
                  value={post.likes || 0}
                  onChange={(e) => updateInstagramPost(idx, 'likes', Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-card px-2 py-1 text-xs text-foreground font-mono outline-none focus:border-rose-500"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Announcement Bar & Contact Details ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcement Bar */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <Sparkles className="w-4 h-4 text-rose-500" />
            Announcement Header Bar
          </h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={activeContent.announcement?.enabled ?? true}
              onChange={(e) => updateNested('announcement', 'enabled', e.target.checked)}
              className="h-4 w-4 rounded border-border text-rose-600 focus:ring-rose-500"
            />
            <span className="text-sm font-semibold text-foreground">
              Enable Header Announcement Bar
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-foreground">
              Announcement Message
            </span>
            <input
              type="text"
              value={activeContent.announcement?.text || ''}
              onChange={(e) => updateNested('announcement', 'text', e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-rose-500"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-foreground">
              Link URL (Optional)
            </span>
            <input
              type="text"
              value={activeContent.announcement?.link || ''}
              onChange={(e) => updateNested('announcement', 'link', e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-mono text-foreground outline-none focus:border-rose-500"
            />
          </label>
        </div>

        {/* Brand Contact Details */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <HelpCircle className="w-4 h-4 text-rose-500" />
            Brand Support & Social Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-foreground">
                WhatsApp Support Number
              </span>
              <input
                type="text"
                value={activeContent.brandInfo?.whatsapp || ''}
                onChange={(e) => updateNested('brandInfo', 'whatsapp', e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-rose-500"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-foreground">
                Support Email ID
              </span>
              <input
                type="email"
                value={activeContent.brandInfo?.email || ''}
                onChange={(e) => updateNested('brandInfo', 'email', e.target.value)}
                placeholder="anokhiada01@gmail.com"
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-rose-500"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-foreground">
                Support Hours
              </span>
              <input
                type="text"
                value={activeContent.brandInfo?.supportTime || ''}
                onChange={(e) => updateNested('brandInfo', 'supportTime', e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-rose-500"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-foreground">
              Instagram Page Link
            </span>
            <input
              type="text"
              value={activeContent.brandInfo?.instagram || ''}
              onChange={(e) => updateNested('brandInfo', 'instagram', e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-mono text-foreground outline-none focus:border-rose-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
