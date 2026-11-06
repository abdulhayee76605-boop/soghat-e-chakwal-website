// ============================================================
// Orders Store — Clean Production Real Orders
// Syncs with server API and local storage
// ============================================================

import { Order, OrderStatus, PaymentStatus } from './types';

// Zero fake seed data — starts clean with real customer orders only
export const demoOrders: Order[] = [];

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('sec_orders');
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    // Filter out any leftover fake demo orders
    return Array.isArray(parsed)
      ? parsed.filter((o: Order) => !o.id?.startsWith('ord-seed-'))
      : [];
  } catch {
    return [];
  }
}

export async function fetchServerOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.orders)) {
        // Merge with local storage
        if (typeof window !== 'undefined') {
          const local = getStoredOrders();
          const mergedMap = new Map<string, Order>();
          local.forEach((o) => mergedMap.set(o.id, o));
          data.orders.forEach((o: Order) => mergedMap.set(o.id, o));
          const merged = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          localStorage.setItem('sec_orders', JSON.stringify(merged));
          return merged;
        }
        return data.orders;
      }
    }
  } catch {
    // Fallback to local
  }
  return getStoredOrders();
}

export function saveNewOrder(orderData: {
  items: Order['items'];
  customer: Order['customer'];
  paymentMethod: Order['paymentMethod'];
  subtotal: number;
  shipping: number;
  total: number;
}): Order {
  const orderNumber = `SEC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const newOrder: Order = {
    ...orderData,
    id: `ord-${Date.now()}`,
    orderNumber,
    paymentStatus: 'pending',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: orderData.customer?.notes,
  };

  // 1. Save to local storage
  if (typeof window !== 'undefined') {
    try {
      const orders = getStoredOrders();
      orders.unshift(newOrder);
      localStorage.setItem('sec_orders', JSON.stringify(orders));
    } catch {
      // Ignore
    }
    // 2. Transmit to server API so admin can view cross-device
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(() => {});
  }

  return newOrder;
}

export function updateStoredOrderStatus(orderId: string, status: OrderStatus): void {
  if (typeof window !== 'undefined') {
    try {
      const orders = getStoredOrders().map((o) => (o.id === orderId ? { ...o, status } : o));
      localStorage.setItem('sec_orders', JSON.stringify(orders));
      // Notify server
      fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      }).catch(() => {});
    } catch {
      // Fallback
    }
  }
}

export function updateStoredPaymentStatus(orderId: string, paymentStatus: PaymentStatus): void {
  if (typeof window !== 'undefined') {
    try {
      const orders = getStoredOrders().map((o) => (o.id === orderId ? { ...o, paymentStatus } : o));
      localStorage.setItem('sec_orders', JSON.stringify(orders));
      fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentStatus }),
      }).catch(() => {});
    } catch {
      // Fallback
    }
  }
}
