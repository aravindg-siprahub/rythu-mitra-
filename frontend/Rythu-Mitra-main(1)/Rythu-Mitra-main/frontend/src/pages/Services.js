import React from "react";
import PageShell from "../components/layout/PageShell";
import Card from "../components/ui/Card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const services = [
    { title: "Crop Advisor", desc: "Scientific sowing plan", icon: "🌱", path: "/crop", color: "text-emerald-400" },
    { title: "Disease Lab", desc: "Pathology scanner", icon: "🔬", path: "/disease", color: "text-blue-400" },
    { title: "Market Terminal", desc: "Live analytics hub", icon: "📊", path: "/market", color: "text-amber-400" },
    { title: "Weather Radar", desc: "Micro-climate forecast", icon: "🌤", path: "/weather", color: "text-cyan-400" },
    { title: "Fleet Manager", desc: "Tractors & Trucks", icon: "🚜", path: "/transport", color: "text-indigo-400" },
    { title: "Labor Connect", desc: "Workforce hiring", icon: "👷", path: "/workers", color: "text-orange-400" },
];

import TopNav from "../components/dashboard/TopNav";

export default function Services() {
    const navigate = useNavigate();

    return (
        <PageShell>
            <TopNav />
            <div className="max-w-5xl mx-auto">

                <div className="mb-16">
                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic neo-dark-headline">Enterprise <span className="text-brand-gradient">Modules_</span></h1>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-2">Direct node access to OS core intelligence.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((s, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -8 }}
                            onClick={() => navigate(s.path)}
                            className="neo-dark-panel p-8 cursor-pointer group relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className={`text-4xl mb-6 ${s.color} bg-white/5 w-16 h-16 rounded-[1.5rem] flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-2xl`}>
                                    {s.icon}
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tighter mb-2 group-hover:text-brand-gradient transition-colors uppercase italic">{s.title}</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">{s.desc}</p>
                                <div className="mt-8 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.3em] text-accent-blue opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                                    <span>Enter Workspace</span>
                                    <span>→</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </PageShell>
    );
}
