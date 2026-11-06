'use client';

// ============================================================
// Soghat-e-Chakwal — Official Parcel Shipping Label & Invoice
// 1. Parcel Shipping Label (For Courier Envelope / Flyer Pocket)
// 2. Full Itemized Customer Tax Invoice
// ============================================================

import React, { useRef, useState } from 'react';
import {
  Printer,
  X,
  ShieldCheck,
  Phone,
  MapPin,
  Truck,
  Package,
  FileText,
  AlertTriangle,
  QrCode,
  Tag,
} from 'lucide-react';
import { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/lib/config';

interface OrderInvoiceProps {
  order: Order;
  onClose: () => void;
  defaultMode?: 'label' | 'invoice';
}

export function OrderInvoice({ order, onClose, defaultMode = 'label' }: OrderInvoiceProps) {
  const [viewMode, setViewMode] = useState<'label' | 'invoice'>(defaultMode);
  const printableRef = useRef<HTMLDivElement>(null);

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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[96vh] flex flex-col overflow-hidden my-auto border border-stone-300">
        
        {/* Modal Action Header (Hidden during actual print) */}
        <div className="no-print bg-brand-green text-brand-cream px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex bg-black/25 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('label')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'label'
                    ? 'bg-brand-gold text-brand-charcoal shadow-sm'
                    : 'text-brand-cream/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                📦 Parcel Shipping Slip (Envelope Label)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('invoice')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'invoice'
                    ? 'bg-brand-gold text-brand-charcoal shadow-sm'
                    : 'text-brand-cream/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                🧾 Detailed Invoice &amp; Bill
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-brand-cream/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Content */}
        <div className="overflow-y-auto p-4 sm:p-8 flex-1 text-stone-800 bg-stone-50" id="printable-invoice" ref={printableRef}>
          
          {/* ========================================================
              VIEW 1: PARCEL SHIPPING LABEL (COURIER FLYER / ENVELOPE SLIP)
              Designed specifically to stick on the parcel / flyer pocket
              ======================================================== */}
          {viewMode === 'label' && (
            <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border-2 border-stone-800 shadow-sm space-y-5">
              
              {/* Slip Top Header */}
              <div className="flex justify-between items-start border-b-2 border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-green text-brand-gold flex items-center justify-center font-heading font-black text-2xl shadow-xs border border-brand-gold/40">
                    S
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-xl text-brand-green tracking-tight uppercase">
                      Soghat-e-Chakwal
                    </h2>
                    <p className="text-[11px] font-serif font-bold text-brand-gold">
                      سوغات چکوال &bull; 100% Pure Desi Mustard Oil
                    </p>
                    <p className="text-[10px] text-stone-500 font-mono">
                      Parcel Dispatch &amp; Courier Flyer Slip
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-stone-400">Tracking / Order ID</p>
                  <p className="font-mono text-xl font-black text-stone-900 tracking-wider">
                    {order.orderNumber}
                  </p>
                  <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                    Date: {formattedDate}
                  </p>
                </div>
              </div>

              {/* 1. HUGE BOLD CONSIGNEE (SHIP TO) BOX */}
              <div className="border-3 border-stone-900 rounded-2xl p-4 sm:p-5 bg-amber-50/40 space-y-2">
                <div className="flex justify-between items-center border-b border-stone-300 pb-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-brand-green flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-brand-gold" />
                    DELIVER TO (CUSTOMER / CONSIGNEE):
                  </span>
                  <span className="bg-stone-900 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded uppercase">
                    DESTINATION: {order.customer.city}
                  </span>
                </div>

                {/* Big Customer Name */}
                <p className="text-xl sm:text-2xl font-black text-stone-950 font-heading">
                  {order.customer.fullName}
                </p>

                {/* Huge Phone Numbers */}
                <div className="flex flex-wrap items-center gap-4 py-1">
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-300 shadow-2xs">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-stone-500 font-bold">Call:</span>
                    <span className="font-mono text-base sm:text-lg font-black text-stone-900 tracking-wide select-all">
                      {order.customer.phone}
                    </span>
                  </div>
                  {order.customer.whatsapp && (
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-300 shadow-2xs">
                      <span className="text-xs text-emerald-600 font-bold">WhatsApp:</span>
                      <span className="font-mono text-sm sm:text-base font-black text-stone-900 select-all">
                        {order.customer.whatsapp}
                      </span>
                    </div>
                  )}
                </div>

                {/* Complete Address */}
                <div className="bg-white p-3 rounded-xl border border-stone-300 mt-2">
                  <p className="text-[10px] uppercase font-bold text-stone-400">Complete Delivery Address:</p>
                  <p className="text-sm sm:text-base font-bold text-stone-900 leading-snug mt-0.5">
                    {order.customer.address}
                  </p>
                  <p className="text-xs font-black text-brand-green uppercase mt-1">
                    {order.customer.city}, {order.customer.province} {order.customer.postalCode ? ` - ${order.customer.postalCode}` : ''}
                  </p>
                </div>

                {order.notes && (
                  <div className="bg-amber-100/70 p-2 rounded-lg border border-amber-300 text-xs text-amber-950 font-medium">
                    <span className="font-bold">Rider Landmark Note:</span> {order.notes}
                  </div>
                )}
              </div>

              {/* 2. HUGE CASH TO COLLECT (COD) BOX & PARCEL SPECS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cash on Delivery Box */}
                <div className="border-3 border-emerald-700 bg-emerald-50/70 rounded-2xl p-4 text-center space-y-1">
                  <p className="text-[11px] uppercase font-black text-emerald-900 tracking-wider">
                    {order.paymentMethod === 'cod' ? 'CASH ON DELIVERY (COD)' : 'PREPAID ORDER'}
                  </p>
                  <p className="text-xs text-stone-600 font-semibold">AMOUNT TO COLLECT FROM CUSTOMER:</p>
                  <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-950">
                    {order.paymentMethod === 'cod' ? formatPrice(order.total) : 'Rs. 0 (ALREADY PAID)'}
                  </p>
                  <p className="text-[10px] text-emerald-800 font-bold">
                    {order.paymentMethod === 'cod' ? 'Handover parcel only after collecting cash' : 'Direct bank transfer verified'}
                  </p>
                </div>

                {/* Parcel Contents */}
                <div className="border border-stone-300 bg-stone-50 rounded-2xl p-4 space-y-1.5 text-xs">
                  <p className="text-[11px] uppercase font-bold text-stone-500">Parcel Package Contents:</p>
                  <div className="space-y-1 font-bold text-stone-900">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="flex justify-between border-b border-stone-200 pb-0.5">
                        <span>&bull; {item.product.name} ({item.variant.name})</span>
                        <span className="font-mono">Qty: {item.quantity}</span>
                      </p>
                    ))}
                  </div>
                  <div className="pt-1 flex justify-between text-[11px] text-stone-600 font-medium">
                    <span>Shipping: {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
                    <span className="font-bold">Total: {formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* 3. FRAGILE WARNING & SHIPPER RETURN ADDRESS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t-2 border-stone-300">
                {/* Fragile Liquid Warning */}
                <div className="flex items-center gap-3 bg-red-50 border-2 border-dashed border-red-400 p-3 rounded-xl text-red-900">
                  <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <p className="font-black uppercase tracking-wider text-red-700">FRAGILE &bull; LIQUID PRODUCT</p>
                    <p className="font-semibold text-stone-700 mt-0.5">Handle with care &bull; Do not drop or place heavy weights on package</p>
                  </div>
                </div>

                {/* Shipper Return Address */}
                <div className="bg-stone-100 p-3 rounded-xl border border-stone-300 text-xs">
                  <p className="text-[10px] font-bold uppercase text-stone-500">If Undelivered, Return To (Sender):</p>
                  <p className="font-bold text-brand-green">Soghat-e-Chakwal Main Facility</p>
                  <p className="text-stone-600 text-[11px]">Chakwal, Punjab, Pakistan</p>
                  <p className="text-stone-800 font-mono text-[11px] font-bold mt-0.5">Helpline: 0300-8325693</p>
                </div>
              </div>

              {/* Instructions Bar */}
              <div className="text-center pt-1 text-[10px] text-stone-400 font-mono">
                Printed via Soghat-e-Chakwal Official Store System &bull; Please fold &amp; place into courier plastic flyer pocket.
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 2: FULL TAX INVOICE & BILL
              ======================================================== */}
          {viewMode === 'invoice' && (
            <div className="max-w-2xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-stone-300 shadow-sm space-y-6">
              {/* Header */}
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
                    Customer Tax Invoice &amp; Bill
                  </span>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Invoice Number
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
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Bank Transfer'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-brand-ivory/60 border border-brand-green/10">
                <div>
                  <p className="text-[11px] font-bold text-brand-green uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-brand-gold" /> Bill &amp; Ship To
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
                    <span className="font-semibold">Phone:</span>{' '}
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
                </div>
              </div>

              {/* Order Items Table */}
              <div className="border border-stone-200 rounded-xl overflow-hidden">
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

              {/* Pricing Breakdown */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-stone-200 pt-4">
                <div className="sm:max-w-xs w-full p-4 rounded-xl border border-stone-200 bg-stone-50 text-xs space-y-1">
                  <p className="font-bold text-stone-800 uppercase text-[11px]">
                    Payment Mode: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                  </p>
                  <p className="text-stone-500 text-[11px]">
                    Amount to collect upon delivery: <strong className="text-brand-green">{formatPrice(order.total)}</strong>
                  </p>
                </div>

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
                </div>
              </div>

              {/* Signature */}
              <div className="mt-8 pt-6 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
                <p className="font-serif italic text-brand-gold text-sm font-semibold">
                  &ldquo;Wohi Purana Desi Zaiqa, Ab Har Ghar Mein!&rdquo;
                </p>
                <div className="text-right border-t border-stone-400 pt-1 w-36 text-center text-[11px] font-mono font-bold text-stone-700">
                  Authorized Sign
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="no-print bg-stone-100 border-t border-stone-200 px-6 py-3 flex flex-wrap justify-between items-center gap-3 flex-shrink-0">
          <p className="text-xs text-stone-600">
            {viewMode === 'label'
              ? '📦 Print this Parcel Slip and attach to the courier flyer or box envelope pocket.'
              : '🧾 Detailed Invoice for customer accounting & records.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-brand-green text-brand-cream hover:bg-brand-green-light px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
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

      {/* Print CSS */}
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
            padding: 8mm !important;
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
