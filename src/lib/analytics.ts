// ============================================================
// Analytics & Conversion Tracking Hooks
// (GA4, Meta Pixel, Google Ads)
// ============================================================

export interface AnalyticsItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}

export function trackAddToCart(item: AnalyticsItem) {
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
  if (typeof window === 'undefined') return;

  // Prevent duplicate firing using sessionStorage
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
