import React from "react";
import { useNavigate } from "react-router-dom";
import FeatureCard from "./FeatureCard";
import { motion } from "framer-motion";

const features = [
    {
        title: "AI Crop Advisor",
        subtitle: "Neural processing of spectral soil data to maximize yield efficiency.",
        icon: "🌱",
        color: "bg-emerald-500",
        path: "/crop"
    },
    {
        title: "Pathogen Lab",
        subtitle: "Instant diagnosis of complex pathology using computer vision & hyper-spectral analysis.",
        icon: "🔬",
        color: "bg-blue-500",
        path: "/disease"
    },
    {
        title: "Trade Terminal",
        subtitle: "Real-time algorithmiccommodity price discovery from global interconnected nodes.",
        icon: "📈",
        color: "bg-amber-500",
        path: "/market"
    },
    {
        title: "Hyper-Local Radar",
        subtitle: "Precision atmospheric modeling with micro-climate sensing for your exact plotted land.",
        icon: "🌤",
        color: "bg-cyan-500",
        path: "/weather"
    },
    {
        title: "Autonomous Fleet",
        subtitle: "On-demand dispatch of heavy logistics, drones, and autonomous tractors.",
        icon: "🚚",
        color: "bg-indigo-500",
        path: "/transport"
    },
    {
        title: "Workforce Nexus",
        subtitle: "Decentralized labor marketplace connecting verified agri-specialists with land nodes.",
        icon: "👷",
        color: "bg-orange-500",
        path: "/workers"
    },
];

export default function FeaturesGrid() {
    const navigate = useNavigate();

    return (
        <section id="ecosystem" className="relative py-32 bg-[#030712] overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold tracking-[0.4em] uppercase mb-8"
                    >
                        Enterprise Modules
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl font-black tracking-tighter text-white md:text-7xl mb-12"
                    >
                        The Future <span className="text-red-500">Ecosystem</span>
                    </motion.h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                        {[
                            { label: "Predictive Precision", val: "99.9%" },
                            { label: "Yield Efficiency", val: "2X MORE" },
                            { label: "Global Nodes", val: "500+" },
                            { label: "Real-time Sync", val: "0.4ms" },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex flex-col gap-1"
                            >
                                <span className="text-3xl font-black text-white">{stat.val}</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                <span className="text-[8px] font-mono text-emerald-500/40 uppercase tracking-tighter mt-1 italic">Verified via Quantum-Link v2</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((f, i) => (
                        <FeatureCard
                            key={i}
                            {...f}
                            delay={i * 0.1}
                            onClick={() => navigate(f.path)}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}
