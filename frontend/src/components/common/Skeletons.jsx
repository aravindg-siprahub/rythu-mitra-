import React from 'react';

export const PanelSkeleton = ({ height = "h-64" }) => (
    <div className={`w-full ${height} bg-neo-panel border border-neo-border rounded-xl p-4 overflow-hidden relative`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-pulse-slow" />
        <div className="flex items-center space-x-3 mb-4">
            <div className="h-5 w-5 bg-neo-bg rounded" />
            <div className="h-4 w-32 bg-neo-bg rounded" />
        </div>
        <div className="space-y-3">
            <div className="h-2 w-full bg-neo-bg rounded" />
            <div className="h-2 w-3/4 bg-neo-bg rounded" />
            <div className="h-2 w-1/2 bg-neo-bg rounded" />
        </div>
    </div>
);

export const MetricSkeleton = () => (
    <div className="bg-neo-panel border border-neo-border rounded-xl p-4">
        <div className="h-3 w-20 bg-neo-bg rounded mb-2" />
        <div className="h-8 w-16 bg-neo-bg rounded mb-2" />
        <div className="h-2 w-full bg-neo-bg rounded" />
    </div>
);
