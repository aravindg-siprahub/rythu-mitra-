import React from 'react';
import { THEME } from '../../styles/theme';

/**
 * Determine soil health level for a nutrient value.
 * Returns: 'poor' | 'fair' | 'good' | 'excellent'
 */
function getNLevel(val) {
    if (val < 40) return 'poor';
    if (val < 80) return 'fair';
    if (val <= 120) return 'good';
    return 'excellent';
}
function getPLevel(val) {
    if (val < 20) return 'poor';
    if (val < 40) return 'fair';
    if (val <= 80) return 'good';
    return 'excellent';
}
function getKLevel(val) {
    if (val < 20) return 'poor';
    if (val < 40) return 'fair';
    if (val <= 80) return 'good';
    return 'excellent';
}
function getPHLevel(val) {
    if (val < 5 || val > 8) return 'poor';
    if ((val >= 5 && val < 6) || (val > 7 && val <= 8)) return 'fair';
    return 'good';
}

const LEVEL_COLORS = {
    poor: THEME.colors.soilPoor,
    fair: THEME.colors.soilFair,
    good: THEME.colors.soilGood,
    excellent: THEME.colors.soilExcellent,
};

const LEVEL_SCORES = { poor: 25, fair: 50, good: 75, excellent: 100 };

/**
 * CircularGauge — CSS conic-gradient gauge for a single nutrient.
 */
function CircularGauge({ label, value, levelFn, unit }) {
    const level = levelFn(parseFloat(value) || 0);
    const color = LEVEL_COLORS[level];
    const score = LEVEL_SCORES[level];

    return (
        <div className="flex flex-col items-center gap-1">
            <div
                className="relative flex items-center justify-center"
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: `conic-gradient(${color} ${score * 3.6}deg, #E8F5E9 0deg)`,
                }}
            >
                <div
                    className="flex items-center justify-center rounded-full bg-white"
                    style={{ width: 48, height: 48 }}
                >
                    <span className="text-[10px] font-bold" style={{ color }}>
                        {typeof value === 'number' ? value : (parseFloat(value) || 0)}
                    </span>
                </div>
            </div>
            <span
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: THEME.colors.textMuted }}
            >
                {label}
            </span>
            <span
                className="text-[9px] capitalize"
                style={{ color }}
            >
                {level}
            </span>
        </div>
    );
}

/**
 * SoilHealthMeter — Visual soil dashboard using 4 circular gauges.
 * Updates live as user types without any API call.
 *
 * @param {{ N, P, K, ph }} props
 */
export default function SoilHealthMeter({ N, P, K, ph }) {
    // Overall score: average of all 4 nutrient scores
    const nScore = LEVEL_SCORES[getNLevel(parseFloat(N) || 0)];
    const pScore = LEVEL_SCORES[getPLevel(parseFloat(P) || 0)];
    const kScore = LEVEL_SCORES[getKLevel(parseFloat(K) || 0)];
    const phScore = LEVEL_SCORES[getPHLevel(parseFloat(ph) || 0)];
    const overall = Math.round((nScore + pScore + kScore + phScore) / 4);

    let overallLabel, overallColor;
    if (overall >= 75) {
        overallLabel = 'Excellent';
        overallColor = THEME.colors.soilExcellent;
    } else if (overall >= 50) {
        overallLabel = 'Good';
        overallColor = THEME.colors.soilGood;
    } else if (overall >= 25) {
        overallLabel = 'Fair';
        overallColor = THEME.colors.soilFair;
    } else {
        overallLabel = 'Poor';
        overallColor = THEME.colors.soilPoor;
    }

    return (
        <div
            className="rounded-xl p-4 border"
            style={{
                backgroundColor: THEME.colors.surface,
                borderColor: THEME.colors.border,
            }}
        >
            <div className="flex items-center justify-between mb-3">
                <span
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: THEME.colors.textSecondary }}
                >
                    🧪 Soil Health
                </span>
                <span
                    className="text-sm font-bold"
                    style={{ color: overallColor }}
                >
                    {overallLabel}
                </span>
            </div>

            <div className="grid grid-cols-4 gap-2 justify-items-center">
                <CircularGauge label="N" value={N} levelFn={getNLevel} unit="kg/ha" />
                <CircularGauge label="P" value={P} levelFn={getPLevel} unit="kg/ha" />
                <CircularGauge label="K" value={K} levelFn={getKLevel} unit="kg/ha" />
                <CircularGauge label="pH" value={ph} levelFn={getPHLevel} unit="" />
            </div>

            <div className="mt-3 text-center">
                <span
                    className="text-[11px]"
                    style={{ color: THEME.colors.textMuted }}
                >
                    Your soil is:{' '}
                    <strong style={{ color: overallColor }}>{overallLabel}</strong>
                </span>
            </div>
        </div>
    );
}
