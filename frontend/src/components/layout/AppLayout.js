import React from "react";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
    return (
        <div className="relative min-h-screen bg-[#0f172a]">
            <Navbar />
            <div className="pt-20"> {/* Add padding for fixed navbar */}
                <Outlet />
            </div>
        </div>
    );
}
