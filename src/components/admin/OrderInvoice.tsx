'use client';

// ============================================================
// Soghat-e-Chakwal — Official Parcel Shipping Label & Invoice
// 1. Parcel Shipping Label (For Courier Envelope / Flyer Pocket)
// 2. Full Itemized Customer Tax Invoice
// 3. Custom Rate / WhatsApp Deal Editor (Editable Pricing in Bill)
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
  Download,
  Check,
  Copy,
  FileDown,
  Edit3,
  Save,
  Sparkles,
} from 'lucide-react';
import { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/lib/config';
import { updateStoredOrder } from '@/lib/orders-db';

interface OrderInvoiceProps {
  order: Order;
  onClose: () => void;
  defaultMode?: 'label' | 'invoice';
  initialEditMode?: boolean;
  onUpdateOrder?: (updatedOrder: Order) => void;
}

export function OrderInvoice({
  order,
  onClose,
  defaultMode = 'label',
  initialEditMode = false,
  onUpdateOrder,
}: OrderInvoiceProps) {
  const [viewMode, setViewMode] = useState<'label' | 'invoice'>(defaultMode);
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [isCustomizing, setIsCustomizing] = useState<boolean>(initialEditMode);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  // Edit draft states for live customization
  const [editablePrices, setEditablePrices] = useState<number[]>(
    order.items.map((i) => i.variant.price)
  );
  const [editableQtys, setEditableQtys] = useState<number[]>(
    order.items.map((i) => i.quantity)
  );
  const [editableShippingMode, setEditableShippingMode] = useState<'free' | 'standard' | 'custom'>(
    order.shipping === 0 ? 'free' : (order.shipping === 250 ? 'standard' : 'custom')
  );
  const [editableCustomShipping, setEditableCustomShipping] = useState<number>(
    order.shipping
  );
  const [editableDiscount, setEditableDiscount] = useState<number>(
    order.discount || 0
  );
  const [editableNotes, setEditableNotes] = useState<string>(
    order.notes || ''
  );

  // Real-time calculation while admin is typing custom price
  const draftSubtotal = editablePrices.reduce(
    (sum, price, idx) => sum + (price * (editableQtys[idx] || 1)),
    0
  );
  const draftDiscount = Math.max(0, editableDiscount);
  const draftTotalLiters = currentOrder.items.reduce((sum, item, idx) => {
    const is1L = item.variant.size?.toLowerCase().includes('1l') || item.variant.name.includes('1');
    const litersPerBottle = is1L ? 1 : 0.5;
    return sum + litersPerBottle * (editableQtys[idx] || 1);
  }, 0);

  const draftShipping =
    editableShippingMode === 'free'
      ? 0
      : editableShippingMode === 'standard'
      ? draftTotalLiters >= 3 ? 0 : 250
      : Math.max(0, editableCustomShipping);

  const draftTotal = Math.max(0, draftSubtotal - draftDiscount + draftShipping);

  const handleSaveCustomRates = () => {
    const updatedItems = currentOrder.items.map((item, idx) => ({
      ...item,
      quantity: Math.max(1, editableQtys[idx] || 1),
      variant: {
        ...item.variant,
        price: Math.max(0, editablePrices[idx] ?? item.variant.price),
      },
    }));

    const updatedOrder: Order = {
      ...currentOrder,
      items: updatedItems,
      subtotal: draftSubtotal,
      shipping: draftShipping,
      discount: draftDiscount > 0 ? draftDiscount : undefined,
      total: draftTotal,
      notes: editableNotes.trim() || undefined,
      source: 'whatsapp',
      updatedAt: new Date().toISOString(),
    };

    setCurrentOrder(updatedOrder);
    updateStoredOrder(updatedOrder);
    if (onUpdateOrder) {
      onUpdateOrder(updatedOrder);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const formattedDate = new Date(currentOrder.createdAt).toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(currentOrder.createdAt).toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCourierText = () => {
    const itemsList = currentOrder.items
      .map((i) => `${i.product.name} (${i.variant.name}) x ${i.quantity} @ Rs. ${i.variant.price}`)
      .join(', ');
    const text = `=============================
📦 SOGHAT-E-CHAKWAL PARCEL SLIP
=============================
Order ID: ${currentOrder.orderNumber}
Date: ${formattedDate}

DELIVER TO (CUSTOMER):
Name: ${currentOrder.customer.fullName}
Phone: ${currentOrder.customer.phone}
${currentOrder.customer.whatsapp ? `WhatsApp: ${currentOrder.customer.whatsapp}\n` : ''}Address: ${currentOrder.customer.address}
City: ${currentOrder.customer.city.toUpperCase()}, ${currentOrder.customer.province}
${currentOrder.notes ? `Landmark Note: ${currentOrder.notes}\n` : ''}
PACKAGE CONTENTS:
${itemsList}

PAYMENT (COD):
Amount to Collect: ${currentOrder.paymentMethod === 'cod' ? `Rs. ${currentOrder.total.toLocaleString()} (Cash on Delivery)` : 'Rs. 0 (Already Paid)'}

RETURN TO (SENDER):
Soghat-e-Chakwal
Shop MC33, Street 1, Ghauri Town, Phase 7, Islamabad, Pakistan
Helpline / WhatsApp: 0300-8325693
=============================`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  const handleDownloadTextSlip = () => {
    const itemsList = currentOrder.items
      .map((i) => `• ${i.product.name} (${i.variant.name}) x ${i.quantity} @ Rs. ${i.variant.price}`)
      .join('\n');
    const text = `===========================================
📦 SOGHAT-E-CHAKWAL — PARCEL DISPATCH SLIP
===========================================
Order ID: ${currentOrder.orderNumber}
Date: ${formattedDate} (${formattedTime})

CONSIGNEE / DELIVER TO:
-------------------------------------------
Name: ${currentOrder.customer.fullName}
Phone: ${currentOrder.customer.phone}
${currentOrder.customer.whatsapp ? `WhatsApp: ${currentOrder.customer.whatsapp}\n` : ''}Address: ${currentOrder.customer.address}
City: ${currentOrder.customer.city.toUpperCase()} (${currentOrder.customer.province})
${currentOrder.notes ? `Landmark Note: ${currentOrder.notes}\n` : ''}
PARCEL CONTENTS:
-------------------------------------------
${itemsList}
Total Amount: Rs. ${currentOrder.total}

COD CASH TO COLLECT:
-------------------------------------------
Amount: ${currentOrder.paymentMethod === 'cod' ? `Rs. ${currentOrder.total.toLocaleString()} (CASH ON DELIVERY)` : 'Rs. 0 (PREPAID)'}

SENDER (RETURN ADDRESS):
-------------------------------------------
Soghat-e-Chakwal
Shop MC33, Street 1, Ghauri Town, Phase 7, Islamabad, Pakistan
Helpline / WhatsApp: 0300-8325693
===========================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Soghat-Parcel-${currentOrder.orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleDownloadFile = () => {
    if (!printableRef.current) return;
    const isSlip = viewMode === 'label';
    const filename = isSlip
      ? `Soghat-Chakwal-Parcel-Slip-${currentOrder.orderNumber}.html`
      : `Soghat-Chakwal-Invoice-${currentOrder.orderNumber}.html`;

    const slipInnerHtml = printableRef.current.innerHTML;

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSlip ? 'Parcel Shipping Slip' : 'Customer Tax Invoice'} - ${currentOrder.orderNumber}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; padding: 0 !important; }
      #slip-content { box-shadow: none !important; border: 2px solid #000 !important; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; padding: 16px; margin: 0; }
  </style>
</head>
<body>
  <div class="no-print max-w-2xl mx-auto mb-4 bg-emerald-900 text-white p-3.5 rounded-2xl flex flex-wrap justify-between items-center gap-3 shadow-lg">
    <div>
      <p class="text-xs uppercase font-bold tracking-wider text-emerald-300">📦 Soghat-e-Chakwal Dispatch Document</p>
      <p class="text-xs text-white/80">Order: ${currentOrder.orderNumber} &bull; Consignee: ${currentOrder.customer.fullName} &bull; Net COD: Rs. ${currentOrder.total}</p>
    </div>
    <button onclick="window.print()" style="background:#D4AF37; color:#1c1917; font-weight:900; padding:8px 18px; border-radius:10px; border:none; cursor:pointer; font-size:12px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">
      🖨️ Print Slip / Save PDF
    </button>
  </div>
  <div id="slip-content" class="max-w-2xl mx-auto">
    ${slipInnerHtml}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[96vh] flex flex-col overflow-hidden my-auto border border-stone-300">
        
        {/* Modal Action Header (Hidden during actual print) */}
        <div className="no-print bg-brand-green text-brand-cream px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2">
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
                📦 Parcel Slip
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
                🧾 Detailed Invoice
              </button>
            </div>

            {/* Custom Price / Edit Bill Toggle Button */}
            <button
              type="button"
              onClick={() => setIsCustomizing((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                isCustomizing
                  ? 'bg-amber-400 text-stone-950 shadow-md ring-2 ring-white/60'
                  : 'bg-white/15 hover:bg-white/25 text-amber-300 border border-amber-300/40'
              }`}
              title="Click to set custom price (e.g. 650/L) or change shipping/discount in the bill"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>✏️ Custom Price (کسٹم ریٹ)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <button
              onClick={handleCopyCourierText}
              className="flex items-center gap-1.5 bg-brand-gold/20 hover:bg-brand-gold text-brand-cream hover:text-brand-charcoal border border-brand-gold/40 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
              title="Copy customer name, phone, address & COD amount for courier booking"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Courier
                </>
              )}
            </button>
            <button
              onClick={handleDownloadTextSlip}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all border border-white/20 active:scale-95"
              title="Download text slip that opens on any phone"
            >
              <FileDown className="w-4 h-4" />
              .txt
            </button>
            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              title="Download standalone HTML slip file to device"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  Done!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  HTML
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Print / PDF
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

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto p-4 sm:p-8 flex-1 text-stone-800 bg-stone-50" id="printable-invoice" ref={printableRef}>
          
          {/* ════════════════════════════════════════════════════════
              CUSTOM PRICE & WHATSAPP DEAL EDITOR BOX (Hidden on Print)
              Allows typing custom price (e.g. 650/L), custom delivery, and discounts directly on bill
              ════════════════════════════════════════════════════════ */}
          <div className="no-print max-w-2xl mx-auto mb-6">
            {!isCustomizing ? (
              <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-dashed border-amber-300 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-lg shadow-xs">
                    🏷️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">
                      Need custom rate (e.g. Rs. 650/L) or Free Delivery for WhatsApp Customer?
                    </p>
                    <p className="text-[11px] text-stone-600 font-serif">
                      اگر گاہک سے واٹس ایپ پر 650 فی لیٹر ریٹ طے ہوا ہے تو یہاں سے بل میں کسٹم ریٹ سیٹ کریں۔
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomizing(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-4 py-2 rounded-xl text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1.5 ml-auto"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  ✏️ Edit Custom Price / 650
                </button>
              </div>
            ) : (
              <div className="bg-white border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 animate-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center border-b border-stone-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-heading font-black text-sm text-stone-900">
                        WhatsApp Custom Price &amp; Deal Editor (کسٹم ریٹ)
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        سیٹ کریں کہ کسٹمر کو واٹس ایپ پر کس ریٹ (مثلاً 650 فی لیٹر) پر مال دیا ہے۔
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCustomizing(false)}
                    className="text-stone-400 hover:text-stone-600 p-1"
                    title="Close editor"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Item Rates Row */}
                <div className="space-y-3">
                  {currentOrder.items.map((item, idx) => {
                    const is1L = item.variant.size?.toLowerCase().includes('1l') || item.variant.name.includes('1');
                    return (
                      <div key={idx} className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-stone-900">{item.product.name} ({item.variant.name})</span>
                          <span className="font-mono text-stone-500 text-[11px]">Standard: {formatPrice(is1L ? 700 : 350)}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
                          {/* Custom Rate input */}
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-stone-600 uppercase block">
                              Custom Unit Price / Rate (PKR)
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-stone-400 font-bold text-xs">Rs.</span>
                              <input
                                type="number"
                                min={0}
                                value={editablePrices[idx] ?? item.variant.price}
                                onChange={(e) => {
                                  const next = [...editablePrices];
                                  next[idx] = Number(e.target.value) || 0;
                                  setEditablePrices(next);
                                }}
                                className="w-full pl-9 pr-3 py-1.5 border-2 border-emerald-500 rounded-xl font-mono font-bold text-sm text-emerald-950 bg-white"
                                placeholder="e.g. 650"
                              />
                            </div>

                            {/* 1-Click Presets */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className="text-[10px] text-stone-400 font-medium self-center">Presets:</span>
                              {is1L ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...editablePrices];
                                      next[idx] = 650;
                                      setEditablePrices(next);
                                    }}
                                    className={`px-2.5 py-0.5 rounded text-[10px] font-black border transition-all ${
                                      editablePrices[idx] === 650
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                        : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                                    }`}
                                  >
                                    🔥 Rs. 650 (WhatsApp Deal)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...editablePrices];
                                      next[idx] = 600;
                                      setEditablePrices(next);
                                    }}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                      editablePrices[idx] === 600
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                        : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                                    }`}
                                  >
                                    Rs. 600 (Special)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...editablePrices];
                                      next[idx] = 700;
                                      setEditablePrices(next);
                                    }}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                      editablePrices[idx] === 700
                                        ? 'bg-stone-800 text-white border-stone-800 shadow-xs'
                                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                                    }`}
                                  >
                                    Rs. 700 (Standard)
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...editablePrices];
                                      next[idx] = 320;
                                      setEditablePrices(next);
                                    }}
                                    className={`px-2.5 py-0.5 rounded text-[10px] font-black border transition-all ${
                                      editablePrices[idx] === 320
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                        : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                                    }`}
                                  >
                                    🔥 Rs. 320 (WhatsApp Deal)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...editablePrices];
                                      next[idx] = 300;
                                      setEditablePrices(next);
                                    }}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                      editablePrices[idx] === 300
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                        : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                                    }`}
                                  >
                                    Rs. 300 (Special)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...editablePrices];
                                      next[idx] = 350;
                                      setEditablePrices(next);
                                    }}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                      editablePrices[idx] === 350
                                        ? 'bg-stone-800 text-white border-stone-800 shadow-xs'
                                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                                    }`}
                                  >
                                    Rs. 350 (Standard)
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Quantity & Item Subtotal */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-600 uppercase block">
                              Quantity
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                value={editableQtys[idx] ?? item.quantity}
                                onChange={(e) => {
                                  const next = [...editableQtys];
                                  next[idx] = Math.max(1, Number(e.target.value) || 1);
                                  setEditableQtys(next);
                                }}
                                className="w-20 px-2 py-1.5 border rounded-xl font-mono font-bold text-xs text-center bg-white"
                              />
                              <span className="text-xs font-mono font-bold text-stone-800">
                                = {formatPrice((editablePrices[idx] ?? item.variant.price) * (editableQtys[idx] ?? item.quantity))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Shipping & Discount controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-600 uppercase block flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-brand-green" /> Delivery / Shipping Fee
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => setEditableShippingMode('free')}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-black border transition-all ${
                          editableShippingMode === 'free'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-500'
                        }`}
                      >
                        🎉 FREE
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditableShippingMode('standard')}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                          editableShippingMode === 'standard'
                            ? 'bg-brand-green text-white border-brand-green shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        Standard
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditableShippingMode('custom')}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                          editableShippingMode === 'custom'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                    {editableShippingMode === 'custom' && (
                      <input
                        type="number"
                        min={0}
                        value={editableCustomShipping}
                        onChange={(e) => setEditableCustomShipping(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1 border rounded-lg text-xs font-bold font-mono"
                        placeholder="Shipping fee (PKR)"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-600 uppercase block flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-red-600" /> Special Deal Discount (PKR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-stone-400 font-bold text-xs">Rs.</span>
                      <input
                        type="number"
                        min={0}
                        value={editableDiscount}
                        onChange={(e) => setEditableDiscount(Number(e.target.value) || 0)}
                        className="w-full pl-8 pr-2 py-1.5 border rounded-xl font-mono font-bold text-xs text-red-600"
                        placeholder="e.g. 50"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500">
                      Direct deduction from bill total.
                    </p>
                  </div>
                </div>

                {/* Live Total & Save Button Bar */}
                <div className="bg-emerald-950 text-emerald-100 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
                  <div className="space-y-0.5 text-xs">
                    <p className="text-emerald-300 text-[11px]">
                      Subtotal: <strong className="text-white">{formatPrice(draftSubtotal)}</strong> &bull;{' '}
                      Shipping: <strong className="text-white">{draftShipping === 0 ? 'FREE' : formatPrice(draftShipping)}</strong>{' '}
                      {draftDiscount > 0 ? <>&bull; Discount: <strong className="text-amber-300">-{formatPrice(draftDiscount)}</strong></> : null}
                    </p>
                    <p className="text-white font-black text-sm">
                      Updated Net Total: <span className="font-mono text-base text-brand-gold">{formatPrice(draftTotal)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveCustomRates}
                      className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-black px-4 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      💾 Save &amp; Apply to Bill
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomizing(false)}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-xl font-semibold"
                    >
                      Done
                    </button>
                  </div>
                </div>

                {saveSuccess && (
                  <div className="bg-emerald-100 border border-emerald-400 text-emerald-900 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>✅ Custom price applied! Bill updated to {formatPrice(currentOrder.total)}.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════
              VIEW 1: PARCEL SHIPPING LABEL (COURIER FLYER / ENVELOPE SLIP)
              Designed specifically to stick on the parcel / flyer pocket
              ════════════════════════════════════════════════════════ */}
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
                    {currentOrder.orderNumber}
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
                    DESTINATION: {currentOrder.customer.city}
                  </span>
                </div>

                {/* Big Customer Name */}
                <p className="text-xl sm:text-2xl font-black text-stone-950 font-heading">
                  {currentOrder.customer.fullName}
                </p>

                {/* Phone Numbers */}
                <div className="flex flex-wrap items-center gap-4 py-1">
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-300 shadow-2xs">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-stone-500 font-bold">Call:</span>
                    <span className="font-mono text-base sm:text-lg font-black text-stone-900 tracking-wide select-all">
                      {currentOrder.customer.phone}
                    </span>
                  </div>
                  {currentOrder.customer.whatsapp && (
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-300 shadow-2xs">
                      <span className="text-xs text-emerald-600 font-bold">WhatsApp:</span>
                      <span className="font-mono text-sm sm:text-base font-black text-stone-900 select-all">
                        {currentOrder.customer.whatsapp}
                      </span>
                    </div>
                  )}
                </div>

                {/* Complete Address */}
                <div className="bg-white p-3 rounded-xl border border-stone-300 mt-2">
                  <p className="text-[10px] uppercase font-bold text-stone-400">Complete Delivery Address:</p>
                  <p className="text-sm sm:text-base font-bold text-stone-900 leading-snug mt-0.5">
                    {currentOrder.customer.address}
                  </p>
                  <p className="text-xs font-black text-brand-green uppercase mt-1">
                    {currentOrder.customer.city}, {currentOrder.customer.province} {currentOrder.customer.postalCode ? ` - ${currentOrder.customer.postalCode}` : ''}
                  </p>
                </div>

                {currentOrder.notes && (
                  <div className="bg-amber-100/70 p-2 rounded-lg border border-amber-300 text-xs text-amber-950 font-medium">
                    <span className="font-bold">Rider Landmark Note:</span> {currentOrder.notes}
                  </div>
                )}
              </div>

              {/* 2. HUGE CASH TO COLLECT (COD) BOX & PARCEL SPECS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cash on Delivery Box */}
                <div className="border-3 border-emerald-700 bg-emerald-50/70 rounded-2xl p-4 text-center space-y-1">
                  <p className="text-[11px] uppercase font-black text-emerald-900 tracking-wider">
                    {currentOrder.paymentMethod === 'cod' ? 'CASH ON DELIVERY (COD)' : 'PREPAID ORDER'}
                  </p>
                  <p className="text-xs text-stone-600 font-semibold">AMOUNT TO COLLECT FROM CUSTOMER:</p>
                  <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-950">
                    {currentOrder.paymentMethod === 'cod' ? formatPrice(currentOrder.total) : 'Rs. 0 (ALREADY PAID)'}
                  </p>
                  <p className="text-[10px] text-emerald-800 font-bold">
                    {currentOrder.paymentMethod === 'cod' ? 'Handover parcel only after collecting cash' : 'Direct bank transfer verified'}
                  </p>
                </div>

                {/* Parcel Contents */}
                <div className="border border-stone-300 bg-stone-50 rounded-2xl p-4 space-y-1.5 text-xs">
                  <p className="text-[11px] uppercase font-bold text-stone-500">Parcel Package Contents:</p>
                  <div className="space-y-1 font-bold text-stone-900">
                    {currentOrder.items.map((item, idx) => (
                      <p key={idx} className="flex justify-between border-b border-stone-200 pb-0.5">
                        <span>
                          &bull; {item.product.name} ({item.variant.name})
                          <span className="ml-1 text-[11px] font-mono text-emerald-700 font-bold">
                            @{formatPrice(item.variant.price)}
                          </span>
                        </span>
                        <span className="font-mono">Qty: {item.quantity}</span>
                      </p>
                    ))}
                  </div>
                  <div className="pt-1 flex flex-wrap justify-between text-[11px] text-stone-600 font-medium gap-x-2">
                    <span>Shipping: {currentOrder.shipping === 0 ? 'FREE' : formatPrice(currentOrder.shipping)}</span>
                    {currentOrder.discount && currentOrder.discount > 0 ? (
                      <span className="text-red-600 font-bold">Discount: -{formatPrice(currentOrder.discount)}</span>
                    ) : null}
                    <span className="font-bold text-stone-900">Total: {formatPrice(currentOrder.total)}</span>
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
                  <p className="font-bold text-brand-green">Soghat-e-Chakwal</p>
                  <p className="text-stone-700 font-medium text-[11px] leading-snug mt-0.5">
                    Shop MC33, Street 1, Ghauri Town, Phase 7, Islamabad, Pakistan
                  </p>
                  <p className="text-stone-900 font-mono text-[11px] font-bold mt-1">Helpline / WhatsApp: 0300-8325693</p>
                </div>
              </div>

              {/* Instructions Bar */}
              <div className="text-center pt-1 text-[10px] text-stone-400 font-mono">
                Printed via Soghat-e-Chakwal Official Store System &bull; Please fold &amp; place into courier plastic flyer pocket.
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              VIEW 2: FULL TAX INVOICE & BILL
              ════════════════════════════════════════════════════════ */}
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
                  <p className="text-[11px] text-stone-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                    Shop MC33, Street 1, Ghauri Town, Phase 7, Islamabad, Pakistan
                  </p>
                  <p className="text-[11px] text-stone-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
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
                    {currentOrder.orderNumber}
                  </p>
                  <p className="text-xs text-stone-600 mt-1">
                    <span className="font-semibold">Date:</span> {formattedDate} ({formattedTime})
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border border-stone-200">
                    <span>Payment:</span>
                    <span className="uppercase text-brand-green">
                      {currentOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Bank Transfer'}
                    </span>
                    <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded ${
                      currentOrder.paymentStatus === 'received' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {currentOrder.paymentStatus.toUpperCase()}
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
                  <p className="font-bold text-sm text-stone-900">{currentOrder.customer.fullName}</p>
                  <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                    {currentOrder.customer.address}
                  </p>
                  <p className="text-xs font-semibold text-stone-800 mt-0.5">
                    {currentOrder.customer.city}, {currentOrder.customer.province} {currentOrder.customer.postalCode ? `(${currentOrder.customer.postalCode})` : ''}
                  </p>
                </div>

                <div className="sm:border-l sm:border-stone-200 sm:pl-6">
                  <p className="text-[11px] font-bold text-brand-green uppercase tracking-wider mb-1">
                    Customer Contact Details
                  </p>
                  <p className="text-xs text-stone-700">
                    <span className="font-semibold">Phone:</span>{' '}
                    <span className="font-mono font-bold text-stone-900">{currentOrder.customer.phone}</span>
                  </p>
                  {currentOrder.customer.whatsapp && (
                    <p className="text-xs text-stone-700 mt-1">
                      <span className="font-semibold">WhatsApp:</span>{' '}
                      <span className="font-mono text-emerald-700 font-bold">{currentOrder.customer.whatsapp}</span>
                    </p>
                  )}
                  {currentOrder.customer.email && (
                    <p className="text-xs text-stone-700 mt-1">
                      <span className="font-semibold">Email:</span> {currentOrder.customer.email}
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
                    {currentOrder.items.map((item, idx) => {
                      const lineTotal = item.variant.price * item.quantity;
                      const isCustom = (item.variant.size?.toLowerCase().includes('1l') && item.variant.price !== 700) ||
                                       (item.variant.size?.toLowerCase().includes('500ml') && item.variant.price !== 350) ||
                                       currentOrder.source === 'whatsapp';
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
                            {isCustom && (
                              <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded mt-1">
                                ✨ WhatsApp Deal Rate: {formatPrice(item.variant.price)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-medium text-stone-700">
                            {item.variant.name}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
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
                    Payment Mode: {currentOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                  </p>
                  <p className="text-stone-500 text-[11px]">
                    Amount to collect upon delivery: <strong className="text-brand-green">{formatPrice(currentOrder.total)}</strong>
                  </p>
                </div>

                <div className="w-full sm:w-72 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">{formatPrice(currentOrder.subtotal)}</span>
                  </div>
                  {currentOrder.discount && currentOrder.discount > 0 ? (
                    <div className="flex justify-between text-red-600 font-medium">
                      <span>Special Discount:</span>
                      <span className="font-mono font-bold">-{formatPrice(currentOrder.discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-stone-600">
                    <span>Delivery &amp; Handling:</span>
                    <span className="font-mono font-semibold">
                      {currentOrder.shipping === 0 ? (
                        <span className="text-emerald-700 font-bold">FREE DELIVERY</span>
                      ) : (
                        formatPrice(currentOrder.shipping)
                      )}
                    </span>
                  </div>
                  <div className="border-t-2 border-brand-green pt-2 flex justify-between items-center text-stone-900">
                    <span className="font-heading font-black text-sm uppercase">Total Payable:</span>
                    <span className="font-mono font-black text-xl text-brand-green">
                      {formatPrice(currentOrder.total)}
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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyCourierText}
              className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Courier Text
                </>
              )}
            </button>
            <button
              onClick={handleDownloadTextSlip}
              className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download .txt
            </button>
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
