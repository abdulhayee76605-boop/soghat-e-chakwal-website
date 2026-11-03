'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Leaf, Flame, Package, Heart } from 'lucide-react';

const BENEFITS = [
  {
    icon: Leaf,
    title: "Inspired by Chakwal's Traditions",
    description:
      "Rooted in the agricultural heritage and time-honored practices of Chakwal.",
  },
  {
    icon: Flame,
    title: 'Authentic Desi Flavor',
    description:
      'The unmistakable taste of traditional Pakistani cooking in every drop.',
  },
  {
    icon: Package,
    title: 'Carefully Packaged',
    description:
      'Sealed with care to preserve freshness and deliver quality to your doorstep.',
  },
  {
    icon: Heart,
    title: 'Made for Family Kitchens',
    description:
      'Bringing the warmth of homemade flavors to families across Pakistan.',
  },
] as const;

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section ref={sectionRef} className="bg-brand-green section-padding">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.h2
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl md:text-5xl font-bold text-center text-white mb-14"
        >
          Why Choose Soghat-e-Chakwal?
        </motion.h2>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={
                  prefersReducedMotion ? false : { opacity: 0, y: 40 }
                }
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: prefersReducedMotion ? 0 : 0.12 * i,
                  ease: 'easeOut' as const,
                }}
                whileHover={
                  prefersReducedMotion
                    ? {}
                    : { y: -4, backgroundColor: 'rgba(255,255,255,0.2)' }
                }
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 transition-colors duration-200 cursor-default"
              >
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 mb-5">
                  <Icon className="w-12 h-12 text-brand-gold" strokeWidth={1.5} />
                </div>

                <h3 className="font-heading text-xl font-semibold text-white">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-white/70 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
