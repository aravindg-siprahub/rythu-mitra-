import React from "react";
import LandingNavbar from "../landing/LandingNavbar";
import { Outlet } from "react-router-dom";

export default function LandingLayout({ children }) {
    return (
        <div className="relative">
            <LandingNavbar />
            <main className="min-h-screen bg-[#030712] selection:bg-emerald-500/30 selection:text-white overflow-x-hidden">
                {children || <Outlet />}
            </main>
        </div>
    );
}
