import React, { useEffect, useState } from 'react';
import MetricCard from '../ui/MetricCard';

// Icons (using simple text/emojis if generic icons aren't available, or Heroicons/Lucide if installed)
// Since I don't know if lucide-react is installed, I'll use SVG paths or text for now to be safe, 
// but sticking to the design system "text-neo-muted" for labels.

const Row1_NationalKPIs = () => {
    // Mock Data - In real app, fetch from /api/dashboard/kpi_stats
    const [metrics, setMetrics] = useState({
        activeFarmers: "12.4M",
        activeDistricts: "542",
        modelHealth: "99.8%",
        aiConfidence: "87.4%",
        threatLevel: "LOW",
        apiHealth: "100%",
        throughput: "45k/s"
    });

    useEffect(() => {
        // Simulate "Live" updates
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                throughput: `${(40 + Math.random() * 10).toFixed(1)}k/s`,
                aiConfidence: `${(87 + Math.random()).toFixed(1)}%`
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <MetricCard
                title="Active Farmers"
                value={metrics.activeFarmers}
                subtext="Total Registered"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                delay={0}
            />

            <MetricCard
                title="Active Districts"
                value={metrics.activeDistricts}
                subtext="Across 18 States"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                delay={100}
            />

            <MetricCard
                title="Model Health"
                value={metrics.modelHealth}
                status="success"
                trend="up"
                trendValue="0.2%"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                delay={200}
            />

            <MetricCard
                title="AI Confidence"
                value={metrics.aiConfidence}
                trend="up"
                trendValue="1.5%"
                unit="AVG"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                delay={300}
            />

            <MetricCard
                title="Threat Level"
                value={metrics.threatLevel}
                status="success"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                delay={400}
            />

            <MetricCard
                title="API Health"
                value={metrics.apiHealth}
                status="success"
                subtext="Latency: 45ms"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>}
                delay={500}
            />

            <MetricCard
                title="Throughput"
                value={metrics.throughput}
                trend="up"
                trendValue="5%"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                delay={600}
            />
        </div>
    );
};

export default Row1_NationalKPIs;
