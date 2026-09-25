import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShieldCheck, Box, ShoppingBag, Check, ArrowRight, Star, Tag, FileText, Layers } from 'lucide-react';
import { products } from '../../data/products';
import { formatINR } from '../../utils/currency';
import { useApp } from '../../context/useApp';

const PACKING_CATEGORIES = [
  { id: 'all', label: 'All Packing Material', icon: Package },
  { id: 'polybag', label: '1. Polybag', icon: ShieldCheck },
  { id: 'corrugated-boxes', label: '2. Corrugated boxes', icon: Box },
  { id: 'tape', label: '3. Tape', icon: Tag },
  { id: 'thermal-roll', label: '4. Thermal roll', icon: FileText },
  { id: 'bubble-wrap', label: '5. Bubble wrap', icon: Layers },
];

export default function PackingMaterialSection() {
  const { addToCart } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [addedId, setAddedId] = useState(null);

  // Filter packing products
  const packingProducts = products.filter((p) => p.category === 'Packing Material');

  const filteredProducts = packingProducts.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'polybag') return p.subCategory === 'Polybag' || p.name.toLowerCase().includes('polybag');
    if (activeTab === 'corrugated-boxes') return p.subCategory === 'Corrugated boxes' || p.name.toLowerCase().includes('corrugated');
    if (activeTab === 'tape') return p.subCategory === 'Tape' || p.name.toLowerCase().includes('tape');
    if (activeTab === 'thermal-roll') return p.subCategory === 'Thermal roll' || p.name.toLowerCase().includes('thermal');
    if (activeTab === 'bubble-wrap') return p.subCategory === 'Bubble wrap' || p.name.toLowerCase().includes('bubble');
    return true;
  });

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section className="py-16 sm:py-24 bg-surface-container/50 border-y border-border relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-primary mb-2 flex items-center gap-1.5">
              <Package size={14} /> E-Commerce Shipping &amp; Packaging Essentials
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Packing Material Section
            </h2>
            <p className="text-sm text-foreground/70 mt-2 max-w-2xl">
              Heavy-duty tamper-proof Polybags, crush-resistant Corrugated Boxes, and high-tack Sealing Tapes to ensure your parcels arrive safely.
            </p>
          </div>

          <Link
            to="/products?category=packing-material"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors shrink-0"
          >
            Explore All Packaging Supplies <ArrowRight size={16} />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {PACKING_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                    : 'bg-surface-muted text-foreground/70 hover:text-foreground hover:bg-surface-muted/80'
                }`}
              >
                <Icon size={14} /> {cat.label}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-card rounded-3xl p-4 border border-border hover:border-primary/40 transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-surface-muted mb-4">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                      {product.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-foreground/60 mb-1">
                  <span className="font-semibold text-primary/90">{product.subCategory || 'Packing Supply'}</span>
                  {product.rating && (
                    <span className="flex items-center gap-1 font-semibold text-amber-500">
                      <Star size={12} fill="currentColor" /> {product.rating} ({product.reviews})
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-foreground/60 line-clamp-2 mb-4">{product.description}</p>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-4 border-t border-border pt-3">
                  <span className="text-lg font-extrabold text-foreground">{formatINR(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-foreground/40 line-through font-medium">
                      {formatINR(product.originalPrice)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className={`w-full py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    addedId === product.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                  }`}
                >
                  {addedId === product.id ? (
                    <>
                      <Check size={14} /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} /> Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
