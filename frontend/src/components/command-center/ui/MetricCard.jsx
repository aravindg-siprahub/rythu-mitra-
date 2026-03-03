import React from 'react';

const MetricCard = ({ title, value, unit, trend, trendValue, icon, status, subtext, delay = 0 }) => {
    // Status color mapping
    const statusColor = {
        'success': 'text-brand-success',
        'warning': 'text-status-warning',
        'critical': 'text-status-critical',
        'neutral': 'text-neo-text'
    };

    return (
        <div
            className={`
                relative overflow-hidden
                bg-neo-panel backdrop-blur-md border border-neo-border rounded-xl
                p-4 transition-all duration-300 hover:shadow-neo-glow hover:border-brand-primary/50
                animate-fade-in-up
            `}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="flex justify-between items-start mb-2">
                <span className="text-neo-muted text-xs font-mono uppercase tracking-wider">{title}</span>
                {icon && <span className="text-brand-primary opacity-80">{icon}</span>}
            </div>

            <div className="flex items-baseline space-x-1">
                <span className={`text-2xl font-bold font-mono ${status ? statusColor[status] : 'text-neo-text'}`}>
                    {value}
                </span>
                {unit && <span className="text-neo-muted text-sm">{unit}</span>}
            </div>

            {(trend || subtext) && (
                <div className="mt-2 flex items-center justify-between">
                    {trend && (
                        <div className={`flex items-center text-xs ${trend === 'up' ? 'text-brand-success' : 'text-status-critical'}`}>
                            <span>{trend === 'up' ? '▲' : '▼'}</span>
                            <span className="ml-1 font-mono">{trendValue}</span>
                        </div>
                    )}
                    {subtext && (
                        <span className="text-xs text-neo-muted/70 font-mono">{subtext}</span>
                    )}
                </div>
            )}

            {/* Status Indicator Dot */}
            {status && (
                <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${status === 'critical' ? 'bg-status-critical animate-pulse' : 'bg-brand-success'}`} />
            )}
        </div>
    );
};

export default MetricCard;
