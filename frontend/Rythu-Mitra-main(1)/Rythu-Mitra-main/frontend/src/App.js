// =============================================================
//  RYTHU MITRA ENTERPRISE OS — ROUTING MAP
// =============================================================

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LanguageProvider } from "./context/LanguageContext";
import { SimulationProvider } from "./context/SimulationContext";
import { AlertProvider } from "./pages/alerts";
import { AIProvider } from "./context/AIContext";
import ScrollToAnchor from "./utils/ScrollToAnchor";

// Core Pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

// Intelligent Modules
const CropRecommendation = lazy(() => import("./pages/CropRecommendation"));
const Market = lazy(() => import("./pages/Market"));
const Weather = lazy(() => import("./pages/Weather"));
const DiseaseLab = lazy(() => import("./pages/DiseaseLab"));
const Workers = lazy(() => import("./pages/Workers"));
const Transport = lazy(() => import("./pages/Transport"));
const Booking = lazy(() => import("./pages/Booking"));
const Services = lazy(() => import("./pages/Services"));

function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#020617] text-white">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
          <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
            <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-blue-500" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-black tracking-widest uppercase text-white mb-1">Rythu Mitra OS</h2>
          <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase animate-pulse">Initializing Intelligence Console...</p>
        </div>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* 1. Landing & Core */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />

        {/* 2. Intelligent Agriculture Modules */}
        <Route path="/crop" element={<CropRecommendation />} />
        <Route path="/disease" element={<DiseaseLab />} />
        <Route path="/market" element={<Market />} />
        <Route path="/weather" element={<Weather />} />

        {/* 3. Logistics & Services */}
        <Route path="/workers" element={<Workers />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/services" element={<Services />} />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AlertProvider>
        <SimulationProvider>
          <AIProvider>
            <BrowserRouter>
              <ScrollToAnchor />
              <Suspense fallback={<LoadingScreen />}>
                <AnimatedRoutes />
              </Suspense>
            </BrowserRouter>
          </AIProvider>
        </SimulationProvider>
      </AlertProvider>
    </LanguageProvider>
  );
}
