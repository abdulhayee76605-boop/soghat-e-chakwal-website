// ============================================================
// Seed Data — Demo Products & Categories
// ============================================================

import { Product, Category } from './types';

export const categories: Category[] = [
  {
    id: 'cat-oils',
    name: 'Cooking Oils',
    nameUrdu: 'کھانا پکانے کے تیل',
    slug: 'cooking-oils',
    description: 'Traditional cooking oils inspired by Chakwal\'s agricultural heritage.',
    isActive: true,
    productCount: 2,
  },
  {
    id: 'cat-ghee',
    name: 'Desi Ghee',
    nameUrdu: 'دیسی گھی',
    slug: 'desi-ghee',
    description: 'Pure desi ghee made the traditional way.',
    isActive: false,
    productCount: 0,
  },
  {
    id: 'cat-honey',
    name: 'Honey',
    nameUrdu: 'شہد',
    slug: 'honey',
    description: 'Natural honey from the hills of Pakistan.',
    isActive: false,
    productCount: 0,
  },
  {
    id: 'cat-spices',
    name: 'Spices',
    nameUrdu: 'مصالحے',
    slug: 'spices',
    description: 'Authentic Pakistani spices and spice blends.',
    isActive: false,
    productCount: 0,
  },
  {
    id: 'cat-pickles',
    name: 'Pickles',
    nameUrdu: 'اچار',
    slug: 'pickles',
    description: 'Traditional homestyle pickles.',
    isActive: false,
    productCount: 0,
  },
];

export const products: Product[] = [
  // ── PRODUCT 1: 1 LITER BOTTLE ──
  {
    id: 'prod-mustard-oil-1l',
    slug: 'mustard-oil-1-liter',
    name: 'Soghat-e-Chakwal Mustard Oil (1 Liter)',
    nameUrdu: 'سوغات چکوال سرسوں کا تیل — ۱ لٹر',
    category: 'Cooking Oils',
    categorySlug: 'cooking-oils',
    description:
      'Experience the authentic taste of tradition with the 1 Liter family bottle of Soghat-e-Chakwal Mustard Oil. Packaged in our signature tall rectangular amber bottle with original white screw cap and tamper-proof seal. Inspired by the rich agricultural heritage of Chakwal, this pure mustard oil brings the familiar aroma and depth of home cooking to your table.',
    shortDescription:
      'Pure mustard oil in 1 Liter tall rectangular amber bottle with white screw cap. Perfect for family kitchens.',
    features: [
      '1 Liter family size (Tall rectangular amber bottle)',
      'Fitted with original white screw cap & tamper seal',
      'Authentic mustard oil with rich traditional aroma',
      'Inspired by Chakwal\'s Potohar agricultural heritage',
      'Ideal for traditional cooking, frying, saag & achar',
    ],
    ingredients: ['100% Pure Mustard Oil (Sarson ka Tel)'],
    storageInstructions:
      'Store in a cool, dry place away from direct sunlight. Keep the white cap tightly sealed after each use to preserve aroma.',
    shippingInfo:
      'Cash on Delivery available nationwide across Pakistan. Delivered in protective cushioned packaging within 2-4 business days.',
    faqs: [
      {
        question: 'What is the bottle shape and cap color for the 1 Liter size?',
        answer:
          'The 1 Liter bottle is a tall rectangular transparent amber bottle with a long narrow neck, original white screw cap, and verified Soghat-e-Chakwal label.',
      },
      {
        question: 'Is this oil suitable for daily cooking and frying?',
        answer:
          'Yes, Soghat-e-Chakwal Mustard Oil is ideal for traditional Pakistani cooking, saag tadka, fish frying, and seasonal pickle preparation.',
      },
      {
        question: 'What are the delivery charges?',
        answer:
          'Standard delivery is Rs. 200 across Pakistan, and orders of Rs. 2,000 or more enjoy completely FREE delivery.',
      },
    ],
    images: [
      {
        id: 'img-1l-main',
        src: '/images/products/mustard-oil-1l.png',
        alt: 'Soghat-e-Chakwal Mustard Oil 1 Liter Bottle with White Cap and 1 Liter Badge',
        width: 1200,
        height: 800,
        isPrimary: true,
      },
      {
        id: 'img-1l-duo',
        src: '/images/products/mustard-oil-duo.png',
        alt: 'Soghat-e-Chakwal Mustard Oil 1L and 500ml Bottles with Official Logo',
        width: 1200,
        height: 800,
        isPrimary: false,
      },
    ],
    variants: [
      {
        id: 'var-1l',
        name: '1 Liter Bottle',
        size: '1L',
        price: 750,
        sku: 'SEC-MO-1L',
        weight: 1100,
        image: '/images/products/mustard-oil-1l.png',
        inStock: true,
        stockQuantity: 65,
      },
    ],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tags: ['mustard-oil', '1-liter', 'cooking-oil', 'traditional', 'white-cap'],
  },

  // ── PRODUCT 2: 500ML BOTTLE ──
  {
    id: 'prod-mustard-oil-500ml',
    slug: 'mustard-oil-500ml',
    name: 'Soghat-e-Chakwal Mustard Oil (500ml)',
    nameUrdu: 'سوغات چکوال سرسوں کا تیل — ۵۰۰ ملی لٹر',
    category: 'Cooking Oils',
    categorySlug: 'cooking-oils',
    description:
      'The compact 500ml bottle of Soghat-e-Chakwal Mustard Oil. Packaged in our distinct shorter rectangular amber bottle with original yellow screw cap. Perfect for compact kitchens, daily hair and body massage, or smaller households wanting the authentic desi flavor of Chakwal.',
    shortDescription:
      'Pure mustard oil in 500ml compact rectangular amber bottle with yellow screw cap. Fresh, handy, and authentic.',
    features: [
      '500ml compact size (Shorter rectangular amber bottle)',
      'Fitted with original yellow screw cap & tamper seal',
      'Authentic mustard oil with rich traditional aroma',
      'Handy and convenient for daily cooking or wellness',
      'Carefully packaged for leak-proof doorstep delivery',
    ],
    ingredients: ['100% Pure Mustard Oil (Sarson ka Tel)'],
    storageInstructions:
      'Store in a cool, dry place away from direct sunlight. Keep the yellow cap tightly closed after each use.',
    shippingInfo:
      'Cash on Delivery available nationwide across Pakistan. Standard delivery takes 2-4 business days.',
    faqs: [
      {
        question: 'What is the bottle shape and cap color for the 500ml size?',
        answer:
          'The 500ml bottle is a shorter rectangular transparent amber bottle with a narrow neck, original yellow screw cap, and verified Soghat-e-Chakwal label.',
      },
      {
        question: 'Can I order multiple 500ml bottles or combine with 1 Liter?',
        answer:
          'Yes, you can add any combination of 1L and 500ml bottles to your cart, or order directly via WhatsApp at 0300-8325693.',
      },
    ],
    images: [
      {
        id: 'img-500ml-main',
        src: '/images/products/mustard-oil-500ml.png',
        alt: 'Soghat-e-Chakwal Mustard Oil 500ml Bottle with Yellow Cap and 500ml Badge',
        width: 1200,
        height: 800,
        isPrimary: true,
      },
      {
        id: 'img-500ml-duo',
        src: '/images/products/mustard-oil-duo.png',
        alt: 'Soghat-e-Chakwal Mustard Oil 1L and 500ml Bottles with Official Logo',
        width: 1200,
        height: 800,
        isPrimary: false,
      },
    ],
    variants: [
      {
        id: 'var-500ml',
        name: '500ml Bottle',
        size: '500ml',
        price: 450,
        sku: 'SEC-MO-500ML',
        weight: 600,
        image: '/images/products/mustard-oil-500ml.png',
        inStock: true,
        stockQuantity: 90,
      },
    ],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tags: ['mustard-oil', '500ml', 'cooking-oil', 'traditional', 'yellow-cap'],
  },
];

// Helper functions
export function getProductBySlug(slug: string): Product | undefined {
  // Backward compatibility alias: "mustard-oil" maps to the 1 Liter flagship product
  if (slug === 'mustard-oil') return products[0];
  return products.find((p) => p.slug === slug && p.isActive);
}

export function getActiveProducts(): Product[] {
  return products.filter((p) => p.isActive);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isActive && p.isFeatured);
}

export function getActiveCategories(): Category[] {
  return categories.filter((c) => c.isActive);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter(
    (p) => p.categorySlug === categorySlug && p.isActive
  );
}
