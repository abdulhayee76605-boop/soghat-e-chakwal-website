// ============================================================
// Soghat-e-Chakwal — Core Type Definitions
// ============================================================

export interface ProductVariant {
  id: string;
  name: string;           // e.g. "1 Liter", "500ml"
  size: string;           // e.g. "1L", "500ml"
  price: number;          // in PKR (Selling Price)
  compareAtPrice?: number; // optional original price (only if real)
  costPrice?: number;     // Wholesale / Purchase cost in PKR (خریداری قیمت / لاگت)
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
  discount?: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  source?: string;
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
  freeShippingLiters?: number;
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

// ============================================================
// Accounting, Expenses & Monthly Profit & Loss (P&L) Reports
// ============================================================

export type ExpenseCategory =
  | 'ads'         // Facebook / Instagram / Google / TikTok Ads
  | 'packaging'   // Boxes, Flyers, Bubble Wrap, Bottles, Seals, Tape
  | 'delivery'    // Courier delivery fees paid to TCS/Leopards/Trax
  | 'inventory'   // Raw mustard seeds, oil procurement, bulk bottles
  | 'operational' // Rent, utilities, labor, fuel
  | 'other';      // Miscellaneous expenses

export interface ExpenseEntry {
  id: string;
  date: string;          // YYYY-MM-DD
  month: string;         // YYYY-MM e.g. "2026-11"
  category: ExpenseCategory;
  title: string;
  amount: number;        // in PKR
  notes?: string;
  createdAt: string;
}

export interface VariantPackagingCost {
  materialCost: number; // Bottle / Container / Carton cost per unit in PKR (e.g. 60 for 1L, 40 for 500ml)
  laborCost: number;    // Packing / Filling labour cost per unit in PKR (e.g. 5 for 1L, 5 for 500ml)
}

export interface FinancialSettings {
  defaultCostPrice1L: number;    // Wholesale / Purchase cost per 1L bottle (e.g. 480 PKR)
  defaultCostPrice500ml: number; // Wholesale / Purchase cost per 500ml bottle (e.g. 240 PKR)
  variantCosts?: Record<string, number>; // variantId -> default wholesale purchase cost in PKR
  variantPackaging?: Record<string, VariantPackagingCost>; // variantId -> default packaging material & labour cost
  monthlyWholesaleRates?: Record<
    string,
    {
      cost1L?: number;
      cost500ml?: number;
      variantRates?: Record<string, number>; // variantId -> wholesale purchase rate for that specific month
      variantPackagingRates?: Record<string, VariantPackagingCost>; // variantId -> monthly packaging & labour rate
    }
  >;
  packagingCostPerOrder?: number;
  courierCostPerOrder?: number;
}

export interface MonthlyFinancialReport {
  month: string;                 // YYYY-MM e.g. "2026-11"
  monthName: string;             // e.g. "November 2026"
  ordersCount: number;
  totalLiters: number;
  bottles1LSold: number;
  bottles500mlSold: number;
  grossSales: number;            // Total product prices before discount
  discountTotal: number;         // Total discounts given to customers
  shippingCollected: number;     // Shipping fee paid by customers
  netRevenue: number;            // (Gross Sales - Discounts) + Shipping Collected

  // Expense breakdown
  cogsProductCost: number;       // Wholesale product purchase cost (COGS)
  adSpend: number;               // Total advertising spend (Meta, Google, etc.)
  packagingCost: number;         // Total packaging material expenses (Auto sold units + manual ledger)
  autoPackagingCost: number;     // Auto-calculated from units sold (Bottles * (material + labor))
  autoPackagingMaterialCost: number; // Only bottle/packing materials total
  autoPackagingLaborCost: number;    // Only packing labour total
  manualPackagingCost: number;   // Extra manual packaging logged in ledger (cartons, tape, etc.)
  packagingBreakdownByVariant: Array<{
    variantId: string;
    productName: string;
    variantName: string;
    unitsSold: number;
    materialCostPerUnit: number;
    laborCostPerUnit: number;
    totalUnitPackaging: number;
    totalPackagingExpense: number;
  }>;
  courierCost: number;           // Actual courier charges paid
  operationalCost: number;       // Rent, staff, utilities
  otherExpenses: number;         // Miscellaneous
  totalExpenses: number;         // Sum of all costs

  // Profitability metrics
  grossProfit: number;           // Net Revenue - COGS
  netProfit: number;             // Net Revenue - Total Expenses
  profitMarginPercent: number;   // (Net Profit / Net Revenue) * 100
  isProfit: boolean;             // True if Net Profit >= 0
}
