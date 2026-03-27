// ==============================================================
//  INDEX.JS — VISION PRO ROOT (CLEAN + CORRECT)
// ==============================================================

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

/* Global Styling */
import "./index.css";
// import "./App.css"; // Removed as per the provided code edit

import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

// ==============================================================
//  ROOT MOUNT (React 18)
// ==============================================================
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "❌ Root element not found. Ensure <div id='root'></div> exists in index.html"
  );
}

const root = ReactDOM.createRoot(rootElement);

// ==============================================================
// GLOBAL ERROR BOUNDARY (Loader)
// ==============================================================
// True Error Boundary for JS Errors
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-[#030712] text-red-500 p-8 text-center">
          <h1 className="text-4xl font-bold mb-4">System Malfunction</h1>
          <p className="text-xl text-slate-400 mb-8">The Rythu Mitra OS encountered a critical error.</p>
          <div className="bg-slate-900 p-6 rounded-lg border border-red-900/50 max-w-2xl w-full overflow-auto text-left font-mono text-sm">
            <p className="font-bold text-red-400 mb-2">{this.state.error?.toString()}</p>
            <pre className="text-slate-500">{this.state.errorInfo?.componentStack}</pre>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-500"
          >
            Reboot System
          </button>
        </div>
      );
    }

    return (
      <React.Suspense
        fallback={
          <div className="flex h-screen w-full items-center justify-center bg-[#030712] text-white">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-emerald-500" />
          </div>
        }
      >
        {this.props.children}
      </React.Suspense>
    );
  }
}

// ==============================================================
//  RENDER APP (NO ENGINES HERE)
// ==============================================================
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
