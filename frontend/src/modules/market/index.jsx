import React, { useState } from 'react';
import SeasonBanner from '../../components/ui/SeasonBanner';
import CropIcon from '../../components/ui/CropIcon';
import { THEME } from '../../styles/theme';
import { useMarketData } from './hooks/useMarketData';
import {
    LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Area, AreaChart,
    ReferenceLine,
} from 'recharts';

// Custom tooltip for the chart
function PriceTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="px-3 py-2 rounded-lg text-xs shadow-md border"
            style={{ backgroundColor: '#fff', borderColor: THEME.colors.border }}
        >
            <p className="font-bold" style={{ color: THEME.colors.textPrimary }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: ₹{Number(p.value).toLocaleString('en-IN')}
                </p>
            ))}
        </div>
    );
}

export default function MarketModule() {
    const {
        loading, result, error,
        crop, setCrop,
        market, setMarket,
        days, setDays,
        fetchForecast,
        commodities,
    } = useMarketData();

    // Build chart data from API response
    const chartData = React.useMemo(() => {
        if (!result?.forecast) return [];
        return result.forecast.map((pt, i) => ({
            day: `Day ${i + 1}`,
            price: pt.predicted_price,
            lower: pt.lower_bound,
            upper: pt.upper_bound,
        }));
    }, [result]);

    const todayPrice = chartData[0]?.price || result?.current_price || 0;
    const day7Price = chartData.length >= 7 ? chartData[6]?.price : null;
    const day14Price = chartData.length >= 14 ? chartData[13]?.price : null;

    const trendPct = todayPrice && day7Price
        ? (((day7Price - todayPrice) / todayPrice) * 100).toFixed(1)
        : null;

    let trendMsg = '', trendColor = THEME.colors.textMuted;
    if (trendPct !== null) {
        if (parseFloat(trendPct) > 2) {
            trendMsg = `↑ Price Rising — Good time to wait before selling`;
            trendColor = THEME.colors.riskLow;
        } else if (parseFloat(trendPct) < -2) {
            trendMsg = `↓ Price Falling — Consider selling soon`;
            trendColor = THEME.colors.riskHigh;
        } else {
            trendMsg = `→ Price Stable — Normal market conditions`;
            trendColor = THEME.colors.riskMedium;
        }
    }

    return (
        <div style={{ backgroundColor: THEME.colors.background, minHeight: '100vh' }}>
            <SeasonBanner />

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-black" style={{ color: THEME.colors.textPrimary }}>
                        📈 Market Price Intelligence
                    </h1>
                    <p className="text-sm mt-1" style={{ color: THEME.colors.textSecondary }}>
                        Know the price before you sell
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* ── Controls ─────────────────────────────────────── */}
                    <div className="lg:col-span-2">
                        <div
                            className="rounded-xl p-5 shadow-sm"
                            style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                        >
                            <h2 className="font-bold text-sm mb-4" style={{ color: THEME.colors.textPrimary }}>
                                Forecast Parameters
                            </h2>

                            {/* Crop dropdown */}
                            <div className="mb-4">
                                <label className="text-xs font-semibold block mb-1" style={{ color: THEME.colors.textSecondary }}>
                                    Commodity
                                </label>
                                <select
                                    value={crop}
                                    onChange={(e) => setCrop(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                                    style={{ borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}
                                >
                                    {commodities.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Market name */}
                            <div className="mb-4">
                                <label className="text-xs font-semibold block mb-1" style={{ color: THEME.colors.textSecondary }}>
                                    Market / Mandi
                                </label>
                                <input
                                    type="text"
                                    value={market}
                                    onChange={(e) => setMarket(e.target.value)}
                                    placeholder="e.g. Warangal, Karimnagar"
                                    className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                                    style={{ borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}
                                />
                            </div>

                            {/* Days toggle */}
                            <div className="mb-5">
                                <label className="text-xs font-semibold block mb-2" style={{ color: THEME.colors.textSecondary }}>
                                    Forecast Period
                                </label>
                                <div className="flex gap-2">
                                    {[7, 14].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setDays(d)}
                                            className="flex-1 py-2 rounded-lg text-sm font-bold border transition-colors"
                                            style={{
                                                backgroundColor: days === d ? THEME.colors.primary : THEME.colors.surface,
                                                color: days === d ? '#fff' : THEME.colors.textSecondary,
                                                borderColor: days === d ? THEME.colors.primary : THEME.colors.border,
                                            }}
                                        >
                                            {d} Days
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={fetchForecast}
                                disabled={loading}
                                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-opacity"
                                style={{
                                    backgroundColor: loading ? THEME.colors.primaryLight : THEME.colors.primary,
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading ? 'Fetching prices...' : '📊 Get Forecast'}
                            </button>

                            {error && (
                                <div
                                    className="mt-3 px-3 py-2 rounded-lg text-sm"
                                    style={{ backgroundColor: '#FDEAEA', color: THEME.colors.riskHigh }}
                                >
                                    {error}
                                </div>
                            )}

                            {/* Trend indicator */}
                            {trendMsg && (
                                <div
                                    className="mt-4 px-3 py-3 rounded-lg text-sm font-semibold"
                                    style={{ backgroundColor: `${trendColor}18`, color: trendColor }}
                                >
                                    {trendMsg}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Chart & Summary ──────────────────────────────── */}
                    <div className="lg:col-span-3 space-y-4">

                        {/* Price summary cards */}
                        {todayPrice > 0 && (
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Today', price: todayPrice, pct: null },
                                    { label: `Day 7`, price: day7Price, pct: trendPct },
                                    { label: `Day 14`, price: day14Price, pct: null },
                                ].map(({ label, price, pct }) => price && (
                                    <div
                                        key={label}
                                        className="rounded-xl p-4 text-center shadow-sm"
                                        style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                                    >
                                        <p className="text-xs font-semibold mb-1" style={{ color: THEME.colors.textMuted }}>{label}</p>
                                        <p className="text-xl font-black" style={{ color: THEME.colors.textPrimary }}>
                                            ₹{Number(price).toLocaleString('en-IN')}
                                        </p>
                                        {pct && (
                                            <p className="text-xs font-bold mt-1" style={{ color: parseFloat(pct) >= 0 ? THEME.colors.riskLow : THEME.colors.riskHigh }}>
                                                {parseFloat(pct) >= 0 ? '+' : ''}{pct}%
                                            </p>
                                        )}
                                        <p className="text-[9px] mt-0.5" style={{ color: THEME.colors.textMuted }}>₹/quintal</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Recharts forecast chart */}
                        {chartData.length > 0 && (
                            <div
                                className="rounded-xl p-4 shadow-sm"
                                style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                            >
                                <h3 className="font-bold text-sm mb-3" style={{ color: THEME.colors.textPrimary }}>
                                    Price Forecast — {crop} · {market}
                                </h3>
                                <div style={{ height: 280 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={THEME.colors.primaryLight} stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor={THEME.colors.primaryLight} stopOpacity={0.05} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.colors.border} vertical={false} />
                                            <XAxis dataKey="day" fontSize={10} stroke={THEME.colors.textMuted} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={10} stroke={THEME.colors.textMuted} tickLine={false} axisLine={false}
                                                tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`} />
                                            <Tooltip content={<PriceTooltip />} />

                                            {/* Confidence band — upper bound */}
                                            <Area type="monotone" dataKey="upper" stroke="none"
                                                fill="url(#bandGrad)" name="Upper bound" />
                                            {/* Main predicted price line */}
                                            <Line type="monotone" dataKey="price" stroke={THEME.colors.primary}
                                                strokeWidth={3} dot={{ r: 3, fill: THEME.colors.primary }} name="Forecast price" />
                                            {/* Lower bound line */}
                                            <Line type="monotone" dataKey="lower" stroke={THEME.colors.primaryLight}
                                                strokeWidth={1} strokeDasharray="4 4" dot={false} name="Lower bound" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && chartData.length === 0 && !error && (
                            <div
                                className="rounded-xl p-8 text-center"
                                style={{ backgroundColor: THEME.colors.surface, border: `1px dashed ${THEME.colors.border}` }}
                            >
                                <span className="text-4xl block mb-3">📈</span>
                                <p className="font-medium" style={{ color: THEME.colors.textSecondary }}>
                                    Select a commodity, enter your market, and click "Get Forecast" to see price predictions.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
