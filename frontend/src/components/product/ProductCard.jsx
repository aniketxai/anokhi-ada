import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiHeart, FiShoppingBag } from 'react-icons/fi';
import { useApp } from '../../context/useApp';
import { formatINR } from '../../utils/currency';

function discountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const wished = wishlist.includes(String(product.id));
  const image = Array.isArray(product.images) ? product.images[0] : product.image;
  const discount = discountPercent(product.price, product.originalPrice);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className="group relative flex flex-col rounded-[1.25rem] bg-card border border-border overflow-hidden transition-all duration-300 hover:premium-shadow-lg hover:-translate-y-1"
    >
      <Link to={`/products/${product.id}`} className="block flex-1">
        <div className="relative overflow-hidden bg-muted aspect-[4/5]">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              {discount > 0 && (
                <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold text-primary-foreground shadow-sm">
                  -{discount}%
                </span>
              )}
              {product.badge && (
                <span className="rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold text-foreground shadow-sm">
                  {product.badge}
                </span>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 1.3 }}
              onClick={handleWishlist}
              aria-label="Toggle wishlist"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full glass flex items-center justify-center hover:text-primary hover:scale-110 transition-all shadow-sm"
            >
              <FiHeart
                className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${wished ? 'fill-primary text-primary' : ''}`}
              />
            </motion.button>
          </div>

          <div className="hidden sm:flex absolute inset-x-3 bottom-3 gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleAdd}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <FiShoppingBag className="h-3.5 w-3.5" /> Add to Cart
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground">
            {product.category?.replace(/-/g, ' ')}
          </p>
          <h3 className="mt-1 text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <FiStar className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="font-medium text-foreground">{product.rating || 4.8}</span>
            {product.reviews != null && <span>({product.reviews})</span>}
          </div>
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-base font-semibold">{formatINR(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={handleAdd}
        className="sm:hidden mx-3 mb-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground active:scale-95 transition-transform"
      >
        <FiShoppingBag className="h-3.5 w-3.5" /> Add to Cart
      </button>
    </motion.div>
  );
}
