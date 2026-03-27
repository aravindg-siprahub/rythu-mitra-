import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import StatsSection from "./StatsSection";
import ProblemSolution from "./ProblemSolution";
import FeaturesSection from "./FeaturesSection";
import HowItWorks from "./HowItWorks";
import DemoPreview from "./DemoPreview";
import ImpactSection from "./ImpactSection";
import UseCasesSection from "./UseCasesSection";
import MissionSection from "./MissionSection";
import CTASection from "./CTASection";
import Footer from "./Footer";

/**
 * Full Lovable landing (rythu-mitra-ai-5defe26d) ported to CRA + React Router.
 * Theme scoped under .lovable-landing so the rest of the app keeps its styles.
 */
export default function LovableLanding() {
  return (
    <div className="lovable-landing min-h-screen">
      <AnnouncementBar />
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ProblemSolution />
      <FeaturesSection />
      <HowItWorks />
      <DemoPreview />
      <ImpactSection />
      <UseCasesSection />
      <MissionSection />
      <CTASection />
      <Footer />
    </div>
  );
}
