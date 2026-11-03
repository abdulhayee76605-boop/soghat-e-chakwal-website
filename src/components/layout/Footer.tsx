'use client';

// ============================================================
// Premium Footer — Soghat-e-Chakwal
// Official address, WhatsApp, policies & luxury branding
// ============================================================

import Link from 'next/link';
import { Phone, MapPin, Mail, MessageCircle, Heart } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import { BrandLogo } from '@/components/common/BrandLogo';

const footerNav = [
  { label: 'Home', href: '/' },
  { label: 'Shop Collection', href: '/shop' },
  { label: 'Our Story', href: '/story' },
  { label: 'Our Process', href: '/process' },
  { label: 'Contact Us', href: '/contact' },
];

const policyLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Shipping Policy', href: '/shipping-policy' },
  { label: 'Return & Refund Policy', href: '/refund-policy' },
  { label: 'Terms & Conditions', href: '/terms' },
];

export function Footer() {
  return (
    <footer className="bg-brand-green text-brand-cream border-t border-brand-gold/20">
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Column 1 — Brand Identity */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="inline-block bg-[#FFF8E9] px-4 py-2.5 rounded-2xl shadow-md border border-brand-gold/40">
              <BrandLogo size="lg" />
            </div>
            <p className="font-serif text-xs text-brand-gold/90 italic">
              &ldquo;Wohi Purana Desi Zaiqa, Ab Har Ghar Mein!&rdquo;
            </p>
            <p className="text-brand-cream/75 text-sm leading-relaxed">
              Authentic traditional Pakistani food products inspired by Chakwal&apos;s rich agricultural heritage, family traditions, and genuine desi flavors.
            </p>

            {/* Social Placeholders with inline SVGs */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/923008325693"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-brand-cream/80 hover:bg-[#25D366] hover:text-white transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <span
                aria-label="Facebook"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-brand-cream/60 cursor-pointer hover:bg-brand-gold hover:text-brand-charcoal transition-all shadow-xs"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </span>
              <span
                aria-label="Instagram"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-brand-cream/60 cursor-pointer hover:bg-brand-gold hover:text-brand-charcoal transition-all shadow-xs"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </span>
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-sm tracking-widest uppercase text-brand-gold">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              {footerNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-brand-cream/70 hover:text-brand-gold transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Policies */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-sm tracking-widest uppercase text-brand-gold">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-brand-cream/70 hover:text-brand-gold transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/admin"
                  className="text-brand-gold/60 hover:text-brand-gold text-xs transition-colors inline-block pt-2"
                >
                  Admin Portal →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 — Official Contact Information */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-sm tracking-widest uppercase text-brand-gold">
              Direct Contact
            </h4>
            <ul className="space-y-3 text-sm text-brand-cream/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {siteConfig.address.join(' ')}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-gold shrink-0" />
                <a
                  href={`tel:${siteConfig.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  className="hover:text-brand-gold transition-colors"
                >
                  {siteConfig.whatsappNumber}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <a
                  href={siteConfig.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors"
                >
                  WhatsApp: {siteConfig.whatsappNumber}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-gold shrink-0" />
                <a
                  href="mailto:contact@soghatechakwal.pk"
                  className="hover:text-brand-gold transition-colors"
                >
                  contact@soghatechakwal.pk
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-brand-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-cream/60">
          <p>© 2026 {siteConfig.brandName}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-brand-terracotta fill-brand-terracotta" /> in Chakwal & Islamabad, Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}
