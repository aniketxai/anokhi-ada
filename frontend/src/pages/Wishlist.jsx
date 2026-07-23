import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/useApp';
import { useState, useEffect } from 'react';
import Button from '../components/Button';
import SectionHeading from '../components/SectionHeading';
import { formatINR } from '../utils/currency';
import api from '../api';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useApp();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wishlist.length === 0) {
      setWishlistProducts([]);
      return;
    }

    setLoading(true);
    api.fetchProducts()
      .then(result => {
        const all = Array.isArray(result) ? result : (result.items || []);
        const filtered = all.filter(p => wishlist.includes(String(p.id)));
        setWishlistProducts(filtered);
      })
      .catch(err => {
        console.error('Failed to fetch wishlist products:', err);
        setWishlistProducts([]);
      })
      .finally(() => setLoading(false));
  }, [wishlist]);

  if (loading) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary-text">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart size={48} className="text-surface-muted mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground font-display mb-2">Your wishlist is empty</h2>
          <p className="text-secondary-text text-sm mb-6">Save products you love for later.</p>
          <Link to="/products">
            <Button icon={ArrowRight}>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading label="Saved" title="Your Wishlist" description="Products you have saved for later." center={false} />

        <div className="space-y-4 mb-8">
          {wishlistProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-surface-container rounded-3xl p-3 sm:p-4 grid grid-cols-4 sm:flex sm:flex-row sm:items-center gap-3 sm:gap-4"
            >
              <Link to={`/products/${product.id}`} className="col-span-1 shrink-0">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-24 sm:w-20 sm:h-20 rounded-2xl object-cover"
                />
              </Link>
              <div className="col-span-3 sm:flex-1 sm:min-w-0 text-left">
                <Link to={`/products/${product.id}`} className="font-semibold text-foreground text-xs sm:text-sm hover:text-primary transition-material line-clamp-2">
                  {product.name}
                </Link>
                <p className="text-xs text-outline mt-0.5">{product.category}</p>
                <p className="text-sm sm:text-lg font-bold text-foreground mt-1">{formatINR(product.price)}</p>
              </div>
              <div className="col-span-4 sm:col-span-1 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button 
                  size="sm" 
                  icon={ShoppingCart} 
                  onClick={() => addToCart(product)}
                  className="flex-1 sm:flex-none text-xs sm:text-sm py-2 sm:py-2"
                >
                  Add to Cart
                </Button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleWishlist(product)}
                  className="p-2 rounded-full hover:bg-error/10 text-outline hover:text-error transition-material"
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
