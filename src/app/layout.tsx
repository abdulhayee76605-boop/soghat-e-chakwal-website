// ============================================================
// Root Layout — Soghat-e-Chakwal
// ============================================================

import type { Metadata } from 'next';
import Script from 'next/script';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://soghatechakwal.pk'),
  title: 'Soghat-e-Chakwal — From Farm to Fork',
  description:
    'Soghat-e-Chakwal brings the authentic, pure flavors of Chakwal to your doorstep. Pure mustard oil, traditional desi flavors, and quality food products inspired by Chakwal\'s agricultural heritage.',
  keywords: [
    'Soghat-e-Chakwal',
    'mustard oil',
    'sarson ka tel',
    'Chakwal food',
    'Pakistani food',
    'farm to fork',
    'traditional desi flavor',
    'pure cooking oil',
  ],
  authors: [{ name: 'Soghat-e-Chakwal' }],
  openGraph: {
    title: 'Soghat-e-Chakwal — From Farm to Fork',
    description:
      'Pure mustard oil and authentic traditional flavors inspired by Chakwal\'s agricultural heritage.',
    type: 'website',
    locale: 'en_PK',
    siteName: 'Soghat-e-Chakwal',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-body bg-brand-ivory text-brand-charcoal">
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1559230849573012');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1559230849573012&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <Header />
        <AnalyticsTracker />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <CartDrawer />
      </body>
    </html>
  );
}
