import React from 'react';

const STATUS_CONFIG = {
    active: { color: 'bg-emerald-500', text: 'text-emerald-500', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.5)]' },
    warning: { color: 'bg-amber-500', text: 'text-amber-500', glow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]' },
    critical: { color: 'bg-red-500', text: 'text-red-500', glow: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]' },
    inactive: { color: 'bg-slate-600', text: 'text-slate-500', glow: '' }
};

export default function StatusBadge({ status = 'active', label, pulse = false }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;

    return (
        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white/5 border border-white/10 ${config.text}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${config.color} ${pulse ? 'animate-pulse' : ''} ${config.glow}`} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">{label}</span>
        </div>
    );
}
