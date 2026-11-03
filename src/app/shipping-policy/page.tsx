import type { Metadata } from 'next';
import { PageHero } from '@/components/common/PageHero';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy — Soghat-e-Chakwal',
  description: 'Nationwide delivery across Pakistan, delivery timeframes, rates, and cash on delivery information.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="bg-brand-ivory min-h-screen">
      <PageHero
        title="Shipping &amp; Delivery"
        subtitle="Transparent details regarding delivery timelines, packing, and coverage throughout Pakistan."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-brand-charcoal/85 text-sm sm:text-base leading-relaxed bg-white rounded-3xl p-8 sm:p-12 border border-brand-green/10 my-12 shadow-sm">
        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-green">
            1. Coverage Areas
          </h2>
          <p>
            Soghat-e-Chakwal delivers to all major cities, towns, and reachable tehsils across Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad Capital Territory, Azad Jammu &amp; Kashmir, and Gilgit-Baltistan.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-green">
            2. Delivery Timeframes
          </h2>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong>Rawalpindi / Islamabad / Chakwal:</strong> 1 &ndash; 2 business days.</li>
            <li><strong>Major Cities (Lahore, Karachi, Faisalabad, Multan, Peshawar):</strong> 2 &ndash; 4 business days.</li>
            <li><strong>Other Cities &amp; Remote Regions:</strong> 3 &ndash; 5 business days.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-green">
            3. Shipping Rates
          </h2>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong>Standard Flat Rate:</strong> Rs. 200 per order across Pakistan.</li>
            <li><strong>Free Delivery:</strong> Enjoy completely free delivery on all orders of Rs. 2,000 and above!</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-green">
            4. Protective Packaging
          </h2>
          <p>
            Our mustard oil bottles are enclosed in heavy-duty protective bubble wrap and reinforced outer cartons to prevent leakage or transit damage. If you receive a visibly damaged parcel, please inspect it in front of the courier rider and contact us immediately on WhatsApp: <strong>0300-8325693</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
