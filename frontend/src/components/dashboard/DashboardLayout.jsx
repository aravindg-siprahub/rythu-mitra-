import React from 'react';
import GlobalCommandBar from './GlobalCommandBar';

const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30">
            {/* 1. Global Command Bar (Apple Navbar) */}
            <GlobalCommandBar />

            {/* 2. Main Content Area (Full Width) */}
            <main className="pt-[48px] min-h-screen">
                <div className="w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
