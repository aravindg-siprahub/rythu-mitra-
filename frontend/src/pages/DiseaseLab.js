import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from './components/dashboard/DashboardLayout';
import GlassCard from './components/ui/GlassCard';
import Button from './components/ui/Button';

export default function DiseaseLab() {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setUploadedImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const runAnalysis = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setResult({
                disease: "Early Blight",
                confidence: 96.4,
                severity: "Moderate",
                treatment: "Apply Mancozeb fungicide spray (2.5g/L) every 7 days."
            });
        }, 2500);
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
                {/* Header */}
                <div className="mb-12 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-2xl border border-rose-500/20 shadow-lg shadow-rose-900/20">
                            🔬
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Pathogen <span className="text-rose-500">Lab</span></h1>
                            <p className="text-slate-500 text-sm font-mono uppercase tracking-widest mt-1">Computer Vision Diagnosis v4.2</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Upload Zone */}
                    <GlassCard className="min-h-[500px] flex flex-col justify-center items-center border-dashed border-2 border-white/10 hover:border-emerald-500/50 transition-colors bg-white/[0.01] relative overflow-hidden group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />

                        {uploadedImage ? (
                            <div className="relative z-10 w-full h-full p-4">
                                <img src={uploadedImage} alt="Analysis Target" className="w-full h-full object-contain rounded-lg shadow-2xl" />
                                {analyzing && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative w-16 h-16">
                                                <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full"></div>
                                                <div className="absolute inset-0 border-t-4 border-emerald-500 rounded-full animate-spin"></div>
                                            </div>
                                            <p className="text-emerald-400 font-mono text-xs uppercase tracking-widest animate-pulse">Scanning Bio-Markers...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center p-8 pointer-events-none group-hover:scale-105 transition-transform duration-300">
                                <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 text-4xl text-slate-600 group-hover:text-emerald-400 transition-colors">
                                    📸
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Upload Sample</h3>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto">Drag and drop or select high-resolution leaf imagery for analysis.</p>
                            </div>
                        )}
                    </GlassCard>

                    {/* Analysis Console */}
                    <div className="flex flex-col gap-6">
                        <GlassCard className="flex-1 bg-white/[0.02] border-white/5 flex flex-col">
                            <div className="border-b border-white/5 pb-4 mb-6 flex justify-between items-center">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Diagnostic Report</h3>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {!result ? (
                                    <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                                        <span className="font-mono text-4xl mb-4">🖥️</span>
                                        <p className="font-mono text-xs uppercase tracking-widest">System Idle</p>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex-1 space-y-8"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Detected Pathogen</p>
                                                <h2 className="text-3xl font-black text-white tracking-tight">{result.disease}</h2>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Confidence</p>
                                                <h2 className="text-3xl font-mono font-bold text-emerald-400">{result.confidence}%</h2>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2">Recommended Treatment Protocol</p>
                                            <p className="text-sm text-white font-light leading-relaxed">{result.treatment}</p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Severity Index</p>
                                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "65%" }}
                                                    transition={{ duration: 1, delay: 0.2 }}
                                                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-8 pt-6 border-t border-white/5">
                                <Button
                                    onClick={runAnalysis}
                                    disabled={!uploadedImage || analyzing}
                                    className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] bg-white text-black hover:bg-emerald-400 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                >
                                    {analyzing ? "Processing..." : "Run Diagnostics"}
                                </Button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
