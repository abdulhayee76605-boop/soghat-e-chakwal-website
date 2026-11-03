import type { Metadata } from 'next';
import { PageHero } from '@/components/common/PageHero';
import Link from 'next/link';
import { ArrowRight, Heart, Sparkles, Sprout } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Story — Soghat-e-Chakwal',
  description:
    'The story of Soghat-e-Chakwal: born from the golden fields of Chakwal, honoring Pakistani culinary traditions and bringing pure farm-to-fork flavors into every home.',
};

export default function OurStoryPage() {
  return (
    <div className="bg-brand-ivory min-h-screen">
      <PageHero
        eyebrow="HERITAGE &amp; ROOTS"
        title="Our Story"
        urduTitle="ہماری کہانی — مٹی سے دسترخوان تک"
        subtitle="A journey rooted in the historic red soils of Chakwal, carrying the aroma of timeless desi recipes into modern family kitchens."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16 md:space-y-24">
        {/* Chapter 1: The Heart of Chakwal */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-gold uppercase tracking-[0.2em]">
            <Sprout className="w-4 h-4 text-brand-gold" />
            <span>Chapter 01</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-brand-green leading-tight">
            The Golden Earth of Chakwal
          </h2>
          <div className="prose prose-lg text-brand-charcoal/85 leading-relaxed space-y-4 text-base md:text-lg">
            <p>
              Nestled in the Potohar plateau of Punjab, Chakwal is a land blessed with undulating hills, fertile terraced fields, and a centuries-old tradition of agriculture. For generations, the families of this region have cultivated the land with patience and profound respect for seasonal rhythms.
            </p>
            <p>
              Every winter, the plains of Chakwal transform into a luminous carpet of vibrant yellow mustard blossoms (<em>sarson kay khet</em>). The distinct earthy aroma that fills the brisk morning air is not merely a sight of nature — it is an emotion deeply woven into the memory of every Pakistani household.
            </p>
          </div>
        </section>

        {/* Decorative Quote Divider */}
        <div className="relative py-8 text-center border-y border-brand-green/15">
          <p className="font-heading text-2xl md:text-3xl lg:text-4xl italic text-brand-green max-w-2xl mx-auto">
            &ldquo;Wohi Purana Desi Zaiqa, Ab Har Ghar Mein!&rdquo;
          </p>
          <p className="font-serif text-lg text-brand-gold font-semibold mt-2">
            وہی پرانا دیسی ذائقہ، اب ہر گھر میں!
          </p>
        </div>

        {/* Chapter 2: The Warmth of Family Kitchens */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-gold uppercase tracking-[0.2em]">
            <Heart className="w-4 h-4 text-brand-gold" />
            <span>Chapter 02</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-brand-green leading-tight">
            Some Flavors Bring Back Memories
          </h2>
          <div className="prose prose-lg text-brand-charcoal/85 leading-relaxed space-y-4 text-base md:text-lg">
            <p>
              Recall the aroma that greeted you whenever Dadi or Ami stepped into the kitchen: the sizzle of whole spices hitting warm mustard oil, the fragrant tempering for seasonal saag, the slow frying of fish on a winter evening, and the quiet comfort of a homemade meal shared around a busy family table.
            </p>
            <p>
              In our fast-paced modern lives, ultra-processed and artificially flavored foods have gradually displaced these honest tastes. <strong>Soghat-e-Chakwal</strong> was born from a desire to reclaim those precious memories — bridging the gap between ancestral agricultural wisdom and contemporary urban dining.
            </p>
          </div>
        </section>

        {/* Chapter 3: An Honest Promise */}
        <section className="space-y-6 bg-brand-cream rounded-3xl p-8 md:p-12 border border-brand-gold/30">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-terracotta uppercase tracking-[0.2em]">
            <Sparkles className="w-4 h-4 text-brand-terracotta" />
            <span>Our Philosophy</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-brand-green">
            From Farm to Fork — Without Compromise
          </h2>
          <p className="text-brand-charcoal/80 text-sm md:text-base leading-relaxed">
            We hold no secrets or artificial shortcuts. We don&apos;t invent laboratory claims or fake certifications. Our philosophy is simple: source quality crops from trusted agricultural lands, prepare and package them with utmost hygiene and care, and deliver genuine traditional food directly to your doorstep.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-brand-green text-brand-cream px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-brand-green-light transition-all shadow-md"
            >
              Taste Our Mustard Oil <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/our-process"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-charcoal border border-brand-green/20 px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-brand-ivory transition-all"
            >
              See How It&apos;s Prepared
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
