import React from 'react';

/**
 * Premium RiskBadge Component for Rythu Mitra
 * Displays a color-coded badge based on the risk level.
 */
export default function RiskBadge({ level = 'Low', size = 'md' }) {
    const levels = {
        Low: {
            bg: 'bg-emerald-100',
            text: 'text-emerald-700',
            dot: 'bg-emerald-500',
            label: 'Low Risk'
        },
        Medium: {
            bg: 'bg-amber-100',
            text: 'text-amber-700',
            dot: 'bg-amber-500',
            label: 'Medium Risk'
        },
        High: {
            bg: 'bg-red-100',
            text: 'text-red-700',
            dot: 'bg-red-500',
            label: 'High Risk'
        },
        Uncertain: {
            bg: 'bg-slate-100',
            text: 'text-slate-600',
            dot: 'bg-slate-400',
            label: 'Uncertain'
        }
    };

    const config = levels[level] || levels.Uncertain;
    
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm'
    };

    return (
        <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full ${config.bg} ${config.text} ${sizeClasses[size]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`}></span>
            {config.label}
        </span>
    );
}
