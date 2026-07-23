import React, { forwardRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Heart, ShoppingCart, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/useApp';

const iconMap = {
  cart: ShoppingCart,
  wishlist: Heart,
  success: CheckCircle2,
};

const themeMap = {
  cart: {
    ring: 'ring-primary/20',
    accent: 'from-primary/15 via-primary/10 to-transparent',
    badge: 'bg-primary/15 text-primary',
    button: 'hover:bg-primary/10 text-primary',
  },
  wishlist: {
    ring: 'ring-pink-400/20',
    accent: 'from-pink-500/15 via-rose-500/10 to-transparent',
    badge: 'bg-pink-500/15 text-pink-400',
    button: 'hover:bg-pink-500/10 text-pink-300',
  },
  success: {
    ring: 'ring-emerald-400/20',
    accent: 'from-emerald-500/15 via-emerald-400/10 to-transparent',
    badge: 'bg-emerald-500/15 text-emerald-400',
    button: 'hover:bg-emerald-500/10 text-emerald-300',
  },
};

const NotificationToast = forwardRef(function NotificationToast({ notification, onClose }, ref) {
  const navigate = useNavigate();
  const Icon = iconMap[notification.icon] || Sparkles;
  const theme = themeMap[notification.type] || themeMap.success;

  const handleAction = () => {
    onClose(notification.id);
    if (notification.actionTo) {
      navigate(notification.actionTo);
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: -14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-surface-container/95 shadow-2xl backdrop-blur-xl ring-1 ${theme.ring}`}
    >
      <div className={`absolute inset-0 bg-linear-to-br ${theme.accent}`} />
      <div className="relative flex items-start gap-3 sm:gap-4 p-4 sm:p-5">
        <div className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl ${theme.badge} shadow-inner`}>
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{notification.title}</p>
          <p className="mt-1 text-sm text-secondary-text leading-relaxed">{notification.message}</p>

          {(notification.actionLabel || notification.actionTo) && (
            <button
              type="button"
              onClick={handleAction}
              className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-material ${theme.button}`}
            >
              <span>{notification.actionLabel || 'View'}</span>
              <Sparkles size={12} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onClose(notification.id)}
          className="rounded-full p-2 text-secondary-text hover:bg-white/5 hover:text-foreground transition-material"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
});

export default function Notifications() {
  const { notifications, removeNotification } = useApp();

  if (!notifications.length) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 sm:top-6 z-80 px-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl justify-center sm:justify-end">
        <div className="flex w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm flex-col gap-3">
          <AnimatePresence initial={false} mode="popLayout">
            {notifications.map((notification) => (
              <NotificationToast
                key={notification.id}
                notification={notification}
                onClose={removeNotification}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
