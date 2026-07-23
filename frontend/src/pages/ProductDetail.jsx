import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  ShoppingCart,
  Star,
  ArrowLeft,
  Package,
  Ruler,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';

import api from '../api';
import { useApp } from '../context/useApp';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import BlurBlob from '../components/BlurBlob';
import ProductDetailSkeleton from '../components/ProductDetailSkeleton';
import PersonalisationActionBox from '../components/PersonalisationActionBox';
import { formatINR } from '../utils/currency';
import { sanitizeImageUrl, sanitizeProductImages } from '../utils/image';

function safeProductShape(product) {
  if (!product) return null;

  return {
    ...product,
    images: sanitizeProductImages(product.images || []),
    features: product.features || [],
    specifications: product.specifications || {},
  };
}

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const { addToCart, toggleWishlist, wishlist } = useApp();

  useEffect(() => {
    let active = true;

    setLoading(true);
    setSelectedImage(0);

    Promise.allSettled([
      api.fetchProductById(id),
      api.fetchProducts()
    ])
      .then(([singleProductResult, productsResult]) => {
        if (!active) return;

        const singleProduct = singleProductResult.status === 'fulfilled' ? singleProductResult.value : null;
        const allProducts = productsResult.status === 'fulfilled'
          ? (Array.isArray(productsResult.value) ? productsResult.value : (productsResult.value.items || []))
          : api.getCachedProducts();

        const productFromList = allProducts.find(item => String(item?.id) === String(id)) || null;
        const cachedProduct = api.getCachedProductById(id);

        setProduct(safeProductShape(singleProduct || productFromList || cachedProduct));
        setProducts(Array.isArray(allProducts) ? allProducts : []);

        if (id) {
          api.incrementProductView(id);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary-text text-lg mb-4">
            Product not found
          </p>

          <Link to="/products">
            <Button variant="outline" icon={ArrowLeft}>
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const features = product.features || [];
  const specifications = product.specifications || {};

  const currentImage =
    images[selectedImage] ||
    images[0] ||
    'https://via.placeholder.com/600x600?text=No+Image';

  const isWished = wishlist.includes(product.id);

  const related = products
    .filter(
      (p) =>
        p.category === product.category &&
        p.id !== product.id
    )
    .slice(0, 4);

  const specIcons = {
    material: Package,
    dimensions: Ruler,
    weight: Package,
    printTime: Clock,
  };

  return (
    <div className="pt-24 pb-20 min-h-screen relative">
      <BlurBlob className="w-72 h-72 sm:w-100 sm:h-100 top-20 left-6 bg-secondary-container" />
      <BlurBlob className="w-56 h-56 sm:w-72 sm:h-72 bottom-20 right-0 bg-accent-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-outline mb-8">
          <Link
            to="/products"
            className="hover:text-primary transition-material"
          >
            Products
          </Link>

          <ChevronRight size={14} />

          <span className="text-secondary-text">
            {product.category}
          </span>

          <ChevronRight size={14} />

          <span className="text-foreground font-medium">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >

            {/* Main Image */}
            <div className="bg-surface-container rounded-3xl overflow-hidden aspect-square mb-4">
              <img
                src={sanitizeImageUrl(currentImage)}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=600';
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden transition-material cursor-pointer ${
                      selectedImage === i
                        ? 'ring-2 ring-primary ring-offset-2'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={sanitizeImageUrl(img)}
                      alt={`Product ${i + 1}`}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=600';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >

            {/* Badge */}
            {product.badge && (
              <span className="inline-block bg-primary text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
                {product.badge}
              </span>
            )}

            {/* Category */}
            <p className="text-xs text-outline font-medium mb-1">
              {product.category}
            </p>

            {/* Name */}
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-display mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.round(product.rating || 0)
                        ? 'fill-warning text-warning'
                        : 'text-surface-muted'
                    }
                  />
                ))}
              </div>

              <span className="text-sm font-medium text-foreground">
                {product.rating || 0}
              </span>

              <span className="text-sm text-outline">
                ({product.reviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-foreground">
                {formatINR(product.price || 0)}
              </span>

              {product.originalPrice && (
                <span className="text-lg text-outline line-through">
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-secondary-text leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Features */}
            {features.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground text-sm mb-3">
                  Features
                </h3>

                <div className="flex flex-wrap gap-2">
                  {features.map((f, index) => (
                    <span
                      key={index}
                      className="text-xs bg-surface-container px-3 py-1.5 rounded-full text-secondary-text"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications */}
            {Object.keys(specifications).length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-foreground text-sm mb-3">
                  Specifications
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(specifications).map(([key, value]) => {
                    const Icon = specIcons[key] || Layers;

                    return (
                      <div
                        key={key}
                        className="bg-surface-container rounded-2xl p-3"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            size={14}
                            className="text-primary"
                          />

                          <span className="text-xs text-outline capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                        </div>

                        <p className="text-sm font-medium text-foreground">
                          {value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Personalisation & Checkout Actions */}
            <div className="space-y-4">
              <PersonalisationActionBox
                product={product}
                onAddToCart={(p, options) => {
                  addToCart({ ...p, isGiftOrder: options?.isGiftOrder });
                }}
                onBuyNow={(p, options) => {
                  addToCart({ ...p, isGiftOrder: options?.isGiftOrder });
                  window.location.href = '/checkout';
                }}
              />

              <div className="flex gap-3 max-w-md mx-auto pt-1">
                <Button
                  variant={isWished ? 'primary' : 'outline'}
                  size="md"
                  icon={Heart}
                  className="flex-1"
                  onClick={() => toggleWishlist(product)}
                >
                  {isWished ? 'Wishlisted' : 'Add to Wishlist'}
                </Button>

                <Link to="/custom-order" className="flex-1">
                  <Button variant="secondary" size="md" className="w-full">
                    Custom Request
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground font-display mb-6">
              Related Products
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}