import type { Metadata } from 'next';
import { PageHero } from '@/components/common/PageHero';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Soghat-e-Chakwal',
  description: 'Terms of service and purchasing guidelines for Soghat-e-Chakwal.',
};

export default function TermsPage() {
  return (
    <div className="bg-brand-ivory min-h-screen">
      <PageHero
        title="Terms &amp; Conditions"
        subtitle="Please read our terms of service governing website usage and product purchases."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-brand-charcoal/85 text-sm sm:text-base leading-relaxed bg-white rounded-3xl p-8 sm:p-12 border border-brand-green/10 my-12 shadow-sm">
        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-green">
            1. Overview
          </h2>
          <p>
            This website is operated by Soghat-e-Chakwal. Throughout the site, the terms &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo; refer to Soghat-e-Chakwal. By visiting our site or purchasing goods from us, you agree to be bound by these terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-green">
            2. Products &amp; Pricing
          </h2>
          <p>
            Prices for our products are subject to change without notice based on seasonal crop yields and logistics costs. We reserve the right to limit sales quantities per household or order.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-green">
            3. Order Placement &amp; WhatsApp Interactions
          </h2>
          <p>
            Orders can be placed directly through our online cart or coordinated via WhatsApp. Clicking on a WhatsApp link does not constitute an automatically confirmed contract until details and availability have been mutually agreed upon.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-green">
            4. Governing Jurisdiction
          </h2>
          <p>
            These terms and any agreements whereby we provide you products shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan.
          </p>
        </section>
      </div>
    </div>
  );
}
