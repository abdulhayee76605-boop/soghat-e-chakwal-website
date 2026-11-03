'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCartStore } from '@/lib/cart-store';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const lowestPrice = Math.min(...product.variants.map((v) => v.price));
  const firstVariant = product.variants[0];

  const handleAddToCart = () => {
    if (firstVariant) {
      addItem(product, firstVariant, 1);
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
        className="block aspect-[16/10] sm:aspect-[4/3] relative overflow-hidden bg-amber-50"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-left sm:object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute top-3 left-3 bg-brand-green/90 backdrop-blur-md text-brand-cream text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm">
          {product.category}
        </span>
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
        <div className="mt-3 flex gap-2">
          {product.variants.map((v) => (
            <span
              key={v.id}
              className="text-[11px] font-semibold bg-brand-cream text-brand-charcoal px-2.5 py-0.5 rounded-lg border border-brand-gold/30"
            >
              {v.name}: Rs. {v.price}
            </span>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-brand-green/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-brand-charcoal/50 uppercase font-bold tracking-wider">
              Starting from
            </p>
            <p className="text-brand-green font-heading font-black text-xl">
              Rs. {lowestPrice.toLocaleString()}
            </p>
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
