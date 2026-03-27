import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../ui/Card";

const reviews = [
    { name: "Ravi Kumar", role: "Organic Farmer", text: "Rythu Mitra OS increased my paddy yield by 40% in just one season. The AI predictions are scary accurate." },
    { name: "Anitha Reddy", role: "Agri-Entrepreneur", text: "The market intelligence tool is a game changer. I sold my cotton at the peak price thanks to the alerts." },
    { name: "Srinivas Rao", role: "Logistics Manager", text: "Connecting with transport drivers used to take hours. Now it takes seconds." },
];

export default function Testimonials() {
    return (
        <section className="py-40 bg-darker border-t border-white/5 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="mb-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black tracking-[0.4em] uppercase mb-8"
                    >
                        User Verification
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic font-title">Trusted by <span className="text-emerald-500">Pioneers</span></h2>
                </div>

                <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                    {reviews.map((r, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                            className="p-10 rounded-[3rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl hover:border-emerald-500/30 transition-all duration-700 group hover-lift"
                        >
                            <div className="flex text-emerald-500 mb-8 text-xs tracking-[0.5em] font-black uppercase">★★★★★</div>
                            <p className="text-slate-400 italic font-medium text-lg leading-relaxed mb-10 group-hover:text-white transition-colors">"{r.text}"</p>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">👤</div>
                                <div>
                                    <p className="text-white font-black uppercase tracking-widest text-sm">{r.name}</p>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{r.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
