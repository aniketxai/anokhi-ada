import mongoose from 'mongoose';

const HeroSlideSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  cta: { type: String, default: 'Shop Now' },
  href: { type: String, default: '/products' },
  image: { type: String, required: true },
}, { _id: false });

const InstagramPostSchema = new mongoose.Schema({
  id: { type: String, required: true },
  image: { type: String, required: true },
  likes: { type: Number, default: 0 },
}, { _id: false });

const CollectionItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
}, { _id: false });

const FeatureItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  icon: { type: String, default: 'truck' },
}, { _id: false });

const SubcollectionItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
}, { _id: false });

const SubcollectionSectionSchema = new mongoose.Schema({
  key: { type: String, required: true },
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  viewAllHref: { type: String, default: '/products' },
  items: [SubcollectionItemSchema],
}, { _id: false });

const HomeContentSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    heroSlides: [HeroSlideSchema],
    announcement: {
      enabled: { type: Boolean, default: true },
      text: { type: String, default: '✨ Free shipping on orders above ₹499 | Handcrafted with Love' },
      link: { type: String, default: '/products' },
    },
    aboutSection: {
      heading: { type: String, default: "We don't just deliver gifts — we deliver moments." },
      story: { type: String, default: "At Anokhi Ada, every hamper, every wrap, every little detail is chosen with love. Founded by Sana, we've delivered 5000+ orders to customers across India. Our mission is simple: make gifting feel personal again." },
      promise: { type: String, default: "Gifting, reimagined with love." },
      image: { type: String, default: "https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=900" },
      founder: { type: String, default: 'Sana' },
      foundedYear: { type: Number, default: 2022 },
      ordersDelivered: { type: String, default: '5000+' },
      city: { type: String, default: 'Patna, Bihar' },
    },
    features: [FeatureItemSchema],
    instagramPosts: [InstagramPostSchema],
    collections: [CollectionItemSchema],
    subcollectionStrips: [SubcollectionSectionSchema],
    brandInfo: {
      name: { type: String, default: 'Anokhi Ada' },
      tagline: { type: String, default: 'Gifting, reimagined with love.' },
      whatsapp: { type: String, default: '+91 9942085352' },
      instagram: { type: String, default: 'https://www.instagram.com/anokhiada_01/' },
      supportTime: { type: String, default: '10:00 AM – 6:00 PM (Monday to Saturday)' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('HomeContent', HomeContentSchema);
