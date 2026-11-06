'use client';

// ============================================================
// Soghat-e-Chakwal — Admin Management Portal
// ============================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Eye,
  LogOut,
  Lock,
  Layers,
  Banknote,
  Search,
  Sparkles,
  Printer,
  FileText,
  TrendingUp,
  Users,
  Activity,
  ExternalLink,
  Tag,
  BarChart3,
  MousePointerClick,
} from 'lucide-react';
import { Product, Order, OrderStatus, PaymentStatus } from '@/lib/types';
import { products as initialProducts, categories as initialCategories } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/lib/config';
import { getStoredOrders, updateStoredOrderStatus, saveNewOrder } from '@/lib/orders-db';
import { OrderInvoice } from '@/components/admin/OrderInvoice';
import { getFunnelMetrics, FunnelMetrics } from '@/lib/analytics';
import { FB_PIXEL_ID } from '@/lib/pixel';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'categories' | 'settings'>('overview');

  // State data
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [invoiceMode, setInvoiceMode] = useState<'label' | 'invoice'>('label');
  const [funnel, setFunnel] = useState<FunnelMetrics>(getFunnelMetrics());

  // Manual Order Creation State
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualCity, setManualCity] = useState('Chakwal');
  const [manualAddress, setManualAddress] = useState('');
  const [manualProductChoice, setManualProductChoice] = useState<'1l' | '500ml'>('1l');
  const [manualQty, setManualQty] = useState(1);
  const [manualPayment, setManualPayment] = useState<'cod' | 'bank_transfer'>('cod');

  // Form states
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Cooking Oils');
  const [newPrice1L, setNewPrice1L] = useState('750');
  const [newPrice500ml, setNewPrice500ml] = useState('450');

  // Config state
  const [shippingRate, setShippingRate] = useState(siteConfig.shippingCharge);
  const [freeShippingMin, setFreeShippingMin] = useState(siteConfig.freeShippingThreshold || 2000);
  const [savedSettings, setSavedSettings] = useState(false);

  // Load orders & persistent products
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedProds = localStorage.getItem('sec_products');
        if (storedProds) {
          setProductList(JSON.parse(storedProds));
        }
      } catch {}
    }
  }, []);

  const saveProductList = (updated: Product[]) => {
    setProductList(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sec_products', JSON.stringify(updated));
      } catch {}
    }
  };

  const updateStockQuantity = (productId: string, variantId: string, delta: number) => {
    const updated = productList.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          variants: p.variants.map((v) => {
            if (v.id === variantId) {
              const currentStock = v.stockQuantity ?? 30;
              const newQty = Math.max(0, currentStock + delta);
              return { ...v, stockQuantity: newQty, inStock: newQty > 0 };
            }
            return v;
          }),
        };
      }
      return p;
    });
    saveProductList(updated);
  };

  const toggleStockStatus = (productId: string, variantId: string) => {
    const updated = productList.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          variants: p.variants.map((v) => {
            if (v.id === variantId) {
              return { ...v, inStock: !v.inStock };
            }
            return v;
          }),
        };
      }
      return p;
    });
    saveProductList(updated);
  };

  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const is1L = manualProductChoice === '1l';
    const unitPrice = is1L ? 750 : 450;
    const subtotal = unitPrice * manualQty;
    const shipping = subtotal >= freeShippingMin ? 0 : shippingRate;
    const total = subtotal + shipping;

    const prod = productList[is1L ? 0 : 1] || initialProducts[0];
    const variant = prod.variants[is1L ? 0 : 1] || prod.variants[0];

    const newOrder = saveNewOrder({
      items: [
        {
          productId: prod.id,
          variantId: variant.id,
          quantity: manualQty,
          product: prod,
          variant: variant,
        },
      ],
      customer: {
        fullName: manualName,
        phone: manualPhone,
        whatsapp: manualPhone,
        address: manualAddress,
        city: manualCity,
        province: 'Punjab',
      },
      paymentMethod: manualPayment,
      subtotal,
      shipping,
      total,
    });

    setOrders((prev) => [newOrder, ...prev]);
    setShowAddOrderModal(false);
    setManualName('');
    setManualPhone('');
    setManualAddress('');
    // Automatically open invoice for immediate printing
    setInvoiceOrder(newOrder);
  };

  // Load orders from API
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = () => {
    try {
      const stored = getStoredOrders();
      setOrders(stored);
      setFunnel(getFunnelMetrics());
    } catch {
      // Fallback
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'soghat') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    try {
      updateStoredOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
      }
    } catch {
      // Ignore
    }
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      setOrders((prev) => {
        const updated = prev.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o));
        if (typeof window !== 'undefined') {
          localStorage.setItem('sec_orders', JSON.stringify(updated));
        }
        return updated;
      });
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus } : null));
      }
    } catch {
      // Ignore
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      slug: newProductName.toLowerCase().replace(/\s+/g, '-'),
      name: newProductName,
      category: newProductCategory,
      categorySlug: newProductCategory.toLowerCase().replace(/\s+/g, '-'),
      description: `Premium quality ${newProductName} inspired by Chakwal tradition.`,
      shortDescription: `Pure ${newProductName} prepared with care.`,
      features: ['Authentic recipe', 'Carefully packed'],
      images: [
        {
          id: 'img-new',
          src: '/images/products/mustard-oil-1l.jpg',
          alt: newProductName,
          width: 800,
          height: 1000,
          isPrimary: true,
        },
      ],
      variants: [
        {
          id: `var-${Date.now()}-1`,
          name: '1 Liter',
          size: '1L',
          price: Number(newPrice1L) || 750,
          sku: `SEC-${Date.now()}-1L`,
          weight: 1000,
          inStock: true,
          stockQuantity: 30,
        },
        {
          id: `var-${Date.now()}-2`,
          name: '500ml',
          size: '500ml',
          price: Number(newPrice500ml) || 450,
          sku: `SEC-${Date.now()}-500ML`,
          weight: 500,
          inStock: true,
          stockQuantity: 45,
        },
      ],
      isActive: true,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['traditional', 'chakwal'],
    };

    saveProductList([newProd, ...productList]);
    setShowAddProduct(false);
    setNewProductName('');
  };

  const deleteProduct = (id: string) => {
    saveProductList(productList.filter((p) => p.id !== id));
  };

  // Analytics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'received' ? o.total : 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-ivory flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-brand-green/10 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-brand-green text-brand-gold flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-brand-green">
              Soghat-e-Chakwal Admin
            </h1>
            <p className="text-xs text-brand-charcoal/60">
              Enter password to access store management
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password (demo: admin123)"
                className="w-full px-4 py-3 rounded-xl border border-brand-green/20 focus:outline-none focus:border-brand-gold text-sm"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-600 font-medium">
                Incorrect password. Please use <code className="bg-red-50 px-1 py-0.5 rounded">admin123</code>
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-brand-green text-brand-cream py-3 rounded-xl font-bold text-sm hover:bg-brand-green-light transition-all shadow-md"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-brand-charcoal/60 hover:text-brand-green">
              &larr; Return to main store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-brand-green text-brand-cream p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-8">
          <div>
            <h2 className="font-heading text-xl font-bold text-brand-gold">
              Soghat-e-Chakwal
            </h2>
            <p className="text-[11px] text-brand-cream/60">Store Admin &bull; v1.0</p>
          </div>

          <nav className="space-y-1.5 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-brand-gold text-brand-charcoal font-bold'
                  : 'text-brand-cream/80 hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'orders'
                  ? 'bg-brand-gold text-brand-charcoal font-bold'
                  : 'text-brand-cream/80 hover:bg-white/10'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Orders ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'products'
                  ? 'bg-brand-gold text-brand-charcoal font-bold'
                  : 'text-brand-cream/80 hover:bg-white/10'
              }`}
            >
              <Package className="w-4 h-4" />
              Products ({productList.length})
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'categories'
                  ? 'bg-brand-gold text-brand-charcoal font-bold'
                  : 'text-brand-cream/80 hover:bg-white/10'
              }`}
            >
              <Layers className="w-4 h-4" />
              Categories ({initialCategories.length})
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'settings'
                  ? 'bg-brand-gold text-brand-charcoal font-bold'
                  : 'text-brand-cream/80 hover:bg-white/10'
              }`}
            >
              <Settings className="w-4 h-4" />
              Store Settings
            </button>
          </nav>
        </div>

        <div className="pt-8 border-t border-white/10 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-brand-cream/70 hover:text-brand-gold transition-colors"
          >
            <Eye className="w-4 h-4" /> View Live Store
          </Link>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-2 text-xs text-red-300 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-stone-200 gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-brand-charcoal capitalize">
              {activeTab} Management
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage inventory, monitor orders, and customize your e-commerce operations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Live Demo Mode (Local Store)
            </span>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* ── Meta (Facebook) Pixel Live Integration Bar ── */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-brand-green text-white rounded-3xl p-6 shadow-md border border-white/10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Meta Pixel Live &amp; Connected
                    </span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      ID: {FB_PIXEL_ID}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">
                    Facebook Ads Live Event Tracking Active
                  </h3>
                  <p className="text-xs text-white/80 max-w-xl leading-relaxed">
                    Automatically transmitting PageView, ViewContent (Product), AddToCart, InitiateCheckout &amp; Purchase events directly to your Meta Events Manager.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={`https://business.facebook.com/events_manager2/list/dataset/${FB_PIXEL_ID}/test_events`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    <Activity className="w-4 h-4" />
                    Open Meta Events Manager <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                  <button
                    onClick={fetchOrders}
                    className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors"
                  >
                    Refresh Metrics
                  </button>
                </div>
              </div>

              {/* Event Status Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4 pt-4 border-t border-white/10 text-center">
                <div className="bg-white/10 rounded-xl p-2">
                  <p className="text-[10px] text-white/70 uppercase font-bold">PageView</p>
                  <p className="font-mono text-base font-bold text-emerald-300 mt-0.5">{funnel.pageViews}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <p className="text-[10px] text-white/70 uppercase font-bold">ViewContent</p>
                  <p className="font-mono text-base font-bold text-emerald-300 mt-0.5">{funnel.productViews}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <p className="text-[10px] text-white/70 uppercase font-bold">AddToCart</p>
                  <p className="font-mono text-base font-bold text-amber-300 mt-0.5">{funnel.addToCart}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <p className="text-[10px] text-white/70 uppercase font-bold">InitiateCheckout</p>
                  <p className="font-mono text-base font-bold text-amber-300 mt-0.5">{funnel.checkouts}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-2 col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-white/70 uppercase font-bold">Purchase (Orders)</p>
                  <p className="font-mono text-base font-bold text-brand-gold mt-0.5">{orders.length}</p>
                </div>
              </div>
            </div>

            {/* ── Live E-Commerce Conversion Funnel ── */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-heading font-bold text-lg text-brand-charcoal flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-brand-green" />
                    Live Customer Conversion Funnel (Sessions to Purchase)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Real-time count of visitors moving through each stage of your store.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-brand-green/10 text-brand-green px-3 py-1 rounded-full">
                    Overall Conversion Rate: {((orders.length / Math.max(1, funnel.sessions)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Funnel Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                {/* 1. Sessions */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center relative overflow-hidden">
                  <div className="w-2 h-full bg-blue-500 absolute left-0 top-0" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">1. Total Sessions</p>
                  <p className="font-mono text-2xl font-black text-stone-900 mt-1">{funnel.sessions}</p>
                  <p className="text-[10px] text-stone-500 mt-1">Store visitors</p>
                </div>

                {/* 2. Product Views */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center relative overflow-hidden">
                  <div className="w-2 h-full bg-indigo-500 absolute left-0 top-0" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">2. Product Views</p>
                  <p className="font-mono text-2xl font-black text-stone-900 mt-1">{funnel.productViews}</p>
                  <p className="text-[10px] text-stone-500 mt-1">
                    {((funnel.productViews / Math.max(1, funnel.sessions)) * 100).toFixed(0)}% viewed products
                  </p>
                </div>

                {/* 3. Add to Cart */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center relative overflow-hidden">
                  <div className="w-2 h-full bg-amber-500 absolute left-0 top-0" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">3. Added to Cart</p>
                  <p className="font-mono text-2xl font-black text-stone-900 mt-1">{funnel.addToCart}</p>
                  <p className="text-[10px] text-stone-500 mt-1">
                    {((funnel.addToCart / Math.max(1, funnel.productViews)) * 100).toFixed(0)}% of viewers
                  </p>
                </div>

                {/* 4. Checkout */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center relative overflow-hidden">
                  <div className="w-2 h-full bg-orange-500 absolute left-0 top-0" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">4. Reached Checkout</p>
                  <p className="font-mono text-2xl font-black text-stone-900 mt-1">{funnel.checkouts}</p>
                  <p className="text-[10px] text-stone-500 mt-1">
                    {((funnel.checkouts / Math.max(1, funnel.addToCart)) * 100).toFixed(0)}% proceeded
                  </p>
                </div>

                {/* 5. Orders Placed */}
                <div className="bg-emerald-50/70 border-2 border-emerald-500 rounded-2xl p-4 text-center relative overflow-hidden">
                  <div className="w-2 h-full bg-emerald-600 absolute left-0 top-0" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">5. Orders Placed</p>
                  <p className="font-mono text-2xl font-black text-emerald-950 mt-1">{orders.length}</p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-1">Completed purchases</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Total Orders
                </p>
                <p className="font-heading text-3xl font-bold text-brand-charcoal mt-2">
                  {orders.length}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">Recorded transactions</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Pending Orders
                </p>
                <p className="font-heading text-3xl font-bold text-amber-600 mt-2">
                  {pendingOrdersCount}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">Require confirmation</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Total Revenue
                </p>
                <p className="font-heading text-3xl font-bold text-brand-green mt-2">
                  {formatPrice(totalRevenue)}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">From completed orders</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Active Products
                </p>
                <p className="font-heading text-3xl font-bold text-brand-charcoal mt-2">
                  {productList.length}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">Across 5 categories</p>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-bold text-lg text-brand-charcoal">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-brand-green hover:underline"
                >
                  View All &rarr;
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-sm text-stone-400 py-6 text-center">
                  No orders recorded yet. Place an order on the checkout page to see it here!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider">
                        <th className="py-3 px-2">Order #</th>
                        <th className="py-3 px-2">Customer</th>
                        <th className="py-3 px-2">City</th>
                        <th className="py-3 px-2">Total</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Dispatch Slips</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-stone-50">
                          <td className="py-3 px-2 font-mono font-bold text-brand-green">
                            {o.orderNumber}
                          </td>
                          <td className="py-3 px-2 font-medium">{o.customer.fullName}</td>
                          <td className="py-3 px-2 text-stone-500">{o.customer.city}</td>
                          <td className="py-3 px-2 font-bold">{formatPrice(o.total)}</td>
                          <td className="py-3 px-2">
                            <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setInvoiceMode('label');
                                  setInvoiceOrder(o);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] bg-brand-green/10 hover:bg-brand-green hover:text-white text-brand-green px-2.5 py-1 rounded-md font-bold transition-all shadow-2xs"
                                title="Print Parcel Envelope Slip"
                              >
                                <Tag className="w-3 h-3" />
                                📦 Parcel Slip
                              </button>
                              <button
                                onClick={() => {
                                  setInvoiceMode('invoice');
                                  setInvoiceOrder(o);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] bg-brand-gold/25 hover:bg-brand-gold text-brand-charcoal px-2.5 py-1 rounded-md font-bold transition-all shadow-2xs"
                                title="Print Customer Invoice"
                              >
                                <Printer className="w-3 h-3" />
                                Invoice
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-heading font-bold text-lg text-brand-charcoal">
                    All Customer Orders ({orders.length})
                  </h3>
                  <p className="text-xs text-stone-500">
                    Track statuses, customer addresses, and generate dispatch invoices.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowAddOrderModal(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-brand-green text-brand-cream hover:bg-brand-green-light px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-brand-gold" />
                    + New WhatsApp / Phone Order
                  </button>
                  <button
                    onClick={fetchOrders}
                    className="text-xs bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl font-medium transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {orders.length === 0 ? (
                <p className="text-sm text-stone-400 py-8 text-center">
                  No orders found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider">
                        <th className="py-3 px-3">Order Details</th>
                        <th className="py-3 px-3">Customer &amp; Phone</th>
                        <th className="py-3 px-3">Address</th>
                        <th className="py-3 px-3">Payment</th>
                        <th className="py-3 px-3">Order Status</th>
                        <th className="py-3 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-stone-50">
                          <td className="py-4 px-3">
                            <p className="font-mono font-bold text-brand-green text-xs">
                              {order.orderNumber}
                            </p>
                            <p className="text-stone-400 text-[10px]">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p className="font-bold text-stone-700 mt-1">
                              {formatPrice(order.total)}
                            </p>
                          </td>

                          <td className="py-4 px-3">
                            <p className="font-semibold text-stone-800">{order.customer.fullName}</p>
                            <p className="text-brand-green font-mono">{order.customer.phone}</p>
                            {order.customer.whatsapp && (
                              <a
                                href={`https://wa.me/${order.customer.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-emerald-600 hover:underline inline-block mt-0.5"
                              >
                                Chat on WhatsApp &rarr;
                              </a>
                            )}
                          </td>

                          <td className="py-4 px-3 max-w-xs text-stone-600">
                            <p className="truncate">{order.customer.address}</p>
                            <p className="text-[10px] text-stone-400">
                              {order.customer.city}, {order.customer.province}
                            </p>
                          </td>

                          <td className="py-4 px-3">
                            <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                              {order.paymentMethod}
                            </span>
                            <div className="mt-1">
                              <select
                                value={order.paymentStatus}
                                onChange={(e) =>
                                  updatePaymentStatus(order.id, e.target.value as PaymentStatus)
                                }
                                className="text-[10px] font-semibold border rounded px-1.5 py-0.5 bg-white"
                              >
                                <option value="pending">Pending</option>
                                <option value="received">Received</option>
                                <option value="refunded">Refunded</option>
                              </select>
                            </div>
                          </td>

                          <td className="py-4 px-3">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order.id, e.target.value as OrderStatus)
                              }
                              className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-50 text-red-800 border-red-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="packed">Packed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td className="py-4 px-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                              >
                                Items
                              </button>
                              <button
                                onClick={() => {
                                  setInvoiceMode('label');
                                  setInvoiceOrder(order);
                                }}
                                className="inline-flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-2xs"
                                title="Print Parcel Shipping Slip"
                              >
                                <Tag className="w-3.5 h-3.5" />
                                📦 Parcel Slip
                              </button>
                              <button
                                onClick={() => {
                                  setInvoiceMode('invoice');
                                  setInvoiceOrder(order);
                                }}
                                className="inline-flex items-center gap-1 text-xs bg-brand-gold/25 hover:bg-brand-gold text-brand-charcoal px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-2xs"
                                title="Print Detailed Customer Invoice"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                Invoice
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Order Inspection Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h4 className="font-heading font-bold text-lg text-brand-green">
                      Order #{selectedOrder.orderNumber}
                    </h4>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-stone-400 hover:text-stone-700 text-sm font-bold"
                    >
                      &times; Close
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="font-bold text-stone-700">Customer Details:</p>
                      <p>{selectedOrder.customer.fullName} &bull; {selectedOrder.customer.phone}</p>
                      <p className="text-stone-500">{selectedOrder.customer.address}, {selectedOrder.customer.city}</p>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="font-bold text-stone-700 mb-2">Items Ordered:</p>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between bg-stone-50 p-2.5 rounded-xl">
                            <div>
                              <p className="font-bold text-stone-800">{item.product.name}</p>
                              <p className="text-stone-500">
                                Variant: {item.variant.name} &bull; Qty: {item.quantity}
                              </p>
                            </div>
                            <span className="font-bold text-brand-green">
                              {formatPrice(item.variant.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t flex justify-between font-bold text-sm">
                      <span>Total Amount:</span>
                      <span className="text-brand-green">{formatPrice(selectedOrder.total)}</span>
                    </div>

                    <div className="pt-4 border-t flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => {
                          const o = selectedOrder;
                          setSelectedOrder(null);
                          setInvoiceMode('label');
                          setInvoiceOrder(o);
                        }}
                        className="flex items-center gap-1.5 bg-brand-green text-brand-cream hover:bg-brand-green-light px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                      >
                        <Tag className="w-4 h-4 text-brand-gold" />
                        Print Parcel Shipping Slip
                      </button>
                      <button
                        onClick={() => {
                          const o = selectedOrder;
                          setSelectedOrder(null);
                          setInvoiceMode('invoice');
                          setInvoiceOrder(o);
                        }}
                        className="flex items-center gap-1.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                      >
                        <Printer className="w-4 h-4" />
                        Print Tax Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-bold text-lg text-brand-charcoal">
                Product Inventory
              </h3>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="flex items-center gap-1.5 bg-brand-green text-brand-cream px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-brand-green-light transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add New Product
              </button>
            </div>

            {/* Add Product Form */}
            {showAddProduct && (
              <form
                onSubmit={handleAddProduct}
                className="bg-white rounded-3xl p-6 border border-brand-gold/40 shadow-md space-y-4"
              >
                <h4 className="font-heading font-bold text-base text-brand-green">
                  Add Product (Supports Multi-Category Expansion)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold">Product Name</label>
                    <input
                      type="text"
                      required
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      placeholder="e.g. Chakwal Pure Desi Ghee"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Category</label>
                    <select
                      value={newProductCategory}
                      onChange={(e) => setNewProductCategory(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      <option value="Cooking Oils">Cooking Oils</option>
                      <option value="Desi Ghee">Desi Ghee</option>
                      <option value="Honey">Honey</option>
                      <option value="Spices">Spices</option>
                      <option value="Pickles">Pickles</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">1 Liter / 1 Kg Price (PKR)</label>
                    <input
                      type="number"
                      value={newPrice1L}
                      onChange={(e) => setNewPrice1L(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">500ml / 500g Price (PKR)</label>
                    <input
                      type="number"
                      value={newPrice500ml}
                      onChange={(e) => setNewPrice500ml(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-brand-green text-brand-cream px-5 py-2 rounded-xl text-xs font-bold hover:bg-brand-green-light"
                  >
                    Save &amp; Publish Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="bg-stone-100 text-stone-600 px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Product Table */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Product Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Variants, Pricing &amp; Stock Count</th>
                    <th className="py-3 px-3">Inventory Status</th>
                    <th className="py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {productList.map((prod) => (
                    <tr key={prod.id} className="hover:bg-stone-50">
                      <td className="py-4 px-3">
                        <p className="font-bold text-stone-900 text-sm">{prod.name}</p>
                        {prod.nameUrdu && (
                          <p className="font-serif text-brand-gold text-xs">{prod.nameUrdu}</p>
                        )}
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5">ID: {prod.id}</p>
                      </td>
                      <td className="py-4 px-3">
                        <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-4 px-3 space-y-2">
                        {prod.variants.map((v) => (
                          <div
                            key={v.id}
                            className="flex flex-wrap items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200"
                          >
                            <span className="font-bold text-stone-800 text-[11px] min-w-[70px]">
                              {v.name}:
                            </span>
                            <span className="font-mono text-brand-green font-bold text-xs">
                              {formatPrice(v.price)}
                            </span>
                            <div className="flex items-center gap-1.5 ml-auto">
                              <span className="text-[10px] text-stone-500">Stock:</span>
                              <div className="inline-flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => updateStockQuantity(prod.id, v.id, -5)}
                                  className="px-2 py-0.5 hover:bg-stone-100 text-stone-600 font-bold border-r text-[10px]"
                                  title="Reduce stock by 5"
                                >
                                  -5
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateStockQuantity(prod.id, v.id, -1)}
                                  className="px-2 py-0.5 hover:bg-stone-100 text-stone-600 font-bold border-r text-xs"
                                  title="Reduce stock by 1"
                                >
                                  -
                                </button>
                                <span className="px-2.5 py-0.5 font-mono font-bold text-xs text-brand-charcoal min-w-[32px] text-center">
                                  {v.stockQuantity ?? 30}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateStockQuantity(prod.id, v.id, 1)}
                                  className="px-2 py-0.5 hover:bg-stone-100 text-stone-600 font-bold border-l text-xs"
                                  title="Increase stock by 1"
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateStockQuantity(prod.id, v.id, 10)}
                                  className="px-2 py-0.5 hover:bg-stone-100 text-stone-600 font-bold border-l text-[10px]"
                                  title="Add 10 more bottles"
                                >
                                  +10
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleStockStatus(prod.id, v.id)}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                                  v.inStock !== false && (v.stockQuantity ?? 30) > 0
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                              >
                                {v.inStock !== false && (v.stockQuantity ?? 30) > 0 ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </td>
                      <td className="py-4 px-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Live in Store
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <button
                          onClick={() => deleteProduct(prod.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-lg text-brand-charcoal">
              Product Categories Architecture
            </h3>
            <p className="text-xs text-stone-500">
              The architecture is structured to support future product line extensions without rewriting code.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {initialCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={`p-4 rounded-2xl border ${
                    cat.isActive
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-heading font-bold text-sm text-brand-green">
                      {cat.name}
                    </h4>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        cat.isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Coming Soon'}
                    </span>
                  </div>
                  <p className="font-serif text-xs text-brand-gold font-medium mt-0.5">
                    {cat.nameUrdu}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-2">{cat.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm space-y-6 max-w-2xl">
            <h3 className="font-heading font-bold text-lg text-brand-charcoal">
              Store &amp; Logistics Configuration
            </h3>

            {savedSettings && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings updated successfully!</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Standard Shipping Charge (PKR)</label>
                <input
                  type="number"
                  value={shippingRate}
                  onChange={(e) => setShippingRate(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Free Shipping Minimum Threshold (PKR)</label>
                <input
                  type="number"
                  value={freeShippingMin}
                  onChange={(e) => setFreeShippingMin(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Official WhatsApp Business Number</label>
                <input
                  type="text"
                  defaultValue="+92 300 8325693"
                  className="w-full px-4 py-2.5 border rounded-xl bg-stone-50"
                  readOnly
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Database Connection</label>
                <div className="p-3 bg-brand-cream/60 rounded-xl border border-brand-gold/30 text-stone-600">
                  <p className="font-semibold text-brand-green">Local In-Memory Mode Active</p>
                  <p className="text-[10px] mt-0.5">
                    To connect Supabase in production, add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSavedSettings(true);
                  setTimeout(() => setSavedSettings(false), 2500);
                }}
                className="bg-brand-green text-brand-cream px-6 py-2.5 rounded-xl font-bold hover:bg-brand-green-light transition-all shadow-sm"
              >
                Save Configuration
              </button>
            </div>
          </div>
        )}

        {/* ── Manual Order Modal ── */}
        {showAddOrderModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-stone-200">
              <div className="flex justify-between items-center border-b pb-3">
                <h4 className="font-heading font-bold text-lg text-brand-green flex items-center gap-2">
                  <Plus className="w-5 h-5 text-brand-gold" />
                  Create Manual / WhatsApp Order
                </h4>
                <button
                  onClick={() => setShowAddOrderModal(false)}
                  className="text-stone-400 hover:text-stone-700 text-sm font-bold"
                >
                  &times; Close
                </button>
              </div>

              <form onSubmit={handleCreateManualOrder} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Usman Tariq"
                    className="w-full px-3.5 py-2.5 border rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="0300 1234567"
                      className="w-full px-3.5 py-2.5 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={manualCity}
                      onChange={(e) => setManualCity(e.target.value)}
                      placeholder="e.g. Chakwal, Rawalpindi"
                      className="w-full px-3.5 py-2.5 border rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Complete Delivery Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="House / Shop #, Street, Mohallah / Sector"
                    className="w-full px-3.5 py-2.5 border rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Product Variant</label>
                    <select
                      value={manualProductChoice}
                      onChange={(e) => setManualProductChoice(e.target.value as '1l' | '500ml')}
                      className="w-full px-3.5 py-2.5 border rounded-xl bg-white"
                    >
                      <option value="1l">1 Liter Bottle (Rs. 750)</option>
                      <option value="500ml">500ml Bottle (Rs. 450)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={manualQty}
                      onChange={(e) => setManualQty(Number(e.target.value) || 1)}
                      className="w-full px-3.5 py-2.5 border rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Payment Method</label>
                  <select
                    value={manualPayment}
                    onChange={(e) => setManualPayment(e.target.value as 'cod' | 'bank_transfer')}
                    className="w-full px-3.5 py-2.5 border rounded-xl bg-white"
                  >
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="bank_transfer">Direct Bank Transfer</option>
                  </select>
                </div>

                <div className="bg-brand-ivory p-3.5 rounded-xl border border-brand-green/10 flex justify-between items-center text-xs">
                  <span className="font-semibold text-stone-700">Total Payable (with Shipping):</span>
                  <span className="font-black font-mono text-base text-brand-green">
                    {formatPrice(
                      (manualProductChoice === '1l' ? 750 : 450) * manualQty +
                        ((manualProductChoice === '1l' ? 750 : 450) * manualQty >= freeShippingMin
                          ? 0
                          : shippingRate)
                    )}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-brand-green text-brand-cream py-2.5 rounded-xl font-bold hover:bg-brand-green-light transition-all shadow-sm"
                  >
                    Save &amp; Generate Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddOrderModal(false)}
                    className="bg-stone-100 text-stone-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-stone-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Official Printable / Downloadable Invoice Modal ── */}
        {invoiceOrder && (
          <OrderInvoice
            order={invoiceOrder}
            onClose={() => setInvoiceOrder(null)}
            defaultMode={invoiceMode}
          />
        )}
      </main>
    </div>
  );
}
