import type { Metadata } from 'next';
import { PageHero } from '@/components/common/PageHero';

export const metadata: Metadata = {
  title: 'Return & Refund Policy — Soghat-e-Chakwal',
  description: 'Our policy regarding damaged items, replacements, and customer satisfaction.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="bg-brand-ivory min-h-screen">
      <PageHero
        title="Return &amp; Refund Policy"
        subtitle="Our commitment to customer satisfaction and fair replacement policies."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-brand-charcoal/85 text-sm sm:text-base leading-relaxed bg-white rounded-3xl p-8 sm:p-12 border border-brand-green/10 my-12 shadow-sm">
        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-green">
            1. Damaged or Leaking Parcels
          </h2>
          <p>
            Your satisfaction is our utmost priority. If your order arrives damaged, leaking, or with broken seals during transit, please notify our team within <strong>48 hours of delivery</strong>.
          </p>
          <p>
            Take clear photos or a short video showing the damaged bottle and courier packaging, and send them to our WhatsApp support at <strong>+92 300 8325693</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-green">
            2. Replacements &amp; Refunds
          </h2>
          <p>
            Upon verifying transit damage or packing error, we will promptly dispatch a free replacement bottle or issue a full refund via bank transfer / EasyPaisa / JazzCash as per your preference.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-green">
            3. Food Safety Guidelines
          </h2>
          <p>
            Due to hygiene and food safety standards, edible products that have been unsealed or partially consumed cannot be returned unless verified as defective upon arrival.
          </p>
        </section>
      </div>
    </div>
  );
}
