import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { BRAND } from '../data/brand';

export default function WhatsAppButton() {
  if (!BRAND.social.whatsapp) return null;
  return (
    <motion.a
      href={BRAND.social.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/30"
    >
      <FaWhatsapp className="h-7 w-7" />
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 -z-10" />
    </motion.a>
  );
}
