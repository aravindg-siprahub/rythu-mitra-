import React, { useState } from 'react';
import SeasonBanner from '../../components/ui/SeasonBanner';
import { THEME } from '../../styles/theme';
import { useMarketData } from './hooks/useMarketData';
import {
    LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Area, AreaChart,
    ReferenceLine,
} from 'recharts';

// Government of India MSP 2024-25 (₹/quintal)
// Source: Cabinet Committee on Economic Affairs, June 2024
const MSP_2024_25 = {
  'Rice':       2300,
  'Wheat':      2275,
  'Maize':      2090,
  'Groundnut':  6783,
  'Soybean':    4892,
  'Cotton':     7121,
  'Sugarcane':   340,
  'Turmeric':   7000,
  'Jowar':      3371,
  'Bajra':      2625,
  'Ragi':       4290,
  'Tur':        7550,
  'Moong':      8682,
  'Urad':       7400,
};

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
        loading, result, error, marketError, setMarketError, loadingMsg,
        crop, setCrop,
        market, setMarket,
        days, setDays,
        fetchForecast,
        commodities,
    } = useMarketData();

    const [quintals, setQuintals] = useState('');

    // Build chart data from API response
    const chartData = React.useMemo(() => {
        const forecast = result?.day_forecast || result?.forecast || [];
        return forecast.map((pt, i) => ({
            day: pt.day ?? `Day ${i + 1}`,
            price: pt.price ?? pt.predicted_price ?? 0,
            lower: pt.lower ?? pt.lower_bound ?? 0,
            upper: pt.upper ?? pt.upper_bound ?? 0,
            range: [pt.lower ?? pt.lower_bound ?? 0, pt.upper ?? pt.upper_bound ?? 0]
        }));
    }, [result]);

    const chartPrices = chartData.map(d => d.price);
    const allPrices = [
        ...chartPrices,
        ...chartData.map(d => d.upper),
        ...chartData.map(d => d.lower)
    ];
    const minP = allPrices.length ? Math.min(...allPrices) : 0;
    const maxP = allPrices.length ? Math.max(...allPrices) : 0;
    const pad = (maxP - minP) * 0.4 || 100;
    const yMin = Math.floor((minP - pad) / 50) * 50;
    const yMax = Math.ceil((maxP + pad) / 50) * 50;

    const todayPrice = chartData[0]?.price || result?.current_price_per_quintal || result?.current_price || result?.today_price || 0;
    const day7Price = chartData.length >= 7 ? chartData[6]?.price : (result?.predicted_price_7_days || result?.day_forecast?.[6]?.price || null);
    const day14Price = chartData.length >= 14 ? chartData[13]?.price : (result?.predicted_price_14_days || null);

    const trendPct = todayPrice && day7Price
        ? (((day7Price - todayPrice) / todayPrice) * 100).toFixed(1)
        : null;

    const TREND_CONFIG = {
        'Rising':  { 
            text: 'Price Rising — Good time to wait before selling',
            color: 'var(--color-text-success)' 
        },
        'Falling': { 
            text: 'Price Falling — Consider selling soon',
            color: 'var(--color-text-danger)' 
        },
        'Stable':  { 
            text: 'Price Stable — Normal market conditions',
            color: 'var(--color-text-warning)' 
        },
        'rising':  { text: 'Price Rising', color: 'var(--color-text-success)' },
        'falling': { text: 'Price Falling', color: 'var(--color-text-danger)' },
        'stable':  { text: 'Price Stable', color: 'var(--color-text-warning)' },
    };

    let trendMsg = '', trendColor = THEME.colors.textMuted;
    if (result) {
        const trend = result.price_trend || 'Stable';
        const config = TREND_CONFIG[trend] || TREND_CONFIG['Stable'] || TREND_CONFIG['stable'];
        const icon = (trend.toLowerCase() === 'rising' || trend.toLowerCase() === 'up') ? '↑' : (trend.toLowerCase() === 'falling' || trend.toLowerCase() === 'down') ? '↓' : '→';
        trendMsg = `${icon} ${config.text}`;
        trendColor = config.color;
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
                                {loading ? loadingMsg : '📊 Get Forecast'}
                            </button>

                            {marketError && (
                                <div style={{
                                    background: '#fef2f2', border: '0.5px solid #fca5a5',
                                    borderRadius: 8, padding: '10px 14px', marginTop: 8,
                                    display: 'flex', gap: 8, alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: 14 }}>⚠️</span>
                                    <div>
                                        <div style={{ fontSize: 13, color: '#b91c1c', fontWeight: 500 }}>
                                            {marketError}
                                        </div>
                                        <div
                                            onClick={() => { setMarketError(null); fetchForecast(); }}
                                            style={{
                                                fontSize: 12, color: '#1d4ed8', marginTop: 3,
                                                cursor: 'pointer', textDecoration: 'underline'
                                            }}
                                        >
                                            Tap to retry →
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Trend indicator */}
                            {trendMsg && (
                                <div
                                    className="mt-4 px-3 py-3 rounded-lg text-sm font-semibold border"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.05)', color: trendColor }}
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
                                ].map(({ label, price, pct }) => price ? (
                                    <div
                                        key={label}
                                        className="rounded-xl p-4 text-center shadow-sm"
                                        style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                                    >
                                        <p className="text-xs font-semibold mb-1" style={{ color: THEME.colors.textMuted }}>{label}</p>
                                        <p className="text-xl font-black" style={{ color: THEME.colors.textPrimary }}>
                                            ₹{Number(price).toLocaleString('en-IN')}
                                        </p>
                                        
                                        {label === 'Today' && result?.generated_at && (
                                          <div style={{
                                            fontSize: 11,
                                            color: THEME.colors.textMuted,
                                            marginTop: 3
                                          }}>
                                            AI estimate · {result.generated_at}
                                          </div>
                                        )}
                                        {label === 'Today' && result?.is_fallback && (
                                          <div style={{
                                            fontSize: 11, color: '#92400e',
                                            background: '#fffbeb', borderRadius: 4,
                                            padding: '2px 6px', marginTop: 4, display: 'inline-block'
                                          }}>
                                            ⚠️ Using default prices
                                          </div>
                                        )}
                                        
                                        {pct && (
                                            <p className="text-xs font-bold mt-1" style={{ color: parseFloat(pct) >= 0 ? THEME.colors.riskLow : THEME.colors.riskHigh }}>
                                                {parseFloat(pct) >= 0 ? '+' : ''}{pct}%
                                            </p>
                                        )}
                                        <p className="text-sm mt-0.5" style={{ color: THEME.colors.textMuted }}>₹/quintal</p>
                                    </div>
                                ) : <div key={label}></div>)}
                            </div>
                        )}

                        {result && todayPrice > 0 && (
                          <div style={{
                            background: 'rgba(0,0,0,0.02)',
                            border: `0.5px solid ${THEME.colors.border}`,
                            borderRadius: 12, padding: '12px 14px', marginBottom: 12
                          }}>
                            <div style={{
                              fontSize: 11, fontWeight: 600, color: THEME.colors.textSecondary,
                              letterSpacing: '0.04em', marginBottom: 10
                            }}>
                              REVENUE CALCULATOR
                            </div>
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              background: THEME.colors.surface,
                              border: `0.5px solid ${THEME.colors.border}`,
                              borderRadius: 8, padding: '7px 10px', marginBottom: 10,
                              width: 'fit-content'
                            }}>
                              <span style={{ fontSize: 13, color: THEME.colors.textSecondary,
                                whiteSpace: 'nowrap' }}>
                                I have:
                              </span>
                              <input
                                type="number"
                                min="1"
                                max="10000"
                                step="1"
                                placeholder="e.g. 10"
                                value={quintals}
                                onChange={(e) => setQuintals(e.target.value)}
                                style={{
                                  width: '60px', border: 'none', outline: 'none', fontSize: 13,
                                  background: 'transparent', color: THEME.colors.textPrimary,
                                  fontWeight: 600, textAlign: 'center'
                                }}
                              />
                              <span style={{ fontSize: 13, color: THEME.colors.textSecondary }}>
                                quintals
                              </span>
                            </div>

                            {quintals && !isNaN(quintals) && parseFloat(quintals) > 0 && (() => {
                              const q = parseFloat(quintals);
                              const todayRev = Math.round(q * todayPrice);
                              const d7Price = day7Price || todayPrice;
                              const day7Rev = Math.round(q * d7Price);
                              const diff = day7Rev - todayRev;
                              
                              return (
                                <div>
                                  <div style={{
                                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                                    gap: 8, marginBottom: 8
                                  }}>
                                    {[
                                      { label: 'Sell today', revenue: todayRev,
                                        price: todayPrice },
                                      { label: 'Sell on Day 7', revenue: day7Rev, price: d7Price },
                                    ].map((opt) => (
                                      <div key={opt.label} style={{
                                        background: THEME.colors.surface,
                                        border: `0.5px solid ${THEME.colors.border}`,
                                        borderRadius: 8, padding: '8px 10px'
                                      }}>
                                        <div style={{ fontSize: 11,
                                          color: THEME.colors.textSecondary, marginBottom: 2 }}>
                                          {opt.label}
                                        </div>
                                        <div style={{ fontSize: 15, fontWeight: 600,
                                          color: THEME.colors.textPrimary }}>
                                          ₹{opt.revenue.toLocaleString('en-IN')}
                                        </div>
                                        <div style={{ fontSize: 11,
                                          color: THEME.colors.textMuted }}>
                                          @ ₹{opt.price.toLocaleString('en-IN')}/qtl
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div style={{
                                    fontSize: 12, color: diff > 0 ? '#166534' : '#92400e',
                                    background: diff > 0 ? '#f0fdf4' : '#fffbeb',
                                    borderRadius: 8, padding: '7px 10px', lineHeight: 1.5
                                  }}>
                                    {diff > 0
                                      ? `💰 Waiting until Day 7 earns ₹${Math.abs(diff).toLocaleString('en-IN')} more`
                                      : diff < 0
                                      ? `⚡ Selling today saves ₹${Math.abs(diff).toLocaleString('en-IN')} vs waiting`
                                      : `Prices stable — sell when convenient`
                                    }
                                  </div>
                                </div>
                              );
                            })()}
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
                                <div style={{ minHeight: 320, width: '100%' }}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={THEME.colors.primaryLight} stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor={THEME.colors.primaryLight} stopOpacity={0.05} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.colors.border} vertical={false} />
                                            <XAxis dataKey="day" fontSize={10} stroke={THEME.colors.textMuted} tickLine={false} axisLine={false} />
                                            <YAxis 
                                                domain={[yMin, yMax]}
                                                tickFormatter={(v) => `₹${(v/1000).toFixed(1)}k`}
                                                tick={{ fontSize: 11, fill: '#64748b' }}
                                                width={52}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip content={<PriceTooltip />} />

                                            {/* Confidence band shading */}
                                            <Area type="monotone" dataKey="range" stroke="none" fill="rgba(22, 101, 52, 0.1)" />
                                            {/* Upper bound dashed line */}
                                            <Line type="monotone" dataKey="upper" stroke="rgba(22, 101, 52, 0.5)" strokeWidth={1} strokeDasharray="4 4" dot={false} activeDot={false} name="Upper bound" />
                                            {/* Lower bound dashed line */}
                                            <Line type="monotone" dataKey="lower" stroke="rgba(22, 101, 52, 0.5)" strokeWidth={1} strokeDasharray="4 4" dot={false} activeDot={false} name="Lower bound" />
                                            {/* Main predicted price line */}
                                            <Line type="monotone" dataKey="price" stroke={THEME.colors.primary} strokeWidth={2} dot={{ r: 3, fill: THEME.colors.primary }} name="Forecast price" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                    
                                    <div className="text-center mt-2 text-xs text-gray-500 mb-1">
                                        ── Predicted price &nbsp;&nbsp;&nbsp; ╌ ╌ Confidence range
                                    </div>
                                    <div style={{
                                      fontSize: 11, color: THEME.colors.textMuted,
                                      textAlign: 'center', marginTop: 6, fontStyle: 'italic'
                                    }}>
                                      AI-generated price estimates · Not sourced from live AGMARKNET data ·
                                      Verify at your local mandi before selling
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MSP Comparison Alert */}
                        {(() => {
                          const msp = MSP_2024_25[crop];
                          if (!msp || !todayPrice || !result) return null;
                          const forecastPrice = todayPrice;
                          const diff = forecastPrice - msp;
                          const diffPct = ((diff / msp) * 100).toFixed(1);
                          const aboveMSP = diff >= 0;

                          return (
                            <div style={{
                              background: aboveMSP ? '#f0fdf4' : '#fef2f2',
                              border: `1px solid ${aboveMSP ? '#86efac' : '#fca5a5'}`,
                              borderRadius: 12, margin: '0 0 12px', padding: '12px 14px'
                            }}>
                              <div style={{
                                fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
                                color: aboveMSP ? '#166534' : '#b91c1c', marginBottom: 6
                              }}>
                                {aboveMSP ? '✅ ABOVE MSP — GOOD TIME TO SELL' : '⚠️ BELOW MSP — CONSIDER GOVERNMENT PROCUREMENT'}
                              </div>
                              <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', marginBottom: 6
                              }}>
                                <div>
                                  <div style={{ fontSize: 12, color: THEME.colors.textSecondary }}>
                                    MSP 2024-25 for {crop}
                                  </div>
                                  <div style={{ fontSize: 16, fontWeight: 500,
                                    color: THEME.colors.textPrimary }}>
                                    ₹{msp.toLocaleString('en-IN')}/qtl
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: 12, color: THEME.colors.textSecondary }}>
                                    Forecast vs MSP
                                  </div>
                                  <div style={{
                                    fontSize: 16, fontWeight: 600,
                                    color: aboveMSP ? '#166534' : '#b91c1c'
                                  }}>
                                    {aboveMSP ? '+' : ''}{diffPct}%
                                  </div>
                                </div>
                              </div>
                              <div style={{
                                fontSize: 12, color: aboveMSP ? '#166534' : '#7f1d1d',
                                lineHeight: 1.55
                              }}>
                                {aboveMSP
                                  ? `Market price is ₹${Math.abs(diff).toLocaleString('en-IN')} above MSP. Selling in open market is recommended.`
                                  : `Market price is ₹${Math.abs(diff).toLocaleString('en-IN')} below MSP. Contact your nearest government procurement center (PACS/FCI) to sell at guaranteed MSP rate.`
                                }
                              </div>
                            </div>
                          );
                        })()}

                        {/* AI Market Insight */}
                        {(result?.explanation?.market_insight || result?.strategy_summary) && (
                            <div className="rounded-xl p-5 shadow-sm border border-blue-100 bg-blue-50">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
                                    💡 Market Insight & Strategy
                                </h3>
                                <p className="text-sm text-blue-900 leading-relaxed mb-3">
                                    {result.explanation?.market_insight || result.strategy_summary}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    {(result.best_selling_time || result.best_time_to_sell) && (
                                        <div className="bg-white p-3 rounded-lg border border-blue-200">
                                            <p className="text-sm font-bold text-blue-600 uppercase">Best Time to Sell</p>
                                            <p className="text-sm font-bold text-blue-900">{result.best_selling_time || result.best_time_to_sell}</p>
                                        </div>
                                    )}
                                    {(result.best_mandi || result.recommended_mandi) && (
                                        <div className="bg-white p-3 rounded-lg border border-blue-200">
                                            <p className="text-sm font-bold text-blue-600 uppercase">Recommended Mandi</p>
                                            <p className="text-sm font-bold text-blue-900">{result.best_mandi || result.recommended_mandi}</p>
                                        </div>
                                    )}
                                </div>
                                
                                {(result.explanation?.farmer_advisory || result.what_to_do) && (
                                    <div style={{ marginTop: '12px' }}>
                                        <h4 className="text-sm uppercase font-bold text-gray-500 mb-1">What to do</h4>
                                        <p className="text-sm font-medium" style={{ color: '#166534' }}>
                                            {result.explanation?.farmer_advisory || result.what_to_do}
                                        </p>
                                    </div>
                                )}
                                
                                {result?.storage_advice && (
                                  <div style={{
                                    background: 'rgba(0,0,0,0.03)',
                                    borderRadius: 8, padding: '8px 12px', marginTop: 8,
                                    fontSize: 12, color: THEME.colors.textSecondary, lineHeight: 1.55
                                  }}>
                                    🏪 <span style={{ fontWeight: 500, color: THEME.colors.textPrimary }}>
                                      Storage: </span>{result.storage_advice}
                                  </div>
                                )}
                                
                                {result?.nearby_mandis?.length > 0 && (
                                  <div style={{ marginTop: 10 }}>
                                    <div style={{
                                      fontSize: 11, fontWeight: 600, color: THEME.colors.textSecondary,
                                      letterSpacing: '0.04em', marginBottom: 6
                                    }}>
                                      NEARBY MANDIS
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                      {result.nearby_mandis.map((m) => (
                                        <div key={m.name} style={{
                                          background: 'rgba(0,0,0,0.03)',
                                          border: `0.5px solid ${THEME.colors.border}`,
                                          borderRadius: 8, padding: '6px 10px', fontSize: 12
                                        }}>
                                          <div style={{ fontWeight: 500,
                                            color: THEME.colors.textPrimary }}>{m.name}</div>
                                          <div style={{ color: THEME.colors.textMuted }}>
                                            ~{m.distance_km}km · {m.known_for}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                        )}

                        {/* Market Risks */}
                        {result?.risk_factors && result.risk_factors.length > 0 && (
                            <div className="rounded-xl p-5 shadow-sm border border-orange-100 bg-orange-50">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-700 mb-2">
                                    ⚠️ Market Risk Factors
                                </h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {result.risk_factors.map((risk, idx) => (
                                        <li key={idx} className="text-sm text-orange-900">{risk}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Empty state — only before first result */}
                        {!loading && !result && !error && !marketError && (
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
