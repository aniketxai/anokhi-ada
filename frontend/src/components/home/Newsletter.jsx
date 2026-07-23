import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiCheckCircle } from 'react-icons/fi';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail('');
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary via-[#8f5d33] to-[#c58a4c] px-6 py-14 sm:px-12 sm:py-16 text-center text-primary-foreground premium-shadow">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-200/20 blur-2xl" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-xl mx-auto"
        >
          <h2 className="font-serif text-3xl sm:text-4xl text-balance">
            Join our newsletter
          </h2>
          <p className="mt-3 text-sm text-primary-foreground/85">
            Get 10% off your first order, early access to new drops, and gifting
            inspiration straight to your inbox.
          </p>
          <form onSubmit={submit} className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 rounded-full bg-white/95 px-5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
            >
              {done ? (
                <>
                  <FiCheckCircle className="h-4 w-4" /> Subscribed
                </>
              ) : (
                <>
                  <FiSend className="h-4 w-4" /> Subscribe
                </>
              )}
            </button>
          </form>
          <p className="mt-3 text-xs text-primary-foreground/70">
            No spam, unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
