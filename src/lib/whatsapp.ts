// ============================================================
// WhatsApp Utility Functions
// ============================================================

import { CartItem } from './types';
import { siteConfig } from './config';

export function generateWhatsAppMessage(items: CartItem[], customerName?: string): string {
  const lines: string[] = [
    '🛒 *New Order — Soghat-e-Chakwal*',
    '',
  ];

  if (customerName) {
    lines.push(`👤 Customer: ${customerName}`);
    lines.push('');
  }

  lines.push('📦 *Order Details:*');
  lines.push('');

  let subtotal = 0;

  items.forEach((item, index) => {
    const itemTotal = item.variant.price * item.quantity;
    subtotal += itemTotal;
    lines.push(
      `${index + 1}. ${item.product.name}`,
      `   Size: ${item.variant.name}`,
      `   Qty: ${item.quantity}`,
      `   Price: Rs. ${item.variant.price.toLocaleString()} × ${item.quantity} = Rs. ${itemTotal.toLocaleString()}`,
      ''
    );
  });

  const shipping = subtotal >= 2000 ? 0 : 200;
  const total = subtotal + shipping;

  lines.push('─────────────────');
  lines.push(`💰 Subtotal: Rs. ${subtotal.toLocaleString()}`);
  lines.push(`🚚 Shipping: ${shipping === 0 ? 'FREE' : `Rs. ${shipping}`}`);
  lines.push(`*💵 Total: Rs. ${total.toLocaleString()}*`);
  lines.push('');
  lines.push('📍 Please share your delivery address.');

  return lines.join('\n');
}

export function generateProductWhatsAppMessage(
  productName: string,
  size: string,
  quantity: number,
  price: number
): string {
  const total = price * quantity;
  const lines = [
    '🛒 *Order Inquiry — Soghat-e-Chakwal*',
    '',
    `📦 Product: ${productName}`,
    `📏 Size: ${size}`,
    `🔢 Quantity: ${quantity}`,
    `💰 Unit Price: Rs. ${price.toLocaleString()}`,
    `*💵 Total: Rs. ${total.toLocaleString()}*`,
    '',
    '📍 Please share your delivery address.',
  ];

  return lines.join('\n');
}

export function getWhatsAppUrl(message: string): string {
  return `${siteConfig.whatsappLink}?text=${encodeURIComponent(message)}`;
}
