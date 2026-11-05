// ============================================================
// Meta (Facebook) Pixel Helper — Soghat-e-Chakwal
// ============================================================

export const FB_PIXEL_ID = '1559230849573012';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export function trackEvent(eventName: string, data?: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      if (data) {
        window.fbq('track', eventName, data);
      } else {
        window.fbq('track', eventName);
      }
    } catch {
      // Ignore if blocked by adblocker
    }
  }
}
