import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulation } from "../../context/SimulationContext";

const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "AI Crop Advisor", path: "/crop" },
    { name: "Pathogen Lab", path: "/disease" },
    { name: "Trade Terminal", path: "/market" },
    { name: "Weather Intelligence", path: "/weather" },
    { name: "Global Logistics", path: "/transport" },
    { name: "Workers", path: "/workers" },
    { name: "Services", path: "/services" },
];

export default function TopNav() {
    const navigate = useNavigate();
    const { region, setRegion, notifications } = useSimulation();
    const [searchTerm, setSearchTerm] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const location = useLocation();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center px-8 w-full backdrop-blur-2xl border-b border-white/5 bg-black/40">
            {/* Logo Area */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/dashboard")}>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow duration-500">
                    <span className="text-xl">🌾</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tight text-white leading-none uppercase italic">Rythu Mitra</span>
                    <span className="text-[9px] font-medium tracking-[0.2em] text-blue-400 uppercase mt-1">Enterprise OS</span>
                </div>
            </div>

            {/* Navigation Scroller */}
            <div className="hidden xl:flex items-center gap-1">
                {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`relative px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] transition-all
                                ${isActive ? "text-white" : "text-slate-500 hover:text-white"}`}
                        >
                            {link.name}
                            {isActive && (
                                <motion.div
                                    layoutId="nav-active"
                                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="nav-glow"
                                    className="absolute -bottom-[24px] left-1/2 -translate-x-1/2 h-1 w-8 bg-brand-gradient blur-[2px] rounded-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-6 ml-auto">
                {/* System Pulse */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Core Engine Active</span>
                </div>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all relative group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">🔔</span>
                        {notifications.length > 0 && (
                            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse ring-4 ring-slate-900"></span>
                        )}
                    </button>
                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute top-14 right-0 w-80 neo-glass rounded-3xl overflow-hidden z-50"
                            >
                                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural Interrupts</span>
                                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[8px] font-black">{notifications.length} Active</span>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-10 text-center">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">All Systems Nominal</p>
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} className="p-5 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-black text-white text-[11px] uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{n.title}</h4>
                                                    <span className="text-[9px] text-slate-600 font-mono italic">{n.time}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{n.msg}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Account */}
                <div
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-4 pl-6 border-l border-white/10 cursor-pointer group hover:bg-white/5 h-12 rounded-2xl transition-all pr-2"
                >
                    <div className="h-9 w-9 rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl group-hover:border-brand-gradient transition-all bg-gradient-to-tr from-blue-500 to-pink-500 p-[1px]">
                        <div className="h-full w-full bg-darker rounded-[14px] overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Aravind+Kumar&background=3b82f6&color=fff&size=100" alt="User" className="h-full w-full object-cover" />
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-[11px] font-black text-white leading-none uppercase tracking-tighter">Aravind</p>
                        <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1 block">Enterprise Admin</span>
                    </div>
                </div>
            </div>
        </nav>
    );
}
