import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../ui/Button";
import Dropdown, { DropdownItem } from "../ui/Dropdown";
import { useLanguage } from "../../context/LanguageContext";

const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Crop Advisor", path: "/crop", icon: "🌱" },
    { name: "Disease Lab", path: "/disease", icon: "🔬" },
    { name: "Markets", path: "/prices", icon: "📈" },
    { name: "Weather", path: "/weather", icon: "🌤" },
    { name: "Logistics", path: "/transport", icon: "🚚" },
];

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { lang, setLang } = useLanguage();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Scroll Engine
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
                    ${scrolled || mobileMenuOpen
                        ? "neo-glass h-16"
                        : "bg-transparent h-24"
                    }
                `}
            >
                <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6 lg:px-12">
                    {/* Logo */}
                    <div className="flex cursor-pointer items-center gap-4 group" onClick={() => navigate("/")}>
                        <div className="relative h-11 w-11">
                            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-50 transition-all duration-700" />
                            <div className="relative h-full w-full bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center text-blue-500 font-black text-2xl shadow-2xl group-hover:border-blue-500/50 group-hover:scale-105 transition-all duration-500">
                                R
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-base font-black text-white tracking-widest uppercase mb-0.5 leading-none font-title italic">Rythu Mitra</h1>
                            <span className="text-[9px] font-black text-blue-500 tracking-[0.5em] uppercase opacity-80">AI Intelligence OS</span>
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden items-center gap-2 lg:flex">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={`
                                    relative px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all
                                    ${isActive(link.path) ? "text-white" : "text-slate-500 hover:text-white"}
                                `}
                            >
                                {isActive(link.path) && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-white/5 border border-white/10 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{link.name}</span>
                            </NavLink>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-6">
                        <Dropdown
                            align="right"
                            trigger={
                                <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-[10px] font-black text-slate-500 hover:bg-white/10 hover:text-white transition-all">
                                    {lang}
                                </button>
                            }
                        >
                            <DropdownItem onClick={() => setLang("EN")} active={lang === "EN"}>ENG</DropdownItem>
                            <DropdownItem onClick={() => setLang("TE")} active={lang === "TE"}>TEL</DropdownItem>
                            <DropdownItem onClick={() => setLang("HI")} active={lang === "HI"}>HIN</DropdownItem>
                        </Dropdown>

                        <Button
                            variant="primary"
                            className="hidden sm:flex text-[10px] h-10 px-6 rounded-xl font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20"
                            onClick={() => navigate("/dashboard")}
                        >
                            Open Console
                        </Button>

                        {/* Mobile Toggle */}
                        <button
                            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-400"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-darker/95 backdrop-blur-3xl lg:hidden pt-24 px-6"
                    >
                        <div className="space-y-4">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`
                                        flex items-center justify-between rounded-2xl p-6 text-sm font-black uppercase tracking-widest border border-white/5
                                        ${isActive(link.path) ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400"}
                                    `}
                                >
                                    <span>{link.name}</span>
                                    <span className="text-xl opacity-30">{link.icon}</span>
                                </NavLink>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
