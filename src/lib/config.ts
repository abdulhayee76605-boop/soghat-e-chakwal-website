// ============================================================
// Site Configuration
// ============================================================

import { SiteConfig } from './types';

export const siteConfig: SiteConfig = {
  brandName: 'Soghat-e-Chakwal',
  tagline: 'From Farm to Fork',
  slogan: 'Wohi Purana Desi Zaiqa, Ab Har Ghar Mein!',
  whatsappNumber: '+92 300 8325693',
  whatsappLink: 'https://wa.me/923008325693',
  address: [
    'Street 1, Shop MC33,',
    'Ghauri Town, Phase 7,',
    'Islamabad, Pakistan.',
  ],
  shippingCharge: 200,
  freeShippingThreshold: 2000,
  bankDetails: {
    bankName: 'To be configured',
    accountTitle: 'To be configured',
    accountNumber: 'To be configured',
  },
  socialLinks: {},
  analytics: {
    // Configure these in .env.local
    // ga4Id: process.env.NEXT_PUBLIC_GA4_ID,
    // metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
    // googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
  },
};

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Our Process', href: '/our-process' },
  { label: 'Contact', href: '/contact' },
];

export const provinces = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan',
];
