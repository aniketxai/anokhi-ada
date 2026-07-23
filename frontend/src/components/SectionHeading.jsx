import { motion } from 'framer-motion';

export default function SectionHeading({ label, title, description, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className={`max-w-2xl mb-12 ${center ? 'mx-auto text-center' : ''}`}
    >
      {label && (
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">
          {label}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-display leading-tight mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-secondary-text text-base leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
}
