// =============================================================
//  RYTHU MITRA ENTERPRISE OS — ROUTING MAP
// =============================================================

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AnimatePresence } from "framer-motion";
import { LanguageProvider } from "./context/LanguageContext";
import { SimulationProvider } from "./context/SimulationContext";
import { AlertProvider } from "./pages/alerts";
import { AIProvider } from "./context/AIContext";
import { AuthProvider } from "./context/AuthContext";
import ScrollToAnchor from "./utils/ScrollToAnchor";
import LandingLayout from "./components/layout/LandingLayout";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages (eagerly loaded for fast access)
import Login from "./pages/Login";
import Register from "./pages/Register";

// Core Pages
const LandingPageNew = lazy(() => import("./pages/LandingPageNew"));
const CommandCenterDashboard = lazy(() => import("./pages/CommandCenter/CommandCenterDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

// Intelligent Modules
const CropRecommendation = lazy(() => import("./modules/crop"));
const Market = lazy(() => import("./modules/market"));
const Weather = lazy(() => import("./modules/weather"));
const DiseaseLab = lazy(() => import("./modules/disease"));
const Workers = lazy(() => import("./modules/workforce"));
const Transport = lazy(() => import("./modules/transport"));
const Governance = lazy(() => import("./modules/governance"));
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

        {/* ── PUBLIC: Auth Pages (no layout wrapper) ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── PUBLIC: Landing Page ── */}
        <Route path="/" element={<LandingPageNew />} />

        {/* ── PROTECTED: App Pages (require login) ── */}
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <CommandCenterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Intelligent Agriculture Modules */}
          <Route
            path="/crop"
            element={
              <ProtectedRoute>
                <CropRecommendation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disease"
            element={
              <ProtectedRoute>
                <DiseaseLab />
              </ProtectedRoute>
            }
          />
          <Route
            path="/market"
            element={
              <ProtectedRoute>
                <Market />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weather"
            element={
              <ProtectedRoute>
                <Weather />
              </ProtectedRoute>
            }
          />

          {/* Logistics & Services */}
          <Route
            path="/workers"
            element={
              <ProtectedRoute>
                <Workers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transport"
            element={
              <ProtectedRoute>
                <Transport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/governance"
            element={
              <ProtectedRoute>
                <Governance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ── CATCH-ALL ── */}
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
            <AuthProvider>
              <BrowserRouter>
                <ScrollToAnchor />
                <Suspense fallback={<LoadingScreen />}>
                  <AnimatedRoutes />
                </Suspense>
              </BrowserRouter>
            </AuthProvider>
          </AIProvider>
        </SimulationProvider>
      </AlertProvider>
    </LanguageProvider>
  );
}
