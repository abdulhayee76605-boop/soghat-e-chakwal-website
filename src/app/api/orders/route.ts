// ============================================================
// Server-side Orders API Route
// ============================================================

import { NextResponse } from 'next/server';
import { Order } from '@/lib/types';
import { demoOrders } from '@/lib/orders-db';

export async function GET() {
  return NextResponse.json({
    orders: demoOrders,
    count: demoOrders.length,
  });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Order must contain items' }, { status: 400 });
    }

    if (!data.customer?.fullName || !data.customer?.phone || !data.customer?.address || !data.customer?.city) {
      return NextResponse.json({ error: 'Missing required customer details' }, { status: 400 });
    }

    const orderNumber = `SEC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      items: data.items,
      customer: data.customer,
      paymentMethod: data.paymentMethod || 'cod',
      paymentStatus: 'pending',
      status: 'pending',
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: data.customer?.notes,
    };

    demoOrders.unshift(newOrder);

    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process order';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { orderId, status, paymentStatus } = await req.json();
    const orderIndex = demoOrders.findIndex((o) => o.id === orderId);

    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (status) demoOrders[orderIndex].status = status;
    if (paymentStatus) demoOrders[orderIndex].paymentStatus = paymentStatus;
    demoOrders[orderIndex].updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      order: demoOrders[orderIndex],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update order';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
