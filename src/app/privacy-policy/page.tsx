import type { Metadata } from 'next';
import { PageHero } from '@/components/common/PageHero';

export const metadata: Metadata = {
  title: 'Privacy Policy — Soghat-e-Chakwal',
  description: 'Our privacy policy regarding personal data collection, usage, and protection.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-brand-ivory min-h-screen">
      <PageHero
        title="Privacy Policy"
        subtitle="How Soghat-e-Chakwal collects, protects, and respects your customer data."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-brand-charcoal/85 text-sm sm:text-base leading-relaxed bg-white rounded-3xl p-8 sm:p-12 border border-brand-green/10 my-12 shadow-sm">
        <p className="text-xs text-brand-charcoal/50">Last updated: November 2026</p>

        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-green">
            1. Information We Collect
          </h2>
          <p>
            When you purchase products or communicate with Soghat-e-Chakwal, we collect necessary shipping and contact details including:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Your full name and contact number</li>
            <li>Delivery address, city, and province</li>
            <li>WhatsApp phone number (for tracking and customer service)</li>
            <li>Email address (if provided for receipt notifications)</li>
            <li>Order history and communication transcripts</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-green">
            2. How We Use Your Information
          </h2>
          <p>
            Your information is used strictly to fulfill your orders, arrange delivery with our domestic courier partners, coordinate via WhatsApp for address verification, and provide customer support.
          </p>
          <p>
            We do not sell, rent, or trade your personal information to third-party advertisers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-green">
            3. Payment Security
          </h2>
          <p>
            We offer Cash on Delivery (COD) and Direct Bank Transfer. We do not store credit or debit card numbers on our servers. All transactions adhere to strict domestic security guidelines.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-green">
            4. Contact Regarding Privacy
          </h2>
          <p>
            For any queries or data deletion requests, contact us on WhatsApp at <strong>+92 300 8325693</strong> or visit our office at Street 1, Shop MC33, Ghauri Town, Phase 7, Islamabad.
          </p>
        </section>
      </div>
    </div>
  );
}
