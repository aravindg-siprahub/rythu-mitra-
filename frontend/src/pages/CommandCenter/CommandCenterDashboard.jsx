import React, { Suspense, lazy } from 'react';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { PanelSkeleton, MetricSkeleton } from '../../components/common/Skeletons';

// Lazy Load Components
const Row1_NationalKPIs = lazy(() => import('../../components/command-center/kpi/Row1_NationalKPIs'));
const Row2_RegionalMap = lazy(() => import('../../components/command-center/kpi/Row2_RegionalMap'));
const Row3_AIMonitoring = lazy(() => import('../../components/command-center/ai-monitoring/Row3_AIMonitoring'));
const Row4_Operations = lazy(() => import('../../components/command-center/operations/Row4_Operations'));
const Row5_Alerts = lazy(() => import('../../components/command-center/alerts/Row5_Alerts'));
const Row6_Governance = lazy(() => import('../../components/command-center/governance/Row6_Governance'));

const CommandCenterDashboard = () => {
    return (
        <div className="min-h-screen bg-neo-bg text-neo-text font-sans selection:bg-brand-primary selection:text-white pb-10">
            {/* Background Texture Overlay */}
            <div className="fixed inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
            <div className="fixed inset-0 bg-glass-gradient pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 border-b border-neo-border bg-neo-bg/80 backdrop-blur-md sticky top-0">
                <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-neo-glow">
                            <span className="font-bold text-white">RM</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-white">
                                Rythu Mitra <span className="text-brand-primary">OS</span>
                            </h1>
                            <p className="text-[10px] text-neo-muted font-mono uppercase tracking-widest">
                                National Agriculture Command Center
                            </p>
                        </div>
                    </div>

                    {/* Header Controls */}
                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-neo-panel rounded-full border border-neo-border">
                            <span className="w-2 h-2 rounded-full bg-status-online animate-pulse" />
                            <span className="text-xs font-mono text-status-online">SYSTEM NOMINAL</span>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-mono text-neo-muted">REGION</div>
                            <div className="text-sm font-bold text-brand-primary">IN-SOUTH-1</div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-neo-panel border border-neo-border flex items-center justify-center text-neo-muted hover:text-white hover:border-brand-primary cursor-pointer transition-colors">
                            <span className="text-sm font-bold">A</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="relative z-0 max-w-[1920px] mx-auto p-6 space-y-6">

                {/* ROW 1: National KPIs */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-mono text-neo-muted uppercase tracking-widest">
                            <span className="text-brand-primary mr-2">///</span>
                            National Performance Overview
                        </h2>
                        <button className="text-xs text-brand-secondary hover:text-brand-primary transition-colors">
                            View Detailed Report →
                        </button>
                    </div>
                    <ErrorBoundary>
                        <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"><MetricSkeleton /><MetricSkeleton /><MetricSkeleton /><MetricSkeleton /></div>}>
                            <Row1_NationalKPIs />
                        </Suspense>
                    </ErrorBoundary>
                </section>

                {/* ROW 2 & 3 Middle Split */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Layer 2: Geospatial Intel (Map) */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-mono text-neo-muted uppercase tracking-widest">
                                <span className="text-brand-accent mr-2">///</span>
                                Geospatial Intelligence
                            </h2>
                        </div>
                        <ErrorBoundary>
                            <Suspense fallback={<PanelSkeleton height="h-[500px]" />}>
                                <Row2_RegionalMap />
                            </Suspense>
                        </ErrorBoundary>
                    </div>

                    {/* Layer 3: AI Systems Health */}
                    <div className="lg:col-span-1 space-y-6">
                        <div>
                            <h2 className="text-sm font-mono text-neo-muted uppercase tracking-widest mb-4">
                                <span className="text-brand-secondary mr-2">///</span>
                                AI Neural Mesh
                            </h2>
                            <ErrorBoundary>
                                <Suspense fallback={<PanelSkeleton height="h-[500px]" />}>
                                    <Row3_AIMonitoring />
                                </Suspense>
                            </ErrorBoundary>
                        </div>
                    </div>
                </div>

                {/* Layer 4: Operations & Layer 5: Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-sm font-mono text-neo-muted uppercase tracking-widest mb-4">
                            <span className="text-brand-primary mr-2">///</span>
                            Operations & Logistics
                        </h2>
                        <ErrorBoundary>
                            <Suspense fallback={<PanelSkeleton height="h-80" />}>
                                <Row4_Operations />
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                    <div>
                        <h2 className="text-sm font-mono text-neo-muted uppercase tracking-widest mb-4">
                            <span className="text-status-critical mr-2">///</span>
                            Risk & Alerts Command
                        </h2>
                        <ErrorBoundary>
                            <Suspense fallback={<PanelSkeleton height="h-80" />}>
                                <Row5_Alerts />
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                </div>

                {/* Layer 6: Governance */}
                <section>
                    <h2 className="text-sm font-mono text-neo-muted uppercase tracking-widest mb-4">
                        <span className="text-neo-muted mr-2">///</span>
                        System Governance & Trust
                    </h2>
                    <ErrorBoundary>
                        <Suspense fallback={<PanelSkeleton height="h-32" />}>
                            <Row6_Governance />
                        </Suspense>
                    </ErrorBoundary>
                </section>

            </main>
        </div>
    );
};

export default CommandCenterDashboard;
