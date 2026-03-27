import React from "react";
import GlowCard from "../ui/GlowCard";
import { useSimulation } from "../../context/SimulationContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function HeroCards() {
    const { data, region } = useSimulation();
    const navigate = useNavigate();

    return (
        <section className="relative">
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black tracking-[0.3em] uppercase mb-6"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Neural Console Active
                        </motion.div>
                        <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tighter leading-[0.85] uppercase italic font-title">
                            Welcome back, <br /><span className="text-blue-500">Aravind</span>.
                        </h1>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl neo-glass border-white/5 font-black text-[10px] tracking-widest text-slate-400 uppercase">
                                <span className="text-slate-600 font-mono">NODE:</span> {region}
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl neo-glass border-white/5 font-black text-[10px] tracking-widest text-emerald-400 uppercase">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                Quantum Link Stable
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3 Hero Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Card 1: Soil */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="h-[360px] neo-glass rounded-[3rem] border-white/5 relative overflow-hidden group cursor-pointer"
                        onClick={() => navigate("/crop")}
                    >
                        <div className="h-full flex flex-col justify-between p-10 relative z-10">
                            <div>
                                <span className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-8">
                                    Spectral Analysis
                                </span>
                                <h3 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic leading-none">Soil: {data.soil.status}</h3>
                                <p className="text-slate-500 text-xs leading-relaxed font-bold uppercase tracking-widest max-w-[90%]">
                                    Nitrogen: <span className="text-white">{data.soil.n} mg/kg</span> • Yield prob: 98.2% • Sync: Nano-Stable
                                </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-blue-500 uppercase tracking-tighter group-hover:gap-4 transition-all">Launch Advisor →</span>
                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <span className="text-xl">📊</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute right-[-20%] bottom-[-10%] opacity-5 group-hover:opacity-10 transition-all duration-1000 rotate-12 group-hover:rotate-0 scale-150">
                            <span className="text-[15rem]">🌱</span>
                        </div>
                    </motion.div>

                    {/* Card 2: Market */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="h-[360px] neo-glass rounded-[3rem] border-white/5 relative overflow-hidden group cursor-pointer"
                        onClick={() => navigate("/market")}
                    >
                        <div className="h-full flex flex-col justify-between p-10 relative z-10">
                            <div>
                                <span className="inline-block px-4 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-8">
                                    Live Trade Terminal
                                </span>
                                <h3 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic leading-none">₹ {data.market.tomato}/kg</h3>
                                <p className="text-slate-500 text-xs leading-relaxed font-bold uppercase tracking-widest max-w-[90%]">
                                    Trend: <span className={data.market.trend > 0 ? "text-emerald-400" : "text-red-500"}>
                                        {data.market.trend > 0 ? '▲' : '▼'} {Math.abs(data.market.trend)}%
                                    </span> • Neural Logic: <span className="text-white italic">Strong Buy</span>
                                </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-amber-500 uppercase tracking-tighter group-hover:gap-4 transition-all transition-all">Open Orderbook →</span>
                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                    <span className="text-xl">📈</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute right-[-20%] bottom-[-10%] opacity-5 group-hover:opacity-10 transition-all duration-1000 -rotate-12 group-hover:rotate-0 scale-150">
                            <span className="text-[15rem]">💰</span>
                        </div>
                    </motion.div>

                    {/* Card 3: Weather */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="h-[360px] neo-glass rounded-[3rem] border-white/5 relative overflow-hidden group cursor-pointer"
                        onClick={() => navigate("/weather")}
                    >
                        <div className="h-full flex flex-col justify-between p-10 relative z-10">
                            <div>
                                <span className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-8">
                                    Satellite Radar
                                </span>
                                <h3 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic leading-none">{data.weather.temp}°C • {data.weather.storm ? 'Unstable' : 'Nominal'}</h3>
                                <p className="text-slate-500 text-xs leading-relaxed font-bold uppercase tracking-widest max-w-[90%]">
                                    Precipitation: <span className="text-white">{data.weather.rain}%</span> • Storm Risk: <span className="text-emerald-400">Minimal</span>
                                </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-emerald-500 uppercase tracking-tighter group-hover:gap-4 transition-all">Atmosphere HUD →</span>
                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <span className="text-xl">🌦</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute right-[-20%] bottom-[-10%] opacity-5 group-hover:opacity-10 transition-all duration-1000 rotate-6 group-hover:rotate-0 scale-150">
                            <span className="text-[15rem]">🌧</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
