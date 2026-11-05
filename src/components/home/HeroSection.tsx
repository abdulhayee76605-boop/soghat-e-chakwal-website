'use client';

// ============================================================
// Cinematic Hero Banner Slider — Soghat-e-Chakwal
// Incorporating All 3 Official Full HD Master Banners
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  BookOpen,
  Truck,
  Sparkles,
  ShieldCheck,
  Sprout,
  MessageCircle,
} from 'lucide-react';

const BANNERS = [
  {
    id: 'banner-1',
    src: '/images/banners/hero-banner-1.png',
    alt: 'Soghat-e-Chakwal — From Farm to Fork — Wohi Purana Desi Zaiqa, Ab Har Ghar Mein!',
    badge: 'Farm to Fork',
    title: 'Wohi Purana Desi Zaiqa, Ab Har Ghar Mein!',
    subtitle: '100% Pure & Natural • Traditional Taste • Farm Sourced',
    primaryCta: {
      text: 'Shop Now',
      href: '/shop',
      icon: ShoppingCart,
      isExternal: false,
    },
    secondaryCta: {
      text: 'Explore Our Story',
      href: '/our-story',
      icon: BookOpen,
      isExternal: false,
    },
  },
  {
    id: 'banner-2',
    src: '/images/banners/hero-banner-2.png',
    alt: 'Soghat-e-Chakwal — The Taste of Tradition — Pure Desi Flavor from Chakwal',
    badge: 'Traditional Heritage',
    title: 'The Taste of Tradition',
    subtitle: 'Pure Desi Flavor from Chakwal • Crafted for family kitchens',
    primaryCta: {
      text: 'Explore Our Story',
      href: '/our-story',
      icon: BookOpen,
      isExternal: false,
    },
    secondaryCta: {
      text: 'Buy Mustard Oil',
      href: '/products/mustard-oil',
      icon: ShoppingCart,
      isExternal: false,
    },
  },
  {
    id: 'banner-3',
    src: '/images/banners/hero-banner-3.png',
    alt: 'Soghat-e-Chakwal — Shipping Nationwide! Delivered across Pakistan (Islamabad, Lahore, Karachi, Peshawar, Quetta)',
    badge: 'Nationwide Delivery',
    title: 'Shipping Nationwide!',
    subtitle: 'Soghat-e-Chakwal Mustard Oil delivered across all cities in Pakistan',
    primaryCta: {
      text: 'Order (Cash on Delivery)',
      href: '/products/mustard-oil',
      icon: Truck,
      isExternal: false,
    },
    secondaryCta: {
      text: 'Order on WhatsApp',
      href: 'https://wa.me/923008325693?text=Assalam-o-Alaikum!%20I%20want%20to%20order%20Soghat-e-Chakwal%20Mustard%20Oil.',
      icon: MessageCircle,
      isExternal: true,
    },
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Auto-advance slider every 6.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 6500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
    touchStartX.current = null;
  };

  const activeBanner = BANNERS[currentSlide];

  return (
    <section
      className="relative w-full overflow-hidden bg-brand-charcoal pt-16 sm:pt-20 md:pt-24 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured Promotions Slider"
    >
      {/* ── Main Full HD Banner Screen ── */}
      <div className="relative w-full aspect-[2.2/1] sm:aspect-[21/9] min-h-[175px] sm:min-h-[460px] md:min-h-[560px] lg:min-h-[640px] max-h-[88vh] bg-stone-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBanner.id}
            initial={{ opacity: 0, scale: 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Full HD Uncompressed Image */}
            <Image
              src={activeBanner.src}
              alt={activeBanner.alt}
              fill
              priority={currentSlide === 0}
              unoptimized={true}
              quality={100}
              sizes="100vw"
              className="object-cover object-center"
            />

            {/* Subtle Gradient Vignette to frame and protect text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />

            {/* Responsive Interactive Action Overlay */}
            <div className="absolute bottom-2.5 sm:bottom-10 right-2 sm:right-12 z-20 flex flex-wrap items-center justify-end gap-1.5 sm:gap-3.5">
              {activeBanner.primaryCta.isExternal ? (
                <a
                  href={activeBanner.primaryCta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 sm:gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-3 sm:px-8 py-1.5 sm:py-3.5 rounded-full font-bold text-[10px] sm:text-sm tracking-wide shadow-xl transition-all transform hover:scale-105 active:scale-95"
                >
                  <activeBanner.primaryCta.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  {activeBanner.primaryCta.text} &rarr;
                </a>
              ) : (
                <Link
                  href={activeBanner.primaryCta.href}
                  className="inline-flex items-center gap-1 sm:gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal px-3 sm:px-8 py-1.5 sm:py-3.5 rounded-full font-bold text-[10px] sm:text-sm tracking-wide shadow-xl transition-all transform hover:scale-105 active:scale-95"
                >
                  <activeBanner.primaryCta.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  {activeBanner.primaryCta.text} &rarr;
                </Link>
              )}

              {activeBanner.secondaryCta.isExternal ? (
                <a
                  href={activeBanner.secondaryCta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-2 bg-[#25D366]/90 hover:bg-[#25D366] text-white px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-xl backdrop-blur-md transition-all hover:scale-105"
                >
                  <activeBanner.secondaryCta.icon className="w-4 h-4" />
                  {activeBanner.secondaryCta.text}
                </a>
              ) : (
                <Link
                  href={activeBanner.secondaryCta.href}
                  className="hidden sm:inline-flex items-center gap-2 bg-white/90 hover:bg-white text-brand-green px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-xl backdrop-blur-md transition-all hover:scale-105"
                >
                  <activeBanner.secondaryCta.icon className="w-4 h-4" />
                  {activeBanner.secondaryCta.text}
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Slide Navigation Arrows (Hidden on small touchscreens for clean swipe) ── */}
        <button
          onClick={prevSlide}
          className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-brand-gold hover:text-brand-charcoal text-white backdrop-blur-md items-center justify-center transition-all shadow-xl active:scale-95"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-brand-gold hover:text-brand-charcoal text-white backdrop-blur-md items-center justify-center transition-all shadow-xl active:scale-95"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* ── Slide Dots & Counter ── */}
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-12 z-30 flex items-center gap-1.5 sm:gap-2.5 bg-black/40 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-white/10">
          {BANNERS.map((banner, idx) => (
            <button
              key={banner.id}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-300 rounded-full ${
                currentSlide === idx
                  ? 'w-5 sm:w-9 h-1.5 sm:h-2 bg-brand-gold shadow-md'
                  : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/90'
              }`}
              aria-label={`Switch to banner ${idx + 1}`}
            />
          ))}
          <span className="text-[9px] sm:text-xs font-mono font-bold text-white/80 ml-0.5">
            0{currentSlide + 1} / 0{BANNERS.length}
          </span>
        </div>
      </div>

      {/* ── Trust Badges Strip Under Banner ── */}
      <div className="bg-brand-green text-brand-cream border-t border-brand-gold/30 py-4 px-4 sm:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 py-1">
            <Sparkles className="w-4 h-4 text-brand-gold flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              100% Pure &amp; Natural
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 py-1">
            <ShieldCheck className="w-4 h-4 text-brand-gold flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              Traditional Desi Zaiqa
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 py-1">
            <Sprout className="w-4 h-4 text-brand-gold flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              Farm Sourced from Chakwal
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 py-1">
            <Truck className="w-4 h-4 text-brand-gold flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              Cash on Delivery Nationwide
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
