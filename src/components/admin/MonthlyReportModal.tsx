'use client';

// ============================================================
// Soghat-e-Chakwal — Official Monthly Financial Statement & P&L Modal
// Printable and downloadable audit document for accounting records
// ============================================================

import React, { useRef, useState } from 'react';
import {
  Printer,
  X,
  Download,
  FileDown,
  Check,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Truck,
  Sparkles,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { ExpenseEntry, MonthlyFinancialReport } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { generateMonthlyReportCSV, generatePrintableReportHTML } from '@/lib/finances';

interface MonthlyReportModalProps {
  report: MonthlyFinancialReport;
  expenses: ExpenseEntry[];
  onClose: () => void;
}

export function MonthlyReportModal({ report, expenses, onClose }: MonthlyReportModalProps) {
  const [downloadSuccess, setDownloadSuccess] = useState<'csv' | 'html' | null>(null);
  const printableRef = useRef<HTMLDivElement>(null);

  const isProfit = report.netProfit >= 0;
  const statusColor = isProfit ? '#059669' : '#dc2626';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const csvContent = generateMonthlyReportCSV(report, expenses);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Soghat-Financial-Report-${report.month}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess('csv');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadHTML = () => {
    const htmlContent = generatePrintableReportHTML(report, expenses);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Soghat-Financial-Statement-${report.month}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess('html');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[96vh] flex flex-col overflow-hidden my-auto border border-stone-300">
        
        {/* Action Header (Hidden on Print) */}
        <div className="no-print bg-brand-green text-brand-cream px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-gold text-brand-charcoal flex items-center justify-center font-bold">
              📊
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-brand-cream">
                Monthly Financial &amp; P&amp;L Statement
              </h3>
              <p className="text-[11px] text-brand-gold font-bold">
                {report.monthName} ({report.month}) &bull; Soghat-e-Chakwal Official Audit
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
              title="Download Excel / CSV spreadsheet"
            >
              {downloadSuccess === 'csv' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  Downloaded CSV!
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Export CSV / Excel
                </>
              )}
            </button>
            <button
              onClick={handleDownloadHTML}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-white/20 active:scale-95"
              title="Download standalone HTML file"
            >
              {downloadSuccess === 'html' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  Downloaded!
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  Download HTML
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal px-4 py-1.5 rounded-xl text-xs font-black transition-all shadow-md active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-brand-cream/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document */}
        <div
          className="overflow-y-auto p-4 sm:p-8 flex-1 text-stone-800 bg-stone-50"
          id="printable-financial-report"
          ref={printableRef}
        >
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-stone-300 shadow-sm space-y-6">
            
            {/* Document Header */}
            <div className="border-b-2 border-brand-green pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-brand-green text-brand-gold flex items-center justify-center font-heading font-black text-2xl shadow-xs">
                    S
                  </div>
                  <div>
                    <h1 className="font-heading font-black text-2xl text-brand-green tracking-tight uppercase">
                      Soghat-e-Chakwal
                    </h1>
                    <p className="text-[11px] font-serif text-brand-gold font-bold">
                      سوغات چکوال &bull; 100% Pure Desi Mustard Oil &amp; Specialties
                    </p>
                  </div>
                </div>
                <p className="text-xs text-stone-600 mt-2 font-medium">
                  Shop MC33, Street 1, Ghauri Town, Phase 7, Islamabad, Pakistan &bull; Helpline: 0300-8325693
                </p>
              </div>

              <div className="sm:text-right bg-stone-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto">
                <span className="inline-block bg-brand-green text-brand-cream text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md mb-1.5">
                  Monthly Financial Statement &amp; P&amp;L
                </span>
                <p className="font-mono text-xl font-black text-brand-green">
                  {report.monthName}
                </p>
                <p className="text-xs text-stone-500 font-medium mt-0.5">
                  Audit Period: <span className="font-mono font-bold text-stone-800">{report.month}</span>
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Generated: {new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-center">
                <p className="text-[10px] uppercase font-bold text-stone-400">Total Net Revenue</p>
                <p className="font-mono font-black text-lg sm:text-xl text-brand-green mt-1">
                  {formatPrice(report.netRevenue)}
                </p>
                <p className="text-[10px] text-stone-500 mt-0.5">{report.ordersCount} Orders ({report.totalLiters}L)</p>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-center">
                <p className="text-[10px] uppercase font-bold text-stone-400">Total Expenses</p>
                <p className="font-mono font-black text-lg sm:text-xl text-red-600 mt-1">
                  {formatPrice(report.totalExpenses)}
                </p>
                <p className="text-[10px] text-stone-500 mt-0.5">COGS + Ads + Delivery</p>
              </div>

              <div
                className={`border-2 rounded-xl p-3.5 text-center ${
                  isProfit ? 'bg-emerald-50/70 border-emerald-500' : 'bg-red-50/70 border-red-500'
                }`}
              >
                <p className="text-[10px] uppercase font-black tracking-wider" style={{ color: statusColor }}>
                  Net {isProfit ? 'Profit (منافع)' : 'Loss (نقصان)'}
                </p>
                <p className="font-mono font-black text-xl sm:text-2xl mt-1" style={{ color: statusColor }}>
                  {formatPrice(report.netProfit)}
                </p>
                <p className="text-[10px] font-bold mt-0.5" style={{ color: statusColor }}>
                  {isProfit ? '▲ Net Positive Inflow' : '▼ Net Deficit'}
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-center">
                <p className="text-[10px] uppercase font-bold text-stone-400">Net Profit Margin</p>
                <p className="font-mono font-black text-lg sm:text-xl mt-1" style={{ color: statusColor }}>
                  {report.profitMarginPercent}%
                </p>
                <p className="text-[10px] text-stone-500 mt-0.5">Margin on Net Revenue</p>
              </div>
            </div>

            {/* 1. REVENUE SECTION */}
            <div className="space-y-2">
              <div className="border-b border-stone-300 pb-1 flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-wider text-brand-green">
                  1. Revenue &amp; Sales Inflow (سیلز کی آمدن)
                </span>
                <span className="text-[11px] text-stone-500 font-medium">Customer Transactions</span>
              </div>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-700 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2 px-3">Revenue Metric</th>
                      <th className="py-2 px-3 text-center">Volume / Units</th>
                      <th className="py-2 px-3 text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-stone-900">
                        Gross Product Sales (Items Subtotal)
                      </td>
                      <td className="py-2.5 px-3 text-center text-stone-600 font-mono">
                        {report.ordersCount} Orders ({report.bottles1LSold} x 1L, {report.bottles500mlSold} x 500ml)
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                        {formatPrice(report.grossSales)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-stone-900">
                        Delivery &amp; Shipping Charges Collected
                      </td>
                      <td className="py-2.5 px-3 text-center text-stone-600">
                        Customer Shipping Paid
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                        {formatPrice(report.shippingCollected)}
                      </td>
                    </tr>
                    {report.discountTotal > 0 && (
                      <tr className="bg-amber-50/40">
                        <td className="py-2.5 px-3 font-semibold text-amber-900">
                          Special Deals &amp; Discounts Deducted
                        </td>
                        <td className="py-2.5 px-3 text-center text-amber-700">
                          Customer Discounts
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                          -{formatPrice(report.discountTotal)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-emerald-50/70 font-black">
                      <td colSpan={2} className="py-3 px-3 uppercase tracking-wider text-emerald-950 font-heading">
                        Total Net Revenue Collected (خالص آمدن)
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-base text-brand-green">
                        {formatPrice(report.netRevenue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. COST OF GOODS SOLD (COGS) */}
            <div className="space-y-2">
              <div className="border-b border-stone-300 pb-1 flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-wider text-stone-800">
                  2. Product Wholesale Purchase Cost / COGS (خریداری لاگت)
                </span>
                <span className="text-[11px] text-stone-500 font-medium">Inventory Acquisition Cost</span>
              </div>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-700 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2 px-3">Product Variant</th>
                      <th className="py-2 px-3 text-center">Units Sold</th>
                      <th className="py-2 px-3 text-center">Wholesale Cost / Unit</th>
                      <th className="py-2 px-3 text-right">Total Wholesale Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-stone-900">
                        Soghat-e-Chakwal Mustard Oil (1 Liter Bottle)
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {report.bottles1LSold}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-stone-600">
                        Rs. 480
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                        {formatPrice(report.bottles1LSold * 480)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-stone-900">
                        Soghat-e-Chakwal Mustard Oil (500ml Bottle)
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {report.bottles500mlSold}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-stone-600">
                        Rs. 240
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                        {formatPrice(report.bottles500mlSold * 240)}
                      </td>
                    </tr>
                    <tr className="bg-stone-100 font-bold">
                      <td colSpan={3} className="py-2.5 px-3 uppercase text-stone-700">
                        Total COGS (خام مال و خریداری لاگت)
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-red-700 font-black">
                        {formatPrice(report.cogsProductCost)}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/50">
                      <td colSpan={3} className="py-2.5 px-3 font-bold text-emerald-900">
                        Gross Margin / Profit Before Overheads (Net Revenue - COGS)
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800">
                        {formatPrice(report.grossProfit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. OPERATING & MARKETING EXPENSES */}
            <div className="space-y-2">
              <div className="border-b border-stone-300 pb-1 flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-wider text-red-800">
                  3. Operating, Delivery &amp; Marketing Expenses (کاروباری اخراجات)
                </span>
                <span className="text-[11px] text-stone-500 font-medium">Business Overhead Costs</span>
              </div>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-700 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2 px-3">Expense Category</th>
                      <th className="py-2 px-3">Scope &amp; Description</th>
                      <th className="py-2 px-3 text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-blue-900">
                        Social Media Ads (اشتہارات)
                      </td>
                      <td className="py-2.5 px-3 text-stone-600">
                        Meta / Facebook, Instagram, Google Ads &amp; TikTok campaigns
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                        {formatPrice(report.adSpend)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-stone-900">
                        Packaging Material &amp; Labour (پیکنگ میٹریل و لیبر)
                      </td>
                      <td className="py-2.5 px-3 text-stone-600">
                        <span>Bottles, containers, tamper seals &amp; packing labour.</span>
                        {report.autoPackagingCost > 0 && (
                          <div className="text-[11px] text-amber-800 font-medium mt-0.5">
                            🤖 Auto Units Sold: {formatPrice(report.autoPackagingCost)}
                            {report.manualPackagingCost > 0 && (
                              <span> + ✍️ Manual Ledger: {formatPrice(report.manualPackagingCost)}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                        {formatPrice(report.packagingCost)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-stone-900">
                        Courier Dispatch Fee (ڈلیوری)
                      </td>
                      <td className="py-2.5 px-3 text-stone-600">
                        Actual courier booking charges paid to TCS / Leopards / Riders
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                        {formatPrice(report.courierCost)}
                      </td>
                    </tr>
                    {report.operationalCost > 0 && (
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-stone-900">
                          Operational &amp; Staff (کرایہ و ملازمین)
                        </td>
                        <td className="py-2.5 px-3 text-stone-600">
                          Facility rent, worker wages, electricity &amp; utility bills
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                          {formatPrice(report.operationalCost)}
                        </td>
                      </tr>
                    )}
                    {report.otherExpenses > 0 && (
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-stone-900">
                          Miscellaneous (متفرق)
                        </td>
                        <td className="py-2.5 px-3 text-stone-600">
                          Incidental expenses, supplies &amp; maintenance
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                          {formatPrice(report.otherExpenses)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-red-50/80 font-black">
                      <td colSpan={2} className="py-3 px-3 uppercase tracking-wider text-red-950 font-heading">
                        Total Monthly Expenses (COGS + Ads + Packaging + Delivery + Ops)
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-base text-red-700">
                        {formatPrice(report.totalExpenses)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. NET PROFIT / LOSS SUMMARY CARD */}
            <div
              className={`rounded-2xl p-5 border-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                isProfit ? 'bg-emerald-50/80 border-emerald-500' : 'bg-red-50/80 border-red-500'
              }`}
            >
              <div>
                <span
                  className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded text-white mb-1.5"
                  style={{ background: statusColor }}
                >
                  {isProfit ? 'PROFITABLE OPERATION (منافع)' : 'NET LOSS RECORDED (نقصان)'}
                </span>
                <h3 className="font-heading font-black text-2xl text-stone-950">
                  Net {isProfit ? 'Profit' : 'Loss'}:{' '}
                  <span className="font-mono" style={{ color: statusColor }}>
                    {formatPrice(report.netProfit)}
                  </span>
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Net Revenue ({formatPrice(report.netRevenue)}) minus Total Expenses ({formatPrice(report.totalExpenses)})
                </p>
              </div>

              <div className="text-left sm:text-right bg-white/70 p-3 rounded-xl border border-stone-200">
                <p className="text-[10px] uppercase font-bold text-stone-500">Net Profit Margin</p>
                <p className="font-mono text-2xl font-black" style={{ color: statusColor }}>
                  {report.profitMarginPercent}%
                </p>
                <p className="text-[10px] text-stone-500 mt-0.5">Total Volume: {report.totalLiters} Liters</p>
              </div>
            </div>

            {/* 5. ITEMIZED EXPENSES TABLE (If any logged) */}
            {expenses.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-700">
                    4. Itemized Expense Entries ({expenses.length} Records)
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">Month: {report.month}</span>
                </div>
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2 px-2.5 w-10 text-center">#</th>
                        <th className="py-2 px-2.5">Date</th>
                        <th className="py-2 px-2.5">Category</th>
                        <th className="py-2 px-2.5">Title / Purpose</th>
                        <th className="py-2 px-2.5">Notes</th>
                        <th className="py-2 px-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {expenses.map((exp, idx) => (
                        <tr key={exp.id} className="hover:bg-stone-50">
                          <td className="py-2 px-2.5 text-center text-stone-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2.5 font-mono text-stone-700 whitespace-nowrap">
                            {exp.date}
                          </td>
                          <td className="py-2 px-2.5 uppercase text-[10px] font-bold text-blue-900">
                            {exp.category}
                          </td>
                          <td className="py-2 px-2.5 font-bold text-stone-900">
                            {exp.title}
                          </td>
                          <td className="py-2 px-2.5 text-stone-500 text-[11px]">
                            {exp.notes || '-'}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-stone-900">
                            {formatPrice(exp.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Official Signature & Verification Footer */}
            <div className="pt-8 border-t border-stone-300 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-stone-500">
              <div>
                <p className="font-bold text-stone-900">Soghat-e-Chakwal Accounting &amp; Audit</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Official internal financial statement prepared for accounting records.
                </p>
                <p className="font-serif italic text-brand-gold text-[11px] mt-1 font-semibold">
                  &ldquo;Wohi Purana Desi Zaiqa, Ab Har Ghar Mein!&rdquo;
                </p>
              </div>

              <div className="text-center w-48 border-t border-stone-800 pt-1.5 self-end sm:self-auto">
                <p className="font-mono font-bold text-stone-800 text-[11px]">Authorized Sign &amp; Stamp</p>
                <p className="text-[9px] text-stone-400">Finance &amp; Operations Officer</p>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="no-print bg-stone-100 border-t border-stone-200 px-6 py-3 flex flex-wrap justify-between items-center gap-3 flex-shrink-0">
          <p className="text-xs text-stone-600">
            📊 Keep physical and digital records of monthly P&amp;L reports, ad costs, and profit margins.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadCSV}
              className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              CSV Spreadsheet
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
          #printable-financial-report, #printable-financial-report * {
            visibility: visible;
          }
          #printable-financial-report {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: auto;
            margin: 0;
            padding: 10mm !important;
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
