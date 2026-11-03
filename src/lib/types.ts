// ============================================================
// Soghat-e-Chakwal — Core Type Definitions
// ============================================================

export interface ProductVariant {
  id: string;
  name: string;           // e.g. "1 Liter", "500ml"
  size: string;           // e.g. "1L", "500ml"
  price: number;          // in PKR
  compareAtPrice?: number; // optional original price (only if real)
  sku: string;
  weight: number;         // in grams
  image?: string;         // variant-specific image
  inStock: boolean;
  stockQuantity: number;
}

export interface ProductImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameUrdu?: string;
  category: string;
  categorySlug: string;
  description: string;
  shortDescription: string;
  features: string[];
  ingredients?: string[];
  storageInstructions?: string;
  shippingInfo?: string;
  faqs?: FAQ[];
  images: ProductImage[];
  variants: ProductVariant[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Category {
  id: string;
  name: string;
  nameUrdu?: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
  productCount: number;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  notes?: string;
}

export type PaymentMethod = 'cod' | 'bank_transfer';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'received' | 'refunded';

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  customer: CustomerInfo;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface SiteConfig {
  brandName: string;
  tagline: string;
  slogan: string;
  whatsappNumber: string;
  whatsappLink: string;
  address: string[];
  shippingCharge: number;
  freeShippingThreshold?: number;
  bankDetails?: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban?: string;
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  analytics: {
    ga4Id?: string;
    metaPixelId?: string;
    googleAdsId?: string;
  };
}

export interface HeroBanner {
  id: string;
  eyebrow: string;
  heading: string;
  subheading: string;
  description: string;
  primaryCta: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
  backgroundImage?: string;
  isActive: boolean;
}
