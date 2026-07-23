import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

export default function ReviewCard({ review, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="h-full rounded-[1.25rem] bg-card border border-border p-5 sm:p-6 flex flex-col transition-all duration-300 hover:premium-shadow hover:-translate-y-1"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar
              key={i}
              className={`h-3.5 w-3.5 ${
                i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-primary/70 bg-accent/50 rounded-full px-2 py-0.5">
          Verified
        </span>
      </div>
      <p className="text-sm text-foreground leading-relaxed flex-1">&ldquo;{review.text}&rdquo;</p>
      <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
        <img
          src={review.avatar}
          alt={review.name}
          className="h-10 w-10 rounded-full object-cover bg-muted ring-2 ring-accent/60"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium line-clamp-1">{review.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {review.location} · {review.product}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
