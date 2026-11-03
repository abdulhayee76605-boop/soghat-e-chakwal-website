'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { getFeaturedProducts } from '@/lib/data';
import ProductCard from './ProductCard';

export default function FeaturedProducts() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();

  const products = getFeaturedProducts();

  const containerVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: prefersReducedMotion ? 0 : 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="bg-brand-cream section-padding"
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-charcoal">
            From Our Farm-Inspired Collection
          </h2>
          <p className="mt-4 text-lg text-brand-terracotta max-w-2xl mx-auto">
            Traditional flavors for today&apos;s kitchens.
          </p>
        </motion.div>

        {/* Product grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}

          {/* If fewer than 3 products, show Coming Soon cards */}
          {products.length < 3 &&
            Array.from({ length: 3 - products.length }).map((_, i) => (
              <motion.div
                key={`coming-${i}`}
                variants={itemVariants}
                className="bg-white/60 rounded-2xl border-2 border-dashed border-brand-gold/30 flex flex-col items-center justify-center aspect-[3/4] p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">🌾</span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-brand-charcoal/60">
                  Coming Soon
                </h3>
                <p className="mt-2 text-sm text-brand-charcoal/40">
                  More traditional flavors are on the way.
                </p>
              </motion.div>
            ))}
        </motion.div>
      </div>
    </section>
  );
}
