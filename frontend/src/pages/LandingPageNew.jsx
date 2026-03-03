import AnnouncementBar from '../components/landing_new/AnnouncementBar';
import Navbar from '../components/landing_new/Navbar';
import Hero from '../components/landing_new/Hero';
import StatsTicker from '../components/landing_new/StatsTicker';
import ProblemSolution from '../components/landing_new/ProblemSolution';
import Features from '../components/landing_new/Features';
import HowItWorks from '../components/landing_new/HowItWorks';
import DemoPreview from '../components/landing_new/DemoPreview';
import Impact from '../components/landing_new/Impact';
import Testimonials from '../components/landing_new/Testimonials';
import ForInvestors from '../components/landing_new/ForInvestors';
import DownloadCTA from '../components/landing_new/DownloadCTA';
import Footer from '../components/landing_new/Footer';

export default function LandingPageNew() {
    return (
        <div className="min-h-screen">
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
}
