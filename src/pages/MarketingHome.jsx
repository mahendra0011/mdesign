import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import ShowcaseSection from '../components/ShowcaseSection';
import ResponsiveSection from '../components/ResponsiveSection';
import EcosystemSection from '../components/EcosystemSection';
import Footer from '../components/Footer';

export default function MarketingHome() {
  return (
    <div className="relative w-full min-h-screen bg-[#fdfdfd]">
      <div className="absolute top-0 left-0 w-full z-[100]">
        <Navbar />
      </div>
      <Hero />
      <EcosystemSection />
      <HowItWorks />
      <ShowcaseSection />
      <ResponsiveSection />
      <Footer />
    </div>
  );
}