import React, { useState } from 'react';
import { THEME } from '../../styles/theme';
import SoilHealthMeter from '../../components/ui/SoilHealthMeter';
import SeasonBanner from '../../components/ui/SeasonBanner';
import { useCropRecommendation } from './hooks/useCropPrediction';
import RiskBadge from '../../components/ui/RiskBadge';
import ConfidenceBar from '../../components/ui/ConfidenceBar';
import CropIcon from '../../components/ui/CropIcon';
import GrowingPlantLoader from '../../components/ui/GrowingPlantLoader';

const FIELDS = [
    { key: 'N', label: 'Nitrogen (N)', icon: '🧪', unit: 'kg/ha', min: 0, max: 140, step: 1 },
    { key: 'P', label: 'Phosphorus (P)', icon: '🧪', unit: 'kg/ha', min: 5, max: 145, step: 1 },
    { key: 'K', label: 'Potassium (K)', icon: '🧪', unit: 'kg/ha', min: 5, max: 205, step: 1 },
    { key: 'temperature', label: 'Temperature', icon: '🌡️', unit: '°C', min: 8, max: 44, step: 0.1 },
    { key: 'humidity', label: 'Humidity', icon: '💧', unit: '%', min: 14, max: 100, step: 0.1 },
    { key: 'ph', label: 'Soil pH', icon: '⚗️', unit: '', min: 3.5, max: 10.0, step: 0.1 },
    { key: 'rainfall', label: 'Annual Rainfall', icon: '🌧️', unit: 'mm', min: 20, max: 300, step: 1 },
];

// ─── Expandable SHAP Feature explanation ─────────────────────────────────────
function ShapSection({ features }) {
    if (!features || features.length === 0) return null;
    const maxVal = Math.max(...features.map((f) => Math.abs(f.value || f.importance || 0)));

    return (
        <div className="mt-3 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: THEME.colors.textMuted }}>Feature Influence</p>
            {features.slice(0, 3).map((ft, i) => {
                const label = ft.feature || ft.name || `Feature ${i + 1}`;
                const importance = ft.importance || ft.value || 0;
                const pct = maxVal > 0 ? Math.round((Math.abs(importance) / maxVal) * 100) : 0;
                return (
                    <div key={i}>
                        <div className="flex justify-between text-[10px] mb-0.5">
                            <span style={{ color: THEME.colors.textSecondary }}>{label}</span>
                            <span style={{ color: THEME.colors.primary }}>{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ backgroundColor: '#E8F5E9' }}>
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: `${pct}%`,
                                    backgroundColor: THEME.colors.primaryLight,
                                    transition: 'width 0.6s ease',
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Single recommendation card ───────────────────────────────────────────────
function RecommendationCard({ rec, rank }) {
    const [expanded, setExpanded] = useState(false);
    const borderColors = [THEME.colors.primary, THEME.colors.primaryLight, '#A8D5B5'];
    const borderWidths = ['2px', '2px', '1px'];

    const confidence = rec.confidence || 0;
    const topFeatures = rec.explanation?.top_features || rec.explanation?.shap_features || [];
    const advisory = rec.explanation?.farmer_advisory || '';

    return (
        <div
            className="rounded-xl p-4 mb-3 shadow-sm"
            style={{
                backgroundColor: THEME.colors.surface,
                border: `${borderWidths[rank - 1]} solid ${borderColors[rank - 1]}`,
            }}
        >
            {/* Header row */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                        style={{ backgroundColor: borderColors[rank - 1] }}
                    >
                        #{rank}
                    </span>
                    <CropIcon cropName={rec.crop} size="md" />
                    <span className="font-bold text-base" style={{ color: THEME.colors.textPrimary }}>
                        {rec.crop}
                    </span>
                </div>
                <RiskBadge level={rec.risk_level || 'Uncertain'} size="sm" />
            </div>

            {/* Confidence bar */}
            <ConfidenceBar confidence={confidence} label="Confidence" />

            {/* Farmer advisory */}
            {advisory && (
                <p
                    className="mt-3 text-sm leading-relaxed rounded-lg px-3 py-2"
                    style={{
                        color: THEME.colors.textPrimary,
                        backgroundColor: THEME.colors.primaryXLight,
                        fontSize: 13,
                    }}
                >
                    {advisory}
                </p>
            )}

            {/* Expand SHAP */}
            {topFeatures.length > 0 && (
                <>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-2 text-[11px] font-semibold underline-offset-2 hover:underline"
                        style={{ color: THEME.colors.primary }}
                    >
                        {expanded ? '▲ Hide details' : '▼ Why this crop?'}
                    </button>
                    {expanded && <ShapSection features={topFeatures} />}
                </>
            )}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CropRecommendation() {
    const {
        formData, updateField, fillDistrict, recommend,
        loading, result, error, fieldErrors, districtNames,
    } = useCropRecommendation();

    const [districtOpen, setDistrictOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        recommend();
    };

    const recommendations = result?.recommendations || [];
    const timing = result?.timing;

    return (
        <div style={{ backgroundColor: THEME.colors.background, minHeight: '100vh' }}>
            <SeasonBanner />

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-black" style={{ color: THEME.colors.textPrimary }}>
                        🌾 Crop Recommendation
                    </h1>
                    <p className="text-sm mt-1" style={{ color: THEME.colors.textSecondary }}>
                        Enter your soil test values to find the best crops for your farm
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* ── Left: Input Form ──────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-4">
                        <div
                            className="rounded-xl p-5 shadow-sm"
                            style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-base" style={{ color: THEME.colors.textPrimary }}>
                                    Tell us about your farm 🌱
                                </h2>
                            </div>

                            {/* District defaults dropdown */}
                            <div className="relative mb-4">
                                <button
                                    type="button"
                                    onClick={() => setDistrictOpen(!districtOpen)}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium border"
                                    style={{
                                        backgroundColor: THEME.colors.primaryXLight,
                                        borderColor: THEME.colors.border,
                                        color: THEME.colors.primary,
                                    }}
                                >
                                    📍 Use district averages ▾
                                </button>
                                {districtOpen && (
                                    <div
                                        className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border shadow-lg overflow-hidden"
                                        style={{ backgroundColor: THEME.colors.surface, borderColor: THEME.colors.border }}
                                    >
                                        {districtNames.map((d) => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => { fillDistrict(d); setDistrictOpen(false); }}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 border-b last:border-0"
                                                style={{ color: THEME.colors.textPrimary, borderColor: THEME.colors.border }}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                {FIELDS.map(({ key, label, icon, unit, min, max, step }) => {
                                    const hasError = !!fieldErrors[key];
                                    return (
                                        <div key={key}>
                                            <label
                                                className="flex items-center gap-1 text-xs font-semibold mb-1"
                                                style={{ color: hasError ? THEME.colors.riskHigh : THEME.colors.textSecondary }}
                                            >
                                                <span>{icon}</span>
                                                {label}
                                                {unit && <span className="ml-auto font-normal" style={{ color: THEME.colors.textMuted }}>{unit}</span>}
                                            </label>
                                            <input
                                                type="number"
                                                value={formData[key]}
                                                onChange={(e) => updateField(key, e.target.value)}
                                                min={min}
                                                max={max}
                                                step={step}
                                                placeholder={`${min}–${max}`}
                                                className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                                                style={{
                                                    borderColor: hasError ? THEME.colors.riskHigh : THEME.colors.border,
                                                    color: THEME.colors.textPrimary,
                                                    backgroundColor: hasError ? '#FFF5F5' : THEME.colors.surface,
                                                }}
                                            />
                                            {hasError && (
                                                <p className="text-[10px] mt-0.5" style={{ color: THEME.colors.riskHigh }}>
                                                    {fieldErrors[key]}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl font-bold text-white text-sm mt-2 transition-opacity"
                                    style={{
                                        backgroundColor: loading ? THEME.colors.primaryLight : THEME.colors.primary,
                                        opacity: loading ? 0.7 : 1,
                                    }}
                                >
                                    {loading ? 'Analyzing...' : '🌾 Find Best Crops'}
                                </button>
                            </form>

                            {/* Error message */}
                            {error && (
                                <div
                                    className="mt-3 px-3 py-2 rounded-lg text-sm"
                                    style={{ backgroundColor: '#FDEAEA', color: THEME.colors.riskHigh }}
                                >
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Live soil health meter */}
                        <SoilHealthMeter
                            N={formData.N}
                            P={formData.P}
                            K={formData.K}
                            ph={formData.ph}
                        />
                    </div>

                    {/* ── Right: Results ────────────────────────────────── */}
                    <div className="lg:col-span-3">
                        {loading && <GrowingPlantLoader />}

                        {!loading && recommendations.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="font-bold text-base" style={{ color: THEME.colors.textPrimary }}>
                                        Top Crop Recommendations
                                    </h2>
                                    {timing && (
                                        <span className="text-[10px] font-mono" style={{ color: THEME.colors.textMuted }}>
                                            Analyzed in {timing.inference_ms}ms · Advisory in {timing.advisory_ms}ms
                                        </span>
                                    )}
                                </div>

                                {recommendations.slice(0, 3).map((rec, i) => (
                                    <RecommendationCard key={i} rec={rec} rank={i + 1} />
                                ))}
                            </div>
                        )}

                        {!loading && recommendations.length === 0 && !error && (
                            <div
                                className="rounded-xl p-8 text-center"
                                style={{ backgroundColor: THEME.colors.surface, border: `1px dashed ${THEME.colors.border}` }}
                            >
                                <span className="text-4xl block mb-3">🌱</span>
                                <p className="font-medium" style={{ color: THEME.colors.textSecondary }}>
                                    Enter your soil values and press "Find Best Crops" to get personalized recommendations.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
