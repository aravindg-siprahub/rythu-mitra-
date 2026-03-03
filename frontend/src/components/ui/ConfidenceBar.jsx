import React from 'react';
import { THEME } from '../../styles/theme';

/**
 * ConfidenceBar — Animated horizontal fill bar.
 * Color: green ≥ 0.80, amber 0.60–0.79, red < 0.60
 *
 * @param {{ confidence: number, label?: string }} props
 * confidence is 0.0–1.0 (float) or 0–100 (auto-detected)
 */
export default function ConfidenceBar({ confidence, label }) {
    // Normalize: accept either 0-1 float or 0-100 int
    const normalized = confidence > 1 ? confidence / 100 : confidence;
    const pct = Math.min(100, Math.max(0, Math.round(normalized * 100)));

    let barColor;
    if (normalized >= 0.8) barColor = THEME.colors.riskLow;
    else if (normalized >= 0.6) barColor = THEME.colors.riskMedium;
    else barColor = THEME.colors.riskHigh;

    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between items-center mb-1">
                    <span
                        className="text-xs font-medium"
                        style={{ color: THEME.colors.textSecondary }}
                    >
                        {label}
                    </span>
                    <span
                        className="text-xs font-bold"
                        style={{ color: barColor }}
                    >
                        {pct}%
                    </span>
                </div>
            )}

            <div
                className="w-full h-6 rounded-full overflow-hidden relative"
                style={{ backgroundColor: '#E8F5E9' }}
            >
                <div
                    className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{
                        width: `${pct}%`,
                        backgroundColor: barColor,
                        transition: 'width 0.8s ease-in-out',
                        minWidth: pct > 0 ? '2rem' : 0,
                    }}
                >
                    <span
                        className="text-[10px] font-bold text-white"
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {pct}%
                    </span>
                </div>
            </div>
        </div>
    );
}
