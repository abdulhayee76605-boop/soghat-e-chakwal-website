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
  RotateCcw,
  CheckCircle,
  Check,
  Copy,
  FileDown,
  AlertTriangle,
  MessageCircle,
  Send,
  Bell,
  Mail,
  Edit3,
  DollarSign,
  Receipt,
  Calendar,
  PieChart,
  FileSpreadsheet,
  TrendingDown,
  X,
} from 'lucide-react';
import {
  Product,
  Order,
  OrderStatus,
  PaymentStatus,
  CartItem,
  ProductVariant,
  ExpenseEntry,
  ExpenseCategory,
  FinancialSettings,
  MonthlyFinancialReport,
} from '@/lib/types';
import {
  getStoredExpenses,
  saveStoredExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  clearAllExpenses,
  fetchServerExpenses,
  getStoredFinancialSettings,
  saveFinancialSettings,
  calculateMonthlyReport,
  getAvailableMonths,
  defaultFinancialSettings,
  generateMonthlyReportCSV,
  getVariantPackagingCost,
} from '@/lib/finances';
import { MonthlyReportModal } from '@/components/admin/MonthlyReportModal';
import { products as initialProducts, categories as initialCategories } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/lib/config';
import {
  getStoredOrders,
  fetchServerOrders,
  updateStoredOrderStatus,
  updateStoredPaymentStatus,
  saveNewOrder,
  getSamplePreviewOrder,
  clearStoredOrders,
} from '@/lib/orders-db';
import { OrderInvoice } from '@/components/admin/OrderInvoice';
import { getFunnelMetrics, fetchServerFunnel, resetFunnelMetrics, FunnelMetrics } from '@/lib/analytics';
import { FB_PIXEL_ID } from '@/lib/pixel';
import { triggerNotificationDispatch, getCustomerWhatsAppUrl } from '@/lib/notifications';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'categories' | 'wholesale' | 'reports' | 'settings'>('overview');

  // Financial & Expense States (P&L, Wholesale, Ad Costs, Packaging, Delivery)
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [finSettings, setFinSettings] = useState<FinancialSettings>(defaultFinancialSettings);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7));
  const [costSubTab, setCostSubTab] = useState<'wholesale' | 'packaging' | 'auto_calc'>('wholesale');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showMonthlyStatementModal, setShowMonthlyStatementModal] = useState(false);
  const [showFinSettingsModal, setShowFinSettingsModal] = useState(false);

  // New / Edit expense form fields
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);
  const [newExpenseCategory, setNewExpenseCategory] = useState<ExpenseCategory>('ads');
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseDate, setNewExpenseDate] = useState(new Date().toISOString().substring(0, 10));
  const [newExpenseNotes, setNewExpenseNotes] = useState('');

  // Per-Month Wholesale Purchase Cost inputs (oil bought per liter & 500ml in that month)
  const [monthCost1L, setMonthCost1L] = useState<string>('480');
  const [monthCost500ml, setMonthCost500ml] = useState<string>('240');

  // Add Product Wholesale Cost fields (catalog defaults)
  const [newCost1L, setNewCost1L] = useState('480');
  const [newCost500ml, setNewCost500ml] = useState('240');

  // State data
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [invoiceMode, setInvoiceMode] = useState<'label' | 'invoice'>('label');
  const [invoiceEditMode, setInvoiceEditMode] = useState<boolean>(false);
  const [funnel, setFunnel] = useState<FunnelMetrics>(getFunnelMetrics());

  // Manual / Custom WhatsApp Order Creation State
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualCity, setManualCity] = useState('Chakwal');
  const [manualAddress, setManualAddress] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualItems, setManualItems] = useState<
    { id: string; variantChoice: string; customPrice: number; qty: number }[]
  >([{ id: 'item-1', variantChoice: 'var-1l', customPrice: 700, qty: 1 }]);
  const [manualShippingMode, setManualShippingMode] = useState<'standard' | 'free' | 'custom'>('standard');
  const [manualCustomShipping, setManualCustomShipping] = useState<number>(0);
  const [manualDiscount, setManualDiscount] = useState<number>(0);
  const [manualPayment, setManualPayment] = useState<'cod' | 'bank_transfer'>('cod');
  const [manualPaymentStatus, setManualPaymentStatus] = useState<PaymentStatus>('pending');

  // Form states
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Cooking Oils');
  const [newPrice1L, setNewPrice1L] = useState('700');
  const [newPrice500ml, setNewPrice500ml] = useState('350');

  // Config state
  const [shippingRate, setShippingRate] = useState(siteConfig.shippingCharge);
  const [freeShippingMin, setFreeShippingMin] = useState(siteConfig.freeShippingThreshold || 2100);
  const [savedSettings, setSavedSettings] = useState(false);

  // Diagnostic & Toast States
  const [pixelStatus, setPixelStatus] = useState<'testing' | 'active' | 'blocked' | null>(null);
  const [resetToast, setResetToast] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Notification Test States
  const [testNotifEmail, setTestNotifEmail] = useState('');
  const [testNotifPhone, setTestNotifPhone] = useState('03001234567');
  const [testNotifStatus, setTestNotifStatus] = useState<string | null>(null);
  const [testNotifLoading, setTestNotifLoading] = useState(false);

  const handleSendTestNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestNotifLoading(true);
    setTestNotifStatus(null);
    try {
      const sample = getSamplePreviewOrder();
      sample.customer.email = testNotifEmail || undefined;
      sample.customer.phone = testNotifPhone;
      sample.customer.whatsapp = testNotifPhone;

      const res = await triggerNotificationDispatch(sample, 'confirmed');
      if (res && res.success) {
        const logs = res.results?.logs?.join(' | ') || 'Dispatched';
        setTestNotifStatus(`Test dispatched: ${logs}`);
      } else {
        setTestNotifStatus(`Result: ${res?.error || 'Dispatched test'}`);
      }
    } catch {
      setTestNotifStatus('Test notification request finished');
    } finally {
      setTestNotifLoading(false);
    }
  };

  const handleTestPixel = () => {
    if (typeof window !== 'undefined' && typeof (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq === 'function') {
      try {
        (window as unknown as { fbq: (...args: unknown[]) => void }).fbq('trackCustom', 'TestEventFromAdmin', {
          adminUser: true,
          time: new Date().toISOString(),
        });
        setPixelStatus('active');
        setTimeout(() => setPixelStatus(null), 4500);
      } catch {
        setPixelStatus('blocked');
        setTimeout(() => setPixelStatus(null), 5000);
      }
    } else {
      setPixelStatus('blocked');
      setTimeout(() => setPixelStatus(null), 5000);
    }
  };

  const handleResetData = () => {
    if (confirm('Kya aap waqai sara purana fake/cached data delete kar ke live counters 0 par reset karna chahte hain?')) {
      clearStoredOrders();
      resetFunnelMetrics();
      setOrders([]);
      setFunnel(getFunnelMetrics());
      setResetToast(true);
      setTimeout(() => setResetToast(false), 3500);
    }
  };

  const handlePreviewSampleSlip = () => {
    setInvoiceMode('label');
    setInvoiceOrder(getSamplePreviewOrder());
  };

  const handleCopyOrderCourierText = (order: Order) => {
    const text = `=============================
📦 SOGHAT-E-CHAKWAL PARCEL SLIP
=============================
Order ID: ${order.orderNumber}
Name: ${order.customer.fullName}
Phone: ${order.customer.phone}
Address: ${order.customer.address}
City: ${order.customer.city.toUpperCase()}
Amount: ${order.paymentMethod === 'cod' ? `Rs. ${order.total.toLocaleString()} (Cash on Delivery)` : 'Rs. 0 (Already Paid)'}
Return: Soghat-e-Chakwal, Shop MC33, Street 1, Ghauri Town, Phase 7, Islamabad (0300-8325693)
=============================`;
    navigator.clipboard.writeText(text);
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  // Load orders & persistent products
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Auto purge old fake data on startup
        const rawOrders = localStorage.getItem('sec_orders');
        if (rawOrders && (rawOrders.includes('Ahmad Khan') || rawOrders.includes('SEC-DEMO-') || rawOrders.includes('ord-seed-'))) {
          localStorage.removeItem('sec_orders');
        }
        if (localStorage.getItem('sec_analytics_funnel')) {
          localStorage.removeItem('sec_analytics_funnel');
        }

        const storedProds = localStorage.getItem('sec_products');
        if (storedProds) {
          try {
            const parsed = JSON.parse(storedProds) as Product[];
            const existingIds = new Set(parsed.map((p) => p.id));
            const missingSeed = initialProducts.filter((p) => !existingIds.has(p.id));
            const merged = [...parsed, ...missingSeed];
            setProductList(merged);
            localStorage.setItem('sec_products', JSON.stringify(merged));
          } catch {
            setProductList(initialProducts);
          }
        } else {
          setProductList(initialProducts);
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

  const handleAddManualItemRow = () => {
    const firstVariantId = productList[0]?.variants[0]?.id || 'var-1l';
    const firstVariantPrice = productList[0]?.variants[0]?.price || 700;
    setManualItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        variantChoice: firstVariantId,
        customPrice: firstVariantPrice,
        qty: 1,
      },
    ]);
  };

  const handleRemoveManualItemRow = (id: string) => {
    if (manualItems.length <= 1) return;
    setManualItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateManualItem = (
    id: string,
    field: 'variantChoice' | 'customPrice' | 'qty',
    value: string | number
  ) => {
    setManualItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (field === 'variantChoice') {
            const choiceStr = String(value);
            let autoPrice = 700;
            for (const p of productList) {
              const matched = p.variants.find((v) => v.id === choiceStr);
              if (matched) {
                autoPrice = matched.price;
                break;
              }
            }
            if (choiceStr === '1l') autoPrice = 700;
            if (choiceStr === '500ml') autoPrice = 350;
            return { ...item, variantChoice: choiceStr, customPrice: autoPrice };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Computed live financial totals for the manual order modal
  const computedManualSubtotal = manualItems.reduce(
    (sum, item) => sum + (Number(item.customPrice) || 0) * (Number(item.qty) || 1),
    0
  );
  const computedManualLiters = manualItems.reduce(
    (sum, item) => {
      const is1L = item.variantChoice.includes('1l') || item.variantChoice === 'var-1l' || item.variantChoice === '1l';
      const is500 = item.variantChoice.includes('500') || item.variantChoice === 'var-500ml' || item.variantChoice === '500ml';
      const unitFactor = is1L ? 1 : is500 ? 0.5 : 1;
      return sum + unitFactor * (Number(item.qty) || 1);
    },
    0
  );
  const computedManualDiscount = Math.max(0, Number(manualDiscount) || 0);
  const computedManualShipping =
    manualShippingMode === 'free'
      ? 0
      : manualShippingMode === 'custom'
      ? Math.max(0, Number(manualCustomShipping) || 0)
      : (computedManualLiters >= 3 || computedManualSubtotal >= freeShippingMin ? 0 : shippingRate);
  const computedManualTotal = Math.max(0, computedManualSubtotal - computedManualDiscount) + computedManualShipping;

  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim() || !manualAddress.trim()) {
      alert('Please fill customer full name, phone and complete delivery address.');
      return;
    }

    let subtotal = 0;
    let totalLiters = 0;

    const cartItems: CartItem[] = manualItems.map((item, idx) => {
      let targetProd = productList[0];
      let targetVariant = targetProd.variants[0];

      for (const p of productList) {
        const foundV = p.variants.find((v) => v.id === item.variantChoice);
        if (foundV) {
          targetProd = p;
          targetVariant = foundV;
          break;
        }
      }

      if (item.variantChoice === '1l') {
        targetProd = productList.find((p) => p.slug.includes('1-liter')) || productList[0];
        targetVariant = targetProd.variants[0];
      } else if (item.variantChoice === '500ml') {
        targetProd = productList.find((p) => p.slug.includes('500ml')) || productList[1] || productList[0];
        targetVariant = targetProd.variants[0];
      }

      const customUnitPrice = Math.max(0, Number(item.customPrice) || targetVariant.price);
      const qty = Math.max(1, Number(item.qty) || 1);

      subtotal += customUnitPrice * qty;

      const is1L = targetVariant.size?.toLowerCase().includes('1l') || targetVariant.name.includes('1 Liter');
      const is500 = targetVariant.size?.toLowerCase().includes('500') || targetVariant.name.includes('500');
      totalLiters += (is1L ? 1 : is500 ? 0.5 : 1) * qty;

      const variant: ProductVariant = {
        ...targetVariant,
        id: `custom-var-${idx}-${Date.now()}`,
        price: customUnitPrice,
      };

      return {
        productId: targetProd.id,
        variantId: variant.id,
        quantity: qty,
        product: targetProd,
        variant,
      };
    });

    const discountAmount = Math.max(0, Number(manualDiscount) || 0);
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);

    let shippingFee = 0;
    if (manualShippingMode === 'free') {
      shippingFee = 0;
    } else if (manualShippingMode === 'custom') {
      shippingFee = Math.max(0, Number(manualCustomShipping) || 0);
    } else {
      shippingFee = (totalLiters >= 3 || subtotal >= freeShippingMin) ? 0 : shippingRate;
    }

    const total = discountedSubtotal + shippingFee;

    const newOrder = saveNewOrder({
      items: cartItems,
      customer: {
        fullName: manualName.trim(),
        phone: manualPhone.trim(),
        whatsapp: manualPhone.trim(),
        address: manualAddress.trim(),
        city: manualCity.trim() || 'Chakwal',
        province: 'Punjab',
        notes: manualNotes.trim() || undefined,
      },
      paymentMethod: manualPayment,
      subtotal,
      shipping: shippingFee,
      discount: discountAmount > 0 ? discountAmount : undefined,
      total,
      notes: manualNotes.trim() || undefined,
      source: 'whatsapp',
    });

    if (manualPaymentStatus === 'received') {
      newOrder.paymentStatus = 'received';
      updateStoredPaymentStatus(newOrder.id, 'received');
    }

    setOrders((prev) => [newOrder, ...prev]);
    setShowAddOrderModal(false);

    // Reset form fields
    setManualName('');
    setManualPhone('');
    setManualAddress('');
    setManualCity('Chakwal');
    setManualNotes('');
    setManualDiscount(0);
    setManualShippingMode('standard');
    setManualCustomShipping(0);
    setManualItems([{ id: Date.now().toString(), variantChoice: '1l', customPrice: 700, qty: 1 }]);

    // Automatically trigger notification (Email, SMS & WhatsApp)
    triggerNotificationDispatch(newOrder, 'order_placed').catch(() => {});
    setNotificationToast(`Custom WhatsApp order created for ${newOrder.customer.fullName}!`);
    setTimeout(() => setNotificationToast(null), 3500);

    // Automatically open invoice for immediate printing / PDF save
    setInvoiceOrder(newOrder);
  };

  // Load orders & finances from API & live sync
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchFinances();
      // Auto-refresh orders every 5 seconds for incoming checkouts & customer orders
      const interval = setInterval(() => {
        fetchOrders();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const serverOrders = await fetchServerOrders();
      setOrders(serverOrders);
      const serverFunnel = await fetchServerFunnel();
      setFunnel(serverFunnel);
    } catch {
      setOrders(getStoredOrders());
      setFunnel(getFunnelMetrics());
    }
  };

  const fetchFinances = async () => {
    try {
      const data = await fetchServerExpenses();
      setExpenses(data.expenses);
      setFinSettings(data.settings);
      const rate = data.settings.monthlyWholesaleRates?.[selectedMonth];
      setMonthCost1L(
        rate && typeof rate.cost1L === 'number' && rate.cost1L > 0
          ? rate.cost1L.toString()
          : (data.settings.defaultCostPrice1L || 480).toString()
      );
      setMonthCost500ml(
        rate && typeof rate.cost500ml === 'number' && rate.cost500ml > 0
          ? rate.cost500ml.toString()
          : (data.settings.defaultCostPrice500ml || 240).toString()
      );
    } catch {
      const stored = getStoredFinancialSettings();
      setExpenses(getStoredExpenses());
      setFinSettings(stored);
      const rate = stored.monthlyWholesaleRates?.[selectedMonth];
      setMonthCost1L(
        rate && typeof rate.cost1L === 'number' && rate.cost1L > 0
          ? rate.cost1L.toString()
          : (stored.defaultCostPrice1L || 480).toString()
      );
      setMonthCost500ml(
        rate && typeof rate.cost500ml === 'number' && rate.cost500ml > 0
          ? rate.cost500ml.toString()
          : (stored.defaultCostPrice500ml || 240).toString()
      );
    }
  };

  // Sync monthly wholesale purchase inputs ONLY when selectedMonth changes (never overwrite active input)
  useEffect(() => {
    const rate = finSettings.monthlyWholesaleRates?.[selectedMonth];
    setMonthCost1L(
      rate && typeof rate.cost1L === 'number' && rate.cost1L > 0
        ? rate.cost1L.toString()
        : (finSettings.defaultCostPrice1L || 480).toString()
    );
    setMonthCost500ml(
      rate && typeof rate.cost500ml === 'number' && rate.cost500ml > 0
        ? rate.cost500ml.toString()
        : (finSettings.defaultCostPrice500ml || 240).toString()
    );
  }, [selectedMonth]);

  const handleUpdate1LCost = (val: string) => {
    setMonthCost1L(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      const updatedSettings: FinancialSettings = {
        ...finSettings,
        defaultCostPrice1L: num,
        monthlyWholesaleRates: {
          ...(finSettings.monthlyWholesaleRates || {}),
          [selectedMonth]: {
            cost1L: num,
            cost500ml: Math.max(0, Number(monthCost500ml) || finSettings.defaultCostPrice500ml || 240),
          },
        },
      };
      setFinSettings(updatedSettings);
      saveFinancialSettings(updatedSettings);

      // Sync product variants (1L bottles)
      const updated = productList.map((p) => ({
        ...p,
        variants: p.variants.map((v) => {
          const is1L = v.size?.toLowerCase().includes('1l') || v.name.includes('1');
          return is1L ? { ...v, costPrice: num } : v;
        }),
      }));
      saveProductList(updated);
    }
  };

  const handleUpdate500mlCost = (val: string) => {
    setMonthCost500ml(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      const updatedSettings: FinancialSettings = {
        ...finSettings,
        defaultCostPrice500ml: num,
        monthlyWholesaleRates: {
          ...(finSettings.monthlyWholesaleRates || {}),
          [selectedMonth]: {
            cost1L: Math.max(0, Number(monthCost1L) || finSettings.defaultCostPrice1L || 480),
            cost500ml: num,
          },
        },
      };
      setFinSettings(updatedSettings);
      saveFinancialSettings(updatedSettings);

      // Sync product variants (500ml bottles)
      const updated = productList.map((p) => ({
        ...p,
        variants: p.variants.map((v) => {
          const is500 = v.size?.toLowerCase().includes('500') || v.name.includes('500');
          return is500 ? { ...v, costPrice: num } : v;
        }),
      }));
      saveProductList(updated);
    }
  };

  const handleSaveMonthWholesaleRates = () => {
    const cost1 = Math.max(0, Number(monthCost1L) || 0);
    const cost500 = Math.max(0, Number(monthCost500ml) || 0);
    const updatedSettings: FinancialSettings = {
      ...finSettings,
      defaultCostPrice1L: cost1 > 0 ? cost1 : finSettings.defaultCostPrice1L,
      defaultCostPrice500ml: cost500 > 0 ? cost500 : finSettings.defaultCostPrice500ml,
      monthlyWholesaleRates: {
        ...(finSettings.monthlyWholesaleRates || {}),
        [selectedMonth]: { cost1L: cost1, cost500ml: cost500 },
      },
    };
    setFinSettings(updatedSettings);
    saveFinancialSettings(updatedSettings);

    const updated = productList.map((p) => ({
      ...p,
      variants: p.variants.map((v) => {
        const is1L = v.size?.toLowerCase().includes('1l') || v.name.includes('1');
        return is1L ? { ...v, costPrice: cost1 } : { ...v, costPrice: cost500 };
      }),
    }));
    saveProductList(updated);

    setNotificationToast(`خریداری ریٹ محفوظ ہو گیا (1L: Rs. ${cost1}, 500ml: Rs. ${cost500})`);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  // Helper to read current wholesale rate for any variant in selectedMonth
  const getVariantWholesaleRate = (variantId: string, fallbackCost: number = 0): number => {
    const monthRate = finSettings.monthlyWholesaleRates?.[selectedMonth]?.variantRates?.[variantId];
    if (typeof monthRate === 'number' && monthRate > 0) return monthRate;

    const defaultCost = finSettings.variantCosts?.[variantId];
    if (typeof defaultCost === 'number' && defaultCost > 0) return defaultCost;

    if (variantId === 'var-1l') {
      const m1L = finSettings.monthlyWholesaleRates?.[selectedMonth]?.cost1L;
      if (typeof m1L === 'number' && m1L > 0) return m1L;
      return finSettings.defaultCostPrice1L || 480;
    }
    if (variantId === 'var-500ml') {
      const m500 = finSettings.monthlyWholesaleRates?.[selectedMonth]?.cost500ml;
      if (typeof m500 === 'number' && m500 > 0) return m500;
      return finSettings.defaultCostPrice500ml || 240;
    }

    return fallbackCost;
  };

  const getVariantDefaultCost = (variantId: string, fallbackCost: number = 0): number => {
    const defaultCost = finSettings.variantCosts?.[variantId];
    if (typeof defaultCost === 'number' && defaultCost > 0) return defaultCost;
    if (variantId === 'var-1l') return finSettings.defaultCostPrice1L || 480;
    if (variantId === 'var-500ml') return finSettings.defaultCostPrice500ml || 240;
    return fallbackCost;
  };

  // Update a variant's rate for the selected month
  const handleUpdateVariantMonthRate = (variantId: string, newRate: number) => {
    const cost = Math.max(0, newRate);
    const currentMonthVariants = finSettings.monthlyWholesaleRates?.[selectedMonth]?.variantRates || {};
    const currentDefaults = finSettings.variantCosts || {};

    const updatedSettings: FinancialSettings = {
      ...finSettings,
      variantCosts: {
        ...currentDefaults,
        [variantId]: currentDefaults[variantId] || cost,
      },
      monthlyWholesaleRates: {
        ...(finSettings.monthlyWholesaleRates || {}),
        [selectedMonth]: {
          ...(finSettings.monthlyWholesaleRates?.[selectedMonth] || {}),
          cost1L: variantId === 'var-1l' ? cost : (finSettings.monthlyWholesaleRates?.[selectedMonth]?.cost1L || finSettings.defaultCostPrice1L || 480),
          cost500ml: variantId === 'var-500ml' ? cost : (finSettings.monthlyWholesaleRates?.[selectedMonth]?.cost500ml || finSettings.defaultCostPrice500ml || 240),
          variantRates: {
            ...currentMonthVariants,
            [variantId]: cost,
          },
        },
      },
    };

    if (variantId === 'var-1l') {
      updatedSettings.defaultCostPrice1L = cost;
      setMonthCost1L(cost.toString());
    } else if (variantId === 'var-500ml') {
      updatedSettings.defaultCostPrice500ml = cost;
      setMonthCost500ml(cost.toString());
    }

    setFinSettings(updatedSettings);
    saveFinancialSettings(updatedSettings);

    // Sync productList
    const updatedProducts = productList.map((p) => ({
      ...p,
      variants: p.variants.map((v) => (v.id === variantId ? { ...v, costPrice: cost } : v)),
    }));
    saveProductList(updatedProducts);

    setNotificationToast(`خریداری ریٹ محفوظ ہو گیا: Rs. ${cost}`);
    setTimeout(() => setNotificationToast(null), 2500);
  };

  // Update a variant's permanent default rate
  const handleUpdateVariantDefaultCost = (variantId: string, newCost: number) => {
    const cost = Math.max(0, newCost);
    const updatedSettings: FinancialSettings = {
      ...finSettings,
      defaultCostPrice1L: variantId === 'var-1l' ? cost : finSettings.defaultCostPrice1L,
      defaultCostPrice500ml: variantId === 'var-500ml' ? cost : finSettings.defaultCostPrice500ml,
      variantCosts: {
        ...(finSettings.variantCosts || {}),
        [variantId]: cost,
      },
    };
    setFinSettings(updatedSettings);
    saveFinancialSettings(updatedSettings);

    const updatedProducts = productList.map((p) => ({
      ...p,
      variants: p.variants.map((v) => (v.id === variantId ? { ...v, costPrice: cost } : v)),
    }));
    saveProductList(updatedProducts);

    setNotificationToast(`ڈیفالٹ لاگت محفوظ ہو گئی: Rs. ${cost}`);
    setTimeout(() => setNotificationToast(null), 2500);
  };

  const handleSaveAllWholesaleRates = () => {
    saveFinancialSettings(finSettings);
    saveProductList(productList);
    setNotificationToast(`تمام پراڈکٹس کے خریداری ریٹس برائے ${selectedMonth} کامیابی سے محفوظ ہو گئے!`);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  // Helper to read packaging & labour costs for a variant in selectedMonth
  const getVariantPackaging = (variantId: string, variantFallback?: { name?: string; size?: string }) => {
    return getVariantPackagingCost(finSettings, variantId, selectedMonth, variantFallback);
  };

  // Update a variant's packaging cost for the selected month
  const handleUpdateVariantPackagingMonth = (
    variantId: string,
    materialCost: number,
    laborCost: number
  ) => {
    const mat = Math.max(0, materialCost);
    const lab = Math.max(0, laborCost);
    const currentMonthPkg = finSettings.monthlyWholesaleRates?.[selectedMonth]?.variantPackagingRates || {};
    const currentDefaults = finSettings.variantPackaging || {};

    const updatedSettings: FinancialSettings = {
      ...finSettings,
      variantPackaging: {
        ...currentDefaults,
        [variantId]: currentDefaults[variantId] || { materialCost: mat, laborCost: lab },
      },
      monthlyWholesaleRates: {
        ...(finSettings.monthlyWholesaleRates || {}),
        [selectedMonth]: {
          ...(finSettings.monthlyWholesaleRates?.[selectedMonth] || {}),
          variantPackagingRates: {
            ...currentMonthPkg,
            [variantId]: { materialCost: mat, laborCost: lab },
          },
        },
      },
    };

    setFinSettings(updatedSettings);
    saveFinancialSettings(updatedSettings);

    setNotificationToast(
      `پیکنگ لاگت محفوظ ہو گئی: بوتل Rs. ${mat} + لیبر Rs. ${lab} = کل Rs. ${mat + lab}`
    );
    setTimeout(() => setNotificationToast(null), 3000);
  };

  // Update a variant's permanent default packaging cost
  const handleUpdateVariantPackagingDefault = (
    variantId: string,
    materialCost: number,
    laborCost: number
  ) => {
    const mat = Math.max(0, materialCost);
    const lab = Math.max(0, laborCost);

    const updatedSettings: FinancialSettings = {
      ...finSettings,
      variantPackaging: {
        ...(finSettings.variantPackaging || {}),
        [variantId]: { materialCost: mat, laborCost: lab },
      },
    };

    setFinSettings(updatedSettings);
    saveFinancialSettings(updatedSettings);

    setNotificationToast(`ڈیفالٹ پیکنگ لاگت محفوظ ہو گئی: Rs. ${mat + lab}`);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  const handleSaveAllPackagingRates = () => {
    saveFinancialSettings(finSettings);
    setNotificationToast(`تمام پراڈکٹس کے پیکنگ و لیبر ریٹس محفوظ ہو گئے!`);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(newExpenseAmount);
    if (!amt || amt <= 0 || !newExpenseTitle.trim()) return;

    const month = newExpenseDate.substring(0, 7) || selectedMonth;

    if (editingExpense) {
      const updated: ExpenseEntry = {
        ...editingExpense,
        date: newExpenseDate,
        month,
        category: newExpenseCategory,
        title: newExpenseTitle.trim(),
        amount: amt,
        notes: newExpenseNotes.trim() || undefined,
      };
      updateExpense(updated);
      setExpenses((prev) => prev.map((exp) => (exp.id === updated.id ? updated : exp)));
      setEditingExpense(null);
      setShowAddExpenseModal(false);
      setNewExpenseTitle('');
      setNewExpenseAmount('');
      setNewExpenseNotes('');
      setNotificationToast(`خرچ کامیابی سے تبدیل ہو گیا: Rs. ${amt}`);
      setTimeout(() => setNotificationToast(null), 3000);
      return;
    }

    const created = addExpense({
      date: newExpenseDate,
      month,
      category: newExpenseCategory,
      title: newExpenseTitle.trim(),
      amount: amt,
      notes: newExpenseNotes.trim() || undefined,
    });

    setExpenses((prev) => [created, ...prev]);
    setShowAddExpenseModal(false);
    setNewExpenseTitle('');
    setNewExpenseAmount('');
    setNewExpenseNotes('');
    setNotificationToast(`نیا خرچ شامل ہو گیا: Rs. ${amt} برائے ${newExpenseCategory.toUpperCase()}`);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  const handleOpenEditExpense = (exp: ExpenseEntry) => {
    setEditingExpense(exp);
    setNewExpenseCategory(exp.category);
    setNewExpenseTitle(exp.title);
    setNewExpenseAmount(exp.amount.toString());
    setNewExpenseDate(exp.date);
    setNewExpenseNotes(exp.notes || '');
    setShowAddExpenseModal(true);
  };

  const handleDeleteExpense = (id: string, title?: string) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(`کیا آپ واقعی اس خرچے کو مٹانا چاہتے ہیں؟\n${title ? `"${title}"` : ''}`);
      if (!confirmed) return;
    }
    deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setNotificationToast('خرچ کامیابی سے مٹا دیا گیا۔ (Expense deleted)');
    setTimeout(() => setNotificationToast(null), 2500);
  };

  const handleSaveFinSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveFinancialSettings(finSettings);
    setShowFinSettingsModal(false);
    setNotificationToast('Base financial rates & COGS settings updated!');
    setTimeout(() => setNotificationToast(null), 3000);
  };

  const updateVariantCostPrice = (productId: string, variantId: string, newCost: number) => {
    const cost = Math.max(0, newCost);
    const is1L = variantId.includes('1l') || variantId.includes('1-liter') || productId.includes('1-liter');
    const updated = productList.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          variants: p.variants.map((v) => {
            if (v.id === variantId) {
              return { ...v, costPrice: cost };
            }
            return v;
          }),
        };
      }
      return p;
    });
    saveProductList(updated);

    // Sync with finSettings & monthly rate
    const updatedSettings: FinancialSettings = {
      ...finSettings,
      defaultCostPrice1L: is1L ? cost : (finSettings.defaultCostPrice1L || 480),
      defaultCostPrice500ml: !is1L ? cost : (finSettings.defaultCostPrice500ml || 240),
      monthlyWholesaleRates: {
        ...(finSettings.monthlyWholesaleRates || {}),
        [selectedMonth]: {
          cost1L: is1L ? cost : (finSettings.monthlyWholesaleRates?.[selectedMonth]?.cost1L || finSettings.defaultCostPrice1L || 480),
          cost500ml: !is1L ? cost : (finSettings.monthlyWholesaleRates?.[selectedMonth]?.cost500ml || finSettings.defaultCostPrice500ml || 240),
        },
      },
    };
    setFinSettings(updatedSettings);
    saveFinancialSettings(updatedSettings);

    if (is1L) setMonthCost1L(cost.toString());
    else setMonthCost500ml(cost.toString());

    setNotificationToast(`خریداری قیمت محفوظ ہو گئی: Rs. ${cost}`);
    setTimeout(() => setNotificationToast(null), 2500);
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

      // Automatically dispatch customer status notification (Email, SMS & WhatsApp)
      const targetOrder = orders.find((o) => o.id === orderId);
      if (targetOrder) {
        const updated = { ...targetOrder, status };
        triggerNotificationDispatch(updated, status).catch(() => {});
        setNotificationToast(`Notification sent to ${targetOrder.customer.fullName} for status: ${status.toUpperCase()}`);
        setTimeout(() => setNotificationToast(null), 3500);
      }
    } catch {
      // Ignore
    }
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      updateStoredPaymentStatus(orderId, paymentStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o))
      );
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
          price: Number(newPrice1L) || 700,
          costPrice: Number(newCost1L) || 480,
          sku: `SEC-${Date.now()}-1L`,
          weight: 1000,
          inStock: true,
          stockQuantity: 30,
        },
        {
          id: `var-${Date.now()}-2`,
          name: '500ml',
          size: '500ml',
          price: Number(newPrice500ml) || 350,
          costPrice: Number(newCost500ml) || 240,
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

  // Analytics & Financial Computations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'received' ? o.total : 0), 0);
  const totalSalesAllTime = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  const allTimeExpensesLogged = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const allTimeCogs = orders.reduce((sum, o) => {
    return (
      sum +
      o.items.reduce((iSum, item) => {
        const is1L =
          item.variant.size?.toLowerCase().includes('1l') ||
          item.variant.name.includes('1') ||
          item.product.name.includes('1 Liter');
        const cost =
          item.variant.costPrice && item.variant.costPrice > 0
            ? item.variant.costPrice
            : is1L
            ? finSettings.defaultCostPrice1L
            : finSettings.defaultCostPrice500ml;
        return iSum + cost * (item.quantity || 1);
      }, 0)
    );
  }, 0);
  // All-time totals: COGS + manually logged business expenses (zero fake estimations)
  const allTimeTotalExpenses = allTimeCogs + allTimeExpensesLogged;
  const allTimeNetProfit = totalSalesAllTime - allTimeTotalExpenses;

  // Monthly Report computations
  const availableMonths = getAvailableMonths(orders, expenses);
  const currentMonthReport: MonthlyFinancialReport = calculateMonthlyReport(selectedMonth, orders, expenses, finSettings);
  const selectedMonthExpenses: ExpenseEntry[] = expenses.filter(
    (e) => e.month === selectedMonth || (e.date && e.date.startsWith(selectedMonth))
  );

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
              onClick={() => setActiveTab('wholesale')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'wholesale'
                  ? 'bg-brand-gold text-brand-charcoal font-bold'
                  : 'text-brand-cream/80 hover:bg-white/10'
              }`}
            >
              <Tag className="w-4 h-4" />
              Wholesale &amp; Packaging (خریداری و پیکنگ)
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'reports'
                  ? 'bg-brand-gold text-brand-charcoal font-bold'
                  : 'text-brand-cream/80 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              P&amp;L Reports &amp; Expenses
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
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handlePreviewSampleSlip}
              className="flex items-center gap-1.5 text-xs bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal px-3.5 py-2 rounded-xl font-bold transition-all shadow-sm active:scale-95"
              title="Click to preview and test the courier envelope shipping label"
            >
              <Tag className="w-3.5 h-3.5" />
              📦 Preview Envelope Slip
            </button>
            <button
              onClick={handleResetData}
              className="flex items-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-2 rounded-xl font-bold transition-all shadow-2xs active:scale-95"
              title="Wipe old fake numbers and reset visitors to 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              🧹 Clear Cache &amp; Reset
            </button>
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Live Store &bull; Real Database Active</span>
            </div>
          </div>
        </div>

        {/* Reset Notification Toast */}
        {resetToast && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-200" />
            <span>Cache Cleared! Fake data removed &amp; counters reset to 0.</span>
          </div>
        )}

        {/* Customer Notification Dispatch Toast */}
        {notificationToast && (
          <div className="fixed top-6 right-6 z-50 bg-brand-green text-brand-cream border border-brand-gold/40 px-5 py-3.5 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-300">
            <Bell className="w-4 h-4 text-brand-gold animate-wiggle" />
            <span>🔔 {notificationToast}</span>
          </div>
        )}

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
                  <button
                    onClick={handleTestPixel}
                    className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
                    title="Fire a test event to verify Meta Pixel connection"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Test Pixel Event
                  </button>
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

              {/* Pixel Diagnostic Feedback */}
              {pixelStatus === 'active' && (
                <div className="mt-3 p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-200 font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>✅ Meta Pixel is Active! Test event sent to Facebook Events Manager dataset {FB_PIXEL_ID}.</span>
                </div>
              )}
              {pixelStatus === 'blocked' && (
                <div className="mt-3 p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs text-amber-200 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <span>AdBlocker detected in browser or fbq not loaded yet. If using an AdBlocker extension, please pause it to test.</span>
                </div>
              )}

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
                  Total Sales Value
                </p>
                <p className="font-heading text-3xl font-bold text-brand-green mt-2">
                  {formatPrice(totalSalesAllTime)}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">From all customer orders</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Total Expenses
                </p>
                <p className="font-heading text-3xl font-bold text-red-600 mt-2">
                  {formatPrice(allTimeTotalExpenses)}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">Wholesale + Ads + Delivery</p>
              </div>

              <div className={`p-6 rounded-3xl border shadow-sm ${allTimeNetProfit >= 0 ? 'bg-emerald-50/70 border-emerald-300' : 'bg-red-50/70 border-red-300'}`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${allTimeNetProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  Net {allTimeNetProfit >= 0 ? 'Profit (منافع)' : 'Loss (نقصان)'}
                </p>
                <p className={`font-heading text-3xl font-bold mt-2 ${allTimeNetProfit >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                  {formatPrice(allTimeNetProfit)}
                </p>
                <p className={`text-[11px] font-bold mt-1 ${allTimeNetProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {allTimeNetProfit >= 0 ? '▲ Net Positive Inflow' : '▼ Net Deficit'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Total Orders
                </p>
                <p className="font-heading text-3xl font-bold text-brand-charcoal mt-2">
                  {orders.length}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">{pendingOrdersCount} pending confirmation</p>
              </div>
            </div>

            {/* Financial Performance Banner */}
            <div className="bg-gradient-to-r from-emerald-950 via-brand-green to-emerald-900 text-white rounded-3xl p-6 shadow-md border border-brand-gold/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-gold text-brand-charcoal text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    Financial Audit &amp; P&amp;L
                  </span>
                  <span className="text-xs text-brand-gold font-bold">
                    Net Profit / Loss Tracking Active
                  </span>
                </div>
                <h3 className="font-heading font-black text-xl text-white">
                  Monthly Profit &amp; Loss Statements &amp; Expense Ledger
                </h3>
                <p className="text-xs text-white/80 max-w-xl">
                  Analyze wholesale product costs (COGS), Meta/Facebook ad spend, courier delivery fees, and packaging materials with instant printable monthly statements.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('reports')}
                className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-black text-xs px-5 py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 flex-shrink-0"
              >
                <BarChart3 className="w-4 h-4" />
                View Monthly P&amp;L Reports &rarr;
              </button>
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
                <div className="py-8 text-center space-y-3">
                  <p className="text-sm text-stone-500 font-medium">
                    Clean database active: Zero fake orders.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => setShowAddOrderModal(true)}
                      className="inline-flex items-center gap-1.5 bg-brand-green text-brand-cream hover:bg-brand-green-light px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-brand-gold" />
                      + Add New Customer Order
                    </button>
                    <button
                      onClick={handlePreviewSampleSlip}
                      className="inline-flex items-center gap-1.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      📦 Preview Sample Parcel Slip
                    </button>
                  </div>
                </div>
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
                              <a
                                href={getCustomerWhatsAppUrl(o, o.status)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] bg-green-50 hover:bg-[#25D366] hover:text-white text-green-700 border border-green-200 px-2 py-1 rounded-md font-bold transition-all shadow-2xs"
                                title={`Send WhatsApp "${o.status.toUpperCase()}" update to ${o.customer.fullName}`}
                              >
                                <MessageCircle className="w-3 h-3 text-[#25D366]" />
                                WhatsApp Update
                              </a>
                              <button
                                onClick={() => handleCopyOrderCourierText(o)}
                                className="inline-flex items-center gap-1 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-md font-bold transition-all shadow-2xs"
                                title="Copy Name, Phone, Address & COD for courier booking"
                              >
                                {copiedOrderId === o.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    Copy
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setInvoiceMode('label');
                                  setInvoiceEditMode(false);
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
                                  setInvoiceEditMode(false);
                                  setInvoiceOrder(o);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] bg-brand-gold/25 hover:bg-brand-gold text-brand-charcoal px-2.5 py-1 rounded-md font-bold transition-all shadow-2xs"
                                title="Print Customer Invoice"
                              >
                                <Printer className="w-3 h-3" />
                                Invoice
                              </button>
                              <button
                                onClick={() => {
                                  setInvoiceMode('invoice');
                                  setInvoiceEditMode(true);
                                  setInvoiceOrder(o);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-900 border border-amber-300 px-2.5 py-1 rounded-md font-bold transition-all shadow-2xs"
                                title="Edit rate (e.g. Rs. 650/L) or customize delivery & discount on this bill"
                              >
                                <Edit3 className="w-3 h-3 text-amber-600" />
                                ✏️ Custom Rate
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
                <div className="py-12 text-center space-y-3">
                  <Package className="w-10 h-10 text-stone-300 mx-auto" />
                  <p className="text-sm text-stone-600 font-semibold">
                    No Customer Orders Yet
                  </p>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    Clean database active: All fake demo orders have been purged. Real incoming orders from checkout or WhatsApp will appear here live.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setShowAddOrderModal(true)}
                      className="inline-flex items-center gap-1.5 bg-brand-green text-brand-cream hover:bg-brand-green-light px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-brand-gold" />
                      + Create WhatsApp / Phone Order
                    </button>
                    <button
                      onClick={handlePreviewSampleSlip}
                      className="inline-flex items-center gap-1.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      📦 Preview Parcel Shipping Slip
                    </button>
                  </div>
                </div>
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
                              <a
                                href={getCustomerWhatsAppUrl(order, order.status)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs bg-green-50 hover:bg-[#25D366] hover:text-white text-green-700 border border-green-200 px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-2xs"
                                title={`Send WhatsApp "${order.status.toUpperCase()}" update to ${order.customer.fullName}`}
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                                WhatsApp Update
                              </a>
                              <button
                                onClick={() => handleCopyOrderCourierText(order)}
                                className="inline-flex items-center gap-1 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-1.5 rounded-lg font-bold transition-all shadow-2xs"
                                title="Copy Name, Phone, Address & COD for courier booking"
                              >
                                {copiedOrderId === order.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setInvoiceMode('label');
                                  setInvoiceEditMode(false);
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
                                  setInvoiceEditMode(false);
                                  setInvoiceOrder(order);
                                }}
                                className="inline-flex items-center gap-1 text-xs bg-brand-gold/25 hover:bg-brand-gold text-brand-charcoal px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-2xs"
                                title="Print Detailed Customer Invoice"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                Invoice
                              </button>
                              <button
                                onClick={() => {
                                  setInvoiceMode('invoice');
                                  setInvoiceEditMode(true);
                                  setInvoiceOrder(order);
                                }}
                                className="inline-flex items-center gap-1 text-xs bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-900 border border-amber-300 px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-2xs"
                                title="Edit rate (e.g. Rs. 650/L) or customize delivery & discount on this bill"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                ✏️ Custom Rate
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
                    <label className="font-bold">1L Selling Price (PKR)</label>
                    <input
                      type="number"
                      value={newPrice1L}
                      onChange={(e) => setNewPrice1L(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-amber-800">1L Wholesale Cost (PKR)</label>
                    <input
                      type="number"
                      value={newCost1L}
                      onChange={(e) => setNewCost1L(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">500ml Selling Price (PKR)</label>
                    <input
                      type="number"
                      value={newPrice500ml}
                      onChange={(e) => setNewPrice500ml(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-amber-800">500ml Wholesale Cost (PKR)</label>
                    <input
                      type="number"
                      value={newCost500ml}
                      onChange={(e) => setNewCost500ml(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-xl font-bold"
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
                    <th className="py-3 px-3">Variants, Wholesale Cost &amp; Stock Count</th>
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
                        {prod.variants.map((v) => {
                          const is1L = v.size?.toLowerCase().includes('1l') || v.name.includes('1');
                          const cost = v.costPrice ?? (is1L ? 480 : 240);
                          const margin = v.price - cost;
                          const marginPct = v.price > 0 ? Math.round((margin / v.price) * 100) : 0;
                          return (
                            <div
                              key={v.id}
                              className="flex flex-wrap items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200"
                            >
                              <span className="font-bold text-stone-800 text-[11px] min-w-[70px]">
                                {v.name}:
                              </span>
                              <span className="font-mono text-brand-green font-bold text-xs" title="Customer Selling Price">
                                Sale: {formatPrice(v.price)}
                              </span>
                              {v.compareAtPrice && v.compareAtPrice > v.price && (
                                <span className="font-mono line-through text-stone-400 text-[10px]">
                                  {formatPrice(v.compareAtPrice)}
                                </span>
                              )}

                              {/* Editable Wholesale Cost Price */}
                              <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded-xl border border-amber-200 shadow-2xs">
                                <span className="text-amber-900 font-bold text-[10px]">Wholesale Cost:</span>
                                <span className="font-mono font-bold text-amber-950 text-xs">Rs.</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={cost}
                                  onChange={(e) => updateVariantCostPrice(prod.id, v.id, Number(e.target.value) || 0)}
                                  className="w-16 px-1.5 py-0.5 border border-amber-300 rounded-lg text-center font-mono font-bold text-xs bg-white text-stone-900"
                                  title="Click to edit purchase / wholesale cost per bottle"
                                />
                              </div>

                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 font-mono">
                                Margin: +{formatPrice(margin)} ({marginPct}%)
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
                        );
                      })}
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

        {/* TAB: WHOLESALE PURCHASE RATES & COGS (تمام پراڈکٹس کی خریداری لاگت و پیکنگ میٹریل) */}
        {activeTab === 'wholesale' && (
          <div className="space-y-8">
            {/* Top Bar */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h3 className="font-heading font-black text-xl text-brand-charcoal flex items-center gap-2">
                  <Tag className="w-6 h-6 text-brand-green" />
                  Wholesale Costs &amp; Packaging Manager (خریداری ریٹس و پیکنگ لاگت)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  سرسوں کا تیل، دیسی گھی اور آئندہ کی تمام پراڈکٹس کی خریداری قیمت، بوتل / جار میٹریل، اور لیبر کے فی یونٹ اخراجات یہاں سے مینیج کریں۔
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                {/* Month Selector Dropdown */}
                <div className="flex items-center gap-2 bg-stone-50 border border-stone-300 rounded-2xl px-3.5 py-2 shadow-2xs">
                  <Calendar className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span className="text-xs font-bold text-stone-600">Month:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent font-mono font-bold text-xs text-brand-charcoal focus:outline-none cursor-pointer"
                  >
                    {availableMonths.map((m) => {
                      const [y, mon] = m.split('-');
                      const d = new Date(Number(y), Number(mon) - 1, 1);
                      const label = d.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
                      return (
                        <option key={m} value={m}>
                          {label} ({m})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {costSubTab === 'wholesale' ? (
                  <button
                    type="button"
                    onClick={handleSaveAllWholesaleRates}
                    className="inline-flex items-center gap-1.5 bg-brand-green hover:bg-brand-green-light text-brand-cream px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    <Check className="w-4 h-4 text-brand-gold" />
                    خریداری ریٹس محفوظ کریں (Save All)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveAllPackagingRates}
                    className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    <Check className="w-4 h-4 text-brand-gold" />
                    پیکنگ ریٹس محفوظ کریں (Save All)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('products');
                    setShowAddProduct(true);
                  }}
                  className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs"
                >
                  <Plus className="w-4 h-4 text-brand-green" />
                  + نئی پراڈکٹ
                </button>
              </div>
            </div>

            {/* Sub-Tabs: 1. Wholesale Rates | 2. Packaging & Labour | 3. Live Auto Packaging Expense */}
            <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
              <button
                type="button"
                onClick={() => setCostSubTab('wholesale')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  costSubTab === 'wholesale'
                    ? 'bg-brand-green text-brand-cream shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Tag className="w-4 h-4" />
                🏷️ Wholesale Purchase Rates (خریداری ریٹس)
              </button>

              <button
                type="button"
                onClick={() => setCostSubTab('packaging')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  costSubTab === 'packaging'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Package className="w-4 h-4" />
                📦 Packaging Material &amp; Labour (پیکنگ میٹریل و لیبر لاگت)
              </button>

              <button
                type="button"
                onClick={() => setCostSubTab('auto_calc')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  costSubTab === 'auto_calc'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                ⚡ Auto Packaging Expense ({currentMonthReport.monthName})
                <span className="bg-white text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-black">
                  {formatPrice(currentMonthReport.packagingCost)}
                </span>
              </button>
            </div>

            {/* ════════════════════════════════════════════════════════════
                SUB-TAB 1: WHOLESALE PURCHASE RATES
            ════════════════════════════════════════════════════════════ */}
            {costSubTab === 'wholesale' && (
              <div className="space-y-6">
                {/* Instruction Banner */}
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border-2 border-amber-300 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-amber-500 text-white text-sm">💡</span>
                    <div>
                      <h4 className="font-heading font-black text-sm text-stone-900">
                        منتخب مہینہ: {currentMonthReport.monthName} ({selectedMonth})
                      </h4>
                      <p className="text-xs text-stone-600">
                        مارکیٹ ریٹ ہر مہینے مختلف ہوتا ہے۔ جس مہینے مال جتنے کا پڑے، اس مہینے کے خانے میں خریداری قیمت درج کریں۔ پیکنگ و لیبر کا خرچہ ساتھ ملا کر کل یونٹ لاگت اور خالص منافع خود بخود نکلتا ہے۔
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCostSubTab('packaging')}
                    className="inline-flex items-center gap-1.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all whitespace-nowrap ml-auto"
                  >
                    <Package className="w-4 h-4 text-amber-700" />
                    پیکنگ میٹریل ریٹس دیکھیں &rarr;
                  </button>
                </div>

                {/* List of Products & Variants */}
                <div className="space-y-6">
                  {productList.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center font-bold text-lg text-brand-green border border-stone-200">
                            {prod.categorySlug === 'desi-ghee' ? '🧈' : '🫒'}
                          </div>
                          <div>
                            <h4 className="font-heading font-black text-base text-stone-900 flex items-center gap-2">
                              {prod.name}
                              <span className="text-xs font-serif text-brand-gold font-normal">
                                ({prod.nameUrdu})
                              </span>
                            </h4>
                            <p className="text-[11px] text-stone-400 font-mono">
                              Category: {prod.category} &bull; ID: {prod.id}
                            </p>
                          </div>
                        </div>

                        <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                          {prod.variants.length} پیکنگ سائز (Variants)
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[10px]">
                              <th className="py-2.5 px-3">سائز / ویرینٹ</th>
                              <th className="py-2.5 px-3">گاہک ریٹ (Sale Price)</th>
                              <th className="py-2.5 px-3">خریداری لاگت ({selectedMonth})</th>
                              <th className="py-2.5 px-3">پیکنگ و لیبر لاگت</th>
                              <th className="py-2.5 px-3">کل یونٹ لاگت (خریداری + پیکنگ)</th>
                              <th className="py-2.5 px-3">حتمی منافع فی بوتل</th>
                              <th className="py-2.5 px-3">ڈیفالٹ خریداری ریٹ</th>
                              <th className="py-2.5 px-3 text-center">ایکشن</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {prod.variants.map((v) => {
                              const monthCost = getVariantWholesaleRate(v.id, v.costPrice || 0);
                              const defaultCost = getVariantDefaultCost(v.id, v.costPrice || 0);
                              const packInfo = getVariantPackaging(v.id, v);
                              const totalUnitCost = monthCost + packInfo.totalCost;
                              const netUnitMargin = v.price - totalUnitCost;
                              const marginPct = v.price > 0 ? Math.round((netUnitMargin / v.price) * 100) : 0;
                              const isProfit = netUnitMargin >= 0;

                              return (
                                <tr key={v.id} className="hover:bg-stone-50">
                                  <td className="py-3 px-3 font-bold text-stone-900">
                                    <div className="flex items-center gap-2">
                                      <span>{v.name}</span>
                                      <span className="font-mono text-[10px] text-stone-400">({v.size})</span>
                                    </div>
                                  </td>

                                  <td className="py-3 px-3 font-mono font-bold text-brand-green text-sm">
                                    {formatPrice(v.price)}
                                  </td>

                                  {/* Wholesale purchase cost input */}
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-300 w-fit shadow-2xs">
                                      <span className="font-bold text-xs text-amber-900">Rs.</span>
                                      <input
                                        type="number"
                                        min={0}
                                        defaultValue={monthCost}
                                        key={`${v.id}-${selectedMonth}-${monthCost}`}
                                        id={`wholesale-${v.id}`}
                                        onBlur={(e) =>
                                          handleUpdateVariantMonthRate(v.id, Number(e.target.value) || 0)
                                        }
                                        className="w-20 font-mono font-black text-sm text-stone-900 bg-transparent focus:outline-none"
                                        placeholder="0"
                                      />
                                    </div>
                                  </td>

                                  {/* Packaging & Labour cost pill */}
                                  <td className="py-3 px-3">
                                    <button
                                      type="button"
                                      onClick={() => setCostSubTab('packaging')}
                                      className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1 rounded-xl text-xs font-bold border border-amber-200 transition-colors"
                                      title="پیکنگ میٹریل و لیبر تبدیل کریں"
                                    >
                                      <span>📦 Rs. {packInfo.totalCost}</span>
                                      <span className="text-[10px] text-amber-600">({packInfo.materialCost}+{packInfo.laborCost})</span>
                                    </button>
                                  </td>

                                  {/* Total Unit Cost (Purchase + Packaging) */}
                                  <td className="py-3 px-3 font-mono font-bold text-stone-800">
                                    <span className="bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                                      Rs. {totalUnitCost}
                                    </span>
                                  </td>

                                  {/* Net Margin per unit */}
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`font-mono font-black text-xs px-2.5 py-1 rounded-lg border ${
                                          isProfit
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                            : 'bg-red-50 text-red-800 border-red-200'
                                        }`}
                                      >
                                        +{formatPrice(netUnitMargin)} ({marginPct}%)
                                      </span>
                                    </div>
                                  </td>

                                  {/* Default cost */}
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-300 w-fit shadow-2xs">
                                      <span className="font-bold text-xs text-stone-500">Rs.</span>
                                      <input
                                        type="number"
                                        min={0}
                                        defaultValue={defaultCost}
                                        key={`${v.id}-default-${defaultCost}`}
                                        onBlur={(e) =>
                                          handleUpdateVariantDefaultCost(v.id, Number(e.target.value) || 0)
                                        }
                                        className="w-16 font-mono font-bold text-xs text-stone-700 bg-transparent focus:outline-none"
                                        placeholder="0"
                                      />
                                    </div>
                                  </td>

                                  <td className="py-3 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const el = document.getElementById(`wholesale-${v.id}`) as HTMLInputElement;
                                        const val = Number(el?.value) || monthCost;
                                        handleUpdateVariantMonthRate(v.id, val);
                                      }}
                                      className="bg-brand-green hover:bg-brand-green-light text-brand-cream px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
                                    >
                                      محفوظ کریں
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                SUB-TAB 2: PACKAGING MATERIAL & LABOUR UNIT CONFIGURATOR
            ════════════════════════════════════════════════════════════ */}
            {costSubTab === 'packaging' && (
              <div className="space-y-6">
                {/* Visual Formula & Explanation Card */}
                <div className="bg-gradient-to-r from-amber-500/15 via-amber-50 to-yellow-500/10 border-2 border-amber-400 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-2xl bg-amber-600 text-white text-base">📦</span>
                    <div>
                      <h4 className="font-heading font-black text-base text-stone-900">
                        پیکنگ میٹریل و لیبر لاگت کا خودکار حساب (Auto Packaging Setup)
                      </h4>
                      <p className="text-xs text-stone-600">
                        یہاں ہر پروڈکٹ کے لیے بوتل / جار میٹریل کی قیمت اور فی یونٹ لیبر چارجز سیٹ کریں۔ جیسے ہی کوئی بوتل سیل ہو گی، سسٹم خود بخود اس مہینے کا کل پیکنگ خرچہ نکال لے گا۔
                      </p>
                    </div>
                  </div>

                  {/* Formula Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    <div className="bg-white/90 border border-amber-300 rounded-2xl p-3 shadow-2xs">
                      <p className="text-[11px] font-bold text-stone-500">1L سرسوں کا تیل</p>
                      <p className="font-mono font-black text-sm text-stone-900 mt-1">
                        Rs. 60 <span className="text-stone-400 font-normal text-xs">(بوتل)</span> + Rs. 5 <span className="text-stone-400 font-normal text-xs">(لیبر)</span>
                      </p>
                      <p className="text-xs font-black text-amber-800 font-mono mt-0.5">
                        = Rs. 65 فی بوتل
                      </p>
                    </div>

                    <div className="bg-white/90 border border-amber-300 rounded-2xl p-3 shadow-2xs">
                      <p className="text-[11px] font-bold text-stone-500">500ml سرسوں کا تیل</p>
                      <p className="font-mono font-black text-sm text-stone-900 mt-1">
                        Rs. 40 <span className="text-stone-400 font-normal text-xs">(بوتل)</span> + Rs. 5 <span className="text-stone-400 font-normal text-xs">(لیبر)</span>
                      </p>
                      <p className="text-xs font-black text-amber-800 font-mono mt-0.5">
                        = Rs. 45 فی بوتل
                      </p>
                    </div>

                    <div className="bg-white/90 border border-amber-300 rounded-2xl p-3 shadow-2xs">
                      <p className="text-[11px] font-bold text-stone-500">1kg خالص دیسی گھی</p>
                      <p className="font-mono font-black text-sm text-stone-900 mt-1">
                        Rs. 70 <span className="text-stone-400 font-normal text-xs">(جار)</span> + Rs. 10 <span className="text-stone-400 font-normal text-xs">(لیبر)</span>
                      </p>
                      <p className="text-xs font-black text-amber-800 font-mono mt-0.5">
                        = Rs. 80 فی جار
                      </p>
                    </div>

                    <div className="bg-white/90 border border-amber-300 rounded-2xl p-3 shadow-2xs">
                      <p className="text-[11px] font-bold text-stone-500">500g خالص دیسی گھی</p>
                      <p className="font-mono font-black text-sm text-stone-900 mt-1">
                        Rs. 45 <span className="text-stone-400 font-normal text-xs">(جار)</span> + Rs. 10 <span className="text-stone-400 font-normal text-xs">(لیبر)</span>
                      </p>
                      <p className="text-xs font-black text-amber-800 font-mono mt-0.5">
                        = Rs. 55 فی جار
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 border-t border-amber-200/60 text-xs text-stone-600">
                    <span>
                      ✨ <strong>نئی پراڈکٹس:</strong> آئندہ جو بھی پروڈکٹ یا ویرینٹ آپ ایڈ کریں گے وہ خود بخود نیچے لسٹ میں آ جائے گی اور آپ اس کے ریٹس سیٹ کر سکیں گے۔
                    </span>
                    <button
                      type="button"
                      onClick={() => setCostSubTab('auto_calc')}
                      className="text-amber-900 font-bold hover:underline whitespace-nowrap"
                    >
                      اس مہینے کا لائیو آٹو خرچہ دیکھیں &rarr;
                    </button>
                  </div>
                </div>

                {/* Packaging Form for each Product */}
                <div className="space-y-6">
                  {productList.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center font-bold text-lg text-amber-800 border border-amber-200">
                            📦
                          </div>
                          <div>
                            <h4 className="font-heading font-black text-base text-stone-900 flex items-center gap-2">
                              {prod.name}
                              <span className="text-xs font-serif text-brand-gold font-normal">
                                ({prod.nameUrdu})
                              </span>
                            </h4>
                            <p className="text-[11px] text-stone-400 font-mono">
                              Packaging Specification &bull; Category: {prod.category}
                            </p>
                          </div>
                        </div>

                        <span className="bg-amber-50 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                          {prod.variants.length} پیکنگ ویرینٹس
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[10px]">
                              <th className="py-2.5 px-3">سائز / ویرینٹ</th>
                              <th className="py-2.5 px-3">گاہک کیلئے ریٹ</th>
                              <th className="py-2.5 px-3">بوتل / کنٹینر میٹریل لاگت ({selectedMonth})</th>
                              <th className="py-2.5 px-3">لیبر خرچ ({selectedMonth})</th>
                              <th className="py-2.5 px-3">کل پیکنگ فی یونٹ</th>
                              <th className="py-2.5 px-3">ڈیفالٹ بیس لاگت</th>
                              <th className="py-2.5 px-3 text-center">ایکشن</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {prod.variants.map((v) => {
                              const packInfo = getVariantPackaging(v.id, v);
                              const defaultPack = finSettings.variantPackaging?.[v.id] || {
                                materialCost: packInfo.materialCost,
                                laborCost: packInfo.laborCost,
                              };

                              return (
                                <tr key={v.id} className="hover:bg-stone-50">
                                  <td className="py-3 px-3 font-bold text-stone-900">
                                    <div className="flex items-center gap-2">
                                      <span>{v.name}</span>
                                      <span className="font-mono text-[10px] text-stone-400">({v.size})</span>
                                    </div>
                                  </td>

                                  <td className="py-3 px-3 font-mono font-bold text-stone-700">
                                    {formatPrice(v.price)}
                                  </td>

                                  {/* Bottle / Material Cost Input */}
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-300 w-fit shadow-2xs">
                                      <span className="font-bold text-xs text-amber-900">Rs.</span>
                                      <input
                                        type="number"
                                        min={0}
                                        defaultValue={packInfo.materialCost}
                                        key={`${v.id}-${selectedMonth}-mat-${packInfo.materialCost}`}
                                        id={`mat-${v.id}`}
                                        className="w-16 font-mono font-black text-sm text-stone-900 bg-transparent focus:outline-none"
                                        placeholder="0"
                                      />
                                    </div>
                                  </td>

                                  {/* Labour Cost Input */}
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1.5 rounded-xl border border-blue-300 w-fit shadow-2xs">
                                      <span className="font-bold text-xs text-blue-900">Rs.</span>
                                      <input
                                        type="number"
                                        min={0}
                                        defaultValue={packInfo.laborCost}
                                        key={`${v.id}-${selectedMonth}-lab-${packInfo.laborCost}`}
                                        id={`lab-${v.id}`}
                                        className="w-14 font-mono font-black text-sm text-stone-900 bg-transparent focus:outline-none"
                                        placeholder="0"
                                      />
                                    </div>
                                  </td>

                                  {/* Total Unit Packaging (Material + Labour) */}
                                  <td className="py-3 px-3">
                                    <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg border bg-amber-100 text-amber-900 border-amber-300">
                                      Rs. {packInfo.totalCost}
                                      <span className="text-[10px] font-normal text-amber-700 ml-1">
                                        ({packInfo.materialCost} + {packInfo.laborCost})
                                      </span>
                                    </span>
                                  </td>

                                  {/* Default Base */}
                                  <td className="py-3 px-3 font-mono text-xs text-stone-500">
                                    Rs. {(defaultPack.materialCost || 0) + (defaultPack.laborCost || 0)}
                                    <span className="text-[10px] text-stone-400 block">
                                      (بوتل {defaultPack.materialCost || 0} + لیبر {defaultPack.laborCost || 0})
                                    </span>
                                  </td>

                                  <td className="py-3 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const matEl = document.getElementById(`mat-${v.id}`) as HTMLInputElement;
                                        const labEl = document.getElementById(`lab-${v.id}`) as HTMLInputElement;
                                        const mat = Number(matEl?.value) || 0;
                                        const lab = Number(labEl?.value) || 0;
                                        handleUpdateVariantPackagingMonth(v.id, mat, lab);
                                      }}
                                      className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                                    >
                                      محفوظ کریں
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                SUB-TAB 3: AUTO-CALCULATED PACKAGING EXPENSE & SUMMARY
            ════════════════════════════════════════════════════════════ */}
            {costSubTab === 'auto_calc' && (
              <div className="space-y-6">
                {/* Monthly KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      فروخت شدہ بوتلیں / یونٹس ({currentMonthReport.monthName})
                    </p>
                    <p className="font-heading text-2xl font-black text-brand-charcoal font-mono">
                      {currentMonthReport.bottles1LSold + currentMonthReport.bottles500mlSold}
                      <span className="text-xs text-stone-500 font-normal ml-1.5">
                        ({currentMonthReport.bottles1LSold}x 1L, {currentMonthReport.bottles500mlSold}x 500ml)
                      </span>
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      🤖 آٹو بوتل / میٹریل خرچ (Materials)
                    </p>
                    <p className="font-heading text-2xl font-black text-amber-900 font-mono">
                      {formatPrice(currentMonthReport.autoPackagingMaterialCost)}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      فروخت شدہ بوتلوں کی بنیاد پر خودکار لاگت
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      🤖 آٹو لیبر و پیکنگ خرچ (Labor)
                    </p>
                    <p className="font-heading text-2xl font-black text-blue-900 font-mono">
                      {formatPrice(currentMonthReport.autoPackagingLaborCost)}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      فی بوتل لیبر چارجز کے مطابق
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-5 text-white shadow-sm space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-100">
                      کل پیکنگ خرچ (Total Packaging in P&amp;L)
                    </p>
                    <p className="font-heading text-2xl font-black font-mono">
                      {formatPrice(currentMonthReport.packagingCost)}
                    </p>
                    <p className="text-[10px] text-amber-100">
                      آٹو یونٹس ({formatPrice(currentMonthReport.autoPackagingCost)}) + مینوئل لیجر ({formatPrice(currentMonthReport.manualPackagingCost)})
                    </p>
                  </div>
                </div>

                {/* Itemized Table of Sold Units for this Month */}
                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <h4 className="font-heading font-black text-base text-stone-900 flex items-center gap-2">
                        <span>📋</span> اس مہینے کا خودکار پیکنگ بریک ڈاؤن ({currentMonthReport.monthName})
                      </h4>
                      <p className="text-xs text-stone-500">
                        ہر پروڈکٹ کی فروخت اور اس پر لگنے والے میٹریل و لیبر کا اصل شفاف حساب۔
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('reports')}
                      className="inline-flex items-center gap-1.5 bg-brand-green text-brand-cream px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-brand-green-light transition-all"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-brand-gold" />
                      ماہانہ P&amp;L رپورٹ دیکھیں &rarr;
                    </button>
                  </div>

                  {currentMonthReport.packagingBreakdownByVariant.length === 0 ? (
                    <div className="py-8 text-center space-y-2 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                      <p className="text-sm font-bold text-stone-700">
                        اس مہینے ({currentMonthReport.monthName}) میں ابھی تک کوئی آرڈر موصول نہیں ہوا۔
                      </p>
                      <p className="text-xs text-stone-500 max-w-md mx-auto">
                        جیسے ہی کسٹمر آرڈر کرے گا، اس کی فروخت شدہ بوتلوں کے مطابق 1L پر 65 روپے اور 500ml پر 45 روپے (اور دیگر پروڈکٹس کے سیٹ کردہ ریٹس) کے مطابق پیکنگ خرچ خود بخود یہاں کیلکولیٹ ہو جائے گا۔
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[10px]">
                            <th className="py-2.5 px-3">پراڈکٹ / سائز</th>
                            <th className="py-2.5 px-3 text-center">فروخت شدہ بوتلیں (Units Sold)</th>
                            <th className="py-2.5 px-3 text-center">بوتل میٹریل لاگت</th>
                            <th className="py-2.5 px-3 text-center">لیبر چارج فی یونٹ</th>
                            <th className="py-2.5 px-3 text-center">کل لاگت فی بوتل</th>
                            <th className="py-2.5 px-3 text-right">کل ماہانہ پیکنگ خرچ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {currentMonthReport.packagingBreakdownByVariant.map((item) => (
                            <tr key={item.variantId} className="hover:bg-stone-50">
                              <td className="py-3 px-3 font-bold text-stone-900">
                                <div>
                                  <p>{item.productName}</p>
                                  <p className="font-mono text-[10px] text-stone-400">{item.variantName}</p>
                                </div>
                              </td>

                              <td className="py-3 px-3 text-center font-mono font-black text-brand-green text-sm">
                                {item.unitsSold}
                              </td>

                              <td className="py-3 px-3 text-center font-mono text-stone-600">
                                Rs. {item.materialCostPerUnit}
                              </td>

                              <td className="py-3 px-3 text-center font-mono text-stone-600">
                                Rs. {item.laborCostPerUnit}
                              </td>

                              <td className="py-3 px-3 text-center font-mono font-bold text-amber-900">
                                <span className="bg-amber-100 px-2 py-0.5 rounded-lg">
                                  Rs. {item.totalUnitPackaging}
                                </span>
                              </td>

                              <td className="py-3 px-3 text-right font-mono font-black text-red-600 text-sm">
                                {formatPrice(item.totalPackagingExpense)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-stone-100 font-bold border-t-2 border-stone-300">
                            <td colSpan={5} className="py-3 px-3 text-stone-800">
                              🤖 کل آٹو پیکنگ و لیبر خرچ (Auto Packaging Subtotal)
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-black text-red-600 text-sm">
                              {formatPrice(currentMonthReport.autoPackagingCost)}
                            </td>
                          </tr>
                          {currentMonthReport.manualPackagingCost > 0 && (
                            <tr className="bg-stone-50 text-stone-600">
                              <td colSpan={5} className="py-2 px-3">
                                ✍️ اضافی مینوئل اخراجات (کارٹن، فائر پاکٹ، ٹیپ جو لیجر میں درج کیے گئے)
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold">
                                {formatPrice(currentMonthReport.manualPackagingCost)}
                              </td>
                            </tr>
                          )}
                          <tr className="bg-amber-100/70 font-black text-amber-950 border-t border-amber-300">
                            <td colSpan={5} className="py-3 px-3 text-sm">
                              کل پیکنگ میٹریل لاگت برائے ماہ (Total Packaging Expense in P&amp;L)
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-base font-black text-amber-900">
                              {formatPrice(currentMonthReport.packagingCost)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: P&L, EXPENSES & MONTHLY REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-8">
            {/* Top Controls Bar */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h3 className="font-heading font-black text-xl text-brand-charcoal flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-brand-green" />
                  Monthly Financial Statement &amp; P&amp;L Ledger
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  ماہانہ سیلز کا حجم، فیس بک ایڈز کی لاگت، پیکنگ و کوریئر اخراجات، اور حتمی منافع و نقصان برائے ریکارڈ۔
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                {/* Month Selector Dropdown */}
                <div className="flex items-center gap-2 bg-stone-50 border border-stone-300 rounded-2xl px-3.5 py-2 shadow-2xs">
                  <Calendar className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span className="text-xs font-bold text-stone-600">Month:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent font-mono font-bold text-xs text-brand-charcoal focus:outline-none cursor-pointer"
                  >
                    {availableMonths.map((m) => {
                      const [y, mon] = m.split('-');
                      const d = new Date(Number(y), Number(mon) - 1, 1);
                      const label = d.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
                      return (
                        <option key={m} value={m}>
                          {label} ({m})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Add Expense Button */}
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="inline-flex items-center gap-1.5 bg-brand-green hover:bg-brand-green-light text-brand-cream px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4 text-brand-gold" />
                  + Log Expense
                </button>

                {/* View Printable Statement Button */}
                <button
                  onClick={() => setShowMonthlyStatementModal(true)}
                  className="inline-flex items-center gap-1.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal px-4 py-2 rounded-2xl text-xs font-black transition-all shadow-sm active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  🖨️ Print Statement / PDF
                </button>

                {/* Export CSV */}
                <button
                  onClick={() => {
                    const csv = generateMonthlyReportCSV(currentMonthReport, selectedMonthExpenses);
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Soghat-Financial-Report-${currentMonthReport.month}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    setNotificationToast('CSV spreadsheet downloaded!');
                    setTimeout(() => setNotificationToast(null), 2500);
                  }}
                  className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs"
                  title="Download Excel / CSV spreadsheet file"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  CSV
                </button>

                {/* Base Rates Configuration */}
                <button
                  onClick={() => setShowFinSettingsModal(true)}
                  className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
                  title="Configure base rates (Default wholesale price, packaging & courier charges)"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 🏷️ MONTHLY WHOLESALE PURCHASE RATE OVERRIDE (خریداری قیمت برائے منتخب مہینہ) */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border-2 border-amber-300 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-amber-500 text-white text-xs">🏷️</span>
                    <h4 className="font-heading font-black text-base text-stone-900">
                      اس مہینے ({currentMonthReport.monthName}) مال کی خریداری لاگت (Wholesale Purchase Cost)
                    </h4>
                  </div>
                  <p className="text-xs text-stone-600 max-w-xl">
                    مارکیٹ ریٹ ہر مہینے مختلف ہوتا ہے۔ سرسوں کا تیل، دیسی گھی یا دیگر اشیاء جس ریٹ پر پڑیں، یہاں درج کریں۔ تمام پراڈکٹس کے مکمل ریٹس دیکھنے کیلئے ساتھ والا بٹن دبائیں۔
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('wholesale')}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    تمام پراڈکٹس کے ریٹس کا سیکشن کھولیں &rarr;
                  </button>
                </div>
              </div>

              {/* Dynamic Rates Grid for All Products */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-amber-200/80">
                {productList.flatMap((p) =>
                  p.variants.map((v) => {
                    const monthCost = getVariantWholesaleRate(v.id, v.costPrice || 0);
                    return (
                      <div
                        key={v.id}
                        className="bg-white/90 border border-amber-300 rounded-2xl p-3 shadow-2xs flex flex-col justify-between space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-xs text-stone-900 truncate">
                              {p.name.includes('Mustard') ? 'سرسوں کا تیل' : p.name.includes('Ghee') ? 'دیسی گھی' : p.name}
                            </p>
                            <p className="text-[10px] text-stone-500 font-mono">
                              {v.name} ({v.size}) &bull; سیل: {formatPrice(v.price)}
                            </p>
                          </div>
                          <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                            {v.size}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                            <span className="text-[10px] font-bold text-amber-900">خریداری:</span>
                            <span className="text-xs font-mono font-bold text-stone-400">Rs.</span>
                            <input
                              type="number"
                              min={0}
                              defaultValue={monthCost}
                              key={`${v.id}-${selectedMonth}-${monthCost}`}
                              onBlur={(e) =>
                                handleUpdateVariantMonthRate(v.id, Number(e.target.value) || 0)
                              }
                              className="w-full font-mono font-black text-xs text-stone-900 bg-transparent focus:outline-none"
                              placeholder="0"
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] px-1 text-stone-500 font-mono">
                            <span>پیکنگ: Rs. {getVariantPackaging(v.id, v).totalCost}</span>
                            <span className="font-bold text-emerald-800">
                              خالص: +{formatPrice(v.price - (monthCost + getVariantPackaging(v.id, v).totalCost))}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 4 Big KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Net Sales */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Total Sales Revenue ({currentMonthReport.monthName})
                    </p>
                    <p className="font-heading text-3xl font-black text-brand-green mt-2">
                      {formatPrice(currentMonthReport.netRevenue)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap justify-between text-[11px] text-stone-500">
                  <span>{currentMonthReport.ordersCount} Orders ({currentMonthReport.totalLiters} Liters)</span>
                  <span className="font-mono font-bold text-stone-700">Gross: {formatPrice(currentMonthReport.grossSales)}</span>
                </div>
              </div>

              {/* Card 2: Product Wholesale Cost (COGS) */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Wholesale Product Cost (COGS)
                    </p>
                    <p className="font-heading text-3xl font-black text-stone-800 mt-2">
                      {formatPrice(currentMonthReport.cogsProductCost)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap justify-between text-[11px] text-stone-500">
                  <span>{currentMonthReport.bottles1LSold}x1L, {currentMonthReport.bottles500mlSold}x500ml</span>
                  <span className="font-mono font-bold text-emerald-700">Gross Margin: {formatPrice(currentMonthReport.grossProfit)}</span>
                </div>
              </div>

              {/* Card 3: Total Expenses */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Total Monthly Expenses
                    </p>
                    <p className="font-heading text-3xl font-black text-red-600 mt-2">
                      {formatPrice(currentMonthReport.totalExpenses)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-500 truncate">
                  COGS + Ads ({formatPrice(currentMonthReport.adSpend)}) + Courier &amp; Packaging
                </div>
              </div>

              {/* Card 4: Net Profit or Loss */}
              <div
                className={`rounded-3xl p-6 border-2 shadow-sm relative overflow-hidden ${
                  currentMonthReport.isProfit ? 'bg-emerald-50/70 border-emerald-500' : 'bg-red-50/70 border-red-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span
                      className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded text-white ${
                        currentMonthReport.isProfit ? 'bg-emerald-700' : 'bg-red-700'
                      }`}
                    >
                      {currentMonthReport.isProfit ? 'PROFITABLE (خالص منافع)' : 'NET LOSS (خالص نقصان)'}
                    </span>
                    <p
                      className="font-heading text-3xl font-black mt-1.5"
                      style={{ color: currentMonthReport.isProfit ? '#065f46' : '#991b1b' }}
                    >
                      {formatPrice(currentMonthReport.netProfit)}
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold"
                    style={{
                      background: currentMonthReport.isProfit ? '#d1fae5' : '#fee2e2',
                      color: currentMonthReport.isProfit ? '#047857' : '#b91c1c',
                    }}
                  >
                    {currentMonthReport.isProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-black/10 flex justify-between items-center text-[11px]">
                  <span className="font-bold text-stone-600">Net Profit Margin:</span>
                  <span
                    className="font-mono font-black text-sm"
                    style={{ color: currentMonthReport.isProfit ? '#047857' : '#b91c1c' }}
                  >
                    {currentMonthReport.profitMarginPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Expense Category Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category 1: Ads */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                      Social Media Ads (اشتہارات)
                    </p>
                    <p className="font-heading text-2xl font-black text-stone-900 mt-1">
                      {formatPrice(currentMonthReport.adSpend)}
                    </p>
                  </div>
                  <span className="p-2 rounded-xl bg-blue-50 text-blue-700 text-xs">📱</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Facebook, Instagram, Google &amp; TikTok Ad Campaigns
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setNewExpenseCategory('ads');
                    setNewExpenseTitle('Meta / Facebook Ads Campaign');
                    setShowAddExpenseModal(true);
                  }}
                  className="w-full text-center py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl font-bold text-xs transition-colors"
                >
                  + Add Ad Spend
                </button>
              </div>

              {/* Category 2: Packaging */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                      Packaging &amp; Labour Materials (پیکنگ و لیبر)
                    </p>
                    <p className="font-heading text-2xl font-black text-stone-900 mt-1">
                      {formatPrice(currentMonthReport.packagingCost)}
                    </p>
                  </div>
                  <span className="p-2 rounded-xl bg-amber-50 text-amber-700 text-xs">📦</span>
                </div>
                <div className="space-y-1 text-[11px] text-stone-600 border-t border-stone-100 pt-2">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <span>🤖</span> فروخت شدہ یونٹس (Auto):
                    </span>
                    <span className="font-mono font-bold text-amber-900">
                      {formatPrice(currentMonthReport.autoPackagingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span className="flex items-center gap-1">
                      <span>✍️</span> مینوئل اخراجات (Manual Ledger):
                    </span>
                    <span className="font-mono">
                      {formatPrice(currentMonthReport.manualPackagingCost)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('wholesale');
                      setCostSubTab('packaging');
                    }}
                    className="flex-1 text-center py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl font-bold text-xs transition-colors"
                  >
                    ⚙️ پیکنگ ریٹس
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewExpenseCategory('packaging');
                      setNewExpenseTitle('Packaging Cartons & Tape');
                      setShowAddExpenseModal(true);
                    }}
                    className="flex-1 text-center py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs transition-colors"
                  >
                    + مینوئل خرچ
                  </button>
                </div>
              </div>

              {/* Category 3: Courier Delivery */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                      Courier Dispatch Fee (ڈلیوری)
                    </p>
                    <p className="font-heading text-2xl font-black text-stone-900 mt-1">
                      {formatPrice(currentMonthReport.courierCost)}
                    </p>
                  </div>
                  <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs">🚚</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Charges paid to TCS, Leopards, Trax or local riders
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setNewExpenseCategory('delivery');
                    setNewExpenseTitle('Courier Delivery Invoice Payment');
                    setShowAddExpenseModal(true);
                  }}
                  className="w-full text-center py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs transition-colors"
                >
                  + Add Courier Bill
                </button>
              </div>

              {/* Category 4: Operational & Overheads */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-900">
                      Operational &amp; Misc (کرایہ و دیگر)
                    </p>
                    <p className="font-heading text-2xl font-black text-stone-900 mt-1">
                      {formatPrice(currentMonthReport.operationalCost + currentMonthReport.otherExpenses)}
                    </p>
                  </div>
                  <span className="p-2 rounded-xl bg-purple-50 text-purple-700 text-xs">🏢</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Facility rent, worker wages, electricity bills &amp; fuel
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setNewExpenseCategory('operational');
                    setNewExpenseTitle('Monthly Facility Rent / Staff');
                    setShowAddExpenseModal(true);
                  }}
                  className="w-full text-center py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl font-bold text-xs transition-colors"
                >
                  + Add Operational Cost
                </button>
              </div>
            </div>

            {/* Itemized Expenses Ledger Table */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="font-heading font-bold text-base text-brand-charcoal">
                    Itemized Expenses Log &bull; {currentMonthReport.monthName} ({selectedMonthExpenses.length} Records)
                  </h4>
                  <p className="text-xs text-stone-500">
                    All recorded operational expenditures for financial auditing and tax records.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingExpense(null);
                      setNewExpenseCategory('ads');
                      setNewExpenseTitle('');
                      setNewExpenseAmount('');
                      setNewExpenseNotes('');
                      setShowAddExpenseModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 bg-brand-green hover:bg-brand-green-light text-brand-cream px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-gold" />
                    + نیا خرچ درج کریں (Add Expense)
                  </button>
                </div>
              </div>

              {selectedMonthExpenses.length === 0 ? (
                <div className="py-10 text-center space-y-3 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                  <p className="text-sm font-semibold text-stone-600">
                    ابھی تک {currentMonthReport.monthName} کا کوئی خرچہ درج نہیں کیا گیا۔
                  </p>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    (تمام اخراجات 100% مینوئل ہیں۔ آپ فیس بک اشتہارات، پیکنگ میٹریل، یا کوریئر ڈلیوری کا خرچ اوپر دیے گئے بٹنوں سے خود درج کر سکتے ہیں)۔
                  </p>
                  <button
                    onClick={() => {
                      setEditingExpense(null);
                      setShowAddExpenseModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 bg-brand-green text-brand-cream px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-green-light"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-gold" />
                    پہلا خرچ درج کریں (Log First Expense)
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Title / Description</th>
                        <th className="py-3 px-3">Notes &amp; Details</th>
                        <th className="py-3 px-3 text-right">Amount (PKR)</th>
                        <th className="py-3 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {selectedMonthExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-stone-50">
                          <td className="py-3 px-3 font-mono text-stone-600 whitespace-nowrap">
                            {exp.date}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`uppercase text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                exp.category === 'ads'
                                  ? 'bg-blue-100 text-blue-800'
                                  : exp.category === 'packaging'
                                  ? 'bg-amber-100 text-amber-800'
                                  : exp.category === 'delivery'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-stone-900">
                            {exp.title}
                          </td>
                          <td className="py-3 px-3 text-stone-500 max-w-xs truncate">
                            {exp.notes || '-'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-red-600 text-sm">
                            {formatPrice(exp.amount)}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditExpense(exp)}
                                className="inline-flex items-center gap-1 text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                                title="Edit this entry"
                              >
                                <Edit3 className="w-3 h-3 text-stone-500" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(exp.id, exp.title)}
                                className="inline-flex items-center gap-1 text-red-600 hover:text-white bg-red-50 hover:bg-red-600 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-2xs"
                                title="Delete this entry"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete (مٹائیں)
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

        {/* TAB 6: SETTINGS */}
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
                <label className="font-bold text-stone-700">Official Shipper Return Address (Printed on Parcel Slips)</label>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-700 space-y-0.5">
                  <p className="font-bold text-brand-green">Soghat-e-Chakwal Main Hub</p>
                  <p className="text-[11px]">Shop MC33, Street 1, Ghauri Town, Phase 7, Islamabad, Pakistan</p>
                  <p className="text-[11px] font-mono text-stone-600">Helpline: +92 300 8325693</p>
                </div>
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

              {/* ── Notification APIs & Automated Messaging Setup ── */}
              <div className="border-t border-stone-200 pt-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-gold" />
                  <h4 className="font-heading font-bold text-sm text-brand-charcoal">
                    Automated Customer Notifications (Email, WhatsApp &amp; SMS)
                  </h4>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Jab koi customer order place kare ya aap admin panel mein status (Confirmed &rarr; Shipped &rarr; Delivered) tabdeel karein, to customer ko automated messages bhejnay ka nizam yahan se control hota hai:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Email Channel */}
                  <div className="bg-emerald-50/70 p-3.5 rounded-2xl border-2 border-emerald-400 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-brand-green font-bold text-xs">
                        <Mail className="w-3.5 h-3.5 text-brand-gold" />
                        1. Auto Email (Resend)
                      </div>
                      <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        CONNECTED
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-600">
                      Branded HTML receipt bill. Automatic customer dispatch active.
                    </p>
                    <p className="font-mono text-[9px] bg-white p-1 rounded border border-emerald-300 text-emerald-800 font-bold truncate">
                      RESEND_API_KEY (Active)
                    </p>
                  </div>

                  {/* SMS Channel */}
                  <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-brand-green font-bold text-xs">
                      <Send className="w-3.5 h-3.5 text-brand-gold" />
                      2. Auto SMS (Phone)
                    </div>
                    <p className="text-[10px] text-stone-500">
                      Pakistani mobile SMS (Twilio or SendPK / BrandSMS gateway API).
                    </p>
                    <p className="font-mono text-[9px] bg-white p-1 rounded border text-stone-700">
                      TWILIO_ACCOUNT_SID
                    </p>
                  </div>

                  {/* WhatsApp Channel */}
                  <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-brand-green font-bold text-xs">
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      3. WhatsApp Update
                    </div>
                    <p className="text-[10px] text-stone-500">
                      UltraMsg API for background auto-send, ya 1-Click WhatsApp button in Orders table.
                    </p>
                    <p className="font-mono text-[9px] bg-white p-1 rounded border text-stone-700">
                      ULTRAMSG_TOKEN
                    </p>
                  </div>
                </div>

                {/* Interactive Test Notification Form */}
                <form onSubmit={handleSendTestNotification} className="bg-brand-ivory/60 p-4 rounded-2xl border border-brand-green/10 space-y-3">
                  <p className="font-bold text-stone-800 text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                    Send Test Customer Notification (Dispatch Test)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-stone-600 block mb-0.5">Test Recipient Email:</label>
                      <input
                        type="email"
                        value={testNotifEmail}
                        onChange={(e) => setTestNotifEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full px-3 py-1.5 bg-white border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-600 block mb-0.5">Test Recipient Phone / WhatsApp:</label>
                      <input
                        type="text"
                        value={testNotifPhone}
                        onChange={(e) => setTestNotifPhone(e.target.value)}
                        placeholder="03001234567"
                        className="w-full px-3 py-1.5 bg-white border rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={testNotifLoading}
                      className="bg-brand-green hover:bg-brand-green-light text-brand-cream px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                    >
                      {testNotifLoading ? 'Dispatching Test...' : 'Send Test Notification'}
                    </button>
                    {testNotifStatus && (
                      <span className="text-[10px] font-semibold text-brand-green">
                        {testNotifStatus}
                      </span>
                    )}
                  </div>
                </form>
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

        {/* ── Custom WhatsApp / Manual Order Modal ── */}
        {showAddOrderModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full space-y-4 shadow-2xl border border-stone-200 my-auto max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-3 sticky top-0 bg-white z-10">
                <div>
                  <h4 className="font-heading font-bold text-lg sm:text-xl text-brand-green flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    Create Custom / WhatsApp Order
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Generate instant invoices &amp; parcel dispatch slips with custom rates, discounts, or free delivery.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddOrderModal(false)}
                  className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 rounded-lg"
                >
                  &times; Close
                </button>
              </div>

              <form onSubmit={handleCreateManualOrder} className="space-y-4 text-xs">
                {/* 1. Customer Information */}
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-3">
                  <h5 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-brand-green" />
                    Customer &amp; Delivery Information
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Customer Full Name *</label>
                      <input
                        type="text"
                        required
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="e.g. Usman Tariq"
                        className="w-full px-3 py-2 border rounded-xl bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Phone / WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        value={manualPhone}
                        onChange={(e) => setManualPhone(e.target.value)}
                        placeholder="0300 1234567"
                        className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={manualCity}
                        onChange={(e) => setManualCity(e.target.value)}
                        placeholder="e.g. Chakwal, Rawalpindi"
                        className="w-full px-3 py-2 border rounded-xl bg-white text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-stone-700 block mb-1">Complete Delivery Address *</label>
                      <input
                        type="text"
                        required
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value)}
                        placeholder="House / Shop #, Street, Mohallah / Sector"
                        className="w-full px-3 py-2 border rounded-xl bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Order / Landmark Notes <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={manualNotes}
                      onChange={(e) => setManualNotes(e.target.value)}
                      placeholder="e.g. Special deal via WhatsApp, deliver after 4 PM"
                      className="w-full px-3 py-2 border rounded-xl bg-white text-xs"
                    />
                  </div>
                </div>

                {/* 2. Products & Custom Pricing Rows */}
                <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-amber-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-amber-700" />
                      Order Items &amp; Custom Unit Pricing
                    </h5>
                    <button
                      type="button"
                      onClick={handleAddManualItemRow}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      + Add Item Row
                    </button>
                  </div>

                  <div className="space-y-2">
                    {manualItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs grid grid-cols-12 gap-2 items-center"
                      >
                        <div className="col-span-12 sm:col-span-4">
                          <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                            Product #{idx + 1}
                          </label>
                          <select
                            value={item.variantChoice}
                            onChange={(e) =>
                              handleUpdateManualItem(item.id, 'variantChoice', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs font-medium"
                          >
                            {productList.flatMap((p) =>
                              p.variants.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {p.name.includes('Mustard')
                                    ? 'Mustard Oil'
                                    : p.name.includes('Ghee')
                                    ? 'Desi Ghee'
                                    : p.name}{' '}
                                  — {v.name} (Rs. {v.price})
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        <div className="col-span-4 sm:col-span-2">
                          <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                            Qty
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={item.qty}
                            onChange={(e) =>
                              handleUpdateManualItem(item.id, 'qty', Number(e.target.value) || 1)
                            }
                            className="w-full px-2 py-1.5 border rounded-lg text-center font-bold text-xs"
                          />
                        </div>

                        <div className="col-span-8 sm:col-span-4">
                          <label className="text-[10px] font-bold text-stone-700 block mb-0.5">
                            Custom Rate (PKR)
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-stone-400 font-bold text-xs">Rs.</span>
                            <input
                              type="number"
                              min={0}
                              value={item.customPrice}
                              onChange={(e) =>
                                handleUpdateManualItem(item.id, 'customPrice', Number(e.target.value))
                              }
                              className="w-full pl-9 pr-2 py-1.5 border-2 border-emerald-500 rounded-lg font-bold text-xs text-brand-green bg-white shadow-2xs"
                              placeholder="e.g. 650"
                              title="Enter custom price agreed on WhatsApp"
                            />
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(() => {
                              let base = 700;
                              for (const p of productList) {
                                const found = p.variants.find((v) => v.id === item.variantChoice);
                                if (found) {
                                  base = found.price;
                                  break;
                                }
                              }
                              if (item.variantChoice === '1l') base = 700;
                              if (item.variantChoice === '500ml') base = 350;
                              const disc1 = Math.max(0, base - 50);
                              const disc2 = Math.max(0, base - 100);

                              return (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateManualItem(item.id, 'customPrice', disc1)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-black border transition-all ${
                                      item.customPrice === disc1
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                                    }`}
                                  >
                                    🔥 {disc1} (-50)
                                  </button>
                                  {disc2 > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateManualItem(item.id, 'customPrice', disc2)}
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                                        item.customPrice === disc2
                                          ? 'bg-emerald-600 text-white border-emerald-600'
                                          : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                                      }`}
                                    >
                                      {disc2} (-100)
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateManualItem(item.id, 'customPrice', base)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                                      item.customPrice === base
                                        ? 'bg-stone-800 text-white border-stone-800'
                                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                                    }`}
                                  >
                                    Original ({base})
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="col-span-12 sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0">
                          <div className="text-right">
                            <span className="text-[9px] text-stone-400 block sm:hidden">Total:</span>
                            <span className="font-mono font-bold text-xs text-stone-800">
                              {formatPrice(item.customPrice * item.qty)}
                            </span>
                          </div>
                          {manualItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveManualItemRow(item.id)}
                              className="text-stone-400 hover:text-red-600 p-1 rounded-md"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Shipping & Discount Controls */}
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Shipping Choice */}
                  <div className="space-y-2">
                    <label className="font-bold text-stone-700 block text-[11px] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-brand-green" />
                      Delivery / Shipping Fee
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setManualShippingMode('free')}
                        className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                          manualShippingMode === 'free'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-500'
                        }`}
                      >
                        🎉 FREE
                      </button>
                      <button
                        type="button"
                        onClick={() => setManualShippingMode('standard')}
                        className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                          manualShippingMode === 'standard'
                            ? 'bg-brand-green text-white border-brand-green shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-brand-green'
                        }`}
                      >
                        Standard
                      </button>
                      <button
                        type="button"
                        onClick={() => setManualShippingMode('custom')}
                        className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                          manualShippingMode === 'custom'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-amber-500'
                        }`}
                      >
                        Custom Fee
                      </button>
                    </div>

                    {manualShippingMode === 'custom' && (
                      <div className="pt-1">
                        <label className="text-[10px] text-stone-500 block mb-0.5">Custom Shipping Fee (PKR):</label>
                        <input
                          type="number"
                          min={0}
                          value={manualCustomShipping}
                          onChange={(e) => setManualCustomShipping(Number(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 border rounded-xl bg-white font-bold text-xs"
                          placeholder="e.g. 150"
                        />
                      </div>
                    )}
                  </div>

                  {/* Special Deal Discount */}
                  <div className="space-y-2">
                    <label className="font-bold text-stone-700 block text-[11px] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-red-600" />
                      Special Deal Discount (PKR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-stone-400 font-bold text-xs">Rs.</span>
                      <input
                        type="number"
                        min={0}
                        value={manualDiscount}
                        onChange={(e) => setManualDiscount(Number(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full pl-9 pr-3 py-1.5 border rounded-xl bg-white font-bold text-xs text-red-600"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500">
                      Subtracted directly from items subtotal on the customer invoice.
                    </p>
                  </div>
                </div>

                {/* 4. Payment Method & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Payment Method</label>
                    <select
                      value={manualPayment}
                      onChange={(e) => setManualPayment(e.target.value as 'cod' | 'bank_transfer')}
                      className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-medium"
                    >
                      <option value="cod">Cash on Delivery (COD)</option>
                      <option value="bank_transfer">Direct Bank Transfer / EasyPaisa</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Payment Status</label>
                    <select
                      value={manualPaymentStatus}
                      onChange={(e) => setManualPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-medium"
                    >
                      <option value="pending">Pending (To Collect on Delivery)</option>
                      <option value="received">Received / Already Paid</option>
                    </select>
                  </div>
                </div>

                {/* 5. Live Summary Box */}
                <div className="bg-emerald-950 text-emerald-100 p-4 rounded-2xl space-y-1.5 shadow-md">
                  <div className="flex justify-between text-xs text-emerald-300">
                    <span>Items Subtotal:</span>
                    <span className="font-mono font-bold">{formatPrice(computedManualSubtotal)}</span>
                  </div>
                  {computedManualDiscount > 0 && (
                    <div className="flex justify-between text-xs text-amber-300">
                      <span>Special Discount:</span>
                      <span className="font-mono font-bold">-{formatPrice(computedManualDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-emerald-300">
                    <span>Shipping / Delivery:</span>
                    <span className="font-mono font-bold">
                      {computedManualShipping === 0 ? 'FREE (Rs. 0)' : formatPrice(computedManualShipping)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-emerald-800 flex justify-between items-center text-white">
                    <span className="font-black text-sm uppercase tracking-wide">Net Amount To Collect:</span>
                    <span className="font-mono font-black text-xl text-brand-gold">
                      {formatPrice(computedManualTotal)}
                    </span>
                  </div>
                </div>

                {/* 6. Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-brand-green text-brand-cream py-3 rounded-xl font-bold hover:bg-brand-green-light transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4 text-brand-gold" />
                    Save &amp; Generate Custom Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddOrderModal(false)}
                    className="bg-stone-100 text-stone-600 px-5 py-3 rounded-xl font-semibold hover:bg-stone-200 transition-colors"
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
            onClose={() => {
              setInvoiceOrder(null);
              setInvoiceEditMode(false);
            }}
            defaultMode={invoiceMode}
            initialEditMode={invoiceEditMode}
            onUpdateOrder={(updatedOrder) => {
              setOrders((prev) =>
                prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
              );
              setInvoiceOrder(updatedOrder);
              setNotificationToast(`Bill updated for ${updatedOrder.orderNumber}! Net total: Rs. ${updatedOrder.total}`);
              setTimeout(() => setNotificationToast(null), 3000);
            }}
          />
        )}

        {/* ── Official Printable Monthly Financial Statement & P&L Modal ── */}
        {showMonthlyStatementModal && (
          <MonthlyReportModal
            report={currentMonthReport}
            expenses={selectedMonthExpenses}
            onClose={() => setShowMonthlyStatementModal(false)}
          />
        )}

        {/* ── Add / Edit Expense Entry Modal ── */}
        {showAddExpenseModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <h3 className="font-heading font-black text-lg text-brand-charcoal flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-brand-green" />
                  {editingExpense ? 'خرچہ تبدیل کریں (Edit Expense)' : 'نیا خرچ درج کریں (Log Business Expense)'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddExpenseModal(false);
                    setEditingExpense(null);
                  }}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Expense Category (خرچ کی قسم)</label>
                  <select
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 border rounded-xl bg-white font-medium"
                  >
                    <option value="ads">📱 Social Media Ads (فیس بک، انسٹاگرام، گوگل ایڈز)</option>
                    <option value="packaging">📦 Packaging Materials (کارٹن، ببل ریپ، بوتلیں، ٹیپ)</option>
                    <option value="delivery">🚚 Courier Delivery (ٹی سی ایس، لیپرڈز، ٹریکس وغیرہ کا بل)</option>
                    <option value="operational">🏢 Operational &amp; Rent (دکان/فیکٹری کا کرایہ، بجلی، ملازمین کی تنخواہ)</option>
                    <option value="inventory">🌾 Raw Material &amp; Inventory (خام مال، بیج، گھی کی خریداری)</option>
                    <option value="other">📝 Miscellaneous (دیگر متفرق اخراجات)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Expense Title / Description (تفصیل)</label>
                  <input
                    type="text"
                    required
                    value={newExpenseTitle}
                    onChange={(e) => setNewExpenseTitle(e.target.value)}
                    placeholder="e.g. Meta Ads Video Campaign Nov 23"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Amount (رقم - PKR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-stone-400 font-bold text-xs">Rs.</span>
                      <input
                        type="number"
                        min={1}
                        required
                        value={newExpenseAmount}
                        onChange={(e) => setNewExpenseAmount(e.target.value)}
                        placeholder="1500"
                        className="w-full pl-9 pr-3 py-2 border rounded-xl font-mono font-bold text-stone-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Expense Date (تاریخ)</label>
                    <input
                      type="date"
                      required
                      value={newExpenseDate}
                      onChange={(e) => setNewExpenseDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Notes &amp; Particulars (اضافی تفصیل - اختیاری)</label>
                  <textarea
                    rows={2}
                    value={newExpenseNotes}
                    onChange={(e) => setNewExpenseNotes(e.target.value)}
                    placeholder="e.g. TCS Invoice #12345 or Meta Ad receipt"
                    className="w-full px-3 py-2 border rounded-xl resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-brand-green text-brand-cream py-2.5 rounded-xl font-bold hover:bg-brand-green-light transition-all shadow-sm"
                  >
                    {editingExpense ? 'تبدیلی محفوظ کریں (Update Record)' : 'خرچ محفوظ کریں (Save Expense Record)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddExpenseModal(false);
                      setEditingExpense(null);
                    }}
                    className="bg-stone-100 text-stone-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-stone-200"
                  >
                    منسوخ (Cancel)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Base Financial Rates & COGS Configuration Modal ── */}
        {showFinSettingsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <h3 className="font-heading font-black text-lg text-brand-charcoal flex items-center gap-2">
                  <Settings className="w-5 h-5 text-brand-green" />
                  Base Rates &amp; Default Costs
                </h3>
                <button
                  type="button"
                  onClick={() => setShowFinSettingsModal(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFinSettings} className="space-y-3.5 text-xs">
                <p className="text-stone-500 text-[11px]">
                  یہ ڈیفالٹ خریداری ریٹس ہیں جو تب استعمال ہوں گے جب کسی مہینے کا الگ ریٹ نہ دیا گیا ہو۔ تمام دیگر اخراجات (اشتہارات، پیکنگ، کوریئر) 100% مینوئل ہیں۔
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Default 1L Wholesale Cost (PKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={finSettings.defaultCostPrice1L}
                      onChange={(e) =>
                        setFinSettings({ ...finSettings, defaultCostPrice1L: Number(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                    />
                    <span className="text-[10px] text-stone-400">1 لیٹر بوتل خریداری ریٹ</span>
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Default 500ml Wholesale Cost (PKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={finSettings.defaultCostPrice500ml}
                      onChange={(e) =>
                        setFinSettings({ ...finSettings, defaultCostPrice500ml: Number(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                    />
                    <span className="text-[10px] text-stone-400">500ml بوتل خریداری ریٹ</span>
                  </div>
                </div>

                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-stone-600 text-[11px] space-y-1">
                  <p className="font-bold text-stone-800">📌 نوٹ برائے اخراجات (100% Manual Entry):</p>
                  <p>
                    فیس بک ایڈز کی لاگت، کوریئر کمپنیوں کا اصل بل، اور پیکنگ میٹریل کی خریداری آپ ماہانہ رپورٹ کے اندر دیے گئے بٹنوں کے ذریعے خود مینوئل درج کر سکتے ہیں، اور غلط انٹری کو کسی بھی وقت ڈیلیٹ کر سکتے ہیں۔
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-brand-green text-brand-cream py-2.5 rounded-xl font-bold hover:bg-brand-green-light"
                  >
                    Save Base Rates (محفوظ کریں)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFinSettingsModal(false)}
                    className="bg-stone-100 text-stone-600 px-4 py-2.5 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
