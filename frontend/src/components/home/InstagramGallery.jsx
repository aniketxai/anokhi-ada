import { motion } from 'framer-motion';
import { FiInstagram, FiHeart } from 'react-icons/fi';
import SectionHeader from '../common/SectionHeader';
import { instagramPosts } from '../../data/content';
import { BRAND } from '../../data/brand';

export default function InstagramGallery() {
  if (!instagramPosts?.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
      <SectionHeader
        eyebrow="Follow along"
        title="From our Instagram"
        subtitle="Tag us to be featured. Follow along for behind-the-scenes prints."
        viewAllHref={BRAND.social.instagram || '#'}
      />
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        {instagramPosts.map((post, i) => (
          <motion.a
            key={post.id}
            href={BRAND.social.instagram || '#'}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (i % 6) * 0.06 }}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-muted"
          >
            <img
              src={post.image}
              alt="Instagram post"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center gap-1 text-white">
              <FiInstagram className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <FiHeart className="h-3 w-3 fill-white" /> {post.likes}
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
