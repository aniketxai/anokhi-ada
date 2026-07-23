import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiMapPin } from 'react-icons/fi';
import { BRAND } from '../../data/brand';

export default function AboutBrand() {
  const stats = [
    { value: String(BRAND.foundedYear), label: 'Founded' },
    { value: BRAND.ordersDelivered, label: 'Orders delivered' },
    { value: 'Pan-India', label: 'Shipping' },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-muted">
            <img
              src="https://images.pexels.com/photos/6393013/pexels-photo-6393013.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt={BRAND.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -right-2 sm:right-6 glass rounded-2xl p-4 premium-shadow-lg max-w-[200px]">
            <p className="font-serif text-lg text-primary">Our promise</p>
            <p className="mt-1 text-xs text-muted-foreground">
              &ldquo;Gifting, reimagined with love.&rdquo;
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            Our Story
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-balance">
            We don&apos;t just deliver gifts — we deliver moments.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            At {BRAND.name}, every hamper, every wrap, every little detail is chosen with
            love. Founded in {BRAND.foundedYear} by {BRAND.founder}, we&apos;ve delivered{' '}
            {BRAND.ordersDelivered} orders to customers across India. Our mission is
            simple: make gifting feel personal again.
          </p>

          <div className="mt-7 grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-accent/40 p-4 text-center">
                <p className="font-serif text-2xl text-primary">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {BRAND.city && (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <FiMapPin className="h-4 w-4 text-primary" />
              Based in {BRAND.city}
            </div>
          )}

          <Link
            to="/about"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:bg-primary hover:text-primary-foreground transition-colors group"
          >
            Read our story <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
