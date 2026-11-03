'use client';

// ============================================================
// Full Cart Page — Soghat-e-Chakwal
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { generateWhatsAppMessage, getWhatsAppUrl } from '@/lib/whatsapp';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getShipping,
    getTotal,
    getItemCount,
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-ivory pt-36 pb-20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shipping = getShipping(subtotal);
  const total = getTotal();
  const itemCount = getItemCount();
  const freeShippingThreshold = 2000;
  const freeShippingLeft = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return;
    const msg = generateWhatsAppMessage(items);
    window.open(getWhatsAppUrl(msg), '_blank');
  };

  return (
    <div className="min-h-screen bg-brand-ivory pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-brand-green/10 pb-6 mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-brand-green">
            Shopping Cart
          </h1>
          <p className="text-sm text-brand-charcoal/70 mt-1">
            Review your traditional culinary selections before checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-brand-green/10 shadow-sm max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 opacity-70" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-brand-charcoal mb-2">
              Your cart is currently empty
            </h2>
            <p className="text-sm text-brand-charcoal/70 mb-6">
              Looks like you haven&apos;t added any traditional products yet.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-brand-green text-brand-cream px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-brand-green-light transition-all shadow-md"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Items List (Left Column) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free shipping banner */}
              <div className="bg-brand-cream p-4 rounded-2xl border border-brand-gold/30">
                <div className="flex justify-between items-center text-xs font-semibold text-brand-charcoal mb-2">
                  <span>
                    {freeShippingLeft === 0 ? (
                      <span className="text-emerald-800 font-bold">
                        🎉 You qualified for FREE Delivery nationwide!
                      </span>
                    ) : (
                      <>
                        Add <strong className="text-brand-green">{formatPrice(freeShippingLeft)}</strong> more for <strong>FREE Delivery</strong>
                      </>
                    )}
                  </span>
                  <span className="text-brand-charcoal/60">
                    {Math.round(freeShippingPercent)}%
                  </span>
                </div>
                <div className="w-full bg-brand-ivory rounded-full h-2 overflow-hidden border border-brand-green/10">
                  <div
                    className="bg-brand-gold h-full rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingPercent}%` }}
                  />
                </div>
              </div>

              {/* Table / List */}
              <div className="bg-white rounded-3xl border border-brand-green/10 shadow-sm overflow-hidden">
                <div className="p-6 divide-y divide-brand-green/10">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-20 bg-amber-50 rounded-xl border border-amber-200/60 flex flex-col items-center justify-center flex-shrink-0">
                          <div className="w-4 h-2 bg-brand-green rounded-t-xs" />
                          <div className="w-3 h-2 bg-amber-700/80" />
                          <div className="w-9 h-12 bg-gradient-to-b from-amber-500 to-amber-700 rounded-xs flex items-center justify-center">
                            <span className="text-[7px] font-bold text-amber-950 bg-brand-cream px-1 rounded-xs">
                              {item.variant.size}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="font-heading font-bold text-brand-green hover:underline text-base sm:text-lg block"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-brand-terracotta font-medium mt-0.5">
                            Size: {item.variant.name}
                          </p>
                          <p className="text-xs text-brand-charcoal/60 sm:hidden mt-1">
                            {formatPrice(item.variant.price)} each
                          </p>
                        </div>
                      </div>

                      {/* Controls and Total */}
                      <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6">
                        {/* Qty Box */}
                        <div className="flex items-center border border-brand-green/20 rounded-xl bg-brand-ivory">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.variantId, item.quantity - 1)
                            }
                            className="p-2 hover:bg-brand-green/10 text-brand-charcoal transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-brand-charcoal">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.variantId, item.quantity + 1)
                            }
                            className="p-2 hover:bg-brand-green/10 text-brand-charcoal transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right min-w-[90px]">
                          <p className="font-heading font-bold text-sm sm:text-base text-brand-charcoal">
                            {formatPrice(item.variant.price * item.quantity)}
                          </p>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-brand-charcoal/40 hover:text-red-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-brand-ivory/50 border-t border-brand-green/10 flex justify-between items-center text-xs">
                  <button
                    onClick={clearCart}
                    className="text-red-600/80 hover:text-red-700 font-semibold"
                  >
                    Clear Cart
                  </button>
                  <Link
                    href="/shop"
                    className="text-brand-green font-semibold hover:underline"
                  >
                    &larr; Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* Order Summary (Right Column) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-brand-green/10 shadow-sm space-y-5">
                <h3 className="font-heading font-bold text-xl text-brand-green pb-3 border-b border-brand-green/10">
                  Order Summary
                </h3>

                <div className="space-y-3 text-sm text-brand-charcoal/80">
                  <div className="flex justify-between">
                    <span>Items ({itemCount})</span>
                    <span className="font-semibold text-brand-charcoal">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Standard Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="font-bold text-emerald-700">FREE</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-brand-green/10 flex justify-between text-lg font-bold text-brand-green">
                    <span>Estimated Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-2 bg-brand-green text-brand-cream py-4 rounded-2xl font-bold text-sm hover:bg-brand-green-light transition-all shadow-md active:scale-[0.99]"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-2xl font-semibold text-sm hover:bg-[#20ba59] transition-all shadow-sm active:scale-[0.99]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Quick Order on WhatsApp
                  </button>
                </div>

                <div className="pt-4 border-t border-brand-green/10 space-y-2 text-xs text-brand-charcoal/60">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-gold flex-shrink-0" />
                    <span>Pay with Cash on Delivery across Pakistan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-gold flex-shrink-0" />
                    <span>Pure traditional recipe, carefully packaged</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
