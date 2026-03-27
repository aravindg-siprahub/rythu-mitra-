import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

export default function LandingNavbar() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled
                    ? "bg-[#030712]/80 backdrop-blur-2xl border-b border-white/5 py-3"
                    : "bg-transparent py-6"
                }
      `}
        >
            <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">

                {/* Brand - Rythu Mitra OS */}
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow duration-500">
                        <span className="text-xl">🌾</span>
                        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight text-white leading-none">Rythu Mitra</span>
                        <span className="text-[10px] font-medium tracking-[0.2em] text-slate-400 uppercase mt-1 group-hover:text-emerald-400 transition-colors">Enterprise OS</span>
                    </div>
                </div>

                {/* Marketing Links (Hidden on Mobile) */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                    {["Platform", "Ecosystem", "Research", "About"].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="hover:text-white transition-colors relative group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-500 transition-all duration-300 group-hover:w-full" />
                        </a>
                    ))}
                </div>

                {/* CTAs */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="hidden md:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    >
                        Sign In
                    </button>
                    <Button
                        variant={scrolled ? "primary" : "gradient"}
                        size="sm"
                        onClick={() => navigate("/dashboard")}
                        className="rounded-full !px-6"
                    >
                        Launch Console
                    </Button>
                </div>

            </div>
        </motion.nav>
    );
}
