import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../context/useApp';
import { formatINR } from '../utils/currency';
import Skeleton from './Skeleton';

export default function ProductCard({ product, index = 0 }) {
  const [imageLoading, setImageLoading] = useState(true);
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const isWished = wishlist.includes(product.id);
  const imageSrc = product.images?.[0] || 'https://via.placeholder.com/600x600?text=No+Image';

  const handleWishlistToggle = () => {
    
    toggleWishlist(product);
  };

  const handleAddToCart = () => {
    
    addToCart(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative"
    >
      <div className="bg-surface-container rounded-3xl overflow-hidden transition-material hover:shadow-lg border border-white/5 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-surface-muted">
          {imageLoading && (
            <Skeleton className="absolute inset-0 rounded-none w-full h-full z-10 bg-surface-container" />
          )}
          <Link to={`/products/${product.id}`} className="block w-full h-full">
            <img
              src={imageSrc}
              alt={product.name}
              width="500"
              height="500"
              decoding="async"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
              className={`w-full h-full object-contain object-center transition-all duration-300 group-hover:scale-105 bg-white/5 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
            />
          </Link>

          {/* Badge */}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
              {product.badge}
            </span>
          )}

          {/* Quick actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 transition-material">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlistToggle}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-material ${
                isWished
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-dim/90 backdrop-blur-sm text-primary border border-primary/30 hover:bg-surface-container'
              }`}
            >
              <Heart size={16} fill={isWished ? 'currentColor' : 'none'} />
            </motion.button>
            <Link to={`/products/${product.id}`}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-dim/90 backdrop-blur-sm text-primary border border-primary/30 hover:bg-surface-container transition-material"
              >
                <Eye size={16} />
              </motion.div>
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex-1 flex flex-col">
          <p className="text-xs text-outline font-medium mb-1">{product.category}</p>
          <Link to={`/products/${product.id}`}>
            <h3 className="font-semibold text-foreground text-sm sm:text-[15px] leading-tight mb-2 line-clamp-2 hover:text-primary transition-material">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <Star size={12} className="fill-warning text-warning" />
            <span className="text-xs font-medium text-secondary-text">{product.rating}</span>
            <span className="text-xs text-outline">({product.reviews})</span>
          </div>

          {/* Price + Cart */}
          <div className="mt-auto flex items-end justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 min-w-0">
              <span className="text-base sm:text-lg font-bold text-foreground">{formatINR(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xs sm:text-sm text-outline line-through">{formatINR(product.originalPrice)}</span>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="w-10 h-10 shrink-0 rounded-full bg-primary text-white flex items-center justify-center hover:shadow-md transition-material"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart size={15} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
