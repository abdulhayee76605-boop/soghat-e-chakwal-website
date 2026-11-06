// ============================================================
// Soghat-e-Chakwal — Customer Notification Engine
// Multi-Channel: Email, WhatsApp, and SMS Status Updates
// ============================================================

import { Order, OrderStatus } from './types';
import { siteConfig } from './config';
import { formatPrice } from './utils';

export type NotificationEvent = 'order_placed' | OrderStatus;

export interface NotificationStatusText {
  title: string;
  badge: string;
  urduTitle: string;
  description: string;
  smsMessage: string;
}

export function getStatusNotificationDetails(event: NotificationEvent, order: Order): NotificationStatusText {
  const helpline = '0300-8325693';
  const customerName = order.customer.fullName;
  const orderNum = order.orderNumber;
  const total = formatPrice(order.total);
  const payMethod = order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Bank Transfer';

  switch (event) {
    case 'order_placed':
    case 'pending':
      return {
        title: 'Order Successfully Placed',
        badge: 'Order Placed',
        urduTitle: 'آپ کا آرڈر موصول ہو گیا ہے',
        description: `Shukriya ${customerName}! Soghat-e-Chakwal par aapka order (${orderNum}) darj ho chuka hai. Hamari team jald hi aap se tasdeeq kare gi.`,
        smsMessage: `Shukriya ${customerName}! Soghat-e-Chakwal par aapka order #${orderNum} masool ho chuka hai. Total: ${total} (${payMethod}). Helpline: ${helpline}`,
      };

    case 'confirmed':
      return {
        title: 'Order Confirmed & In Preparation',
        badge: 'Confirmed',
        urduTitle: 'آپ کا آرڈر کنفرم ہو گیا ہے',
        description: `Mohtaram ${customerName}, aapka Soghat-e-Chakwal order (${orderNum}) confirm ho gaya hai aur taaza desi mustard oil pack kiya ja raha hai.`,
        smsMessage: `Aapka Soghat-e-Chakwal order #${orderNum} confirm ho chuka hai aur packaging jari hai. Jald dispatch hoga. Helpline: ${helpline}`,
      };

    case 'packed':
      return {
        title: 'Order Packed & Ready for Dispatch',
        badge: 'Packed',
        urduTitle: 'آپ کا پارسل پیک ہو چکا ہے',
        description: `Aapka order (${orderNum}) ba-hifazat pack ho chuka hai aur courier rider ko handover karne ke liye tayyar hai.`,
        smsMessage: `Soghat-e-Chakwal: Aapka parcel #${orderNum} pack ho kar courier dispatch k liye tayyar hai. Helpline: ${helpline}`,
      };

    case 'shipped':
      return {
        title: 'Order Dispatched (On the Way)',
        badge: 'Dispatched / In Transit',
        urduTitle: 'آپ کا پارسل روانہ ہو چکا ہے',
        description: `Aapka Soghat-e-Chakwal parcel (${orderNum}) courier ko handover kar diya gaya hai aur aapke address (${order.customer.city}) ki taraf rawaana hai.`,
        smsMessage: `Khushkhabri! Soghat-e-Chakwal order #${orderNum} courier ko bhej diya gaya hai. Kamyab delivery par ${total} COD ada karein. Helpline: ${helpline}`,
      };

    case 'delivered':
      return {
        title: 'Order Successfully Delivered',
        badge: 'Delivered',
        urduTitle: 'پارسل موصول ہو گیا ہے',
        description: `Aapka Soghat-e-Chakwal parcel (${orderNum}) deliver ho chuka hai. Hamari khalis desi masnoo'aat pasand anay par apna feedback zaroor share karein.`,
        smsMessage: `Shukriya ${customerName}! Aapka Soghat-e-Chakwal order #${orderNum} deliver ho chuka hai. Umeed hai khalis desi zaiqa aapko pasand aye ga! Helpline: ${helpline}`,
      };

    case 'cancelled':
      return {
        title: 'Order Cancelled',
        badge: 'Cancelled',
        urduTitle: 'آرڈر منسوخ ہو گیا ہے',
        description: `Aapka Soghat-e-Chakwal order (${orderNum}) mansookh (cancel) kar diya gaya hai. Mazeed maloomat k liye helpline par rabta karein.`,
        smsMessage: `Soghat-e-Chakwal: Aapka order #${orderNum} cancel ho chuka hai. Mazeed maloomat k liye ${helpline} par rabta karein.`,
      };

    default:
      return {
        title: `Order Update: ${event}`,
        badge: event,
        urduTitle: 'آرڈر اپڈیٹ',
        description: `Aapke Soghat-e-Chakwal order (${orderNum}) ka status update kar diya gaya hai.`,
        smsMessage: `Soghat-e-Chakwal order #${orderNum} update: Status is ${event}. Helpline: ${helpline}`,
      };
  }
}

// ── WhatsApp Message Generator ──
export function generateWhatsAppNotification(order: Order, event: NotificationEvent): string {
  const details = getStatusNotificationDetails(event, order);
  const itemsList = order.items
    .map((item) => `• *${item.product.name}* (${item.variant.name}) x ${item.quantity} = ${formatPrice(item.variant.price * item.quantity)}`)
    .join('\n');

  return `*SOGHAT-E-CHAKWAL (سوغات چکوال)*
*${details.title.toUpperCase()}*
_${details.urduTitle}_

Assalam-o-Alaikum *${order.customer.fullName}*,

${details.description}

*--- ORDER SUMMARY ---*
📋 *Order ID:* ${order.orderNumber}
📦 *Items:*
${itemsList}

💰 *Subtotal:* ${formatPrice(order.subtotal)}
🚚 *Delivery:* ${order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
💵 *Total Payable:* *${formatPrice(order.total)}*
💳 *Payment Mode:* ${order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Bank Transfer'}

*--- DELIVERY ADDRESS ---*
📍 ${order.customer.address}, ${order.customer.city}, ${order.customer.province}
📞 ${order.customer.phone}

_Wohi Purana Desi Zaiqa, Ab Har Ghar Mein!_
Helpline / WhatsApp: *+92 300 8325693*
Website: https://soghatechakwal.pk`;
}

// ── Direct Customer WhatsApp Trigger Link ──
export function getCustomerWhatsAppUrl(order: Order, event: NotificationEvent): string {
  const rawPhone = order.customer.whatsapp || order.customer.phone || '';
  const digits = rawPhone.replace(/[^0-9]/g, '');
  let fullNumber = digits;
  if (digits.startsWith('03')) {
    fullNumber = '92' + digits.substring(1);
  } else if (!digits.startsWith('92') && digits.length === 10) {
    fullNumber = '92' + digits;
  }
  const msg = generateWhatsAppNotification(order, event);
  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(msg)}`;
}

// ── Branded HTML Email Template Generator ──
export function generateCustomerEmailHtml(order: Order, event: NotificationEvent): string {
  const details = getStatusNotificationDetails(event, order);
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb;">
          <strong style="color: #1B4D3E; font-size: 14px;">${item.product.name}</strong><br/>
          <span style="font-size: 12px; color: #6b7280;">Variant: ${item.variant.name}</span>
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: bold; font-family: monospace;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold; font-family: monospace; color: #1B4D3E;">
          ${formatPrice(item.variant.price * item.quantity)}
        </td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${details.title} - ${order.orderNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FDFBF7; margin: 0; padding: 24px 12px; color: #2C2C2C;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e7e5e4; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
    <!-- Brand Header -->
    <tr>
      <td style="background-color: #1B4D3E; padding: 28px 24px; text-align: center;">
        <h1 style="color: #FDFBF7; margin: 0; font-size: 24px; letter-spacing: 1px; text-transform: uppercase; font-weight: 900;">
          SOGHAT-E-CHAKWAL
        </h1>
        <p style="color: #D4AF37; margin: 4px 0 0; font-size: 13px; font-weight: bold;">
          سوغات چکوال &bull; 100% Pure Desi Mustard Oil
        </p>
      </td>
    </tr>

    <!-- Status Banner -->
    <tr>
      <td style="padding: 24px; background: #FAF7F0; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <span style="display: inline-block; background: #1B4D3E; color: #D4AF37; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; letter-spacing: 1px;">
          ${details.badge}
        </span>
        <h2 style="color: #1B4D3E; font-size: 20px; margin: 12px 0 4px; font-weight: 800;">
          ${details.title}
        </h2>
        <p style="color: #8C6D3B; font-size: 14px; margin: 0 0 10px; font-weight: bold;">
          ${details.urduTitle}
        </p>
        <p style="color: #4b5563; font-size: 13px; margin: 0; line-height: 1.5;">
          ${details.description}
        </p>
      </td>
    </tr>

    <!-- Order & Customer Details -->
    <tr>
      <td style="padding: 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
          <tr>
            <td style="vertical-align: top; width: 50%;">
              <p style="font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: bold; margin: 0 0 4px;">Tracking / Order ID</p>
              <p style="font-size: 16px; font-weight: 900; font-family: monospace; color: #1B4D3E; margin: 0;">${order.orderNumber}</p>
            </td>
            <td style="vertical-align: top; width: 50%; text-align: right;">
              <p style="font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: bold; margin: 0 0 4px;">Payment Method</p>
              <p style="font-size: 13px; font-weight: bold; color: #111827; margin: 0;">
                ${order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Bank Transfer'}
              </p>
            </td>
          </tr>
        </table>

        <!-- Delivery Address Box -->
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin-bottom: 24px;">
          <p style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold; margin: 0 0 4px;">Delivery Destination</p>
          <p style="font-size: 14px; font-weight: 800; color: #111827; margin: 0 0 2px;">${order.customer.fullName}</p>
          <p style="font-size: 13px; color: #374151; margin: 0 0 4px; line-height: 1.4;">${order.customer.address}</p>
          <p style="font-size: 12px; font-weight: 800; color: #1B4D3E; margin: 0; text-transform: uppercase;">
            ${order.customer.city}, ${order.customer.province} &bull; Call: ${order.customer.phone}
          </p>
        </div>

        <!-- Items Table -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
          <thead>
            <tr style="background: #1B4D3E; color: #ffffff; text-align: left; font-size: 11px; text-transform: uppercase;">
              <th style="padding: 10px; border-radius: 8px 0 0 0;">Item Description</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right; border-radius: 0 8px 0 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Pricing Summary -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
          <tr>
            <td style="padding: 4px 0; font-size: 13px; color: #6b7280;">Subtotal:</td>
            <td style="padding: 4px 0; font-size: 13px; text-align: right; font-family: monospace; font-weight: bold;">${formatPrice(order.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 13px; color: #6b7280;">Courier Shipping:</td>
            <td style="padding: 4px 0; font-size: 13px; text-align: right; font-family: monospace; font-weight: bold;">
              ${order.shipping === 0 ? '<span style="color:#059669;">FREE</span>' : formatPrice(order.shipping)}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 16px; font-weight: 900; color: #1B4D3E; border-top: 2px solid #1B4D3E;">Total Payable:</td>
            <td style="padding: 10px 0; font-size: 20px; font-weight: 900; color: #1B4D3E; text-align: right; font-family: monospace; border-top: 2px solid #1B4D3E;">
              ${formatPrice(order.total)}
            </td>
          </tr>
        </table>

        <!-- Helpline Contact Button -->
        <div style="text-align: center; margin: 16px 0;">
          <a href="https://wa.me/923008325693" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 24px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
            💬 Need Help? Chat with us on WhatsApp (0300-8325693)
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background: #FAF7F0; padding: 18px 24px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">
        <p style="margin: 0 0 4px; font-weight: bold; color: #1B4D3E;">Soghat-e-Chakwal Official Store</p>
        <p style="margin: 0 0 4px;">Shop MC33, Street 1, Ghauri Town, Phase 7, Islamabad, Pakistan</p>
        <p style="margin: 0; font-family: monospace;">Helpline: +92 300 8325693 &bull; orders@soghatechakwal.pk</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Trigger Multi-Channel Dispatch via API ──
export async function triggerNotificationDispatch(order: Order, event: NotificationEvent) {
  try {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order, event }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Network error triggering notification' };
  }
}
