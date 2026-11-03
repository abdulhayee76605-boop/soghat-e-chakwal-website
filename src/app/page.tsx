// ============================================================
// Soghat-e-Chakwal — Homepage
// ============================================================

import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import FamilyStory from '@/components/home/FamilyStory';
import FarmToFork from '@/components/home/FarmToFork';
import WhyChooseUs from '@/components/home/WhyChooseUs';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <FamilyStory />
      <FarmToFork />
      <WhyChooseUs />
    </>
  );
}
