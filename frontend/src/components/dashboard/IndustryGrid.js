import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const modules = [
    { title: "Precision Agriculture", desc: "Advanced satellite mapping & autonomous geo-fencing protocols.", icon: "🛰", path: "/crop" },
    { title: "Neural Monitoring", desc: "Real-time crop health tracking with multi-spectral analysis.", icon: "🌾", path: "/disease" },
    { title: "Atmosphere Sync", desc: "Hyper-local forecasts with predictive micro-climate simulation.", icon: "⛈", path: "/weather" },
    {
        title: "Market Intelligence",
        desc: "Global Price Discovery and algorithmic trade signaling engine.",
        icon: "📈",
        path: "/market",
    },
    {
        title: "Commodity Terminal",
        desc: "Real-time mandatory ticker for global agricultural commodities.",
        icon: "💰",
        path: "/market",
    },
    {
        title: "Fleet Operations",
        desc: "Autonomous logistics management and GPS-guided transport fleet.",
        icon: "🚚",
        path: "/transport",
    },
    { title: "Soil Synthesis", desc: "Sub-surface nutrient composition and life-cycle analytics.", icon: "🧪", path: "/crop" },
    { title: "Pathogen Laboratory", desc: "Deep-learning computer vision for instant disease diagnosis.", icon: "🔬", path: "/disease" },
];

export default function IndustryGrid() {
    const navigate = useNavigate();

    return (
        <div className="py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {modules.map((m, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -8 }}
                        className="p-10 h-[300px] flex flex-col justify-between group bg-white/5 backdrop-blur-md border border-white/5 rounded-[2.5rem] cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-blue-500/30 hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.2)]"
                        onClick={() => navigate(m.path)}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-5xl group-hover:scale-110 transition-transform duration-500">{m.icon}</span>
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-pulse"></div>
                            </div>
                            <h3 className="font-black text-white text-xl group-hover:text-blue-500 transition-colors tracking-tighter uppercase italic leading-none">
                                {m.title}
                            </h3>
                            <p className="text-slate-500 text-[11px] mt-6 leading-relaxed font-bold uppercase tracking-widest leading-relaxed">
                                {m.desc}
                            </p>
                        </div>
                        <div className="flex items-center text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                            Access Module →
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
