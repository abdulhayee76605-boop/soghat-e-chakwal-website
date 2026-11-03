import type { Metadata } from 'next';
import { PageHero } from '@/components/common/PageHero';
import ProductCard from '@/components/home/ProductCard';
import { getActiveProducts, categories } from '@/lib/data';
import { ShieldCheck, Truck, Sparkles, PhoneCall } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shop All Products — Soghat-e-Chakwal',
  description:
    'Discover authentic traditional products from Soghat-e-Chakwal. Our signature mustard oil brings the rich heritage of Chakwal straight to your kitchen.',
};

export default function ShopPage() {
  const products = getActiveProducts();

  return (
    <div className="bg-brand-ivory min-h-screen">
      <PageHero
        eyebrow="TRADITIONAL PANTRY"
        title="Our Farm-Inspired Collection"
        urduTitle="سوغات چکوال کی روایتی مصنوعات"
        subtitle="Pure, wholesome ingredients crafted with respect for Pakistani culinary traditions. Freshness guaranteed in every bottle."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12">
          <button
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-brand-green text-brand-cream shadow-sm"
          >
            All Products ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              disabled={!cat.isActive}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                cat.isActive
                  ? 'bg-white border border-brand-green/20 text-brand-charcoal hover:border-brand-green'
                  : 'bg-stone-200/60 text-stone-400 cursor-not-allowed border border-transparent'
              }`}
              title={cat.isActive ? cat.name : `${cat.name} (Coming Soon)`}
            >
              {cat.name} {!cat.isActive && <span className="text-[10px] ml-1 uppercase font-bold tracking-wider">Soon</span>}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Future Product Teaser Banner */}
        <div className="mt-16 bg-brand-cream rounded-3xl p-8 md:p-12 border border-brand-gold/30 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="inline-block px-3 py-1 bg-brand-gold/20 text-brand-charcoal text-xs font-semibold rounded-full uppercase tracking-wider">
              Expanding Our Pantry
            </span>
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-brand-green">
              More Traditional Delights Arriving Soon
            </h3>
            <p className="text-sm md:text-base text-brand-charcoal/70">
              We are working closely with trusted local producers across Chakwal to bring you pure Desi Ghee, natural hill Honey, authentic hand-pounded spices, and artisanal pickles.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:text-brand-terracotta underline underline-offset-4"
              >
                Inquire about custom or bulk orders &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-brand-green/10">
          <div className="flex flex-col items-center text-center p-4">
            <Sparkles className="w-8 h-8 text-brand-gold mb-2" />
            <h4 className="font-heading font-bold text-sm text-brand-green">Authentic Desi Taste</h4>
            <p className="text-xs text-brand-charcoal/60 mt-1">Inspired by Chakwal&apos;s culinary heritage</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <ShieldCheck className="w-8 h-8 text-brand-gold mb-2" />
            <h4 className="font-heading font-bold text-sm text-brand-green">Purity Guaranteed</h4>
            <p className="text-xs text-brand-charcoal/60 mt-1">Carefully packaged for freshness</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <Truck className="w-8 h-8 text-brand-gold mb-2" />
            <h4 className="font-heading font-bold text-sm text-brand-green">Nationwide Shipping</h4>
            <p className="text-xs text-brand-charcoal/60 mt-1">Cash on Delivery across Pakistan</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <PhoneCall className="w-8 h-8 text-brand-gold mb-2" />
            <h4 className="font-heading font-bold text-sm text-brand-green">Direct WhatsApp Support</h4>
            <p className="text-xs text-brand-charcoal/60 mt-1">Order or ask questions instantly</p>
          </div>
        </div>
      </div>
    </div>
  );
}
