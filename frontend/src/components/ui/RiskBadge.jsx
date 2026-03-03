import React from 'react';
import { THEME } from '../../styles/theme';

const RISK_CONFIG = {
    Low: {
        color: THEME.colors.riskLow,
        bg: '#D8F3DC',
        label: 'Low Risk',
        icon: '✓',
    },
    Medium: {
        color: THEME.colors.riskMedium,
        bg: '#FEF0E7',
        label: 'Medium Risk',
        icon: '!',
    },
    High: {
        color: THEME.colors.riskHigh,
        bg: '#FDEAEA',
        label: 'High Risk',
        icon: '⚠',
    },
    Uncertain: {
        color: THEME.colors.riskUncertain,
        bg: '#F0F0F0',
        label: 'Uncertain',
        icon: '?',
    },
};

/**
 * RiskBadge — Colored pill badge for risk levels.
 * Used across crop, market, and weather modules.
 *
 * @param {{ level: 'Low'|'Medium'|'High'|'Uncertain', size?: 'sm'|'md' }} props
 */
export default function RiskBadge({ level, size = 'md' }) {
    const config = RISK_CONFIG[level] || RISK_CONFIG.Uncertain;
    const isSmall = size === 'sm';

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-bold ${isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
                }`}
            style={{ backgroundColor: config.bg, color: config.color }}
        >
            <span>{config.icon}</span>
            {config.label}
        </span>
    );
}
