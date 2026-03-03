import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from './components/dashboard/DashboardLayout'; // Use the new OS Layout
import GlassCard from './components/ui/GlassCard';
import Button from './components/ui/Button';
import Input from './components/ui/Input';

// Dummy Enterprise Data
const MOCK_PREDICTIONS = [
  { crop: "Rice (Sona Masoori)", confidence: 98, yield: "4.5 tons/acre", profit: "₹45,000", risk: "Low", match: "Perfect Match" },
  { crop: "Maize (Hybrid)", confidence: 85, yield: "3.2 tons/acre", profit: "₹32,000", risk: "Low", match: "High Potential" },
  { crop: "Cotton (Bt)", confidence: 76, yield: "2.1 tons/acre", profit: "₹65,000", risk: "Medium", match: "Profitable" },
];

export default function CropRecommendation() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [formData, setFormData] = useState({
    N: 90, P: 42, K: 43, temperature: 25, humidity: 60, ph: 6.5, rainfall: 200
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResults(MOCK_PREDICTIONS);
      setLoading(false);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="px-6 py-12 max-w-7xl mx-auto"
      >
        {/* Module Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xl border border-emerald-500/20">
              🌱
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Crop Intelligence</h1>
          </div>
          <p className="text-slate-400 max-w-2xl text-lg font-light leading-relaxed">
            Deploying ensemble machine learning models to analyze soil composition and climatic patterns for optimal yield prediction.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Input Panel */}
          <GlassCard className="lg:col-span-4 sticky top-28 border-white/5 bg-white/[0.02]">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">
              Soil Parameters
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Input label="N" name="N" value={formData.N} onChange={handleChange} placeholder="90" />
                <Input label="P" name="P" value={formData.P} onChange={handleChange} placeholder="42" />
                <Input label="K" name="K" value={formData.K} onChange={handleChange} placeholder="43" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="pH Level" name="ph" value={formData.ph} onChange={handleChange} placeholder="6.5" />
                <Input label="Rainfall" name="rainfall" value={formData.rainfall} onChange={handleChange} placeholder="200" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Temp (°C)" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="25" />
                <Input label="Humidity (%)" name="humidity" value={formData.humidity} onChange={handleChange} placeholder="60" />
              </div>

              <Button
                variant="primary"
                className="w-full py-4 text-xs font-bold uppercase tracking-[0.2em] bg-emerald-600 hover:bg-emerald-500 transition-all rounded-lg"
                disabled={loading}
              >
                {loading ? "Processing..." : "Run Analysis"}
              </Button>
            </form>
          </GlassCard>

          {/* Results Panel */}
          <div className="lg:col-span-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              {!results && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-xl bg-white/[0.01]"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 text-2xl grayscale opacity-50">
                    🧬
                  </div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Awaiting Input</h3>
                </motion.div>
              )}

              {results && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid gap-4"
                >
                  {results.map((item, idx) => (
                    <div
                      key={idx}
                      className={`group relative overflow-hidden p-6 rounded-xl border transition-all duration-300 ${idx === 0
                          ? 'bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-900/20'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                        }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded flex items-center justify-center text-2xl ${idx === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                            {idx === 0 ? '🏆' : '🥔'}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{item.crop}</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              <span className={idx === 0 ? "text-emerald-400" : ""}>{item.match}</span>
                              <span>•</span>
                              <span>{item.risk} Risk</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 md:gap-12 pl-18 md:pl-0 font-mono text-xs">
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] text-slate-600 uppercase font-sans font-bold tracking-wider mb-1">Yield</span>
                            <span className="text-white">{item.yield}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] text-slate-600 uppercase font-sans font-bold tracking-wider mb-1">Profit</span>
                            <span className="text-emerald-400">{item.profit}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] text-slate-600 uppercase font-sans font-bold tracking-wider mb-1">Conf.</span>
                            <span className="text-white">{item.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
