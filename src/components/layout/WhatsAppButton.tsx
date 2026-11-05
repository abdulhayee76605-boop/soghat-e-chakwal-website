'use client';

// ============================================================
// Floating WhatsApp Button — Soghat-e-Chakwal
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 2, type: 'spring', damping: 20, stiffness: 200 }}
      className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40"
    >
      {/* Tooltip */}
      <motion.span
        initial={{ opacity: 0, x: 10, scale: 0.9 }}
        animate={
          isHovered
            ? { opacity: 1, x: 0, scale: 1 }
            : { opacity: 0, x: 10, scale: 0.9 }
        }
        transition={{ duration: 0.15 }}
        className="absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap rounded-lg bg-brand-charcoal px-3 py-1.5 text-xs font-medium text-white shadow-lg pointer-events-none"
      >
        Chat on WhatsApp
        {/* Tooltip arrow */}
        <span className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 rotate-45 bg-brand-charcoal" />
      </motion.span>

      {/* Button */}
      <a
        href={siteConfig.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform duration-200 hover:scale-110 focus-visible:scale-110"
        style={{ backgroundColor: '#25D366' }}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#25D366]" />
        <MessageCircle className="w-6 h-6 text-white relative z-10" />
      </a>
    </motion.div>
  );
}
