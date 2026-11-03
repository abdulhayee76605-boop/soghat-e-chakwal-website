'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Sprout, Droplets, Package, Home } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'The Source',
    description:
      'We begin with quality ingredients sourced from trusted agricultural regions.',
    icon: Sprout,
  },
  {
    number: '02',
    title: 'Preparation',
    description:
      'Traditional methods guide our careful preparation process.',
    icon: Droplets,
  },
  {
    number: '03',
    title: 'Packaging',
    description:
      'Sealed and packaged with care to preserve freshness and quality.',
    icon: Package,
  },
  {
    number: '04',
    title: 'Your Kitchen',
    description:
      'Ready to bring authentic flavors to your family\'s table.',
    icon: Home,
  },
] as const;

export default function FarmToFork() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section ref={sectionRef} className="bg-brand-ivory section-padding">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-charcoal">
            From Farm to Fork
          </h2>
          <p className="mt-4 text-lg text-brand-terracotta max-w-xl mx-auto">
            Our journey from nature to your table.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Connecting line — horizontal on desktop */}
          <div
            className="hidden lg:block absolute top-1/2 left-[12.5%] right-[12.5%] h-px -translate-y-1/2 z-0"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--brand-gold) 15%, var(--brand-gold) 85%, transparent)',
              opacity: 0.3,
            }}
          />
          {/* Connecting line — vertical on mobile/tablet */}
          <div
            className="lg:hidden absolute top-[8%] bottom-[8%] left-1/2 w-px -translate-x-1/2 z-0"
            style={{
              background:
                'linear-gradient(180deg, transparent, var(--brand-gold) 10%, var(--brand-gold) 90%, transparent)',
              opacity: 0.3,
            }}
          />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={
                  prefersReducedMotion ? false : { opacity: 0, y: 50 }
                }
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: prefersReducedMotion ? 0 : 0.15 * i,
                  ease: 'easeOut' as const,
                }}
                className="relative z-10 bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Large background number */}
                <span className="absolute top-4 right-5 font-heading text-6xl font-bold text-brand-gold/15 select-none pointer-events-none">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand-green/10 mb-5">
                  <Icon className="w-7 h-7 text-brand-green" />
                </div>

                <h3 className="font-heading text-lg font-semibold text-brand-charcoal">
                  {step.number} — {step.title}
                </h3>
                <p className="mt-3 text-sm text-brand-charcoal/70 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
