import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiInstagram,
  FiFacebook,
  FiPhone,
  FiMapPin,
  FiClock,
  FiChevronRight,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { BRAND } from '../data/brand';

const quickLinks = [
  { href: '/about', label: 'About' },
  { href: '/products', label: 'Shop' },
  { href: '/contact', label: 'Contact' },
  { href: '/wishlist', label: 'Wishlist' },
];

const policyLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/refund-policy', label: 'Refund Policy' },
  { href: '/shipping-policy', label: 'Shipping Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-gradient-to-b from-accent/40 to-accent/20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1 flex flex-col items-start">
            <Link to="/" aria-label={`${BRAND.name} — Home`} className="inline-flex items-center">
              <img
                src="/logo.png"
                alt={BRAND.name}
                className="h-[4.4rem] w-auto object-contain"
              />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              {BRAND.tagline || "We don't just deliver products — we create experiences that become part of your most cherished memories."}
            </p>
            <div className="mt-5 flex items-center gap-3">
              {BRAND.social.instagram && (
                <SocialIcon href={BRAND.social.instagram} label="Instagram">
                  <FiInstagram />
                </SocialIcon>
              )}
              {BRAND.social.facebook && (
                <SocialIcon href={BRAND.social.facebook} label="Facebook">
                  <FiFacebook />
                </SocialIcon>
              )}
              {BRAND.social.whatsapp && (
                <SocialIcon href={BRAND.social.whatsapp} label="WhatsApp">
                  <FaWhatsapp />
                </SocialIcon>
              )}
            </div>
          </div>

          <FooterCol title="Quick Links" links={quickLinks} />
          <FooterCol title="Policies" links={policyLinks} />

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Get in touch
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {BRAND.city && (
                <li className="flex items-start gap-2.5">
                  <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{BRAND.city}</span>
                </li>
              )}
              {BRAND.whatsapp && (
                <li className="flex items-start gap-2.5">
                  <FiPhone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <a href={`tel:${BRAND.whatsapp}`} className="hover:text-primary">
                    {BRAND.whatsapp}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2.5">
                <FiClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{BRAND.supportTime}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          {BRAND.courier && (
            <p className="flex items-center gap-1.5">
              Courier partner:
              <span className="font-medium text-foreground">{BRAND.courier}</span>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              to={l.href}
              className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
            >
              <FiChevronRight className="h-3.5 w-3.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ href, label, children }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      whileHover={{ y: -3 }}
      className="h-10 w-10 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
    >
      {children}
    </motion.a>
  );
}
