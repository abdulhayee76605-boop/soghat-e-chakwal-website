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
    const payload = await request.json();
    const { orderId, order } = payload;
    const targetId = orderId || (order && order.id);

    serverOrders = serverOrders.map((o) => {
      if (o.id === targetId) {
        if (order) {
          return { ...o, ...order, updatedAt: new Date().toISOString() };
        }
        return {
          ...o,
          ...(payload.status ? { status: payload.status } : {}),
          ...(payload.paymentStatus ? { paymentStatus: payload.paymentStatus } : {}),
          ...(payload.items ? { items: payload.items } : {}),
          ...(payload.subtotal !== undefined ? { subtotal: payload.subtotal } : {}),
          ...(payload.shipping !== undefined ? { shipping: payload.shipping } : {}),
          ...(payload.discount !== undefined ? { discount: payload.discount } : {}),
          ...(payload.total !== undefined ? { total: payload.total } : {}),
          ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
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
