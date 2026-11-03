// ============================================================
// Page Hero Banner — Reusable for inner pages
// ============================================================

import React from 'react';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  urduTitle?: string;
}

export function PageHero({ eyebrow, title, subtitle, urduTitle }: PageHeroProps) {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-hero text-white overflow-hidden">
      {/* Decorative background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #D4A437 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {eyebrow && (
          <p className="text-xs md:text-sm font-semibold tracking-[0.25em] text-brand-gold uppercase mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-brand-cream">
          {title}
        </h1>
        {urduTitle && (
          <p className="mt-2 text-xl md:text-2xl text-brand-gold/80 font-medium font-serif">
            {urduTitle}
          </p>
        )}
        {subtitle && (
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-white/80 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Subtle bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-brand-ivory to-transparent pointer-events-none" />
    </section>
  );
}
