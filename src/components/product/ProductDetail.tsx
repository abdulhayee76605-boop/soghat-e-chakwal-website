'use client';

// ============================================================
// Product Detail Component — Soghat-e-Chakwal
// Clean, luxury e-commerce layout with relevant HD product images
// ============================================================

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Zap,
  MessageCircle,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronDown,
  Sparkles,
  Share2,
} from 'lucide-react';
import { Product, ProductVariant } from '@/lib/types';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { generateProductWhatsAppMessage, getWhatsAppUrl } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/pixel';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addItem, openCart } = useCartStore();

  const is1L = product.slug.includes('1-liter') || product.name.includes('1 Liter');

  // Selected variant state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || {
      id: 'default',
      name: is1L ? '1 Liter' : '500ml',
      size: is1L ? '1L' : '500ml',
      price: is1L ? 750 : 450,
      sku: is1L ? 'SEC-1L' : 'SEC-500ML',
      weight: is1L ? 1000 : 500,
      inStock: true,
      stockQuantity: 50,
    }
  );

  // Active gallery image
  const defaultImage = product.images?.[0]?.src || (is1L ? '/images/products/mustard-oil-1l.png' : '/images/products/mustard-oil-500ml.png');
  const [activeImage, setActiveImage] = useState<string>(defaultImage);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'storage' | 'shipping' | 'faqs'>('desc');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [addedToast, setAddedToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    trackEvent('ViewContent', {
      content_name: product.name,
      content_ids: [selectedVariant.id || product.id],
      content_type: 'product',
      value: selectedVariant.price,
      currency: 'PKR',
    });
  }, [product, selectedVariant]);

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    trackEvent('AddToCart', {
      content_name: product.name,
      content_ids: [selectedVariant.id || product.id],
      content_type: 'product',
      value: selectedVariant.price * quantity,
      currency: 'PKR',
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    addItem(product, selectedVariant, quantity);
    trackEvent('InitiateCheckout', {
      content_name: product.name,
      value: selectedVariant.price * quantity,
      currency: 'PKR',
    });
    router.push('/checkout');
  };

  const handleWhatsAppOrder = () => {
    const msg = generateProductWhatsAppMessage(
      product.name,
      selectedVariant.name,
      quantity,
      selectedVariant.price
    );
    window.open(getWhatsAppUrl(msg), '_blank');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Strictly relevant images only
  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [
        {
          id: '1',
          src: is1L ? '/images/products/mustard-oil-1l.png' : '/images/products/mustard-oil-500ml.png',
          alt: product.name,
        },
        {
          id: '2',
          src: '/images/products/mustard-oil-duo.png',
          alt: 'Soghat-e-Chakwal Mustard Oil Collection',
        },
      ];

  return (
    <div className="bg-brand-ivory min-h-screen pt-28 pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-50 bg-brand-green text-brand-cream px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-brand-gold/40"
          >
            <div className="w-7 h-7 rounded-full bg-brand-gold text-brand-charcoal flex items-center justify-center font-bold">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold">Added to cart!</p>
              <p className="text-[11px] text-brand-cream/80">
                {quantity}x {selectedVariant.name}
              </p>
            </div>
            <button
              onClick={openCart}
              className="ml-3 text-xs font-bold text-brand-gold hover:underline"
            >
              View Cart
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-xs md:text-sm text-brand-charcoal/60 mb-8 space-x-2">
          <Link href="/" className="hover:text-brand-green transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-brand-green transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-brand-charcoal font-semibold truncate">
            {product.name}
          </span>
        </nav>

        {/* Product Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Clean Relevant Photo Gallery */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Stage Image */}
            <div className="relative rounded-3xl bg-white border border-brand-green/10 shadow-lg overflow-hidden p-3 aspect-[4/3] sm:aspect-[16/11]">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-amber-50/50">
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  unoptimized={true}
                  className="object-contain object-center transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Verified Product Badge */}
              <div className="absolute top-5 left-5 z-20 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-brand-green/10 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                <span className="text-[11px] font-semibold text-brand-green tracking-wide">
                  {is1L ? '1 Liter Family Size' : '500ml Compact Size'}
                </span>
              </div>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="absolute top-5 right-5 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-brand-charcoal/70 hover:text-brand-green transition-colors shadow-sm"
                title="Share product link"
              >
                <Share2 className="w-4 h-4" />
                {copiedLink && (
                  <span className="absolute right-0 -bottom-7 bg-brand-charcoal text-white text-[10px] px-2 py-0.5 rounded shadow">
                    Copied!
                  </span>
                )}
              </button>
            </div>

            {/* Relevant Thumbnail Row */}
            <div className={`grid ${galleryImages.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img.src)}
                  className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white ${
                    activeImage === img.src
                      ? 'border-brand-green ring-2 ring-brand-green/20 shadow-md scale-[1.02]'
                      : 'border-brand-green/15 hover:border-brand-gold opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="relative w-full h-full rounded-xl overflow-hidden bg-amber-50/30">
                    <Image
                      src={img.src}
                      alt={img.alt || 'Product thumbnail'}
                      fill
                      unoptimized={true}
                      className="object-contain object-center"
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Quality Guarantees Bar */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white p-3.5 rounded-2xl border border-brand-green/10 text-center shadow-xs">
                <ShieldCheck className="w-5 h-5 text-brand-gold mx-auto mb-1" />
                <p className="text-[11px] font-bold text-brand-green">100% Authentic</p>
                <p className="text-[10px] text-brand-charcoal/60">Chakwal Sourced</p>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-brand-green/10 text-center shadow-xs">
                <Truck className="w-5 h-5 text-brand-gold mx-auto mb-1" />
                <p className="text-[11px] font-bold text-brand-green">Cash on Delivery</p>
                <p className="text-[10px] text-brand-charcoal/60">Nationwide Delivery</p>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-brand-green/10 text-center shadow-xs">
                <RotateCcw className="w-5 h-5 text-brand-gold mx-auto mb-1" />
                <p className="text-[11px] font-bold text-brand-green">Secure Packaging</p>
                <p className="text-[10px] text-brand-charcoal/60">Leak-Proof Seal</p>
              </div>
            </div>
          </div>

          {/* Right Column: Purchasing & Specifications */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="text-xs uppercase font-bold tracking-[0.2em] text-brand-terracotta mb-1">
                {product.category}
              </p>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-green leading-tight">
                {product.name}
              </h1>
              {product.nameUrdu && (
                <p className="font-serif text-xl md:text-2xl text-brand-gold font-medium mt-1">
                  {product.nameUrdu}
                </p>
              )}
            </div>

            {/* Price & Stock Display */}
            <div className="flex items-baseline gap-4 pb-4 border-b border-brand-green/10">
              <span className="font-heading text-3xl md:text-4xl font-extrabold text-brand-charcoal">
                {formatPrice(selectedVariant.price)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                In Stock ({selectedVariant.stockQuantity} units available)
              </span>
            </div>

            <p className="text-sm md:text-base text-brand-charcoal/80 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Quick Switcher Between Both Sizes (1L vs 500ml) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase font-bold tracking-wider text-brand-charcoal">
                  Available Sizes / Bottles
                </label>
                <span className="text-xs text-brand-terracotta font-medium">
                  Active: {is1L ? '1 Liter (White Cap)' : '500ml (Yellow Cap)'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/products/mustard-oil-1-liter"
                  className={`p-4 rounded-2xl text-left border-2 transition-all ${
                    is1L
                      ? 'border-brand-green bg-brand-green text-brand-cream shadow-md'
                      : 'border-brand-green/20 bg-white hover:border-brand-gold text-brand-charcoal'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-heading font-bold text-sm sm:text-base">1 Liter Bottle</p>
                      <p className={`text-xs ${is1L ? 'text-brand-cream/80' : 'text-brand-charcoal/60'}`}>
                        White Screw Cap
                      </p>
                    </div>
                    <span className={`font-bold text-sm ${is1L ? 'text-brand-gold' : 'text-brand-green'}`}>
                      Rs. 750
                    </span>
                  </div>
                </Link>

                <Link
                  href="/products/mustard-oil-500ml"
                  className={`p-4 rounded-2xl text-left border-2 transition-all ${
                    !is1L
                      ? 'border-brand-green bg-brand-green text-brand-cream shadow-md'
                      : 'border-brand-green/20 bg-white hover:border-brand-gold text-brand-charcoal'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-heading font-bold text-sm sm:text-base">500ml Bottle</p>
                      <p className={`text-xs ${!is1L ? 'text-brand-cream/80' : 'text-brand-charcoal/60'}`}>
                        Yellow Screw Cap
                      </p>
                    </div>
                    <span className={`font-bold text-sm ${!is1L ? 'text-brand-gold' : 'text-brand-green'}`}>
                      Rs. 450
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider text-brand-charcoal">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-brand-green/20 rounded-2xl bg-white px-2 py-1 shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-brand-green/10 rounded-xl transition-colors text-brand-charcoal"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-heading font-bold text-lg text-brand-charcoal">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 hover:bg-brand-green/10 rounded-xl transition-colors text-brand-charcoal"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-brand-charcoal/70">
                  Total: <strong className="text-brand-charcoal text-sm">{formatPrice(selectedVariant.price * quantity)}</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 bg-brand-green text-brand-cream py-4 rounded-2xl font-semibold text-sm hover:bg-brand-green-light transition-all shadow-md active:scale-[0.99]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full flex items-center justify-center gap-2 bg-brand-gold text-brand-charcoal py-4 rounded-2xl font-bold text-sm hover:bg-brand-gold-dark transition-all shadow-md active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4" />
                  Buy Now
                </button>
              </div>

              {/* WhatsApp Ordering Direct Button */}
              <button
                onClick={handleWhatsAppOrder}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-[#20ba59] transition-all shadow-md active:scale-[0.99]"
              >
                <MessageCircle className="w-5 h-5" />
                Order Directly on WhatsApp (0300-8325693)
              </button>
              <p className="text-[11px] text-center text-brand-charcoal/60">
                ⚡ Instant confirmation, no account required. Pay Cash on Delivery.
              </p>
            </div>

            {/* Detailed Accordion / Tabs */}
            <div className="pt-8 border-t border-brand-green/10">
              <div className="flex border-b border-brand-green/10 space-x-6 text-sm font-semibold mb-6 overflow-x-auto pb-1">
                {[
                  { id: 'desc', label: 'Description' },
                  { id: 'storage', label: 'Storage' },
                  { id: 'shipping', label: 'Shipping' },
                  { id: 'faqs', label: 'FAQs' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`pb-2 transition-colors relative whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-brand-green'
                        : 'text-brand-charcoal/50 hover:text-brand-charcoal'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="text-sm text-brand-charcoal/80 leading-relaxed min-h-[140px]">
                {activeTab === 'desc' && (
                  <div className="space-y-4">
                    <p>{product.description}</p>
                    <div className="bg-brand-cream/80 p-4 rounded-2xl border border-brand-gold/30">
                      <h4 className="font-heading font-bold text-brand-green mb-2">Key Highlights:</h4>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        {product.features.map((feat, idx) => (
                          <li key={idx}>{feat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'storage' && (
                  <div className="space-y-3">
                    <p>{product.storageInstructions}</p>
                    <p className="text-xs text-brand-terracotta font-medium">
                      ✓ Keep cap sealed after every use to maintain traditional pungency and aroma.
                    </p>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-3">
                    <p>{product.shippingInfo}</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Cash on Delivery available all over Pakistan.</li>
                      <li>Standard delivery time: 2-4 business days.</li>
                      <li>Delivery charges: Rs. 200 (Free for orders Rs. 2,000+).</li>
                    </ul>
                  </div>
                )}

                {activeTab === 'faqs' && (
                  <div className="space-y-2">
                    {product.faqs?.map((faq, idx) => {
                      const isOpen = openFaq === idx;
                      return (
                        <div
                          key={idx}
                          className="border border-brand-green/10 rounded-xl overflow-hidden bg-white"
                        >
                          <button
                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                            className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-xs text-brand-charcoal hover:bg-brand-ivory transition-colors"
                          >
                            <span>{faq.question}</span>
                            <ChevronDown
                              className={`w-4 h-4 text-brand-green transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="p-3.5 pt-0 text-xs text-brand-charcoal/70 bg-brand-ivory/50">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-green/10 p-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <p className="text-[10px] text-brand-charcoal/60 uppercase font-bold">
            {selectedVariant.name}
          </p>
          <p className="font-heading font-bold text-base text-brand-charcoal">
            {formatPrice(selectedVariant.price)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end max-w-xs">
          <button
            onClick={handleWhatsAppOrder}
            className="p-3 bg-[#25D366] text-white rounded-xl shadow hover:bg-[#20ba59]"
            title="Order on WhatsApp"
            aria-label="Order on WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-green text-brand-cream py-3 px-4 rounded-xl font-semibold text-xs shadow hover:bg-brand-green-light"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
