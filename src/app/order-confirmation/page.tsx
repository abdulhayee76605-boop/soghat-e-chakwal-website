'use client';

// ============================================================
// Order Confirmation Page — Soghat-e-Chakwal
// ============================================================

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageCircle, Package, ArrowRight, Home } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import { trackEvent } from '@/lib/pixel';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'SEC-ORDER';

  useEffect(() => {
    trackEvent('Purchase', {
      order_id: orderNumber,
      currency: 'PKR',
    });
  }, [orderNumber]);

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum! I have placed an order with Order ID: *${orderNumber}* on Soghat-e-Chakwal. Please share my delivery update.`
  );
  const trackUrl = `${siteConfig.whatsappLink}?text=${whatsappMessage}`;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-brand-green/10 shadow-lg text-center space-y-6">
      {/* Animated Checkmark */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto"
      >
        <CheckCircle2 className="w-12 h-12" />
      </motion.div>

      <div>
        <span className="text-xs font-bold tracking-widest text-brand-gold uppercase">
          Shukriya! Order Received
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-brand-green mt-1">
          Order Successfully Placed!
        </h1>
        <p className="text-sm text-brand-charcoal/70 mt-2">
          Your order has been recorded in our system. We will pack it with care and dispatch it promptly.
        </p>
      </div>

      {/* Order Badge */}
      <div className="bg-brand-cream/80 p-5 rounded-2xl border border-brand-gold/40 max-w-md mx-auto">
        <p className="text-xs text-brand-charcoal/60 uppercase font-bold tracking-wider">
          Your Order Tracking Number
        </p>
        <p className="font-mono text-xl sm:text-2xl font-black text-brand-green tracking-wider mt-1 select-all">
          {orderNumber}
        </p>
        <p className="text-[11px] text-brand-terracotta mt-1">
          Save this number for tracking and communication.
        </p>
        <div className="mt-2.5 pt-2 border-t border-brand-gold/30 text-[11px] text-brand-green font-semibold flex items-center justify-center gap-1.5">
          <span>📧 Automated Email &amp; 📱 SMS notification dispatched</span>
        </div>
      </div>

      {/* Next Steps Timeline */}
      <div className="text-left space-y-3 pt-2 max-w-md mx-auto text-xs text-brand-charcoal/80">
        <h3 className="font-heading font-bold text-sm text-brand-green text-center mb-3">
          What Happens Next?
        </h3>
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-brand-green text-brand-cream flex items-center justify-center font-bold text-[10px] flex-shrink-0">
            1
          </div>
          <div>
            <p className="font-bold text-brand-charcoal">Order Verification</p>
            <p className="text-brand-charcoal/60">Our dispatch team may contact you via WhatsApp/SMS to verify address details.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-brand-green text-brand-cream flex items-center justify-center font-bold text-[10px] flex-shrink-0">
            2
          </div>
          <div>
            <p className="font-bold text-brand-charcoal">Careful Packaging &amp; Dispatch</p>
            <p className="text-brand-charcoal/60">Your mustard oil bottles are securely wrapped in bubble cushioning to prevent any leakage.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-brand-green text-brand-cream flex items-center justify-center font-bold text-[10px] flex-shrink-0">
            3
          </div>
          <div>
            <p className="font-bold text-brand-charcoal">Delivery (3-5 Days)</p>
            <p className="text-brand-charcoal/60">Pay cash on delivery to the rider upon receipt.</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4 max-w-md mx-auto">
        <a
          href={trackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-[#20ba59] transition-all shadow-md active:scale-[0.99]"
        >
          <MessageCircle className="w-5 h-5" />
          Track or Inquire on WhatsApp
        </a>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/shop"
            className="flex items-center justify-center gap-1.5 bg-brand-green text-brand-cream py-3 rounded-2xl font-medium text-xs hover:bg-brand-green-light transition-all"
          >
            <Package className="w-4 h-4" />
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 bg-brand-ivory text-brand-charcoal border border-brand-green/20 py-3 rounded-2xl font-medium text-xs hover:bg-brand-cream transition-all"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-brand-ivory pt-32 pb-24 px-4 flex items-center justify-center">
      <Suspense
        fallback={
          <div className="text-center p-12">
            <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-brand-charcoal/60 mt-3">Loading confirmation...</p>
          </div>
        }
      >
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
