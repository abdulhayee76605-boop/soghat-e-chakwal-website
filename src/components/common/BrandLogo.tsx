'use client';

// ============================================================
// Premium Official Brand Logo — Soghat-e-Chakwal
// Tightly cropped authentic transparent logo with responsive sizing
// ============================================================

import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
}

export function BrandLogo({
  className = '',
  theme = 'auto',
  size = 'md',
  priority = true,
}: BrandLogoProps) {
  // Height sizing finely calibrated for clean responsive navigation & footer
  const sizeClasses = {
    sm: 'h-10 sm:h-11 w-auto',
    md: 'h-11 sm:h-13 md:h-14 w-auto',
    lg: 'h-16 sm:h-20 w-auto',
    xl: 'h-24 sm:h-28 w-auto',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-300 group-hover:scale-[1.02] ${className}`}
    >
      <Image
        src="/images/logo-official.png"
        alt="Soghat-e-Chakwal — From Farm to Fork"
        width={548}
        height={317}
        priority={priority}
        unoptimized={true}
        className={`${sizeClasses} object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.14)]`}
      />
    </div>
  );
}
