import AnnouncementBar from '@/components/landing/AnnouncementBar';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsSection from '@/components/landing/StatsSection';
import ProblemSolution from '@/components/landing/ProblemSolution';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorks from '@/components/landing/HowItWorks';
import DemoPreview from '@/components/landing/DemoPreview';
import ImpactSection from '@/components/landing/ImpactSection';
import Testimonials from '@/components/landing/Testimonials';
import InvestorSection from '@/components/landing/InvestorSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

const Index = () => (
  <div className="min-h-screen">
    <AnnouncementBar />
    <Navbar />
    <HeroSection />
    <StatsSection />
    <ProblemSolution />
    <FeaturesSection />
    <HowItWorks />
    <DemoPreview />
    <ImpactSection />
    <Testimonials />
    <InvestorSection />
    <CTASection />
    <Footer />
  </div>
);

export default Index;
