// ============================================================
// Orders Store — Clean Production Real Orders
// Syncs with server API and local storage
// ============================================================

import { Order, OrderStatus, PaymentStatus } from './types';

// Zero fake seed data — starts clean with real customer orders only
export const demoOrders: Order[] = [];

function isFakeOrder(order: Order): boolean {
  if (!order) return true;
  if (order.id?.startsWith('ord-seed-')) return true;
  if (order.orderNumber?.includes('DEMO')) return true;
  if (order.customer?.fullName === 'Ahmad Khan') return true;
  if (order.customer?.fullName === 'Fatima Malik') return true;
  return false;
}

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('sec_orders');
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter out ANY legacy demo orders
    const cleaned = parsed.filter((o: Order) => !isFakeOrder(o));

    // If cleaned array length is different, overwrite localStorage to remove fake data permanently
    if (cleaned.length !== parsed.length) {
      localStorage.setItem('sec_orders', JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function clearStoredOrders(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('sec_orders');
    } catch {}
  }
}

export function getSamplePreviewOrder(): Order {
  return {
    id: 'sample-preview-slip',
    orderNumber: 'SEC-PK-7829',
    items: [
      {
        productId: 'prod-mustard-oil-1l',
        variantId: 'var-1l',
        quantity: 2,
        product: {
          id: 'prod-mustard-oil-1l',
          slug: 'mustard-oil-1-liter',
          name: 'Soghat-e-Chakwal Mustard Oil (1 Liter)',
          nameUrdu: 'سوغات چکوال خالص سرسوں کا تیل',
          category: 'Cooking Oils',
          categorySlug: 'cooking-oils',
          description: '',
          shortDescription: '',
          features: [],
          images: [],
          variants: [],
          isActive: true,
          isFeatured: true,
          createdAt: '',
          updatedAt: '',
          tags: [],
        },
        variant: {
          id: 'var-1l',
          name: '1 Liter Bottle',
          size: '1L',
          price: 750,
          sku: 'SEC-MO-1L',
          weight: 1100,
          inStock: true,
          stockQuantity: 48,
        },
      },
    ],
    customer: {
      fullName: 'Muhammad Ali Khan (Sample)',
      phone: '0300-1234567',
      whatsapp: '0300-1234567',
      address: 'House #45, Street #3, Sector F-8/2',
      city: 'Islamabad',
      province: 'Islamabad Capital Territory',
      postalCode: '44000',
      notes: 'Near Allied Bank, Main Double Road',
    },
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    status: 'pending',
    subtotal: 1500,
    shipping: 0,
    total: 1500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
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
