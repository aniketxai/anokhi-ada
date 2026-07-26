import HomeContent from '../models/HomeContent.js';

export const DEFAULT_HOME_CONTENT = {
  key: 'default',
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
  features: [
    { title: 'Free Shipping', desc: 'On orders above ₹499', icon: 'truck' },
    { title: 'Secure Packaging', desc: 'Every order packed with care', icon: 'shield' },
    { title: 'Premium Gifting', desc: 'Handcrafted with love', icon: 'gift' },
    { title: 'Support', desc: '10:00 AM – 6:00 PM', icon: 'headphones' },
  ],
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
  ],
  brandInfo: {
    name: 'Anokhi Ada',
    tagline: 'Gifting, reimagined with love.',
    whatsapp: '+91 9942085352',
    instagram: 'https://www.instagram.com/anokhiada_01/',
    supportTime: '10:00 AM – 6:00 PM (Monday to Saturday)',
  },
};

// GET Public Home Content
export async function getPublicHomeContent(req, res) {
  try {
    let content = await HomeContent.findOne({ key: 'default' }).lean();
    if (!content) {
      content = DEFAULT_HOME_CONTENT;
    }
    return res.json({ success: true, data: content });
  } catch (error) {
    console.error('Error fetching home content:', error);
    return res.json({ success: true, data: DEFAULT_HOME_CONTENT });
  }
}

// GET Admin Home Content
export async function getAdminHomeContent(req, res) {
  try {
    let content = await HomeContent.findOne({ key: 'default' }).lean();
    if (!content) {
      content = await HomeContent.create(DEFAULT_HOME_CONTENT);
    }
    return res.json({ success: true, data: content });
  } catch (error) {
    console.error('Error fetching admin home content:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch site content' });
  }
}

// UPDATE Admin Home Content
export async function updateAdminHomeContent(req, res) {
  try {
    const payload = req.body || {};
    const updated = await HomeContent.findOneAndUpdate(
      { key: 'default' },
      { $set: payload },
      { new: true, upsert: true, runValidators: true }
    );
    return res.json({ success: true, message: 'Site homepage content updated successfully!', data: updated });
  } catch (error) {
    console.error('Error updating home content:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update site content' });
  }
}
