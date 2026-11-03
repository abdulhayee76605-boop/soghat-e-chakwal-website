// ============================================================
// Orders Demo In-Memory Store
// ============================================================

import { Order } from './types';

export const demoOrders: Order[] = [
  {
    id: 'ord-seed-01',
    orderNumber: 'SEC-DEMO-9821',
    items: [
      {
        productId: 'prod-mustard-oil',
        variantId: 'var-1l',
        quantity: 2,
        product: {
          id: 'prod-mustard-oil',
          slug: 'mustard-oil',
          name: 'Soghat-e-Chakwal Mustard Oil',
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
          name: '1 Liter',
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
      notes: 'Please call before arrival.',
    },
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    status: 'confirmed',
    subtotal: 1500,
    shipping: 200,
    total: 1700,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];
