// ============================================================
// Orders Store — Client-persistent with seed data
// Production & Static-export ready
// ============================================================

import { Order, OrderStatus } from './types';

export const demoOrders: Order[] = [
  {
    id: 'ord-seed-01',
    orderNumber: 'SEC-DEMO-9821',
    items: [
      {
        productId: 'prod-mustard-oil-1l',
        variantId: 'var-1l',
        quantity: 2,
        product: {
          id: 'prod-mustard-oil-1l',
          slug: 'mustard-oil-1-liter',
          name: 'Soghat-e-Chakwal Mustard Oil (1 Liter)',
          nameUrdu: 'سوغات چکوال سرسوں کا تیل — ۱ لٹر',
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
      fullName: 'Ahmad Khan',
      phone: '03001234567',
      whatsapp: '03001234567',
      email: 'ahmad@example.com',
      address: 'House 42, Street 8, Sector F-10/2',
      city: 'Islamabad',
      province: 'Islamabad Capital Territory',
      postalCode: '44000',
    },
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    status: 'confirmed',
    subtotal: 1500,
    shipping: 0,
    total: 1500,
    createdAt: '2026-11-01T10:30:00Z',
    updatedAt: '2026-11-01T10:30:00Z',
  },
  {
    id: 'ord-seed-02',
    orderNumber: 'SEC-DEMO-9822',
    items: [
      {
        productId: 'prod-mustard-oil-500ml',
        variantId: 'var-500ml',
        quantity: 1,
        product: {
          id: 'prod-mustard-oil-500ml',
          slug: 'mustard-oil-500ml',
          name: 'Soghat-e-Chakwal Mustard Oil (500ml)',
          nameUrdu: 'سوغات چکوال سرسوں کا تیل — ۵۰۰ ملی لٹر',
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
          id: 'var-500ml',
          name: '500ml Bottle',
          size: '500ml',
          price: 450,
          sku: 'SEC-MO-500ML',
          weight: 600,
          inStock: true,
          stockQuantity: 32,
        },
      },
    ],
    customer: {
      fullName: 'Fatima Malik',
      phone: '03219876543',
      whatsapp: '03219876543',
      email: 'fatima@example.com',
      address: 'Plot 15, Block C, Model Town',
      city: 'Lahore',
      province: 'Punjab',
      postalCode: '54000',
    },
    paymentMethod: 'bank_transfer',
    paymentStatus: 'received',
    status: 'shipped',
    subtotal: 450,
    shipping: 200,
    total: 650,
    createdAt: '2026-11-01T14:15:00Z',
    updatedAt: '2026-11-01T14:15:00Z',
  },
];

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return demoOrders;
  try {
    const raw = localStorage.getItem('sec_orders');
    if (!raw) {
      localStorage.setItem('sec_orders', JSON.stringify(demoOrders));
      return demoOrders;
    }
    return JSON.parse(raw);
  } catch {
    return demoOrders;
  }
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

  if (typeof window !== 'undefined') {
    try {
      const orders = getStoredOrders();
      orders.unshift(newOrder);
      localStorage.setItem('sec_orders', JSON.stringify(orders));
    } catch {
      demoOrders.unshift(newOrder);
    }
  } else {
    demoOrders.unshift(newOrder);
  }

  return newOrder;
}

export function updateStoredOrderStatus(orderId: string, status: OrderStatus): void {
  if (typeof window !== 'undefined') {
    try {
      const orders = getStoredOrders().map((o) => (o.id === orderId ? { ...o, status } : o));
      localStorage.setItem('sec_orders', JSON.stringify(orders));
    } catch {
      // Fallback
    }
  }
}
