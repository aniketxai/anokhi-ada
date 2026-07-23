import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiShoppingBag,
  FiHeart,
  FiMenu,
  FiX,
  FiChevronDown,
} from 'react-icons/fi';
import { useApp } from '../context/useApp';
import { categories } from '../data/categories';
import { BRAND } from '../data/brand';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCatOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const isActive = (href) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />

      <div
        className={`border-b border-border transition-shadow duration-300 bg-card ${
          scrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-[84px] sm:h-[92px] items-center">
            <button
              className="lg:hidden relative z-20 mr-2 h-10 w-10 flex items-center justify-center rounded-full text-foreground hover:bg-accent/50 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu className="h-6 w-6" />
            </button>

            <div className="hidden lg:flex items-center gap-8 flex-1">
              <NavLink to="/" active={isActive('/')}>Home</NavLink>

              <div
                className="relative"
                onMouseEnter={() => setCatOpen(true)}
                onMouseLeave={() => setCatOpen(false)}
              >
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    catOpen ? 'text-primary' : 'text-foreground hover:text-primary'
                  }`}
                >
                  Catalog
                  <FiChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {catOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 pt-3 z-50 w-64"
                    >
                      <div className="rounded-2xl border border-border bg-card shadow-xl p-2">
                        {categories.map((c) => (
                          <Link
                            key={c.id}
                            to={`/products?category=${encodeURIComponent(c.slug)}`}
                            className="group flex items-center gap-3 rounded-xl p-2.5 hover:bg-accent/50 transition-colors"
                          >
                            <img
                              src={c.image}
                              alt={c.name}
                              className="h-9 w-9 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground group-hover:text-primary">
                                {c.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground line-clamp-1">{c.blurb}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink to="/products" active={isActive('/products')}>Shop</NavLink>
              <NavLink to="/custom-order" active={isActive('/custom-order')}>Custom Order</NavLink>
              <NavLink to="/about" active={isActive('/about')}>About</NavLink>
              <NavLink to="/contact" active={isActive('/contact')}>Contact</NavLink>
            </div>

            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center lg:relative lg:left-auto lg:top-auto lg:translate-x-0 lg:translate-y-0 lg:flex-1 lg:justify-center">
              <Link to="/" aria-label={`${BRAND.name} — Home`} className="flex items-center justify-center py-1">
                <img
                  src="/logo.png"
                  alt={BRAND.name}
                  className="h-14 w-auto max-w-[200px] object-contain sm:h-18 lg:h-20 max-h-[76px] transition-transform duration-300 hover:scale-105"
                />
              </Link>
            </div>

            <div className="flex items-center gap-1 flex-1 justify-end">
              <IconBtn label="Search" onClick={() => setSearchOpen((v) => !v)}>
                <FiSearch className="h-[19px] w-[19px]" />
              </IconBtn>

              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
              >
                <FiHeart className="h-[19px] w-[19px]" />
              </Link>

              <IconBtn label="Cart" onClick={() => navigate('/cart')} badge={cartCount}>
                <FiShoppingBag className="h-[19px] w-[19px]" />
              </IconBtn>
            </div>
          </div>

          <AnimatePresence>
            {searchOpen && (
              <motion.form
                onSubmit={submitSearch}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pb-4 flex items-center gap-2">
                  <input
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                  >
                    Search
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`relative text-sm font-medium pb-0.5 transition-colors ${
        active
          ? 'text-foreground after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px after:bg-foreground after:rounded-full'
          : 'text-muted-foreground hover:text-primary'
      }`}
    >
      {children}
    </Link>
  );
}

function IconBtn({ label, onClick, badge, children }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="relative h-9 w-9 flex items-center justify-center rounded-full text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
    >
      {children}
      {badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-[17px] w-[17px] rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}

function AnnouncementBar() {
  const messages = [
    `Free Shipping Above ₹${BRAND.freeShippingThreshold}`,
    `${BRAND.ordersDelivered} Happy Customers`,
    'Curated Gifts for Every Occasion',
    'Use Code ANOKHI10 for 10% Off',
  ];
  return (
    <div className="bg-primary overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-1.5 gap-12">
        {[...messages, ...messages, ...messages].map((m, i) => (
          <span key={i} className="text-[11px] font-medium text-primary-foreground/90 shrink-0 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-primary-foreground/70" />
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

function MobileMenu({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-card shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <img src="/logo.png" alt={BRAND.name} className="h-12 sm:h-14 w-auto max-w-[200px] object-contain" />
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-accent/50 transition-colors text-muted-foreground"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3">
              <MobileLink to="/" label="Home" onClose={onClose} />
              <MobileLink to="/products" label="Shop All" onClose={onClose} />

              <p className="px-4 pt-5 pb-2 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                Categories
              </p>
              {categories.map((c) => (
                <MobileLink key={c.id} to={`/products?category=${encodeURIComponent(c.slug)}`} label={c.name} onClose={onClose} />
              ))}

              <div className="my-3 mx-4 border-t border-border" />

              <MobileLink to="/custom-order" label="Custom Order" onClose={onClose} />
              <MobileLink to="/about" label="About Us" onClose={onClose} />
              <MobileLink to="/contact" label="Contact" onClose={onClose} />
              <MobileLink to="/wishlist" label="Wishlist" onClose={onClose} />
            </div>

            <div className="px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">{BRAND.supportTime}</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function MobileLink({ to, label, onClose }) {
  return (
    <Link
      to={to}
      onClick={onClose}
      className="flex items-center px-4 py-2.5 text-sm font-medium text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
    >
      {label}
    </Link>
  );
}
