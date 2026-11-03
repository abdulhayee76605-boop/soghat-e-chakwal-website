'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/* Warm bokeh circles */
const BOKEH = [
  { top: '12%', left: '8%', size: 120, color: 'rgba(212,164,55,0.06)' },
  { top: '60%', left: '75%', size: 180, color: 'rgba(212,164,55,0.05)' },
  { top: '25%', right: '12%', size: 100, color: 'rgba(168,91,54,0.05)' },
  { top: '70%', left: '20%', size: 140, color: 'rgba(212,164,55,0.04)' },
  { top: '40%', left: '55%', size: 90, color: 'rgba(168,91,54,0.06)' },
  { top: '8%', right: '35%', size: 160, color: 'rgba(212,164,55,0.04)' },
];

export default function FamilyStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-120px' });
  const prefersReducedMotion = useReducedMotion();

  const fade = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 40 },
          animate: isInView ? { opacity: 1, y: 0 } : {},
          transition: { duration: 0.8, delay, ease: 'easeOut' as const },
        };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[80vh] flex items-center overflow-hidden"
      style={{
        background:
          'linear-gradient(160deg, #222822 0%, #1a2018 40%, #2a1f12 70%, #222822 100%)',
      }}
    >
      {/* Warm glow overlay — family gathering ambiance */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(168,91,54,0.12) 0%, transparent 60%), radial-gradient(ellipse at 30% 30%, rgba(212,164,55,0.08) 0%, transparent 50%)',
        }}
      />

      {/* Bokeh circles */}
      {BOKEH.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none blur-2xl"
          style={{
            top: b.top,
            left: b.left,
            right: (b as { right?: string }).right,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle, ${b.color}, transparent)`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-10 py-24 text-center">
        <motion.h2
          {...fade(0.1)}
          className="font-heading text-4xl md:text-6xl font-bold text-white leading-tight"
        >
          Some Flavors Bring Back{' '}
          <span className="text-gradient-gold inline-block">Memories.</span>
        </motion.h2>

        <motion.p
          {...fade(0.35)}
          className="mt-8 text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
        >
          The aroma of traditional cooking. The warmth of family gatherings.
          The recipes passed from one generation to the next.
        </motion.p>

        <motion.div {...fade(0.6)} className="mt-10">
          <Link
            href="/our-story"
            className="inline-flex items-center justify-center border-2 border-brand-gold text-brand-gold px-8 py-4 rounded-full font-semibold hover:bg-brand-gold/10 transition-colors duration-200"
          >
            Discover Our Story
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
