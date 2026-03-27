import React from "react";
import { motion } from "framer-motion";
import Card from "../ui/Card";

export default function FeatureCard({ title, subtitle, icon, color, delay, onClick }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: delay, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
            onClick={onClick}
        >
            <div className="h-full p-10 rounded-[3rem] bg-white/5 border border-white/5 backdrop-blur-2xl hover:border-white/10 hover:bg-white/[0.08] transition-all duration-700 cursor-pointer overflow-hidden group relative flex flex-col justify-between">
                {/* Glow Core */}
                <div className={`absolute -top-10 -right-10 h-40 w-40 rounded-full ${color} opacity-[0.03] blur-[100px] transition-all duration-700 group-hover:opacity-10 group-hover:scale-150`} />

                <div>
                    {/* Module Icon Container */}
                    <div className={`mb-12 flex h-20 w-20 items-center justify-center rounded-[2rem] ${color} bg-opacity-10 text-4xl shadow-2xl border border-white/5 group-hover:scale-110 group-hover:border-white/20 transition-all duration-700 ease-[0.16,1,0.3,1]`}>
                        {icon}
                    </div>

                    {/* Metadata */}
                    <h3 className="text-3xl font-black text-white mb-6 tracking-tighter group-hover:text-blue-500 transition-colors duration-500 leading-tight italic">{title}</h3>
                    <p className="text-slate-500 leading-relaxed font-bold text-[11px] uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity duration-500">{subtitle}</p>
                </div>

                {/* Secure Command Action */}
                <div className="mt-14 flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-blue-500 opacity-0 transform translate-x-[-20px] transition-all duration-700 ease-[0.16,1,0.3,1] group-hover:opacity-100 group-hover:translate-x-0">
                    <span className="h-[1px] w-8 bg-blue-500/50" />
                    <span>Initialize_Module</span>
                </div>
            </div>
        </motion.div>
    );
}
