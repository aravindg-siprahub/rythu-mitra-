import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";

export default function LandingNavbar() {
    const navigate = useNavigate();
    const { isLoggedIn, user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const authRef = useRef(null);
    const userRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (authRef.current && !authRef.current.contains(e.target)) {
                setAuthOpen(false);
            }
            if (userRef.current && !userRef.current.contains(e.target)) {
                setUserOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleLogout = async () => {
        setUserOpen(false);
        await logout();
        navigate("/");
    };

    const firstLetter = user?.full_name?.charAt(0)?.toUpperCase() || "F";
    const displayName = user?.full_name
        ? user.full_name.length > 12
            ? user.full_name.substring(0, 12) + "…"
            : user.full_name
        : "";

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

                {/* Brand */}
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

                {/* Nav Links */}
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

                {/* Right: Auth area */}
                <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                        /* ── Logged In: User Menu ── */
                        <div ref={userRef} style={{ position: "relative" }}>
                            <button
                                onClick={() => setUserOpen(!userOpen)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: "rgba(255,255,255,0.08)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    borderRadius: 40,
                                    padding: "6px 14px 6px 6px",
                                    cursor: "pointer",
                                    color: "#fff",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    transition: "background 0.2s"
                                }}
                            >
                                {/* Green avatar circle */}
                                <div style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #16a34a, #15803d)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "#fff",
                                    flexShrink: 0
                                }}>
                                    {firstLetter}
                                </div>
                                <span style={{ maxWidth: 96, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {displayName}
                                </span>
                                <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
                            </button>

                            <AnimatePresence>
                                {userOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        style={{
                                            position: "absolute",
                                            top: "calc(100% + 8px)",
                                            right: 0,
                                            background: "#1c1c1e",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: 12,
                                            padding: "6px 0",
                                            minWidth: 180,
                                            boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                                            zIndex: 100
                                        }}
                                    >
                                        {[
                                            { icon: "👤", label: "My Profile", action: () => { navigate("/profile"); setUserOpen(false); } },
                                            { icon: "📊", label: "Dashboard", action: () => { navigate("/dashboard"); setUserOpen(false); } },
                                        ].map(({ icon, label, action }) => (
                                            <button
                                                key={label}
                                                onClick={action}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    width: "100%",
                                                    padding: "10px 16px",
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: "#e5e7eb",
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                    textAlign: "left",
                                                    transition: "background 0.15s"
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                                                onMouseLeave={e => e.currentTarget.style.background = "none"}
                                            >
                                                <span>{icon}</span> {label}
                                            </button>
                                        ))}
                                        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                                width: "100%",
                                                padding: "10px 16px",
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                color: "#f87171",
                                                fontSize: 13,
                                                fontWeight: 500,
                                                textAlign: "left",
                                                transition: "background 0.15s"
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                                            onMouseLeave={e => e.currentTarget.style.background = "none"}
                                        >
                                            <span>🚪</span> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        /* ── Not Logged In: Login/Register dropdown ── */
                        <div ref={authRef} style={{ position: "relative" }}>
                            <button
                                onClick={() => setAuthOpen(!authOpen)}
                                className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-white transition-colors border border-white/20 rounded-full px-4 py-1.5"
                            >
                                Login / Register
                                <span style={{ fontSize: 10 }}>▾</span>
                            </button>

                            <AnimatePresence>
                                {authOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        style={{
                                            position: "absolute",
                                            top: "calc(100% + 8px)",
                                            right: 0,
                                            background: "#1c1c1e",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: 12,
                                            padding: "6px 0",
                                            minWidth: 170,
                                            boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                                            zIndex: 100
                                        }}
                                    >
                                        {[
                                            { icon: "🔑", label: "Login", path: "/login" },
                                            { icon: "✨", label: "Register Free", path: "/register" }
                                        ].map(({ icon, label, path }) => (
                                            <button
                                                key={path}
                                                onClick={() => { navigate(path); setAuthOpen(false); }}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    width: "100%",
                                                    padding: "11px 16px",
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: "#e5e7eb",
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                    textAlign: "left"
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                                                onMouseLeave={e => e.currentTarget.style.background = "none"}
                                            >
                                                <span>{icon}</span> {label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Launch button always visible */}
                            <Button
                                variant={scrolled ? "primary" : "gradient"}
                                size="sm"
                                onClick={() => navigate("/register")}
                                className="rounded-full !px-6"
                            >
                                Get Started Free
                            </Button>
                        </div>
                    )}
                </div>

            </div>
        </motion.nav>
    );
}
