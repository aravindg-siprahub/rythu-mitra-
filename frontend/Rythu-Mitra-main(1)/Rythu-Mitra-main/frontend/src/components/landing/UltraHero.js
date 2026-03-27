import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

export default function UltraHero() {
    const navigate = useNavigate();
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

    const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacityText = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
    const scaleBackground = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

    return (
        <section ref={ref} className="relative h-[120vh] w-full overflow-hidden bg-darker text-white">

            {/* Cinematic Background Layer */}
            <motion.div
                style={{ scale: scaleBackground }}
                className="absolute inset-0 z-0"
            >
                {/* Dynamic Surface Grid */}
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

                {/* Atmospheric Glows */}
                <div className="absolute top-1/4 left-1/4 h-[800px] w-[800px] rounded-full bg-blue-600/10 blur-[180px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 h-[800px] w-[800px] rounded-full bg-red-600/5 blur-[180px] animate-pulse" style={{ animationDelay: '1s' }} />

                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-darker/20 via-transparent to-darker" />
            </motion.div>

            {/* AI Particle Stream (CSS Only fallback) */}
            <div className="absolute inset-0 z-1 pointer-events-none">
                <div className="absolute top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent opacity-30 animate-radar" />
            </div>

            {/* Content Core */}
            <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center">
                <motion.div
                    style={{ y: yText, opacity: opacityText }}
                    className="max-w-[1400px]"
                >
                    {/* Enterprise Node Identifier */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-12"
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-3xl">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-heartbeat shadow-[0_0_10px_#3b82f6]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
                                Rythu Mitra AI Intelligence OS — <span className="text-white">2035</span> Enterprise Edition
                            </span>
                        </div>
                    </motion.div>

                    {/* The Terminal Headline */}
                    <h1 className="text-[10vw] lg:text-[8vw] font-black tracking-tighter leading-[0.85] mb-16 font-title italic">
                        <motion.span
                            initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
                            animate={{ clipPath: 'inset(0 0 0 0)', opacity: 1 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="block text-white"
                        >
                            Rythu Mitra AI
                        </motion.span>
                        <motion.span
                            initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
                            animate={{ clipPath: 'inset(0 0 0 0)', opacity: 1 }}
                            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="block"
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-white to-red-500">Intelligence OS.</span>
                        </motion.span>
                    </h1>

                    {/* Mission Parameters */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="max-w-5xl mx-auto text-lg md:text-2xl text-slate-500 font-bold uppercase tracking-widest leading-relaxed mb-20 px-4"
                    >
                        The Future of Agriculture Begins Here.
                    </motion.p>

                    {/* Operational Commands */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-10"
                    >
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="group relative h-20 px-16 rounded-[2rem] bg-white text-black font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all btn-tactile hover:shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                        >
                            <span className="relative z-10">Launch Intelligence Console</span>
                            <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1]" />
                        </button>

                        <button className="flex items-center gap-6 group">
                            <div className="h-16 w-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5 transition-all group-active:scale-90">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 group-hover:scale-[3] transition-transform duration-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 group-hover:text-white transition-colors italic">Watch 2035 Vision</span>
                        </button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Context Fade Element */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-darker to-transparent z-30" />

            {/* Scroll Authority */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-16 left-12 flex flex-col items-center gap-6 z-40 hidden md:flex"
            >
                <div className="h-24 w-[1px] bg-gradient-to-b from-blue-500 to-transparent animate-pulse" />
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.8em] [writing-mode:vertical-lr] opacity-50">Operational_Depth</span>
            </motion.div>

        </section>
    );
}
