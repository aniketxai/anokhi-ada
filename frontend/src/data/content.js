export const reviews = [
  {
    id: 'r1',
    name: 'Aishwarya R.',
    location: 'Bengaluru',
    rating: 5,
    text: 'The Rose Blush hamper was even more beautiful in person. My sister cried happy tears. Worth every rupee!',
    product: 'Rose Blush Luxury Hamper',
    avatar: 'https://images.pexels.com/photos/4158298/pexels-photo-4158298.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    id: 'r2',
    name: 'Neha S.',
    location: 'Patna',
    rating: 5,
    text: 'Ordered the fairy light box for my anniversary. Packaging was gorgeous and delivery was quick. Will order again.',
    product: 'Love Theme Fairy Light Box',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    id: 'r3',
    name: 'Priya M.',
    location: 'Delhi',
    rating: 4,
    text: 'Lip gloss set is lovely and non-sticky. Shades are true to the pictures. Fast shipping too.',
    product: 'Petal Glow Lip Gloss Set',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    id: 'r4',
    name: 'Sneha K.',
    location: 'Mumbai',
    rating: 5,
    text: 'The Velvet Orchid perfume lasts all day. Got compliments the moment I stepped out. Premium feel.',
    product: 'Velvet Orchid Perfume',
    avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    id: 'r5',
    name: 'Riya D.',
    location: 'Kolkata',
    rating: 5,
    text: 'Kurti fabric is so soft and the print is exactly as shown. Perfect for daily wear. Highly recommend.',
    product: 'Sundari Kurti — Rose',
    avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    id: 'r6',
    name: 'Tanya G.',
    location: 'Jaipur',
    rating: 5,
    text: 'Bangles box was a hit at the family function. Loved the rose gold finish. Beautiful packaging.',
    product: 'Classic Bangles Box',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
];

export const instagramPosts = [
  { id: 'ig1', image: 'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 1284 },
  { id: 'ig2', image: 'https://images.pexels.com/photos/6211641/pexels-photo-6211641.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 982 },
  { id: 'ig3', image: 'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 1543 },
  { id: 'ig4', image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 1102 },
  { id: 'ig5', image: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 876 },
  { id: 'ig6', image: 'https://images.pexels.com/photos/4467687/pexels-photo-4467687.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 1330 },
];

export const heroSlides = [
  {
    id: 'h1',
    title: 'Gifting, reimagined with love',
    subtitle: 'Luxury hampers for every cherished moment',
    cta: 'Shop Hampers',
    href: '/products?category=luxury-hampers',
    image:
      'https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=1600',
    align: 'left',
  },
  {
    id: 'h2',
    title: 'Petal-soft beauty, picked for her',
    subtitle: 'Cosmetics, perfumes & everyday glow',
    cta: 'Explore Cosmetics',
    href: '/products?category=cosmetics',
    image:
      'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=1600',
    align: 'left',
  },
  {
    id: 'h3',
    title: 'Adorn her in elegance',
    subtitle: 'Jewellery & kurtis she will adore',
    cta: 'Shop Jewellery',
    href: '/products?category=jewellery',
    image:
      'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=1600',
    align: 'left',
  },
];

export default { heroSlides, reviews, instagramPosts };
