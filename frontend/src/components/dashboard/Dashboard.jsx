import React, { useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import ServiceHero from './ServiceHero';
import SystemFocusBanner from './SystemFocusBanner';
import LiveMetrics from './LiveMetrics';
import ControlHub from './ControlHub';
import AIList from './AIList';
import TrustBadge from './TrustBadge';

const Dashboard = () => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30">
                {/* 1. Hero Section (Service Identity) */}
                <ServiceHero />

                {/* 2. System Focus Banner (Conditional) */}
                <SystemFocusBanner />

                {/* 3. Live System Pulse */}
                <LiveMetrics />

                {/* 4. Core Capabilities (Control Hub) */}
                <ControlHub />

                {/* 4. AI Insights (Outcomes) */}
                <AIList />

                {/* 5. Trust & Assurance Footer */}
                <TrustBadge />
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
