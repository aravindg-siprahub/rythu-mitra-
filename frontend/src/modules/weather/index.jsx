import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
function DayCard({ day, actionData, isGoodSpray, isAvoidSpray }) {
    const risk = day.risk_level || 'Uncertain';
    const tint = RISK_TINT[risk] || RISK_TINT.Uncertain;
    const date = day.date
        ? new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
        : (day.date_label ? `${day.day || ''} ${day.date_label}` : `Day ${day.day_index || day.day || ''}`);

    return (
        <div
            className="rounded-xl p-3 flex flex-col items-center gap-1 text-center min-w-[90px] flex-shrink-0"
            style={{
                backgroundColor: tint.bg,
                border: `1px solid ${tint.text}33`,
            }}
        >
            <span className="text-sm font-bold" style={{ color: tint.text }}>{date}</span>
            <span className="text-2xl">{getWeatherIcon(day.condition)}</span>
            <span className="text-sm font-black" style={{ color: THEME.colors.textPrimary }}>
                {day.max_temp ?? day.temperature ?? '–'}°C
            </span>
            <span className="text-sm" style={{ color: THEME.colors.textSecondary }}>
                🌧 {day.rainfall ?? day.precipitation ?? 0}mm
            </span>
            {/* Humidity */}
            {(day.humidity != null) && (
                <div style={{ fontSize: 11, color: THEME.colors.textSecondary, marginTop: 2 }}>
                    💧 {Math.round(day.humidity)}%
                </div>
            )}
            <RiskBadge level={risk} size="sm" />
            {/* Daily farming action */}
            <div style={{ marginTop: 6 }}>
                {actionData?.action && (
                    <div style={{
                        fontSize: 14, lineHeight: 1.4,
                        color: actionData.action_type === 'avoid_spray' ? '#b91c1c'
                            : actionData.action_type === 'irrigate' ? '#0369a1'
                            : actionData.action_type === 'spray' ? '#166534'
                            : '#92400e',
                        textAlign: 'center', padding: '0 4px'
                    }}>
                        {actionData.action_type === 'avoid_spray' ? '❌' :
                            actionData.action_type === 'irrigate' ? '💧' :
                            actionData.action_type === 'spray' ? '✅' :
                            actionData.action_type === 'harvest' ? '🌾' : '⚠️'} {actionData.action}
                    </div>
                )}
                {!actionData?.action && isGoodSpray && (
                    <div style={{ fontSize: 14, color: '#166534', textAlign: 'center' }}>✅ Good spray day</div>
                )}
                {!actionData?.action && isAvoidSpray && (
                    <div style={{ fontSize: 14, color: '#b91c1c', textAlign: 'center' }}>❌ No spray</div>
                )}
            </div>
        </div>
    );
}

export default function WeatherModule() {
    const navigate = useNavigate();
    const {
        loading, result, error,
        selectedDistrict, setSelectedDistrict,
        selectedState, setSelectedState,
        selectedCrop, setSelectedCrop,
        fetchWeather,
    } = useWeather();

    const forecast = result?.forecast_7d || [];
    const alerts = result?.crop_alerts || [];
    const overallRisk = result?.risk_level || result?.overall_risk;
    const advisoryData = result;

    // Build a day → action lookup from advisory data
    const dailyActionMap = useMemo(() => {
        const map = {};
        (advisoryData?.daily_actions || []).forEach(item => {
            if (item.day) map[item.day] = item;
        });
        return map;
    }, [advisoryData]);

    // Build spray advisory lookup
    const sprayMap = useMemo(() => {
        const best = new Set(
            (advisoryData?.spray_advisory?.best_days || []).map(d => d.toLowerCase().substring(0, 3))
        );
        const avoid = new Set(
            (advisoryData?.spray_advisory?.avoid_days || []).map(d => d.toLowerCase().substring(0, 3))
        );
        return { best, avoid };
    }, [advisoryData]);

    const crop = selectedCrop;

    return (
        <div style={{ backgroundColor: THEME.colors.background, minHeight: '100vh', paddingBottom: '80px' }} className="pb-24 md:pb-0">
            <SeasonBanner />

            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-black" style={{ color: THEME.colors.textPrimary }}>
                        🌦️ Weather & Agricultural Risk
                    </h1>
                    <p className="text-sm mt-1" style={{ color: THEME.colors.textSecondary }}>
                        Scientific 7-day forecast with AI-powered crop advisory
                    </p>
                </div>

                <div 
                    className="mb-8 p-1 rounded-3xl shadow-xl transition-all"
                    style={{ 
                        background: `linear-gradient(135deg, ${THEME.colors.primary}11 0%, ${THEME.colors.primary}22 100%)`,
                        border: `1px solid ${THEME.colors.primary}33`
                    }}
                >
                    <div className="bg-white rounded-[22px] p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-xl">📍</div>
                            <div>
                                <h2 className="font-black text-lg" style={{ color: THEME.colors.textPrimary }}>Farmer Forecast Center</h2>
                                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Dynamic AI Advisory for Your Specific Location & Crop</p>
                            </div>
                        </div>

                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                fetchWeather();
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                        >
                            {/* State Input */}
                            <div className="group">
                                <label className="text-sm font-black uppercase tracking-widest block mb-1.5 px-1" style={{ color: THEME.colors.textSecondary }}>
                                    State 🏛️
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={selectedState}
                                        onChange={(e) => setSelectedState(e.target.value)}
                                        placeholder="e.g. Telangana"
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm border-2 transition-all focus:border-blue-500 outline-none"
                                        style={{ borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🗺️</span>
                                </div>
                            </div>

                            {/* Location Input */}
                            <div className="group">
                                <label className="text-sm font-black uppercase tracking-widest block mb-1.5 px-1" style={{ color: THEME.colors.textSecondary }}>
                                    Your Location 🏙️
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        placeholder="e.g. Warangal"
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm border-2 transition-all focus:border-blue-500 outline-none"
                                        style={{ borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🏘️</span>
                                </div>
                            </div>

                            {/* Crop Dropdown */}
                            <div className="group">
                                <label className="text-sm font-black uppercase tracking-widest block mb-1.5 px-1" style={{ color: THEME.colors.textSecondary }}>
                                    Your Crop 🌾
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedCrop}
                                        onChange={(e) => setSelectedCrop(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm border-2 transition-all focus:border-blue-500 outline-none appearance-none bg-white"
                                        style={{ borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}
                                    >
                                        {[
                                            'Rice (Paddy)', 'Wheat', 'Maize', 'Groundnut', 'Tomato',
                                            'Onion', 'Cotton', 'Sugarcane', 'Soybean', 'Turmeric',
                                            'Chilli', 'Brinjal', 'Okra', 'Banana', 'Mango'
                                        ].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🚜</span>
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-sm">▼</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[54px] rounded-2xl font-black text-white text-sm transition-all shadow-lg active:scale-[0.95] flex items-center justify-center gap-2 hover:brightness-110"
                                    style={{
                                        backgroundColor: THEME.colors.primary,
                                        opacity: loading ? 0.7 : 1,
                                    }}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <><span>🔍</span> Analyze Risk</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ── Loading State ───────────────────────────────────────── */}
                {loading && (
                    <div className="text-center py-20 flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-4xl mb-4 animate-bounce">🌩️</div>
                        <h3 className="text-lg font-black" style={{ color: THEME.colors.textPrimary }}>Analyzing Atmosphere...</h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mt-2">Checking Weather Risk for Farmer</p>
                    </div>
                )}

                {/* ── Error ─────────────────────────────────────────── */}
                {error && !loading && (
                    <div
                        className="rounded-2xl px-6 py-4 text-sm font-bold shadow-sm mb-8 flex items-center gap-3 animate-in fade-in"
                        style={{ backgroundColor: '#FDEAEA', color: THEME.colors.riskHigh, border: `1px solid ${THEME.colors.riskHigh}33` }}
                    >
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* ── Results Dashboard ───────────────────────────────────────── */}
                {!loading && result && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {/* Status Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-2xl">🌍</div>
                                <div>
                                    <h3 className="font-black text-xl" style={{ color: THEME.colors.textPrimary }}>
                                        {result.location || `${selectedDistrict}, ${selectedState}`}
                                    </h3>
                                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">Current Forecast Area</p>
                                </div>
                            </div>
                            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Risk Level</span>
                                <RiskBadge level={overallRisk || 'Low'} />
                            </div>
                        </div>



                        {/* AI Meteorological Advisory */}
                        {result?.explanation?.farmer_advisory && (
                            <div className="mb-8 p-6 rounded-2xl border border-blue-100 bg-blue-50 shadow-sm">
                                <h3 className="text-xs font-black uppercase tracking-widest text-blue-700 mb-2">
                                    📜 Scientific Farmer Advisory
                                </h3>
                                <p className="text-sm text-blue-900 leading-relaxed font-medium">
                                    {result.explanation.farmer_advisory}
                                </p>
                            </div>
                        )}

                        {/* 7-day horizontal strip */}
                        <div
                            className="rounded-2xl p-6 mb-8 overflow-x-auto shadow-sm"
                            style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                        >
                            <h2 className="font-bold text-sm mb-4 uppercase tracking-widest" style={{ color: THEME.colors.textPrimary }}>
                                📅 Weekly Outlook
                            </h2>
                            <div className="flex gap-4 min-w-max pb-2">
                                {forecast.length > 0
                                    ? forecast.map((day, i) => {
                                        const dayKey = day.day || '';
                                        const dayLower = dayKey.toLowerCase().substring(0, 3);
                                        return (
                                            <DayCard
                                                key={i}
                                                day={day}
                                                actionData={dailyActionMap[dayKey]}
                                                isGoodSpray={sprayMap.best.has(dayLower)}
                                                isAvoidSpray={sprayMap.avoid.has(dayLower)}
                                            />
                                        );
                                    })
                                    : (
                                        <p className="text-sm p-4 italic" style={{ color: THEME.colors.textMuted }}>
                                            Forecast data is currently unavailable.
                                        </p>
                                    )}
                            </div>
                        </div>

                        {/* Spray Advisory */}
                        {advisoryData?.spray_advisory && (
                            <div style={{
                                background: 'var(--color-background-primary, #fff)',
                                border: `0.5px solid ${THEME.colors.border}`,
                                borderRadius: 12, padding: '14px 16px', marginBottom: 16
                            }}>
                                <div style={{
                                    fontSize: 12, fontWeight: 600,
                                    color: THEME.colors.textSecondary,
                                    letterSpacing: '0.05em', marginBottom: 12
                                }}>
                                    🧪 SPRAY &amp; PESTICIDE WINDOW
                                </div>
                                <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                                    {/* Best days */}
                                    <div style={{ flex: 1, minWidth: 120 }}>
                                        <div style={{ fontSize: 11, color: THEME.colors.textSecondary, marginBottom: 6 }}>✅ Best days to spray</div>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {(advisoryData.spray_advisory.best_days || []).map(day => (
                                                <span key={day} style={{
                                                    background: '#f0fdf4', color: '#166534',
                                                    borderRadius: 20, padding: '3px 10px',
                                                    fontSize: 12, fontWeight: 500
                                                }}>{day}</span>
                                            ))}
                                            {(!advisoryData.spray_advisory.best_days || advisoryData.spray_advisory.best_days.length === 0) && (
                                                <span style={{ fontSize: 12, color: THEME.colors.textSecondary }}>No ideal days this week</span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Avoid days */}
                                    <div style={{ flex: 1, minWidth: 120 }}>
                                        <div style={{ fontSize: 11, color: THEME.colors.textSecondary, marginBottom: 6 }}>❌ Avoid spraying</div>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {(advisoryData.spray_advisory.avoid_days || []).map(day => (
                                                <span key={day} style={{
                                                    background: '#fef2f2', color: '#b91c1c',
                                                    borderRadius: 20, padding: '3px 10px',
                                                    fontSize: 12, fontWeight: 500
                                                }}>{day}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: THEME.colors.textSecondary, lineHeight: 1.55, fontStyle: 'italic' }}>
                                    {advisoryData.spray_advisory.reason}
                                </div>
                            </div>
                        )}

                        {/* Irrigation Advisory */}
                        {advisoryData?.irrigation_advisory && (
                            <div style={{
                                background: '#eff6ff', border: '0.5px solid #bfdbfe',
                                borderRadius: 12, padding: '14px 16px', marginBottom: 16
                            }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#1d4ed8', letterSpacing: '0.05em', marginBottom: 10 }}>
                                    💧 IRRIGATION ADVISORY
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                                    <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px' }}>
                                        <div style={{ fontSize: 11, color: THEME.colors.textSecondary, marginBottom: 3 }}>Today's amount</div>
                                        <div style={{ fontSize: 16, fontWeight: 600, color: '#1d4ed8' }}>
                                            {advisoryData.irrigation_advisory.today_amount_cm}
                                        </div>
                                    </div>
                                    <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px' }}>
                                        <div style={{ fontSize: 11, color: THEME.colors.textSecondary, marginBottom: 3 }}>Best time</div>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: '#1d4ed8' }}>
                                            {advisoryData.irrigation_advisory.today_timing}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: '#1e40af', lineHeight: 1.55 }}>
                                    {advisoryData.irrigation_advisory.weekly_note}
                                </div>
                            </div>
                        )}

                        {/* Disease Risk Forecast */}
                        {advisoryData?.disease_risk_days?.length > 0 && (
                            <div style={{
                                background: '#fff',
                                border: `0.5px solid ${THEME.colors.border}`,
                                borderRadius: 12, padding: '14px 16px', marginBottom: 16
                            }}>
                                <div style={{
                                    fontSize: 12, fontWeight: 600,
                                    color: THEME.colors.textSecondary,
                                    letterSpacing: '0.05em', marginBottom: 10
                                }}>
                                    🦠 DISEASE RISK FORECAST
                                </div>
                                {advisoryData.disease_risk_days.map((risk, i) => (
                                    <div key={i} style={{
                                        display: 'flex', gap: 10, alignItems: 'flex-start',
                                        marginBottom: 8, paddingBottom: 8,
                                        borderBottom: i < advisoryData.disease_risk_days.length - 1
                                            ? `0.5px solid ${THEME.colors.border}` : 'none'
                                    }}>
                                        <div style={{
                                            background: risk.risk_level === 'High' ? '#fef2f2'
                                                : risk.risk_level === 'Medium' ? '#fffbeb'
                                                : '#f0fdf4',
                                            borderRadius: 6, padding: '4px 8px',
                                            fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                                            color: risk.risk_level === 'High' ? '#b91c1c'
                                                : risk.risk_level === 'Medium' ? '#92400e'
                                                : '#166534'
                                        }}>
                                            {risk.day}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 500, color: THEME.colors.textPrimary }}>
                                                {risk.disease}
                                                <span style={{
                                                    fontSize: 11, marginLeft: 6,
                                                    color: risk.risk_level === 'High' ? '#b91c1c'
                                                        : risk.risk_level === 'Medium' ? '#92400e'
                                                        : '#166634'
                                                }}>
                                                    {risk.risk_level} risk
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 12, color: THEME.colors.textSecondary, marginTop: 2 }}>
                                                {risk.action}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div
                                    style={{ fontSize: 12, color: '#185FA5', marginTop: 4, cursor: 'pointer' }}
                                    onClick={() => navigate('/disease')}
                                >
                                    Use Disease Detection if you spot symptoms →
                                </div>
                            </div>
                        )}

                        {/* Crop alert banners — upgraded */}
                        {advisoryData?.crop_alert && (
                            <div style={{
                                background: '#fffbeb', border: '0.5px solid #fcd34d',
                                borderRadius: 12, padding: '12px 14px', marginBottom: 12,
                                display: 'flex', gap: 10
                            }}>
                                <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
                                <div>
                                    <div style={{
                                        fontSize: 12, fontWeight: 600, color: '#92400e',
                                        letterSpacing: '0.05em', marginBottom: 4
                                    }}>
                                        {crop?.toUpperCase() || 'CROP'} ALERT
                                    </div>
                                    <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6 }}>
                                        {advisoryData.crop_alert}
                                    </div>
                                </div>
                            </div>
                        )}

                        {advisoryData?.best_farming_day && (
                            <div style={{
                                background: '#f0fdf4', border: '0.5px solid #86efac',
                                borderRadius: 8, padding: '10px 14px', marginBottom: 12,
                                fontSize: 13, color: '#166534', lineHeight: 1.55
                            }}>
                                🌟 <strong style={{ fontWeight: 500 }}>Best day this week: </strong>
                                {advisoryData.best_farming_day}
                            </div>
                        )}

                        {/* Fallback crop alert banners (old format) */}
                        {alerts.length > 0 && !advisoryData?.crop_alert && (
                            <div className="mt-8">
                                <h3 className="text-xs font-black uppercase tracking-widest text-orange-700 mb-3 px-1">
                                    🚨 Critical Crop Alerts
                                </h3>
                                <CropAlertBanner alerts={alerts} />
                            </div>
                        )}
                    </div>
                )}

                {/* ── Empty state before first fetch ───────────────── */}
                {!loading && !result && !error && (
                    <div
                        className="rounded-2xl p-16 text-center shadow-sm"
                        style={{ backgroundColor: THEME.colors.surface, border: `1px dashed ${THEME.colors.border}` }}
                    >
                        <span className="text-6xl block mb-4">🌦️</span>
                        <h3 className="text-lg font-black mb-2" style={{ color: THEME.colors.textPrimary }}>
                            Ready for Analysis
                        </h3>
                        <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: THEME.colors.textSecondary }}>
                            Enter your state and district details above to receive professional weather forecasts and agricultural advice.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
