import type { Metadata } from 'next';
import { PageHero } from '@/components/common/PageHero';
import Link from 'next/link';
import { Sprout, Droplets, Package, Home, ArrowRight, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Process — Soghat-e-Chakwal',
  description:
    'Discover the journey from farm to fork. Sourcing, preparation, careful packaging, and delivery to family kitchens across Pakistan.',
};

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'The Source',
    subtitle: 'Selected from Agricultural Lands',
    icon: Sprout,
    description:
      'Every journey begins at the source. We work closely with agricultural producers in Chakwal and surrounding Potohar regions, choosing quality seeds nurtured under natural seasonal conditions. Honest sourcing ensures the genuine desi flavor profile that defines our brand.',
    highlights: ['Regional agricultural selection', 'Seasonal harvest appreciation', 'Close relationships with trusted growers'],
  },
  {
    step: '02',
    title: 'Preparation',
    subtitle: 'Guided by Traditional Heritage',
    icon: Droplets,
    description:
      'The extraction and preparation process respects time-honored methods perfected over generations. We avoid harsh chemical treatments or artificial deodorizers that strip away the natural aroma, preserving the genuine taste and warmth of authentic Pakistani mustard oil.',
    highlights: ['Traditional processing guidance', 'No artificial colors or fragrances', 'Careful temperature management'],
  },
  {
    step: '03',
    title: 'Packaging & Sealing',
    subtitle: 'Preserving Aroma and Freshness',
    icon: Package,
    description:
      'Freshly prepared oil is transferred into our distinct rectangular amber bottles designed to shield the contents from direct light degradation. Each bottle is fitted with a secure screw cap (white cap for 1L, yellow cap for 500ml) to ensure tamper-proof delivery without leakage.',
    highlights: ['Amber bottles protecting from UV light', 'Secure screw-seal caps', 'Cushioned dispatch packaging for transit'],
  },
  {
    step: '04',
    title: 'Your Kitchen',
    subtitle: 'Ready for Your Family Table',
    icon: Home,
    description:
      'Delivered straight to your doorstep anywhere in Pakistan via reliable courier partners with Cash on Delivery. From daily tadkas and rich fish curries to soothing hair massages and seasonal pickles, Soghat-e-Chakwal is ready to nourish your household.',
    highlights: ['Nationwide Cash on Delivery', 'Shipped in protective packaging', 'Ready for traditional cooking and wellness'],
  },
];

export default function OurProcessPage() {
  return (
    <div className="bg-brand-ivory min-h-screen">
      <PageHero
        eyebrow="OUR JOURNEY"
        title="From Farm to Fork"
        urduTitle="ہمارا طریقہ کار — کھیت سے باورچی خانے تک"
        subtitle="A transparent, step-by-step look at how we source, prepare, package, and deliver our authentic food products."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Process Steps Timeline */}
        <div className="space-y-12 md:space-y-16 relative">
          {PROCESS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="relative bg-white rounded-3xl p-8 md:p-12 border border-brand-green/10 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-brand-green/10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-green text-brand-gold flex items-center justify-center font-heading font-black text-xl shadow-md">
                      {step.step}
                    </div>
                    <div>
                      <p className="text-xs uppercase font-bold text-brand-gold tracking-widest">
                        Stage {step.step}
                      </p>
                      <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-green">
                        {step.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-cream border border-brand-gold/30 text-xs font-semibold text-brand-charcoal">
                    <Icon className="w-4 h-4 text-brand-gold" />
                    <span>{step.subtitle}</span>
                  </div>
                </div>

                <div className="pt-6 space-y-4">
                  <p className="text-sm md:text-base text-brand-charcoal/80 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-green mb-2">
                      Key Highlights:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {step.highlights.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-ivory text-xs font-medium text-brand-charcoal"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Card */}
        <div className="mt-16 bg-gradient-hero text-brand-cream rounded-3xl p-8 md:p-12 text-center space-y-6">
          <h3 className="font-heading text-3xl md:text-4xl font-bold">
            Experience the Authentic Taste Today
          </h3>
          <p className="max-w-xl mx-auto text-sm md:text-base text-white/80">
            Order a bottle of Soghat-e-Chakwal Mustard Oil and taste the difference honest heritage brings to your home.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-charcoal px-8 py-3.5 rounded-full font-bold text-sm hover:bg-brand-gold-dark transition-all shadow-md"
            >
              Order Online Now <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/923008325693"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-white/10 transition-all"
            >
              Chat on WhatsApp: 0300-8325693
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
