import { NextResponse } from 'next/server';
import { ExpenseEntry, FinancialSettings } from '@/lib/types';

// Server-side shared storage for expenses and financial configurations
// 100% manual entries - initialized completely clean with zero dummy/demo entries
let serverExpenses: ExpenseEntry[] = [];

let serverSettings: FinancialSettings = {
  defaultCostPrice1L: 480,
  defaultCostPrice500ml: 240,
  variantCosts: {
    'var-1l': 480,
    'var-500ml': 240,
    'var-ghee-1kg': 3000,
    'var-ghee-500g': 1550,
  },
  variantPackaging: {
    'var-1l': { materialCost: 60, laborCost: 5 },
    'var-500ml': { materialCost: 40, laborCost: 5 },
    'var-ghee-1kg': { materialCost: 65, laborCost: 5 },
    'var-ghee-500g': { materialCost: 35, laborCost: 5 },
  },
  monthlyWholesaleRates: {},
  packagingCostPerOrder: 0,
  courierCostPerOrder: 0,
};

export async function GET() {
  return NextResponse.json({
    success: true,
    expenses: serverExpenses,
    settings: serverSettings,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.type === 'expense' && body.expense) {
      const newExp: ExpenseEntry = {
        ...body.expense,
        id: body.expense.id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: body.expense.createdAt || new Date().toISOString(),
      };
      serverExpenses.unshift(newExp);
      return NextResponse.json({ success: true, expenses: serverExpenses, settings: serverSettings });
    }

    if (body.type === 'update_expense' && body.expense && body.expense.id) {
      serverExpenses = serverExpenses.map((e) => (e.id === body.expense.id ? { ...e, ...body.expense } : e));
      return NextResponse.json({ success: true, expenses: serverExpenses, settings: serverSettings });
    }

    if (body.type === 'settings' && body.settings) {
      serverSettings = {
        ...serverSettings,
        ...body.settings,
        variantCosts: {
          ...(serverSettings.variantCosts || {}),
          ...(body.settings.variantCosts || {}),
        },
        variantPackaging: {
          ...(serverSettings.variantPackaging || {}),
          ...(body.settings.variantPackaging || {}),
        },
        monthlyWholesaleRates: {
          ...(serverSettings.monthlyWholesaleRates || {}),
          ...(body.settings.monthlyWholesaleRates || {}),
        },
      };
      return NextResponse.json({ success: true, expenses: serverExpenses, settings: serverSettings });
    }

    if (body.type === 'clear_all') {
      serverExpenses = [];
      return NextResponse.json({ success: true, expenses: serverExpenses, settings: serverSettings });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      serverExpenses = serverExpenses.filter((e) => e.id !== id);
      return NextResponse.json({ success: true, expenses: serverExpenses, settings: serverSettings });
    }
    return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
