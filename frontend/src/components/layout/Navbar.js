import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../ui/Button";

// Apple-Style Navigation Links
const navLinks = [
    { name: "Rythu Mitra OS", path: "/dashboard", icon: "⌘" }, // Home/Launcher
    { name: "Crop AI", path: "/crop", icon: "🌱" },
    { name: "Disease", path: "/disease", icon: "🦠" },
    { name: "Market", path: "/market", icon: "📈" },
    { name: "Weather", path: "/weather", icon: "🌤" },
    { name: "Workforce", path: "/workers", icon: "👷" },
    { name: "Transport", path: "/transport", icon: "🚚" },
    { name: "Governance", path: "/governance", icon: "⚖️" },
];

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${scrolled
                    ? "bg-[#0b0c15]/70 backdrop-blur-xl border-white/5 h-16"
                    : "bg-transparent border-transparent h-20"
                }`}
        >
            <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between">

                {/* 1. Brand / OS Identity */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xs">
                        RM
                    </div>
                    <span className="hidden md:block text-sm font-semibold text-white tracking-wide">
                        Rythu Mitra <span className="text-slate-500 font-normal">OS</span>
                    </span>
                </div>

                {/* 2. Apple-Style Centered Nav */}
                <div className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/5 rounded-full px-2 py-1.5 backdrop-blur-md shadow-2xl">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) => `
                                relative px-4 py-1.5 text-[11px] font-medium transition-all rounded-full
                                ${isActive ? "text-white" : "text-slate-400 hover:text-slate-200"}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-white/10 rounded-full border border-white/5 shadow-inner"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        {/* Optional: Show Icon on Hover or Active? For now, clean text only per 'Apple Style' usually text based */}
                                        {link.name}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* 3. Global Actions (Search / Profile) */}
                <div className="flex items-center gap-4">
                    <button className="h-8 w-8 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 p-[1px] cursor-pointer" onClick={() => navigate('/profile')}>
                        <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                            JD
                        </div>
                    </div>
                </div>

            </div>
        </nav>
    );
}
