// =============================================================
//  RYTHU MITRA ENTERPRISE OS — ROUTING MAP
// =============================================================
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AnimatePresence } from "framer-motion";
import { SimulationProvider } from "./context/SimulationContext";
import { AlertProvider } from "./pages/alerts";
import { AIProvider } from "./context/AIContext";
import { AuthProvider } from "./context/AuthContext";
import ScrollToAnchor from "./utils/ScrollToAnchor";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages (eagerly loaded for fast access)
import Login from "./pages/Login";
import Register from "./pages/Register";

// Core Pages
const LandingPageNew = lazy(() => import("./pages/LandingPageNew"));
const DashboardNew = lazy(() => import("./pages/DashboardNew"));
const RoleSelect = lazy(() => import("./pages/RoleSelect"));

const Profile = lazy(() => import("./pages/Profile"));
const CropRecommendation = lazy(() => import("./pages/CropRecommendation"));
const DiseaseLab = lazy(() => import("./pages/DiseaseLab"));
const Weather = lazy(() => import("./pages/Weather"));
const Market = lazy(() => import("./pages/Market"));
const BookingSystem = lazy(() => import("./pages/BookingSystem"));
const WorkPage = lazy(() => import("./modules/work/WorkPage"));

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
          <p className="text-sm font-bold text-slate-500 tracking-[0.3em] uppercase animate-pulse">
            Initializing Intelligence Console...
          </p>
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
        {/* ── PUBLIC ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<LandingPageNew />} />

        {/* ── PROTECTED ── */}
        <Route
          path="/select-role"
          element={
            <ProtectedRoute>
              <RoleSelect />
            </ProtectedRoute>
          }
        />

        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardNew />
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
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <BookingSystem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/work"
            element={
              <ProtectedRoute>
                <WorkPage />
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
  );
}

