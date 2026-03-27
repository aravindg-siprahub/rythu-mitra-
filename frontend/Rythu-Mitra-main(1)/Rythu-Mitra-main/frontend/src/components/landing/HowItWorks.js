import React from "react";
import { motion } from "framer-motion";

const steps = [
    { num: "01", title: "Geo-Spatial Mapping", desc: "Map your land using satellite geo-fencing and real-time spectral telemetry.", icon: "🛰️" },
    { num: "02", title: "Neural Orchestration", desc: "Our AI engine processes million data points to generate an actionable command plan.", icon: "🧠" },
    { num: "03", title: "Operational Profit", desc: "Deploy precision tasks across your fleet to achieve maximum ROI and yield.", icon: "💰" },
];

export default function HowItWorks() {
    return (
        <section className="py-40 bg-darker relative overflow-hidden">
            {/* Subtle flow path overlay */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent hidden md:block" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

                <div className="mb-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black tracking-[0.4em] uppercase mb-8"
                    >
                        System Architecture
                    </motion.div>
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter italic font-title">Operational <span className="text-blue-500">Node</span> Logic</h2>
                </div>

                <div className="grid grid-cols-1 gap-20 md:grid-cols-3">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="relative group"
                        >
                            <div className="p-10 rounded-[3rem] bg-white/5 border border-white/5 backdrop-blur-3xl hover:border-blue-500/30 transition-all duration-700">
                                <span className="absolute -top-6 -left-6 h-12 w-12 flex items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white shadow-2xl group-hover:scale-110 transition-transform">
                                    {step.num}
                                </span>
                                <div className="text-4xl mb-8 opacity-40 group-hover:opacity-100 transition-opacity duration-500">{step.icon}</div>
                                <h3 className="text-2xl font-black text-white mb-4 tracking-tighter italic uppercase group-hover:text-blue-500 transition-colors">{step.title}</h3>
                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed">{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
