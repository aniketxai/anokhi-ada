import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-primary text-white glow-orange hover:bg-primary-light transition-material',
  secondary: 'bg-secondary-container text-foreground hover:bg-surface-muted border border-tertiary/20',
  outline: 'bg-transparent border border-primary/60 text-primary hover:bg-primary/10',
  ghost: 'bg-transparent text-foreground hover:bg-surface-container',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  icon: Icon,
  ...props
}) {
  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3 text-base gap-2.5',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={`
        inline-flex items-center justify-center rounded-full font-medium
        transition-material cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {children}
    </motion.button>
  );
}
