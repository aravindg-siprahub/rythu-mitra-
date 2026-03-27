import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import LandingNavbar from "../components/landing/LandingNavbar";
import UltraHero from "../components/landing/UltraHero";
import FeaturesGrid from "../components/landing/FeaturesGrid";
import HowItWorks from "../components/landing/HowItWorks";
import Testimonials from "../components/landing/Testimonials";
import Footer from "../components/landing/Footer";
import AnimatedBrandCurve from "../components/landing/AnimatedBrandCurve";

export default function LandingPage() {
  return (
    <div className="relative">
      <LandingNavbar />
      <main className="min-h-screen bg-[#030712] selection:bg-emerald-500/30 selection:text-white overflow-x-hidden">

        {/* GLOBAL ANIMATED ELEMENT */}
        <AnimatedBrandCurve />

        <div className="relative z-10">
          <UltraHero />

          <div className="bg-transparent">
            <FeaturesGrid />
          </div>

          <HowItWorks />
          <Testimonials />
          <Footer />
        </div>
      </main>
    </div>
  );
}
