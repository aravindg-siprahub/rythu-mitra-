import AnnouncementBar from '@/components/landing/AnnouncementBar';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import StatsTicker from '@/components/landing/StatsTicker';
import ProblemSolution from '@/components/landing/ProblemSolution';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import DemoPreview from '@/components/landing/DemoPreview';
import Impact from '@/components/landing/Impact';
import Testimonials from '@/components/landing/Testimonials';
import ForInvestors from '@/components/landing/ForInvestors';
import DownloadCTA from '@/components/landing/DownloadCTA';
import Footer from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <StatsTicker />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <DemoPreview />
      <Impact />
      <Testimonials />
      <ForInvestors />
      <DownloadCTA />
      <Footer />
    </div>
  );
};

export default Index;
