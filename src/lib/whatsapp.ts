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
    const priceLine =
      item.variant.compareAtPrice && item.variant.compareAtPrice > item.variant.price
        ? `   Price: ~Rs. ${item.variant.compareAtPrice.toLocaleString()}~ Rs. ${item.variant.price.toLocaleString()} (Sale) × ${item.quantity} = Rs. ${itemTotal.toLocaleString()}`
        : `   Price: Rs. ${item.variant.price.toLocaleString()} × ${item.quantity} = Rs. ${itemTotal.toLocaleString()}`;

    lines.push(
      `${index + 1}. ${item.product.name}`,
      `   Size: ${item.variant.name}`,
      `   Qty: ${item.quantity}`,
      priceLine,
      ''
    );
  });

  const totalLiters = items.reduce((sum, item) => {
    const size = (item.variant.size || '').toLowerCase();
    let liters = 0;
    if (size.includes('1l') || size.includes('1 liter') || size === '1l') liters = 1;
    else if (size.includes('500ml') || size.includes('0.5l') || size === '500ml') liters = 0.5;
    else if (item.variant.weight) liters = item.variant.weight / 1000;
    else liters = item.variant.price / 700;
    return sum + liters * item.quantity;
  }, 0);

  const shipping = totalLiters >= 3 || subtotal >= 2100 ? 0 : 200;
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
