import React, { useState } from "react";
import PageShell from "../components/layout/PageShell";
import TopNav from "../components/dashboard/TopNav";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { motion } from "framer-motion";

export default function Settings() {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [biometrics, setBiometrics] = useState(false);

    const Toggle = ({ enabled, setEnabled }) => (
        <button
            onClick={() => setEnabled(!enabled)}
            className={`relative h-10 w-18 rounded-full transition-all duration-700 flex items-center px-1.5 ${enabled ? "bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)]" : "bg-white/5 border border-white/5"}`}
        >
            <motion.div
                animate={{ x: enabled ? 28 : 0 }}
                className={`h-7 w-7 rounded-full shadow-2xl transition-colors duration-700 ${enabled ? "bg-white" : "bg-slate-700"}`}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        </button>
    );

    return (
        <PageShell>
            <TopNav />


            <div className="max-w-[1100px] mx-auto px-4">

                <div className="mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black tracking-[0.4em] uppercase mb-10"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-heartbeat shadow-[0_0_10px_#ef4444]" />
                        Infrastructure Configuration v4.82
                    </motion.div>
                    <h1 className="text-6xl lg:text-9xl font-black text-white mb-8 tracking-tighter leading-[0.8] uppercase italic font-title neo-dark-headline">
                        OS <br /><span className="text-brand-gradient">Config.</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em] max-w-2xl leading-relaxed">
                        Maintain your agricultural command center and intelligent agent parameters. <span className="text-white italic">Kernel_Status: Optimized</span>.
                    </p>
                </div>

                <div className="space-y-16">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-12 neo-dark-panel group"
                    >
                        <div className="flex items-center gap-6 mb-16">
                            <div className="h-16 w-16 rounded-[1.5rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-4xl group-hover:rotate-12 transition-transform shadow-2xl">🖥️</div>
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Interface Engine</h3>
                        </div>

                        <div className="space-y-12">
                            <div className="flex items-center justify-between group/opt cursor-pointer">
                                <div className="flex-1">
                                    <p className="font-black text-white italic uppercase tracking-tighter text-2xl leading-none mb-4 group-hover/opt:text-blue-500 transition-colors">Visual High-Contrast Mode</p>
                                    <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.5em] leading-relaxed max-w-lg">Optimized color palette for extreme field operations and solar visibility protocols.</p>
                                </div>
                                <Toggle enabled={darkMode} setEnabled={setDarkMode} />
                            </div>
                            <div className="h-[1px] w-full bg-slate-900" />
                            <div className="flex items-center justify-between group/opt cursor-pointer">
                                <div className="flex-1">
                                    <p className="font-black text-white italic uppercase tracking-tighter text-2xl leading-none mb-4 group-hover/opt:text-blue-500 transition-colors">Neural Response Alerts</p>
                                    <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.5em] leading-relaxed max-w-lg">Instant haptic and visual cues for critical real-time crop telemetry streams.</p>
                                </div>
                                <Toggle enabled={notifications} setEnabled={setNotifications} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-12 neo-dark-panel group"
                    >
                        <div className="flex items-center gap-6 mb-16">
                            <div className="h-16 w-16 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-4xl group-hover:rotate-12 transition-transform shadow-2xl shadow-red-500/10">🛡️</div>
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Security Protocol</h3>
                        </div>

                        <div className="space-y-12">
                            <div className="flex items-center justify-between group/opt cursor-pointer">
                                <div className="flex-1">
                                    <p className="font-black text-white italic uppercase tracking-tighter text-2xl leading-none mb-4 group-hover/opt:text-red-500 transition-colors">Biometric Gatekeeper</p>
                                    <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.5em] leading-relaxed max-w-lg">Require encrypted bio-authentication for sensitive fleet and market execution commands.</p>
                                </div>
                                <Toggle enabled={biometrics} setEnabled={setBiometrics} />
                            </div>
                            <div className="h-[1px] w-full bg-slate-900" />
                            <div className="flex flex-col gap-12 pt-6">
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.6em] ml-2 italic">OS_Language_Cluster</label>
                                    <div className="relative group/sel">
                                        <select className="w-full bg-black/40 border border-white/5 rounded-[2.5rem] h-20 px-10 text-[11px] font-black text-white uppercase tracking-[0.5em] focus:outline-none focus:border-red-500 transition-all appearance-none cursor-pointer group-hover/sel:bg-black/60 italic">
                                            <option>Global Standard (English)</option>
                                            <option>Vernacular Core (Telugu)</option>
                                            <option>Federal Standard (Hindi)</option>
                                        </select>
                                        <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover/sel:opacity-100 transition-all text-sm">⌵</div>
                                    </div>
                                </div>
                                <div className="pt-12 flex flex-col md:flex-row gap-8">
                                    <button className="flex-1 neo-dark-btn border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-600">
                                        Flush Persistent Data
                                    </button>
                                    <button className="flex-1 neo-dark-btn">
                                        Export Neural Logs
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>

                <footer className="mt-32 text-center text-slate-800 font-black text-[11px] tracking-[1em] uppercase pb-32 opacity-20 italic">
                    OS_INTEGRITY: RM-8291-ALPHA // QUANTUM_LOCKED
                </footer>

            </div>
        </PageShell>
    );
}
