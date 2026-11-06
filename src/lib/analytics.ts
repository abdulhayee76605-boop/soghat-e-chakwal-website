// ============================================================
// Analytics & Conversion Tracking Hooks
// (GA4, Meta Pixel, Google Ads & Live Funnel Analytics)
// ============================================================

export interface AnalyticsItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}

export interface FunnelMetrics {
  sessions: number;
  pageViews: number;
  productViews: number;
  addToCart: number;
  checkouts: number;
  orders: number;
  lastUpdated: string;
}

const FUNNEL_STORAGE_KEY = 'sec_analytics_funnel';

const zeroFunnel: FunnelMetrics = {
  sessions: 0,
  pageViews: 0,
  productViews: 0,
  addToCart: 0,
  checkouts: 0,
  orders: 0,
  lastUpdated: new Date().toISOString(),
};

export function getFunnelMetrics(): FunnelMetrics {
  if (typeof window === 'undefined') {
    return zeroFunnel;
  }

  try {
    const raw = localStorage.getItem(FUNNEL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(zeroFunnel));
      return zeroFunnel;
    }
    const parsed = JSON.parse(raw);
    return {
      sessions: Number(parsed.sessions) || 0,
      pageViews: Number(parsed.pageViews) || 0,
      productViews: Number(parsed.productViews) || 0,
      addToCart: Number(parsed.addToCart) || 0,
      checkouts: Number(parsed.checkouts) || 0,
      orders: Number(parsed.orders) || 0,
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    };
  } catch {
    return zeroFunnel;
  }
}

export async function fetchServerFunnel(): Promise<FunnelMetrics> {
  try {
    const res = await fetch('/api/analytics', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (typeof window !== 'undefined') {
        const local = getFunnelMetrics();
        // Take maximum of server & local so counts never reset
        const merged: FunnelMetrics = {
          sessions: Math.max(local.sessions, data.sessions || 0),
          pageViews: Math.max(local.pageViews, data.pageViews || 0),
          productViews: Math.max(local.productViews, data.productViews || 0),
          addToCart: Math.max(local.addToCart, data.addToCart || 0),
          checkouts: Math.max(local.checkouts, data.checkouts || 0),
          orders: Math.max(local.orders, data.orders || 0),
          lastUpdated: data.lastUpdated || new Date().toISOString(),
        };
        localStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
      return data;
    }
  } catch {
    // Fallback to local
  }
  return getFunnelMetrics();
}

export function trackFunnelStep(step: keyof Omit<FunnelMetrics, 'lastUpdated'>) {
  if (typeof window === 'undefined') return;
  try {
    const current = getFunnelMetrics();
    current[step] = (current[step] || 0) + 1;
    current.lastUpdated = new Date().toISOString();
    localStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(current));

    // Also send to shared server endpoint
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step }),
    }).catch(() => {});
  } catch {
    // Ignore
  }
}

export function recordVisitorSession() {
  if (typeof window === 'undefined') return;
  try {
    const hasSession = sessionStorage.getItem('sec_session_recorded');
    if (!hasSession) {
      sessionStorage.setItem('sec_session_recorded', 'true');
      trackFunnelStep('sessions');
    }
    trackFunnelStep('pageViews');
  } catch {
    // Ignore
  }
}

export function trackAddToCart(item: AnalyticsItem) {
  trackFunnelStep('addToCart');
  if (typeof window === 'undefined') return;

  // Google Analytics 4 (gtag)
  if (typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === 'function') {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'add_to_cart', {
      currency: 'PKR',
      value: item.price * item.quantity,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
          item_variant: item.variant,
        },
      ],
    });
  }

  // Meta Pixel (fbq)
  if (typeof (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq === 'function') {
    (window as unknown as { fbq: (...args: unknown[]) => void }).fbq('track', 'AddToCart', {
      content_name: item.name,
      content_ids: [item.id],
      content_type: 'product',
      value: item.price * item.quantity,
      currency: 'PKR',
    });
  }
}

export function trackInitiateCheckout(items: AnalyticsItem[], total: number) {
  trackFunnelStep('checkouts');
  if (typeof window === 'undefined') return;

  if (typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === 'function') {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'begin_checkout', {
      currency: 'PKR',
      value: total,
      items: items.map((i) => ({
        item_id: i.id,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    });
  }

  if (typeof (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq === 'function') {
    (window as unknown as { fbq: (...args: unknown[]) => void }).fbq('track', 'InitiateCheckout', {
      value: total,
      currency: 'PKR',
      num_items: items.reduce((s, i) => s + i.quantity, 0),
    });
  }
}

export function trackPurchase(orderNumber: string, total: number, items: AnalyticsItem[]) {
  trackFunnelStep('orders');
  if (typeof window === 'undefined') return;

  const purchaseKey = `tracked_purchase_${orderNumber}`;
  if (sessionStorage.getItem(purchaseKey)) return;
  sessionStorage.setItem(purchaseKey, 'true');

  if (typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === 'function') {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'purchase', {
      transaction_id: orderNumber,
      value: total,
      currency: 'PKR',
      items: items.map((i) => ({
        item_id: i.id,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    });
  }

  if (typeof (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq === 'function') {
    (window as unknown as { fbq: (...args: unknown[]) => void }).fbq('track', 'Purchase', {
      value: total,
      currency: 'PKR',
      content_ids: items.map((i) => i.id),
      content_type: 'product',
    });
  }
}

export function trackWhatsAppClick(source: string, productName?: string) {
  if (typeof window === 'undefined') return;

  if (typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === 'function') {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'contact_whatsapp', {
      source,
      product_name: productName,
    });
  }
}
