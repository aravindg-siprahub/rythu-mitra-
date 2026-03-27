import React from "react";
import PageShell from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import { motion } from "framer-motion";

import TopNav from "../components/dashboard/TopNav";

export default function Profile() {
    return (
        <PageShell>
            <TopNav />

            {/* Global Identity Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[30%] h-[800px] w-[800px] rounded-full bg-emerald-500/5 blur-[150px] animate-pulse" />
            </div>

            <div className="mx-auto max-w-[1500px]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-32">

                    {/* Profile Header Core */}
                    <div className="lg:col-span-4">
                        <div className="p-12 neo-dark-panel text-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 h-60 w-60 rounded-full bg-emerald-500/10 opacity-0 group-hover:opacity-100 blur-[100px] transition-all duration-1000" />

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="relative inline-block mb-12"
                            >
                                <div className="h-56 w-56 rounded-[3.5rem] border border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 p-1.5 bg-black/40 group-hover:scale-105 transition-all duration-1000 group-hover:border-emerald-500/30">
                                    <img src="https://ui-avatars.com/api/?name=Aravind+Kumar&background=10b981&color=fff&size=400" alt="Profile" className="h-full w-full object-cover rounded-[3.2rem] grayscale group-hover:grayscale-0 transition-all duration-1000" />
                                </div>
                                <div className="absolute -inset-10 bg-emerald-500/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-60 transition-all duration-1000" />
                                <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-[1.5rem] bg-darker border border-emerald-500/50 flex items-center justify-center text-3xl z-20 shadow-[0_20px_40px_rgba(16,185,129,0.3)] group-hover:rotate-12 transition-transform">
                                    🛡️
                                </div>
                            </motion.div>

                            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic mb-4 neo-dark-headline">Aravind</h1>
                            <div className="flex flex-col items-center gap-4 mb-16">
                                <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.5em] flex items-center justify-center gap-3 bg-emerald-500/5 px-6 py-2 rounded-full border border-emerald-500/10">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-heartbeat shadow-[0_0_10px_#10b981]" />
                                    Verified Enterprise Lead
                                </p>
                                <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">AUTH_ID: RM-8842-AX</span>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center p-8 rounded-[2.5rem] bg-black/40 border border-white/5 group/stat hover:border-emerald-500/20 transition-all duration-700">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Biometric_Enc</span>
                                    <span className="text-emerald-500 font-black text-[11px] uppercase tracking-[0.3em] bg-emerald-500/10 px-4 py-1.5 rounded-full">Active_Sync</span>
                                </div>
                                <div className="flex justify-between items-center p-8 rounded-[2.5rem] bg-black/40 border border-white/5 group/stat hover:border-blue-500/20 transition-all duration-700">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Global_Node</span>
                                    <span className="text-blue-500 font-black text-[11px] uppercase tracking-[0.3em] bg-blue-500/10 px-4 py-1.5 rounded-full">AP-South-02</span>
                                </div>
                            </div>

                            <button className="w-full neo-dark-btn mt-16">
                                Access Security Keys
                            </button>
                        </div>
                    </div>

                    {/* Telemetry Hub */}
                    <div className="lg:col-span-8 space-y-16">
                        <div className="p-16 neo-glass border-white/5 rounded-[4rem] relative overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

                            <div className="flex items-center justify-between mb-16 relative z-10">
                                <h3 className="text-[12px] font-black text-slate-700 uppercase tracking-[0.6em] italic leading-none">Spatial Asset Telemetry</h3>
                                <div className="flex items-center gap-4 px-5 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-heartbeat" />
                                    Layer_Authorized
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                <div className="p-12 neo-dark-panel bg-slate-900/40 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover/asset:scale-125 transition-transform duration-1000">
                                        <span className="text-9xl">🗺️</span>
                                    </div>
                                    <div className="flex justify-between items-start mb-12 relative z-10">
                                        <div className="h-18 w-18 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center text-4xl border border-blue-500/20 group-hover/asset:bg-blue-600 group-hover/asset:text-white transition-all duration-700 shadow-2xl">🛰️</div>
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] bg-blue-500/5 px-4 py-2 rounded-full border border-blue-500/10 italic">Cluster_Alpha</span>
                                    </div>
                                    <p className="text-5xl font-black text-white italic tracking-tighter mb-6 relative z-10 leading-none">12.4 <span className="text-xl opacity-20 uppercase tracking-widest font-bold">Hectares</span></p>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em]">Geo-fenced Boundary: Locked</p>
                                    </div>
                                </div>

                                <div className="p-12 neo-dark-panel bg-slate-900/40 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover/asset:scale-125 transition-transform duration-1000">
                                        <span className="text-9xl">💹</span>
                                    </div>
                                    <div className="flex justify-between items-start mb-12 relative z-10">
                                        <div className="h-18 w-18 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-4xl border border-emerald-500/20 group-hover/asset:bg-emerald-600 group-hover/asset:text-white transition-all duration-700 shadow-2xl">⚡</div>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10 italic">Tier_Platinum</span>
                                    </div>
                                    <p className="text-5xl font-black text-white italic tracking-tighter mb-6 relative z-10 leading-none uppercase">Enterprise Hub</p>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em]">Global SLA Profile: Active</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-16 neo-glass border-white/5 rounded-[4rem] relative overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center justify-between mb-16 relative z-10">
                                <h3 className="text-[12px] font-black text-slate-700 uppercase tracking-[0.6em] italic leading-none">Neural Command Ledger</h3>
                                <button className="text-[10px] font-black text-slate-800 uppercase tracking-[0.4em] hover:text-white transition-all">Clear_Volatile_Logs</button>
                            </div>
                            <div className="space-y-6 relative z-10">
                                {[
                                    { cmd: "Initialize Bio-Spray Protocol", time: "Sector 4 • 2h Mark", status: "Success", hash: "0x4a...92b", color: "blue" },
                                    { cmd: "Mandi Price Feed Sync", time: "Global Relay • 5h Mark", status: "Success", hash: "0x12...f8a", color: "blue" },
                                    { cmd: "Biometric Re-verification", time: "Console Root • 1d Mark", status: "Secured", hash: "0x88...c7e", color: "emerald" }
                                ].map((log, i) => (
                                    <div key={i} className="flex items-center justify-between p-10 rounded-[3rem] bg-black/30 border border-white/5 transition-all duration-700 group/log cursor-default hover:bg-black/50 hover:border-white/10">
                                        <div className="flex items-center gap-10">
                                            <div className={`h-3 w-3 rounded-full bg-${log.color}-500 shadow-[0_0_15px_${log.color === 'blue' ? '#3b82f6' : '#10b981'}] animate-pulse`} />
                                            <div>
                                                <p className="text-2xl font-black text-white tracking-tighter uppercase italic group-hover/log:text-blue-500 transition-colors duration-700 leading-none mb-3">{log.cmd}</p>
                                                <div className="flex items-center gap-6">
                                                    <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">{log.time}</p>
                                                    <span className="text-[9px] font-black text-slate-800 tracking-[0.5em] bg-white/5 px-3 py-1 rounded-full">{log.hash}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`text-[12px] font-black tracking-[0.4em] text-${log.color}-500 uppercase italic opacity-40 group-hover/log:opacity-100 transition-all`}>{log.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <footer className="mt-32 text-center text-slate-800 text-[11px] font-black tracking-[1em] uppercase pb-32 opacity-20 italic">
                Identity Core // AES-256 Distributed Ledger // Station RY-PR-102
            </footer>

        </PageShell>
    );
}
