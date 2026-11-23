import { NextResponse } from 'next/server';
import { ExpenseEntry, FinancialSettings } from '@/lib/types';

// Server-side shared storage for expenses and financial configurations
let serverExpenses: ExpenseEntry[] = [
  {
    id: 'exp-demo-1',
    date: new Date().toISOString().substring(0, 10),
    month: new Date().toISOString().substring(0, 7),
    category: 'ads',
    title: 'Meta / Facebook Ads (Mustard Oil Campaign)',
    amount: 1500,
    notes: 'Meta Ads Manager daily budget for video views and lead conversions',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-demo-2',
    date: new Date().toISOString().substring(0, 10),
    month: new Date().toISOString().substring(0, 7),
    category: 'packaging',
    title: 'Packaging Boxes & Bubble Wrap Roll (50 Units)',
    amount: 850,
    notes: 'Corrugated cartons, bubble wrap, tape roll, and flyer pockets',
    createdAt: new Date().toISOString(),
  },
];

let serverSettings: FinancialSettings = {
  defaultCostPrice1L: 480,
  defaultCostPrice500ml: 240,
  packagingCostPerOrder: 35,
  courierCostPerOrder: 200,
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

    if (body.type === 'settings' && body.settings) {
      serverSettings = { ...serverSettings, ...body.settings };
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
      return NextResponse.json({ success: true, expenses: serverExpenses });
    }
    return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
