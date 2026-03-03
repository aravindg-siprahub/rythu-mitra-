import React, { useEffect } from 'react';
import SeasonBanner from '../../components/ui/SeasonBanner';
import RiskBadge from '../../components/ui/RiskBadge';
import { THEME } from '../../styles/theme';
import { useWeather } from './hooks/useWeather';

const RISK_TINT = {
    Low: { bg: '#D8F3DC', text: THEME.colors.riskLow },
    Medium: { bg: '#FEF0E7', text: THEME.colors.riskMedium },
    High: { bg: '#FDEAEA', text: THEME.colors.riskHigh },
    Uncertain: { bg: '#F0F0F0', text: THEME.colors.riskUncertain },
};

const WEATHER_ICONS = {
    sunny: '☀️', clear: '☀️', cloudy: '☁️', rain: '🌧️',
    storm: '⛈️', thunderstorm: '⛈️', fog: '🌫️', default: '🌤️',
};

function getWeatherIcon(condition = '') {
    const lower = condition.toLowerCase();
    for (const [key, icon] of Object.entries(WEATHER_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return WEATHER_ICONS.default;
}

// ─── Crop Alert Banner ────────────────────────────────────────────────────────
function CropAlertBanner({ alerts }) {
    if (!alerts || alerts.length === 0) return null;
    return (
        <div className="space-y-3 mt-4">
            {alerts.map((alert, i) => (
                <div
                    key={i}
                    className="rounded-xl px-4 py-3 flex gap-3 items-start"
                    style={{
                        backgroundColor: '#FEF3C7',
                        border: `1px solid ${THEME.colors.riskMedium}44`,
                    }}
                >
                    <span className="text-xl flex-shrink-0">⚠️</span>
                    <div>
                        <p className="text-sm font-bold" style={{ color: '#92400E' }}>
                            {alert.title || 'Crop Advisory'}
                        </p>
                        <p className="text-sm mt-0.5" style={{ color: '#78350F' }}>
                            {alert.message || alert}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Single day card ──────────────────────────────────────────────────────────
function DayCard({ day }) {
    const risk = day.risk_level || 'Uncertain';
    const tint = RISK_TINT[risk] || RISK_TINT.Uncertain;
    const date = day.date ? new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) : `Day ${day.day_index || ''}`;

    return (
        <div
            className="rounded-xl p-3 flex flex-col items-center gap-1 text-center min-w-[90px] flex-shrink-0"
            style={{
                backgroundColor: tint.bg,
                border: `1px solid ${tint.text}33`,
            }}
        >
            <span className="text-[10px] font-bold" style={{ color: tint.text }}>{date}</span>
            <span className="text-2xl">{getWeatherIcon(day.condition)}</span>
            <span className="text-sm font-black" style={{ color: THEME.colors.textPrimary }}>
                {day.max_temp ?? day.temperature ?? '–'}°C
            </span>
            <span className="text-[10px]" style={{ color: THEME.colors.textSecondary }}>
                🌧 {day.rainfall ?? day.precipitation ?? 0}mm
            </span>
            <RiskBadge level={risk} size="sm" />
        </div>
    );
}

export default function WeatherModule() {
    const {
        loading, result, error,
        selectedDistrict, selectDistrict,
        districts, fetchWeather,
    } = useWeather();

    // Load default district on mount
    useEffect(() => {
        fetchWeather('Warangal');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const forecast = result?.forecast_7d || result?.forecast || [];
    const alerts = result?.crop_alerts || result?.alerts || [];
    const overallRisk = result?.risk_level;

    return (
        <div style={{ backgroundColor: THEME.colors.background, minHeight: '100vh' }}>
            <SeasonBanner />

            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-black" style={{ color: THEME.colors.textPrimary }}>
                        🌦️ Weather & Crop Risk
                    </h1>
                    <p className="text-sm mt-1" style={{ color: THEME.colors.textSecondary }}>
                        7-day forecast with agricultural risk assessment
                    </p>
                </div>

                {/* ── District selector ─────────────────────────────── */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {districts.map((d) => (
                        <button
                            key={d}
                            onClick={() => selectDistrict(d)}
                            className="px-4 py-2 rounded-xl text-sm font-bold border transition-all"
                            style={{
                                backgroundColor: selectedDistrict === d ? THEME.colors.primary : THEME.colors.surface,
                                color: selectedDistrict === d ? '#fff' : THEME.colors.textPrimary,
                                borderColor: selectedDistrict === d ? THEME.colors.primary : THEME.colors.border,
                                boxShadow: selectedDistrict === d ? `0 2px 8px ${THEME.colors.primary}44` : 'none',
                            }}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                {/* ── Loading ───────────────────────────────────────── */}
                {loading && (
                    <div className="text-center py-12" style={{ color: THEME.colors.textSecondary }}>
                        <span className="text-4xl block mb-3 animate-pulse">🌤️</span>
                        <p className="text-sm font-medium">Loading weather data for {selectedDistrict}...</p>
                    </div>
                )}

                {/* ── Error ─────────────────────────────────────────── */}
                {error && !loading && (
                    <div
                        className="rounded-xl px-4 py-3 text-sm"
                        style={{ backgroundColor: '#FDEAEA', color: THEME.colors.riskHigh, border: `1px solid ${THEME.colors.riskHigh}33` }}
                    >
                        {error}
                    </div>
                )}

                {/* ── Results ───────────────────────────────────────── */}
                {!loading && result && (
                    <>
                        {/* Overall risk badge */}
                        {overallRisk && (
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm font-semibold" style={{ color: THEME.colors.textSecondary }}>
                                    Overall farm risk:
                                </span>
                                <RiskBadge level={overallRisk} />
                            </div>
                        )}

                        {/* 7-day horizontal strip */}
                        <div
                            className="rounded-xl p-4 mb-4 overflow-x-auto"
                            style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                        >
                            <h2 className="font-bold text-sm mb-3" style={{ color: THEME.colors.textPrimary }}>
                                📅 7-Day Forecast — {selectedDistrict}
                            </h2>
                            <div className="flex gap-3 min-w-max pb-1">
                                {forecast.length > 0
                                    ? forecast.map((day, i) => <DayCard key={i} day={day} />)
                                    : (
                                        <p className="text-sm" style={{ color: THEME.colors.textMuted }}>
                                            No forecast data returned by API.
                                        </p>
                                    )}
                            </div>
                        </div>

                        {/* Crop alert banners */}
                        {(overallRisk === 'Medium' || overallRisk === 'High') && (
                            <CropAlertBanner alerts={alerts} />
                        )}
                    </>
                )}

                {/* ── Empty state before first fetch ───────────────── */}
                {!loading && !result && !error && (
                    <div
                        className="rounded-xl p-8 text-center"
                        style={{ backgroundColor: THEME.colors.surface, border: `1px dashed ${THEME.colors.border}` }}
                    >
                        <span className="text-4xl block mb-3">🌦️</span>
                        <p className="font-medium" style={{ color: THEME.colors.textSecondary }}>
                            Select a district to see weather forecast and crop risk assessment.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
