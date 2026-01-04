import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import CTASection from '@/components/home/CTASection';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Ward Dost - Stay Safe from Water Logging</title>
        <meta
          name="description"
          content="Ward Dost helps you identify water-logged areas, report blocked drains, and get real-time updates on flooding conditions in your ward. Join thousands of citizens making cities flood-free."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <FeaturesSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
