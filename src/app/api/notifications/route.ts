import { NextResponse } from 'next/server';
import { Order } from '@/lib/types';
import {
  NotificationEvent,
  getStatusNotificationDetails,
  generateWhatsAppNotification,
  generateCustomerEmailHtml,
} from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order: Order = body.order;
    const event: NotificationEvent = body.event || 'order_placed';

    if (!order || !order.customer) {
      return NextResponse.json({ success: false, error: 'Missing order details' }, { status: 400 });
    }

    const details = getStatusNotificationDetails(event, order);
    const emailHtml = generateCustomerEmailHtml(order, event);
    const smsMessage = details.smsMessage;
    const whatsAppMessage = generateWhatsAppNotification(order, event);

    const results = {
      emailSent: false,
      smsSent: false,
      whatsappSent: false,
      logs: [] as string[],
    };

    // ── 1. SEND AUTOMATED EMAIL (Resend API) ──
    if (order.customer.email && process.env.RESEND_API_KEY) {
      try {
        const fromEmail = process.env.EMAIL_FROM || 'Soghat-e-Chakwal <onboarding@resend.dev>';
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [order.customer.email],
            subject: `${details.title} - Order #${order.orderNumber} (Soghat-e-Chakwal)`,
            html: emailHtml,
          }),
        });

        if (res.ok) {
          results.emailSent = true;
          results.logs.push(`Email dispatched to ${order.customer.email} via Resend`);
        } else {
          const err = await res.text();
          results.logs.push(`Resend Email Error: ${err}`);
        }
      } catch (err: unknown) {
        results.logs.push(`Email sending exception: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    } else if (!order.customer.email) {
      results.logs.push('No email address provided by customer');
    } else {
      results.logs.push('RESEND_API_KEY not configured in environment variables');
    }

    // ── 2. SEND AUTOMATED SMS (Twilio or Pakistani SMS Gateway) ──
    const customerPhone = order.customer.phone;
    if (customerPhone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        // Format to international +92 for Pakistan
        let formattedPhone = customerPhone.replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('03')) {
          formattedPhone = '+92' + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+' + formattedPhone;
        }

        const sid = process.env.TWILIO_ACCOUNT_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;
        const from = process.env.TWILIO_PHONE_NUMBER;

        const bodyParams = new URLSearchParams();
        bodyParams.append('To', formattedPhone);
        bodyParams.append('From', from);
        bodyParams.append('Body', smsMessage);

        const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: bodyParams.toString(),
        });

        if (twilioRes.ok) {
          results.smsSent = true;
          results.logs.push(`Twilio SMS sent to ${formattedPhone}`);
        } else {
          const err = await twilioRes.text();
          results.logs.push(`Twilio SMS Error: ${err}`);
        }
      } catch (err: unknown) {
        results.logs.push(`SMS exception: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    } else if (process.env.SENDPK_API_KEY) {
      // Pakistani SendPK SMS Gateway Support
      try {
        const cleanMobile = customerPhone.replace(/[^0-9]/g, '');
        const sender = process.env.SENDPK_SENDER_ID || 'SOGHAT';
        const url = `https://sendpk.com/api/sms.php?api_key=${encodeURIComponent(process.env.SENDPK_API_KEY)}&sender=${encodeURIComponent(sender)}&mobile=${encodeURIComponent(cleanMobile)}&message=${encodeURIComponent(smsMessage)}`;
        const res = await fetch(url);
        if (res.ok) {
          results.smsSent = true;
          results.logs.push(`SendPK SMS sent to ${cleanMobile}`);
        }
      } catch (err: unknown) {
        results.logs.push(`SendPK SMS exception: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    } else {
      results.logs.push('SMS gateway API keys (Twilio/SendPK) not configured');
    }

    // ── 3. SEND AUTOMATED WHATSAPP (UltraMsg / GreenAPI / Meta Cloud API) ──
    if (process.env.ULTRAMSG_INSTANCE_ID && process.env.ULTRAMSG_TOKEN) {
      try {
        let cleanNumber = (order.customer.whatsapp || customerPhone).replace(/[^0-9]/g, '');
        if (cleanNumber.startsWith('03')) cleanNumber = '92' + cleanNumber.substring(1);
        if (cleanNumber.startsWith('+')) cleanNumber = cleanNumber.substring(1);

        const instance = process.env.ULTRAMSG_INSTANCE_ID;
        const token = process.env.ULTRAMSG_TOKEN;

        const waRes = await fetch(`https://api.ultramsg.com/${instance}/messages/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            token,
            to: cleanNumber,
            body: whatsAppMessage,
          }).toString(),
        });

        if (waRes.ok) {
          results.whatsappSent = true;
          results.logs.push(`UltraMsg WhatsApp message sent to ${cleanNumber}`);
        }
      } catch (err: unknown) {
        results.logs.push(`UltraMsg exception: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    } else {
      results.logs.push('WhatsApp API keys (UltraMsg) not configured; Direct 1-Click WhatsApp buttons available in Admin');
    }

    return NextResponse.json({
      success: true,
      event,
      orderNumber: order.orderNumber,
      results,
      sampleWhatsAppMessage: whatsAppMessage,
      sampleSmsMessage: smsMessage,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
