'use client';

// ============================================================
// Checkout Page — Soghat-e-Chakwal
// ============================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  MessageCircle,
  Building,
  Banknote,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { provinces } from '@/lib/config';
import { formatPrice } from '@/lib/utils';
import { generateWhatsAppMessage, getWhatsAppUrl } from '@/lib/whatsapp';
import { saveNewOrder } from '@/lib/orders-db';
import { trackEvent } from '@/lib/pixel';
import { triggerNotificationDispatch } from '@/lib/notifications';

const checkoutSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  phone: z
    .string()
    .min(10, 'Valid Pakistani phone number required (e.g. 0300 1234567)')
    .regex(/^(\+92|0|92)?[0-9]{10,11}$/, 'Please enter a valid phone number'),
  whatsapp: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  address: z.string().min(10, 'Please enter a complete delivery address'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(1, 'Please select your province'),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cod', 'bank_transfer']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    items,
    getSubtotal,
    getShipping,
    getTotal,
    clearCart,
  } = useCartStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      city: '',
      province: 'Punjab',
      postalCode: '',
      notes: '',
      paymentMethod: 'cod',
    },
  });

  const selectedPayment = watch('paymentMethod');

  useEffect(() => {
    setMounted(true);
    trackEvent('InitiateCheckout');
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-ivory pt-36 pb-24 text-center px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-brand-green/10 shadow-sm">
          <h2 className="font-heading text-2xl font-bold text-brand-green mb-2">
            Your cart is empty
          </h2>
          <p className="text-sm text-brand-charcoal/70 mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-brand-green text-brand-cream px-6 py-3 rounded-full text-sm font-semibold hover:bg-brand-green-light transition-all"
          >
            Go to Shop <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const newOrder = saveNewOrder({
        items,
        customer: {
          fullName: data.fullName,
          phone: data.phone,
          whatsapp: data.whatsapp || data.phone,
          email: data.email,
          address: data.address,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          notes: data.notes,
        },
        paymentMethod: data.paymentMethod,
        subtotal,
        shipping,
        total,
      });

      // Send automated multi-channel notifications (Email, SMS & WhatsApp)
      triggerNotificationDispatch(newOrder, 'order_placed').catch(() => {});

      // Clear cart and redirect to order confirmation
      clearCart();
      router.push(`/order-confirmation?orderNumber=${newOrder.orderNumber}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while placing your order';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppCheckout = () => {
    const msg = generateWhatsAppMessage(items);
    window.open(getWhatsAppUrl(msg), '_blank');
  };

  return (
    <div className="min-h-screen bg-brand-ivory pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-brand-green">
            Delivery &amp; Checkout
          </h1>
          <p className="text-sm text-brand-charcoal/70 mt-1">
            Complete your order with Cash on Delivery or Direct Bank Transfer.
          </p>
        </div>

        {submitError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Customer Info & Payment */}
            <div className="lg:col-span-7 space-y-8">
              {/* Shipping Address Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-green/10 shadow-sm space-y-6">
                <h2 className="font-heading text-xl font-bold text-brand-green flex items-center gap-2">
                  <Truck className="w-5 h-5 text-brand-gold" />
                  1. Shipping Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register('fullName')}
                      placeholder="e.g. Muhammad Ahmad"
                      className="w-full px-4 py-3 rounded-xl border border-brand-green/20 focus:outline-none focus:border-brand-gold text-base sm:text-sm bg-brand-ivory/30"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-600 font-medium">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      placeholder="0300 1234567"
                      className="w-full px-4 py-3 rounded-xl border border-brand-green/20 focus:outline-none focus:border-brand-gold text-base sm:text-sm bg-brand-ivory/30"
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600 font-medium">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                      WhatsApp Number (Optional)
                    </label>
                    <input
                      type="tel"
                      {...register('whatsapp')}
                      placeholder="Same as phone or different"
                      className="w-full px-4 py-3 rounded-xl border border-brand-green/20 focus:outline-none focus:border-brand-gold text-base sm:text-sm bg-brand-ivory/30"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="For tracking updates (optional)"
                      className="w-full px-4 py-3 rounded-xl border border-brand-green/20 focus:outline-none focus:border-brand-gold text-base sm:text-sm bg-brand-ivory/30"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                      Complete Delivery Address *
                    </label>
                    <textarea
                      rows={3}
                      {...register('address')}
                      placeholder="House / Flat / Shop #, Street, Mohallah / Sector / Phase"
                      className="w-full px-4 py-3 rounded-xl border border-brand-green/20 focus:outline-none focus:border-brand-gold text-base sm:text-sm bg-brand-ivory/30"
                    />
                    {errors.address && (
                      <p className="text-xs text-red-600 font-medium">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                      City *
                    </label>
                    <input
                      type="text"
                      {...register('city')}
                      placeholder="e.g. Islamabad, Lahore, Chakwal"
                      className="w-full px-4 py-3 rounded-xl border border-brand-green/20 focus:outline-none focus:border-brand-gold text-base sm:text-sm bg-brand-ivory/30"
                    />
                    {errors.city && (
                      <p className="text-xs text-red-600 font-medium">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                      Province *
                    </label>
                    <select
                      {...register('province')}
                      className="w-full px-4 py-3 rounded-xl border border-brand-green/20 focus:outline-none focus:border-brand-gold text-base sm:text-sm bg-brand-ivory/30"
                    >
                      {provinces.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                    {errors.province && (
                      <p className="text-xs text-red-600 font-medium">{errors.province.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                      Postal Code (Optional)
                    </label>
                    <input
                      type="text"
                      {...register('postalCode')}
                      placeholder="e.g. 44000"
                      className="w-full px-4 py-3 rounded-xl border border-brand-green/20 focus:outline-none focus:border-brand-gold text-base sm:text-sm bg-brand-ivory/30"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                      Order Notes / Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      {...register('notes')}
                      placeholder="Nearby landmark, delivery timing preference, etc."
                      className="w-full px-4 py-3 rounded-xl border border-brand-green/20 focus:outline-none focus:border-brand-gold text-base sm:text-sm bg-brand-ivory/30"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-green/10 shadow-sm space-y-6">
                <h2 className="font-heading text-xl font-bold text-brand-green flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-brand-gold" />
                  2. Payment Method
                </h2>

                <div className="space-y-3">
                  {/* Option 1: Cash on Delivery */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPayment === 'cod'
                        ? 'border-brand-green bg-brand-cream/50'
                        : 'border-brand-green/20 bg-white hover:border-brand-gold'
                    }`}
                  >
                    <input
                      type="radio"
                      value="cod"
                      {...register('paymentMethod')}
                      className="mt-1 text-brand-green focus:ring-brand-gold"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-brand-green">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-brand-charcoal/70 mt-1">
                        Pay with cash when the package arrives at your doorstep anywhere in Pakistan.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Bank Transfer */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPayment === 'bank_transfer'
                        ? 'border-brand-green bg-brand-cream/50'
                        : 'border-brand-green/20 bg-white hover:border-brand-gold'
                    }`}
                  >
                    <input
                      type="radio"
                      value="bank_transfer"
                      {...register('paymentMethod')}
                      className="mt-1 text-brand-green focus:ring-brand-gold"
                    />
                    <div className="w-full">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-brand-green">
                          Direct Bank Transfer / Raast / EasyPaisa
                        </span>
                      </div>
                      <p className="text-xs text-brand-charcoal/70 mt-1">
                        Transfer directly to our verified business account. Bank details will be presented upon order placement.
                      </p>

                      {selectedPayment === 'bank_transfer' && (
                        <div className="mt-4 p-3.5 rounded-xl bg-white border border-brand-green/20 text-xs space-y-1.5 text-brand-charcoal">
                          <p className="font-semibold text-brand-green flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5" /> Account Details:
                          </p>
                          <p><strong>Bank:</strong> Bank Alfalah / Meezan Bank</p>
                          <p><strong>Title:</strong> Soghat-e-Chakwal Foods</p>
                          <p><strong>WhatsApp for receipt:</strong> 0300-8325693</p>
                          <p className="text-[11px] text-brand-terracotta pt-1">
                            * Please send the payment screenshot on WhatsApp with your Order Number.
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-green/10 shadow-sm space-y-6 sticky top-28">
                <h3 className="font-heading font-bold text-xl text-brand-green pb-3 border-b border-brand-green/10">
                  Your Order ({items.reduce((s, i) => s + i.quantity, 0)} items)
                </h3>

                {/* Items preview */}
                <div className="divide-y divide-brand-green/10 max-h-64 overflow-y-auto space-y-3 pr-1">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="pt-3 first:pt-0 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-10 bg-amber-100 rounded-sm flex items-center justify-center font-bold text-[8px] text-amber-900 border border-amber-300">
                          {item.variant.size}
                        </div>
                        <div>
                          <p className="font-semibold text-brand-charcoal">{item.product.name}</p>
                          <p className="text-brand-charcoal/60">
                            {item.variant.name} &times; {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-brand-charcoal">
                        {formatPrice(item.variant.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-3 border-t border-brand-green/10 text-xs text-brand-charcoal/80">
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
                  <div className="flex justify-between text-base font-bold text-brand-green pt-2 border-t border-brand-green/10">
                    <span>Total Amount</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-brand-green text-brand-cream py-4 rounded-2xl font-bold text-sm hover:bg-brand-green-light transition-all shadow-md active:scale-[0.99] disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Placing Order...
                      </>
                    ) : (
                      <>
                        Confirm &amp; Place Order <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppCheckout}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-2xl font-semibold text-sm hover:bg-[#20ba59] transition-all shadow-sm active:scale-[0.99]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Place via WhatsApp Instead
                  </button>
                </div>

                {/* Security badges */}
                <div className="pt-4 border-t border-brand-green/10 space-y-2 text-[11px] text-brand-charcoal/70">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-gold flex-shrink-0" />
                    <span>Safe &amp; reliable delivery right to your doorstep.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-gold flex-shrink-0" />
                    <span>Need help? WhatsApp 0300-8325693</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
