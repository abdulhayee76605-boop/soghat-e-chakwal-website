'use client';

// ============================================================
// Premium Sticky Header — Soghat-e-Chakwal
// Left-aligned brand logo, center navigation & persistent white styling
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Menu, X, MessageCircle } from 'lucide-react';
import { navLinks, siteConfig } from '@/lib/config';
import { useCartStore } from '@/lib/cart-store';
import { BrandLogo } from '@/components/common/BrandLogo';

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const toggleCart = useCartStore((state) => state.toggleCart);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 25);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* ── Persistent Crisp White Sticky Header ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-b border-brand-green/10 transition-all duration-300 ${
          isScrolled ? 'shadow-md py-2' : 'shadow-xs py-2.5 sm:py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* ── Left Column: Brand Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-2 group py-0.5 transition-transform duration-300 hover:scale-[1.02]"
              aria-label="Soghat-e-Chakwal Home"
            >
              <BrandLogo size="md" />
            </Link>

            {/* ── Center Column: Desktop Navigation ── */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-semibold tracking-wide transition-colors duration-200 group ${
                      isActive
                        ? 'text-brand-green font-bold'
                        : 'text-brand-charcoal/80 hover:text-brand-green'
                    }`}
                  >
                    {link.label}
                    {/* Active / Hover Underline */}
                    <span
                      className={`absolute bottom-0 left-4 right-4 h-0.5 origin-left transition-transform duration-300 ${
                        isActive
                          ? 'scale-x-100 bg-brand-gold'
                          : 'scale-x-0 group-hover:scale-x-100 bg-brand-gold'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* ── Right Column: Global Action Icons ── */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <Link
                href="/shop"
                aria-label="Search all products"
                className="p-2 rounded-full text-brand-charcoal hover:text-brand-green hover:bg-brand-green/5 transition-colors"
                title="Search products"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* WhatsApp Quick Order Button */}
              <a
                href={siteConfig.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Order or chat on WhatsApp"
                className="flex p-2 rounded-full text-[#25D366] hover:bg-green-50 transition-colors"
                title="Order on WhatsApp: 0300-8325693"
              >
                <MessageCircle className="w-5 h-5" />
              </a>

              {/* Shopping Cart Button */}
              <button
                onClick={toggleCart}
                aria-label={`Shopping cart with ${itemCount} items`}
                className="relative p-2 rounded-full text-brand-charcoal hover:text-brand-green hover:bg-brand-green/5 transition-colors"
                title="View cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-brand-terracotta rounded-full ring-2 ring-white shadow-xs">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 rounded-xl text-brand-charcoal hover:text-brand-green hover:bg-brand-green/5 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Slide-in Drawer ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-full max-w-sm bg-brand-cream border-r border-brand-green/10 shadow-2xl flex flex-col lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-brand-green/10 bg-white">
                <BrandLogo size="sm" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-full text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-brand-green/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block py-3 px-4 rounded-xl text-base font-semibold transition-colors ${
                        isActive
                          ? 'bg-brand-green text-brand-cream shadow-xs'
                          : 'text-brand-charcoal hover:bg-brand-green/10'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="pt-6 border-t border-brand-green/10 mt-6 space-y-3">
                  <a
                    href={siteConfig.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-[#25D366] hover:bg-[#20ba59] transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Order via WhatsApp (0300-8325693)
                  </a>

                  <Link
                    href="/shop"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm text-brand-charcoal bg-brand-gold hover:bg-brand-gold-dark transition-colors shadow-sm"
                  >
                    Shop All Products
                  </Link>
                </div>
              </nav>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-brand-green/10 bg-brand-ivory text-center text-xs text-brand-charcoal/60">
                <p className="font-serif italic text-brand-terracotta mb-1">
                  &ldquo;Wohi Purana Desi Zaiqa, Ab Har Ghar Mein!&rdquo;
                </p>
                <p>Official WhatsApp: 0300-8325693</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
