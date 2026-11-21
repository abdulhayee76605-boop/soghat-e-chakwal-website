'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCartStore } from '@/lib/cart-store';
import { trackEvent } from '@/lib/pixel';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const lowestPrice = Math.min(...product.variants.map((v) => v.price));
  const comparePrices = product.variants
    .map((v) => v.compareAtPrice)
    .filter((p): p is number => typeof p === 'number' && p > 0);
  const lowestComparePrice = comparePrices.length > 0 ? Math.min(...comparePrices) : null;
  const hasSale = product.variants.some((v) => v.compareAtPrice && v.compareAtPrice > v.price);
  const maxSavings = Math.max(
    ...product.variants.map((v) => (v.compareAtPrice && v.compareAtPrice > v.price ? v.compareAtPrice - v.price : 0))
  );
  const firstVariant = product.variants[0];

  const handleAddToCart = () => {
    if (firstVariant) {
      addItem(product, firstVariant, 1);
      trackEvent('AddToCart', {
        content_name: product.name,
        content_ids: [firstVariant.id || product.id],
        content_type: 'product',
        value: firstVariant.price,
        currency: 'PKR',
      });
      openCart();
    }
  };

  const primaryImage = product.images?.[0]?.src || '/images/banners/hero-banner-1.png';

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { y: -8 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      className="group bg-white rounded-3xl shadow-md overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 border border-brand-green/10"
    >
      {/* Image area */}
      <Link
        href={`/products/${product.slug}`}
        className="block aspect-[16/11] sm:aspect-[4/3] relative overflow-hidden bg-amber-50/60 p-2 sm:p-3"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <span className="absolute top-3 left-3 bg-brand-green/90 backdrop-blur-md text-brand-cream text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm">
          {product.category}
        </span>
        {hasSale && (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            SALE {maxSavings > 0 ? `• Save Rs. ${maxSavings}` : ''}
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-6">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-heading text-lg sm:text-xl font-bold text-brand-charcoal group-hover:text-brand-green transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.nameUrdu && (
          <p className="font-serif text-sm text-brand-gold font-medium mt-0.5">
            {product.nameUrdu}
          </p>
        )}

        <p className="mt-2 text-xs sm:text-sm text-brand-charcoal/70 line-clamp-2 flex-1 leading-relaxed">
          {product.shortDescription}
        </p>

        {/* Variants summary */}
        <div className="mt-3 flex flex-wrap gap-2">
          {product.variants.map((v) => (
            <span
              key={v.id}
              className="text-[11px] font-semibold bg-brand-cream text-brand-charcoal px-2.5 py-1 rounded-lg border border-brand-gold/30 inline-flex items-center gap-1.5"
            >
              <span>{v.name}:</span>
              {v.compareAtPrice && v.compareAtPrice > v.price && (
                <span className="line-through text-stone-400 text-[10px]">
                  Rs. {v.compareAtPrice}
                </span>
              )}
              <span className="text-brand-green font-bold">Rs. {v.price}</span>
            </span>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-brand-green/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] text-brand-charcoal/50 uppercase font-bold tracking-wider">
                {hasSale ? 'Sale Price' : 'Starting from'}
              </p>
              {hasSale && (
                <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                  Discounted
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-brand-green font-heading font-black text-xl">
                Rs. {lowestPrice.toLocaleString()}
              </p>
              {lowestComparePrice && lowestComparePrice > lowestPrice && (
                <p className="line-through text-stone-400 text-xs sm:text-sm font-semibold">
                  Rs. {lowestComparePrice.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
              className="p-3 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal rounded-full transition-all shadow-sm active:scale-95"
              title="Quick Add to Cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
            <Link
              href={`/products/${product.slug}`}
              className="px-4 py-2 bg-brand-green text-brand-cream text-xs font-semibold rounded-full hover:bg-brand-green-light transition-colors"
            >
              Details &rarr;
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
