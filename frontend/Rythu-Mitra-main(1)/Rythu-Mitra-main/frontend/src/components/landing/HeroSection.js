import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <section className="relative h-screen w-full overflow-hidden bg-[#030712] text-white">

            {/* 4K Background Ambience */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] h-[70vh] w-[70vh] rounded-full bg-blue-600/10 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] h-[70vh] w-[70vh] rounded-full bg-emerald-600/10 blur-[150px] animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
            </div>

            {/* Floating Particles (Simulated) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-1 w-1 bg-white/20 rounded-full"
                        initial={{
                            x: Math.random() * 100 + "vw",
                            y: Math.random() * 100 + "vh",
                            opacity: Math.random() * 0.5 + 0.1,
                        }}
                        animate={{
                            y: [Math.random() * 100 + "vh", Math.random() * 100 + "vh"],
                            x: [Math.random() * 100 + "vw", Math.random() * 100 + "vw"],
                        }}
                        transition={{
                            duration: Math.random() * 20 + 10,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                ))}
            </div>

            {/* Hero Content */}
            <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    style={{ y: y1 }}
                    className="max-w-5xl"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-3xl"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Rythu Mitra OS 2035</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-6xl font-black tracking-tighter md:text-8xl lg:text-9xl mb-6 leading-tight"
                    >
                        <span className="block text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500">
                            Intelligent
                        </span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                            Farming.
                        </span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mx-auto max-w-2xl text-lg text-slate-400 md:text-xl font-light leading-relaxed mb-10"
                    >
                        The world’s first <strong>neural-agricultural engine</strong>.
                        Blending satellite vision, autonomous logistics, and predictive market AI into a single spatial command center.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                    >
                        <Button
                            size="lg"
                            variant="gradient"
                            className="!text-lg !px-10 !py-4 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]"
                            onClick={() => navigate("/dashboard")}
                        >
                            Explore Dashboard
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="!text-lg !px-10 !py-4 border-white/20 hover:bg-white/5"
                        >
                            Try AI Advisor
                        </Button>
                    </motion.div>

                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                style={{ y: y2 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 flex flex-col items-center gap-2"
            >
                <span className="text-[10px] uppercase tracking-widest">Scroll to Explore</span>
                <div className="h-10 w-[1px] bg-gradient-to-b from-slate-500 to-transparent"></div>
            </motion.div>

        </section>
    );
}
