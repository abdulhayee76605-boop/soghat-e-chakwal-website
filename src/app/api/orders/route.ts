import { NextResponse } from 'next/server';
import { Order } from '@/lib/types';

// Server-side shared order registry
let serverOrders: Order[] = [];

export async function GET() {
  return NextResponse.json({ success: true, orders: serverOrders });
}

export async function POST(request: Request) {
  try {
    const newOrder: Order = await request.json();
    if (newOrder && newOrder.id) {
      if (!serverOrders.some((o) => o.id === newOrder.id)) {
        serverOrders.unshift(newOrder);
      }
    }
    return NextResponse.json({ success: true, orders: serverOrders });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid order' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { orderId, status, paymentStatus } = await request.json();
    serverOrders = serverOrders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          ...(status ? { status } : {}),
          ...(paymentStatus ? { paymentStatus } : {}),
          updatedAt: new Date().toISOString(),
        };
      }
      return o;
    });
    return NextResponse.json({ success: true, orders: serverOrders });
  } catch {
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 400 });
  }
}
