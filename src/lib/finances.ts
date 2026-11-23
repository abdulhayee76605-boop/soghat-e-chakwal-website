// ============================================================
// Soghat-e-Chakwal — Financial Analytics & Expense Management
// Monthly Profit & Loss (P&L) Reports, Wholesale Price & COGS
// ============================================================

import { ExpenseEntry, FinancialSettings, MonthlyFinancialReport, Order } from './types';
import { formatPrice } from './utils';

export const defaultFinancialSettings: FinancialSettings = {
  defaultCostPrice1L: 480,       // Wholesale / Purchase cost per 1L bottle
  defaultCostPrice500ml: 240,    // Wholesale / Purchase cost per 500ml bottle
  packagingCostPerOrder: 35,     // Corrugated box, tape, flyer pocket, bubble wrap
  courierCostPerOrder: 200,      // Actual courier fee charged by TCS/Leopards
};

// ── LOCAL STORAGE KEYS ──
const EXPENSES_STORAGE_KEY = 'sec_expenses';
const FINANCIAL_SETTINGS_KEY = 'sec_fin_settings';

export function getStoredExpenses(): ExpenseEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredExpenses(expenses: ExpenseEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch {
    // Ignore storage quota
  }
}

export async function fetchServerExpenses(): Promise<{ expenses: ExpenseEntry[]; settings: FinancialSettings }> {
  try {
    const res = await fetch('/api/finances', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.expenses)) {
        if (typeof window !== 'undefined') {
          saveStoredExpenses(data.expenses);
          if (data.settings) {
            saveFinancialSettings(data.settings);
          }
        }
        return {
          expenses: data.expenses,
          settings: data.settings || defaultFinancialSettings,
        };
      }
    }
  } catch {
    // Fallback to local
  }
  return {
    expenses: getStoredExpenses(),
    settings: getStoredFinancialSettings(),
  };
}

export function getStoredFinancialSettings(): FinancialSettings {
  if (typeof window === 'undefined') return defaultFinancialSettings;
  try {
    const raw = localStorage.getItem(FINANCIAL_SETTINGS_KEY);
    if (!raw) return defaultFinancialSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultFinancialSettings, ...parsed };
  } catch {
    return defaultFinancialSettings;
  }
}

export function saveFinancialSettings(settings: FinancialSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FINANCIAL_SETTINGS_KEY, JSON.stringify(settings));
    fetch('/api/finances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'settings', settings }),
    }).catch(() => {});
  } catch {
    // Ignore
  }
}

export function addExpense(entry: Omit<ExpenseEntry, 'id' | 'createdAt'>): ExpenseEntry {
  const newExpense: ExpenseEntry = {
    ...entry,
    id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const expenses = getStoredExpenses();
    expenses.unshift(newExpense);
    saveStoredExpenses(expenses);

    fetch('/api/finances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'expense', expense: newExpense }),
    }).catch(() => {});
  }

  return newExpense;
}

export function deleteExpense(id: string): void {
  if (typeof window !== 'undefined') {
    const expenses = getStoredExpenses().filter((e) => e.id !== id);
    saveStoredExpenses(expenses);

    fetch(`/api/finances?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch(() => {});
  }
}

export function clearAllExpenses(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(EXPENSES_STORAGE_KEY);
    fetch('/api/finances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'clear_all' }),
    }).catch(() => {});
  }
}

// ── FINANCIAL REPORT CALCULATOR ──
export function calculateMonthlyReport(
  targetMonth: string, // YYYY-MM e.g. "2026-11"
  orders: Order[],
  expenses: ExpenseEntry[],
  settings: FinancialSettings = defaultFinancialSettings
): MonthlyFinancialReport {
  // Filter orders for the target month
  const monthOrders = orders.filter((o) => {
    if (!o.createdAt) return false;
    return o.createdAt.startsWith(targetMonth);
  });

  // Filter expenses for the target month
  const monthExpenses = expenses.filter((e) => {
    return e.month === targetMonth || (e.date && e.date.startsWith(targetMonth));
  });

  // Calculate order items & COGS
  let bottles1LSold = 0;
  let bottles500mlSold = 0;
  let totalLiters = 0;
  let grossSales = 0;
  let discountTotal = 0;
  let shippingCollected = 0;
  let cogsProductCost = 0;

  monthOrders.forEach((o) => {
    grossSales += o.subtotal || 0;
    discountTotal += o.discount || 0;
    shippingCollected += o.shipping || 0;

    o.items.forEach((item) => {
      const is1L =
        item.variant.size?.toLowerCase().includes('1l') ||
        item.variant.name.includes('1') ||
        item.product.name.includes('1 Liter');
      const qty = item.quantity || 1;

      if (is1L) {
        bottles1LSold += qty;
        totalLiters += 1 * qty;
      } else {
        bottles500mlSold += qty;
        totalLiters += 0.5 * qty;
      }

      // Cost price: prioritize variant costPrice, else fallback to settings
      const unitCost =
        item.variant.costPrice && item.variant.costPrice > 0
          ? item.variant.costPrice
          : is1L
          ? settings.defaultCostPrice1L
          : settings.defaultCostPrice500ml;

      cogsProductCost += unitCost * qty;
    });
  });

  const netRevenue = Math.max(0, grossSales - discountTotal + shippingCollected);

  // Categorize expenses
  let adSpend = 0;
  let packagingExpensesLogged = 0;
  let courierExpensesLogged = 0;
  let operationalCost = 0;
  let otherExpenses = 0;

  monthExpenses.forEach((exp) => {
    const amt = Number(exp.amount) || 0;
    switch (exp.category) {
      case 'ads':
        adSpend += amt;
        break;
      case 'packaging':
        packagingExpensesLogged += amt;
        break;
      case 'delivery':
        courierExpensesLogged += amt;
        break;
      case 'operational':
        operationalCost += amt;
        break;
      case 'inventory':
      case 'other':
      default:
        otherExpenses += amt;
        break;
    }
  });

  // Automated packaging & courier calculations per parcel if not logged manually
  const packagingAutoCost = monthOrders.length * settings.packagingCostPerOrder;
  const courierAutoCost = monthOrders.length * settings.courierCostPerOrder;

  const totalPackagingCost = packagingExpensesLogged > 0 ? packagingExpensesLogged : packagingAutoCost;
  const totalCourierCost = courierExpensesLogged > 0 ? courierExpensesLogged : courierAutoCost;

  const totalExpenses =
    cogsProductCost + adSpend + totalPackagingCost + totalCourierCost + operationalCost + otherExpenses;

  const grossProfit = netRevenue - cogsProductCost;
  const netProfit = netRevenue - totalExpenses;
  const profitMarginPercent = netRevenue > 0 ? Math.round((netProfit / netRevenue) * 1000) / 10 : 0;

  // Format month name e.g. "November 2026"
  const [yearStr, monthStr] = targetMonth.split('-');
  const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  const monthName = dateObj.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });

  return {
    month: targetMonth,
    monthName,
    ordersCount: monthOrders.length,
    totalLiters,
    bottles1LSold,
    bottles500mlSold,
    grossSales,
    discountTotal,
    shippingCollected,
    netRevenue,
    cogsProductCost,
    adSpend,
    packagingCost: totalPackagingCost,
    courierCost: totalCourierCost,
    operationalCost,
    otherExpenses,
    totalExpenses,
    grossProfit,
    netProfit,
    profitMarginPercent,
    isProfit: netProfit >= 0,
  };
}

// Get all unique months present in orders and expenses
export function getAvailableMonths(orders: Order[], expenses: ExpenseEntry[]): string[] {
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthSet = new Set<string>();
  monthSet.add(currentMonth);

  orders.forEach((o) => {
    if (o.createdAt) {
      monthSet.add(o.createdAt.substring(0, 7));
    }
  });

  expenses.forEach((e) => {
    if (e.month) monthSet.add(e.month);
    else if (e.date) monthSet.add(e.date.substring(0, 7));
  });

  return Array.from(monthSet).sort().reverse();
}

// ── EXPORT TOOLS (CSV & PRINTABLE HTML) ──
export function generateMonthlyReportCSV(
  report: MonthlyFinancialReport,
  monthExpenses: ExpenseEntry[]
): string {
  const rows: string[] = [
    `"SOGHAT-E-CHAKWAL — MONTHLY FINANCIAL & P&L REPORT"`,
    `"Month:","${report.monthName} (${report.month})"`,
    `"Generated Date:","${new Date().toLocaleDateString('en-PK')}"`,
    ``,
    `"1. REVENUE BREAKDOWN"`,
    `"Metric","Amount (PKR)"`,
    `"Total Customer Orders","${report.ordersCount}"`,
    `"1 Liter Bottles Sold","${report.bottles1LSold}"`,
    `"500ml Bottles Sold","${report.bottles500mlSold}"`,
    `"Total Liters Sold","${report.totalLiters} L"`,
    `"Gross Sales (Subtotal)","${report.grossSales}"`,
    `"Special Discounts Given","-${report.discountTotal}"`,
    `"Shipping Collected from Customers","${report.shippingCollected}"`,
    `"NET SALES REVENUE","${report.netRevenue}"`,
    ``,
    `"2. EXPENSE BREAKDOWN"`,
    `"Expense Category","Amount (PKR)"`,
    `"Product Cost (COGS / Wholesale)","${report.cogsProductCost}"`,
    `"Advertising & Social Media Ads","${report.adSpend}"`,
    `"Packaging Materials","${report.packagingCost}"`,
    `"Courier Delivery Charges Paid","${report.courierCost}"`,
    `"Operational Overheads & Staff","${report.operationalCost}"`,
    `"Other Misc Expenses","${report.otherExpenses}"`,
    `"TOTAL EXPENSES","${report.totalExpenses}"`,
    ``,
    `"3. PROFITABILITY SUMMARY"`,
    `"Gross Profit (Revenue - COGS)","${report.grossProfit}"`,
    `"NET PROFIT / LOSS","${report.netProfit}"`,
    `"Profit Margin %","${report.profitMarginPercent}%"`,
    `"Status","${report.isProfit ? 'PROFITABLE' : 'NET LOSS'}"`,
    ``,
    `"4. ITEMIZED EXPENSES LOG"`,
    `"Date","Category","Title / Description","Amount (PKR)","Notes"`,
  ];

  monthExpenses.forEach((exp) => {
    rows.push(
      `"${exp.date}","${exp.category.toUpperCase()}","${exp.title.replace(/"/g, '""')}","${exp.amount}","${(exp.notes || '').replace(/"/g, '""')}"`
    );
  });

  return rows.join('\n');
}

export function generatePrintableReportHTML(
  report: MonthlyFinancialReport,
  monthExpenses: ExpenseEntry[]
): string {
  const isProfit = report.netProfit >= 0;
  const statusColor = isProfit ? '#059669' : '#dc2626';

  const expensesRowsHtml = monthExpenses
    .map(
      (e, idx) => `
    <tr style="border-bottom: 1px solid #e5e7eb; font-size: 11px;">
      <td style="padding: 6px 10px; color: #6b7280;">${idx + 1}</td>
      <td style="padding: 6px 10px; font-weight: 600;">${e.date}</td>
      <td style="padding: 6px 10px; text-transform: uppercase; font-size: 10px; font-weight: bold; color: #1e3a8a;">${e.category}</td>
      <td style="padding: 6px 10px; font-weight: 500;">${e.title}</td>
      <td style="padding: 6px 10px; color: #4b5563;">${e.notes || '-'}</td>
      <td style="padding: 6px 10px; text-align: right; font-family: monospace; font-weight: bold;">${formatPrice(e.amount)}</td>
    </tr>
  `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Soghat-e-Chakwal — Financial Report ${report.monthName}</title>
  <style>
    @media print {
      .no-print { display: none !important; }
      body { padding: 0 !important; background: white !important; font-size: 12px; }
      .container { box-shadow: none !important; border: 1px solid #000 !important; max-width: 100% !important; padding: 20px !important; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f3f4f6; padding: 24px; margin: 0; color: #111827; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 36px; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { border-bottom: 2px solid #064e3b; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .kpi-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; text-align: center; }
    .kpi-label { font-size: 10px; text-transform: uppercase; color: #6b7280; font-weight: 700; }
    .kpi-value { font-size: 18px; font-weight: 900; margin-top: 4px; font-family: monospace; }
    .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #064e3b; margin: 16px 0 8px 0; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
    th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; color: #374151; font-weight: 700; }
    td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; }
    .total-row { background: #f9fafb; font-weight: 800; }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 800px; margin: 0 auto 16px; display: flex; justify-content: space-between; align-items: center; background: #064e3b; color: white; padding: 12px 20px; border-radius: 12px;">
    <div>
      <strong style="font-size: 13px;">Official Monthly Financial Statement</strong> &bull; <span style="font-size: 11px; opacity: 0.85;">${report.monthName}</span>
    </div>
    <button onclick="window.print()" style="background: #D4AF37; color: #111827; border: none; font-weight: 900; padding: 8px 18px; border-radius: 8px; cursor: pointer; font-size: 12px;">
      🖨️ Print Statement / Save PDF
    </button>
  </div>

  <div class="container">
    <div class="header">
      <div>
        <h1 style="font-size: 24px; font-weight: 900; color: #064e3b; margin: 0; text-transform: uppercase;">Soghat-e-Chakwal</h1>
        <p style="font-size: 11px; color: #D4AF37; font-weight: 700; margin: 2px 0 0;">سوغات چکوال &bull; Pure Mustard Oil & Traditional Desi Specialties</p>
        <p style="font-size: 11px; color: #6b7280; margin: 4px 0 0;">Shop MC33, Street 1, Ghauri Town, Phase 7, Islamabad &bull; Helpline: 0300-8325693</p>
      </div>
      <div style="text-align: right;">
        <span style="background: #064e3b; color: white; font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 4px 8px; border-radius: 4px;">Monthly Financial Audit</span>
        <p style="font-size: 16px; font-weight: 900; color: #111827; margin: 6px 0 2px;">${report.monthName}</p>
        <p style="font-size: 10px; color: #6b7280; margin: 0;">Period: ${report.month} &bull; Generated: ${new Date().toLocaleDateString('en-PK')}</p>
      </div>
    </div>

    <!-- KPI Summary Grid -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Total Net Revenue</div>
        <div class="kpi-value" style="color: #064e3b;">${formatPrice(report.netRevenue)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Total Expenses</div>
        <div class="kpi-value" style="color: #dc2626;">${formatPrice(report.totalExpenses)}</div>
      </div>
      <div class="kpi-card" style="border: 2px solid ${statusColor}; background: ${isProfit ? '#ecfdf5' : '#fef2f2'};">
        <div class="kpi-label" style="color: ${statusColor};">Net ${isProfit ? 'Profit (منافع)' : 'Loss (نقصان)'}</div>
        <div class="kpi-value" style="color: ${statusColor}; font-size: 20px;">${formatPrice(report.netProfit)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Profit Margin</div>
        <div class="kpi-value" style="color: ${statusColor};">${report.profitMarginPercent}%</div>
      </div>
    </div>

    <!-- 1. Revenue Table -->
    <div class="section-title">1. Revenue & Sales Inflow (سیلز کی آمدن)</div>
    <table>
      <thead>
        <tr>
          <th>Revenue Metric</th>
          <th style="text-align: center;">Orders / Units</th>
          <th style="text-align: right;">Amount (PKR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Gross Product Sales (Items Subtotal)</td>
          <td style="text-align: center;">${report.ordersCount} Orders (${report.totalLiters} Liters)</td>
          <td style="text-align: right; font-family: monospace; font-weight: 600;">${formatPrice(report.grossSales)}</td>
        </tr>
        <tr>
          <td>Customer Shipping / Delivery Fee Collected</td>
          <td style="text-align: center;">Delivery Paid by Customers</td>
          <td style="text-align: right; font-family: monospace; font-weight: 600;">${formatPrice(report.shippingCollected)}</td>
        </tr>
        ${
          report.discountTotal > 0
            ? `<tr>
          <td>Special Customer Discounts & Promotions</td>
          <td style="text-align: center;">Discounts Deducted</td>
          <td style="text-align: right; font-family: monospace; font-weight: 600; color: #dc2626;">-${formatPrice(report.discountTotal)}</td>
        </tr>`
            : ''
        }
        <tr class="total-row">
          <td colspan="2">TOTAL NET REVENUE COLLECTED</td>
          <td style="text-align: right; font-family: monospace; font-weight: 900; color: #064e3b; font-size: 14px;">${formatPrice(report.netRevenue)}</td>
        </tr>
      </tbody>
    </table>

    <!-- 2. Cost of Goods Sold (COGS) -->
    <div class="section-title">2. Wholesale Product Purchase Cost / COGS (خریداری لاگت)</div>
    <table>
      <thead>
        <tr>
          <th>Product Bottle Size</th>
          <th style="text-align: center;">Bottles Sold</th>
          <th style="text-align: right;">Wholesale / Cost Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1 Liter Bottles (Wholesale Unit Cost @ Rs. 480)</td>
          <td style="text-align: center; font-weight: bold;">${report.bottles1LSold} Bottles</td>
          <td style="text-align: right; font-family: monospace; font-weight: 600;">${formatPrice(report.bottles1LSold * 480)}</td>
        </tr>
        <tr>
          <td>500ml Bottles (Wholesale Unit Cost @ Rs. 240)</td>
          <td style="text-align: center; font-weight: bold;">${report.bottles500mlSold} Bottles</td>
          <td style="text-align: right; font-family: monospace; font-weight: 600;">${formatPrice(report.bottles500mlSold * 240)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="2">TOTAL COGS (خام مال و خریداری لاگت)</td>
          <td style="text-align: right; font-family: monospace; font-weight: 900; color: #b91c1c;">${formatPrice(report.cogsProductCost)}</td>
        </tr>
        <tr style="background: #ecfdf5;">
          <td colspan="2" style="font-weight: 700; color: #065f46;">GROSS MARGIN / PROFIT BEFORE OVERHEADS (Net Revenue - COGS)</td>
          <td style="text-align: right; font-family: monospace; font-weight: 900; color: #065f46; font-size: 13px;">${formatPrice(report.grossProfit)}</td>
        </tr>
      </tbody>
    </table>

    <!-- 3. Operating & Marketing Expenses -->
    <div class="section-title">3. Operating, Delivery & Marketing Expenses (کاروباری اخراجات)</div>
    <table>
      <thead>
        <tr>
          <th>Expense Category</th>
          <th>Description & Scope</th>
          <th style="text-align: right;">Amount (PKR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight: bold; color: #1e3a8a;">Social Media Ads (اشتہارات)</td>
          <td>Meta / Facebook / Google / TikTok Paid Ad Campaigns</td>
          <td style="text-align: right; font-family: monospace; font-weight: 700; color: #dc2626;">${formatPrice(report.adSpend)}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Packaging Material (پیکنگ)</td>
          <td>Cartons, flyers, bubble cushion wrap, and packing tape</td>
          <td style="text-align: right; font-family: monospace; font-weight: 700;">${formatPrice(report.packagingCost)}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Courier Dispatch Fee (ڈلیوری)</td>
          <td>Actual delivery charges paid to TCS / Leopards / Riders</td>
          <td style="text-align: right; font-family: monospace; font-weight: 700;">${formatPrice(report.courierCost)}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Operational & Staff (ملازمین و کرایہ)</td>
          <td>Facility rent, staff labor, electricity, utilities</td>
          <td style="text-align: right; font-family: monospace; font-weight: 700;">${formatPrice(report.operationalCost)}</td>
        </tr>
        ${
          report.otherExpenses > 0
            ? `<tr>
          <td style="font-weight: bold;">Miscellaneous (متفرق)</td>
          <td>Other operational expenditures and inventory supplies</td>
          <td style="text-align: right; font-family: monospace; font-weight: 700;">${formatPrice(report.otherExpenses)}</td>
        </tr>`
            : ''
        }
        <tr class="total-row" style="background: #fee2e2;">
          <td colspan="2" style="color: #991b1b; font-weight: 900;">TOTAL MONTHLY EXPENSES (COGS + Ads + Packaging + Courier + Ops)</td>
          <td style="text-align: right; font-family: monospace; font-weight: 900; color: #991b1b; font-size: 14px;">${formatPrice(report.totalExpenses)}</td>
        </tr>
      </tbody>
    </table>

    <!-- 4. Final Bottom Line Result -->
    <div style="background: ${isProfit ? '#ecfdf5' : '#fef2f2'}; border: 2px solid ${statusColor}; border-radius: 12px; padding: 16px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h3 style="margin: 0; font-size: 16px; font-weight: 900; color: ${statusColor};">
          NET ${isProfit ? 'PROFIT (خالص منافع)' : 'LOSS (خالص نقصان)'}: ${formatPrice(report.netProfit)}
        </h3>
        <p style="margin: 2px 0 0; font-size: 11px; color: #4b5563;">
          Net Profit Margin: <strong>${report.profitMarginPercent}%</strong> &bull; Total Liters Dispatched: <strong>${report.totalLiters} Liters</strong>
        </p>
      </div>
      <div style="text-align: right;">
        <span style="background: ${statusColor}; color: white; font-weight: 800; font-size: 12px; padding: 6px 14px; border-radius: 8px;">
          ${isProfit ? 'PROFITABLE OPERATION' : 'LOSS RECORDED'}
        </span>
      </div>
    </div>

    ${
      monthExpenses.length > 0
        ? `
      <!-- 5. Itemized Expenses Log -->
      <div class="section-title">4. Itemized Expense Entries (تفصیل اخراجات برائے ریکارڈ)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 20px;">#</th>
            <th>Date</th>
            <th>Category</th>
            <th>Expense Title</th>
            <th>Notes</th>
            <th style="text-align: right;">Amount (PKR)</th>
          </tr>
        </thead>
        <tbody>
          ${expensesRowsHtml}
        </tbody>
      </table>
    `
        : ''
    }

    <!-- Official Signatures -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #6b7280;">
      <div>
        <p style="margin: 0; font-weight: bold; color: #111827;">Soghat-e-Chakwal Accounting Department</p>
        <p style="margin: 2px 0 0;">Prepared for business record & financial tracking.</p>
      </div>
      <div style="text-align: center; border-top: 1px solid #374151; width: 180px; padding-top: 4px; font-weight: bold; color: #111827;">
        Authorized Sign & Stamp
      </div>
    </div>
  </div>
</body>
</html>`;
}
