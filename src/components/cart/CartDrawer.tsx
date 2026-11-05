'use client';

// ============================================================
// Cart Drawer — Slide-in Shopping Cart
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { generateWhatsAppMessage, getWhatsAppUrl } from '@/lib/whatsapp';

export function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getSubtotal,
    getShipping,
    getTotal,
    getItemCount,
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const shipping = getShipping(subtotal);
  const total = getTotal();
  const itemCount = getItemCount();

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return;
    const msg = generateWhatsAppMessage(items);
    window.open(getWhatsAppUrl(msg), '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-brand-cream shadow-2xl flex flex-col"
            aria-label="Shopping Cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-brand-green/10 bg-brand-ivory">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-green" />
                <h2 className="font-heading text-xl font-bold text-brand-green">
                  Your Cart
                </h2>
                <span className="text-xs bg-brand-gold text-brand-charcoal font-semibold px-2 py-0.5 rounded-full">
                  {itemCount}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-full text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-brand-green/10 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-brand-green/10 flex items-center justify-center mb-4 text-brand-green">
                    <ShoppingBag className="w-10 h-10 opacity-60" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-brand-charcoal mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-brand-charcoal/70 max-w-xs mb-6">
                    Add our authentic Chakwal mustard oil and experience the taste of tradition.
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 bg-brand-green text-brand-cream px-6 py-3 rounded-full text-sm font-medium hover:bg-brand-green/90 transition-colors shadow-sm"
                  >
                    Explore Shop <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex gap-4 p-4 rounded-xl bg-white border border-brand-green/10 shadow-sm"
                  >
                    {/* Bottle Thumbnail Placeholder */}
                    <div className="w-16 h-20 rounded-lg bg-amber-50 border border-amber-200/50 flex flex-col items-center justify-center p-1 relative overflow-hidden flex-shrink-0">
                      <div className="w-3 h-2 bg-brand-green rounded-t-xs" />
                      <div className="w-2 h-2 bg-amber-700/80" />
                      <div className="w-8 h-12 bg-gradient-to-b from-amber-500 to-amber-700 rounded-sm flex items-center justify-center">
                        <span className="text-[6px] font-bold text-amber-950 bg-brand-cream px-0.5 rounded-xs">
                          {item.variant.size}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-heading font-semibold text-sm text-brand-green truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-brand-charcoal/40 hover:text-red-600 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-brand-terracotta font-medium mb-2">
                        Size: {item.variant.name}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Qty Selector */}
                        <div className="flex items-center border border-brand-green/20 rounded-lg bg-brand-ivory">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.variantId, item.quantity - 1)
                            }
                            className="p-1 hover:bg-brand-green/10 text-brand-charcoal transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-semibold text-brand-charcoal">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.variantId, item.quantity + 1)
                            }
                            className="p-1 hover:bg-brand-green/10 text-brand-charcoal transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-xs font-bold text-brand-charcoal">
                            {formatPrice(item.variant.price * item.quantity)}
                          </p>
                          <p className="text-[10px] text-brand-charcoal/50">
                            {formatPrice(item.variant.price)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-brand-green/10 bg-brand-ivory space-y-3">
                <div className="space-y-1.5 text-xs text-brand-charcoal/80">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-brand-charcoal">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="font-bold text-emerald-700">FREE</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[11px] text-brand-terracotta">
                      Add {formatPrice(2000 - subtotal)} more for Free Shipping across Pakistan!
                    </p>
                  )}
                  <div className="flex justify-between text-base font-bold text-brand-green pt-2 border-t border-brand-green/10">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-2 pt-2">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full flex items-center justify-center gap-2 bg-brand-green text-brand-cream py-3 rounded-xl font-medium text-sm hover:bg-brand-green/90 transition-all shadow-md active:scale-[0.99]"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-[#20ba59] transition-all shadow-sm active:scale-[0.99]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Order via WhatsApp
                  </button>

                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="block text-center text-xs text-brand-charcoal/70 hover:text-brand-green hover:underline pt-1"
                  >
                    View Full Cart Page
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
