'use client';

// ============================================================
// Soghat-e-Chakwal — Official Order Invoice & Packing Slip
// Standard A4 / Thermal Printable with PDF export readiness
// ============================================================

import React, { useRef } from 'react';
import { Printer, X, Download, ShieldCheck, Phone, MapPin, Truck, CheckCircle2 } from 'lucide-react';
import { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/lib/config';

interface OrderInvoiceProps {
  order: Order;
  onClose: () => void;
}

export function OrderInvoice({ order, onClose }: OrderInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[96vh] flex flex-col overflow-hidden my-auto border border-stone-300">
        
        {/* Modal Action Header (Hidden during actual print) */}
        <div className="no-print bg-brand-green text-brand-cream px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-brand-gold" />
            <h3 className="font-heading font-bold text-base sm:text-lg">
              Official Tax Invoice / Packing Slip
            </h3>
            <span className="text-xs bg-brand-gold/20 text-brand-gold px-2.5 py-0.5 rounded-full font-mono font-bold">
              #{order.orderNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-brand-cream/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Invoice Content */}
        <div className="overflow-y-auto p-6 sm:p-10 flex-1 text-stone-800 bg-white" id="printable-invoice" ref={invoiceRef}>
          {/* Invoice Header */}
          <div className="border-b-2 border-brand-green pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-green text-brand-gold flex items-center justify-center font-heading font-black text-xl shadow-xs">
                  S
                </div>
                <div>
                  <h1 className="font-heading font-black text-2xl text-brand-green tracking-tight">
                    Soghat-e-Chakwal
                  </h1>
                  <p className="text-[11px] font-serif text-brand-gold font-bold">
                    سوغات چکوال &bull; From Farm to Fork
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-600 mt-2 font-medium">
                100% Pure Mustard Oil &amp; Traditional Desi Specialties
              </p>
              <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-stone-400" />
                Chakwal, Punjab, Pakistan
              </p>
              <p className="text-[11px] text-stone-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-stone-400" />
                Helpline &amp; WhatsApp: +92 300 8325693
              </p>
            </div>

            <div className="sm:text-right bg-stone-50 sm:bg-transparent p-4 sm:p-0 rounded-xl w-full sm:w-auto">
              <span className="inline-block bg-brand-green text-brand-cream text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md mb-2">
                Customer Invoice &amp; Dispatch Slip
              </span>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Invoice / Order Number
              </p>
              <p className="font-mono text-lg font-black text-brand-green tracking-wider">
                {order.orderNumber}
              </p>
              <p className="text-xs text-stone-600 mt-1">
                <span className="font-semibold">Date:</span> {formattedDate} ({formattedTime})
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border border-stone-200">
                <span>Payment:</span>
                <span className="uppercase text-brand-green">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Direct Bank Transfer'}
                </span>
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded ${
                  order.paymentStatus === 'received' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer / Shipping Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 rounded-2xl bg-brand-ivory/60 border border-brand-green/10">
            <div>
              <p className="text-[11px] font-bold text-brand-green uppercase tracking-wider mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-brand-gold" /> Deliver To (Consignee)
              </p>
              <p className="font-bold text-sm text-stone-900">{order.customer.fullName}</p>
              <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                {order.customer.address}
              </p>
              <p className="text-xs font-semibold text-stone-800 mt-0.5">
                {order.customer.city}, {order.customer.province} {order.customer.postalCode ? `(${order.customer.postalCode})` : ''}
              </p>
            </div>

            <div className="sm:border-l sm:border-stone-200 sm:pl-6">
              <p className="text-[11px] font-bold text-brand-green uppercase tracking-wider mb-1">
                Customer Contact Details
              </p>
              <p className="text-xs text-stone-700">
                <span className="font-semibold">Primary Phone:</span>{' '}
                <span className="font-mono font-bold text-stone-900">{order.customer.phone}</span>
              </p>
              {order.customer.whatsapp && (
                <p className="text-xs text-stone-700 mt-1">
                  <span className="font-semibold">WhatsApp:</span>{' '}
                  <span className="font-mono text-emerald-700 font-bold">{order.customer.whatsapp}</span>
                </p>
              )}
              {order.customer.email && (
                <p className="text-xs text-stone-700 mt-1">
                  <span className="font-semibold">Email:</span> {order.customer.email}
                </p>
              )}
              {order.notes && (
                <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200/60 text-[11px] text-amber-900">
                  <span className="font-bold">Delivery Instructions:</span> {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Order Items Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-green text-brand-cream uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Variant</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {order.items.map((item, idx) => {
                  const lineTotal = item.variant.price * item.quantity;
                  return (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="py-3 px-3 text-center font-mono text-stone-500 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-stone-900">{item.product.name}</p>
                        {item.product.nameUrdu && (
                          <p className="font-serif text-[11px] text-brand-gold mt-0.5">
                            {item.product.nameUrdu}
                          </p>
                        )}
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                          SKU: {item.variant.sku || 'SEC-OIL'}
                        </p>
                      </td>
                      <td className="py-3 px-3 font-medium text-stone-700">
                        {item.variant.name}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-stone-800">
                        {formatPrice(item.variant.price)}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-stone-900">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-brand-green">
                        {formatPrice(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pricing & Courier Collection Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-stone-200 pt-4">
            {/* Courier Dispatch Instructions */}
            <div className="sm:max-w-xs w-full p-4 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/60 text-xs space-y-2">
              <p className="font-bold text-stone-800 flex items-center gap-1.5 uppercase text-[11px]">
                <ShieldCheck className="w-4 h-4 text-brand-green" /> Courier / Rider Instructions:
              </p>
              <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                <p className="text-[10px] text-stone-500 uppercase font-bold">Collect Cash on Delivery</p>
                <p className="text-lg font-mono font-black text-brand-green">
                  {order.paymentMethod === 'cod' ? formatPrice(order.total) : 'Rs. 0 (PREPAID)'}
                </p>
              </div>
              <p className="text-[10px] text-stone-500">
                &bull; Please inspect seal before delivery.<br />
                &bull; For courier return/support: 0300-8325693
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery &amp; Handling:</span>
                <span className="font-mono font-semibold">
                  {order.shipping === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE DELIVERY</span>
                  ) : (
                    formatPrice(order.shipping)
                  )}
                </span>
              </div>
              <div className="border-t-2 border-brand-green pt-2 flex justify-between items-center text-stone-900">
                <span className="font-heading font-black text-sm uppercase">Total Payable:</span>
                <span className="font-mono font-black text-xl text-brand-green">
                  {formatPrice(order.total)}
                </span>
              </div>
              <p className="text-[10px] text-stone-500 text-right pt-1 italic">
                All taxes &amp; packing included
              </p>
            </div>
          </div>

          {/* Invoice Sign-off & Quality Seal */}
          <div className="mt-8 pt-6 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-500">
            <div className="text-center sm:text-left">
              <p className="font-serif italic text-brand-gold text-sm font-semibold">
                &ldquo;Wohi Purana Desi Zaiqa, Ab Har Ghar Mein!&rdquo;
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Thank you for choosing Soghat-e-Chakwal. Traditional purity from our farm to your kitchen table.
              </p>
            </div>
            <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
              <div className="inline-block border-b border-stone-400 pb-1 w-36 text-center text-[11px] font-mono font-bold text-stone-700">
                Verified &amp; Dispatched
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden on print) */}
        <div className="no-print bg-stone-100 border-t border-stone-200 px-6 py-3 flex justify-between items-center flex-shrink-0">
          <p className="text-xs text-stone-500">
            Tip: Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-mono">Ctrl + P</kbd> or click Print to save as PDF or print on any printer.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-brand-green text-brand-cream hover:bg-brand-green-light px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Invoice
            </button>
            <button
              onClick={onClose}
              className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>

      </div>

      {/* Print-specific CSS injected cleanly */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: auto;
            margin: 0;
            padding: 20mm !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            z-index: 99999;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
