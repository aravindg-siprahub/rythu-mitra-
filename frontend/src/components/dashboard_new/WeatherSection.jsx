import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Droplets, Thermometer } from 'lucide-react';
import { getWeatherForecast } from '../../utils/apiService';

const DISTRICTS = ['Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Nalgonda', 'Hyderabad', 'Adilabad'];

const shimmerStyle = {
    background: 'linear-gradient(90deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0.08) 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 8,
};

const weatherIcon = (rainfall) => {
    if (!rainfall && rainfall !== 0) return '⛅';
    if (rainfall > 50) return '🌧️';
    if (rainfall > 20) return '🌦️';
    if (rainfall > 5) return '🌤️';
    return '☀️';
};

const riskColor = (level) => {
    if (!level) return 'rgba(255,255,255,0.6)';
    const l = level.toLowerCase();
    if (l === 'low') return '#4ade80';
    if (l === 'medium') return '#fbbf24';
    return '#f87171';
};

const getAdvisory = (risk) => {
    if (!risk) return { text: 'Good farming conditions this week.', icon: '🌱', color: '#16a34a' };
    if (risk.flood_risk === 'High') return { text: 'High flood risk — delay sowing, check drainage.', icon: '⚠️', color: '#dc2626' };
    if (risk.drought_risk === 'High') return { text: 'High drought risk — plan irrigation now.', icon: '💧', color: '#d97706' };
    if (risk.heat_risk === 'High') return { text: 'High heat — water crops early morning and evening.', icon: '🌡️', color: '#d97706' };
    return { text: 'Moderate conditions. Regular monitoring advised.', icon: '🌿', color: '#16a34a' };
};

export default function WeatherSection() {
    const [district, setDistrict] = useState('Warangal');
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => { fetchWeather(district); }, [district]);

    const fetchWeather = async (dist) => {
        setLoading(true); setError(null); setWeather(null);
        let timedOut = false;
        const tid = setTimeout(() => {
            timedOut = true;
            setLoading(false);
            setError('Timed out. Please retry.');
        }, 10000);

        try {
            const res = await getWeatherForecast(dist);
            if (!timedOut) { 
                clearTimeout(tid); 
                // Handle new wrapped response format or direct response
                const weatherData = res.data.result || res.data;
                setWeather(weatherData); 
            }
        } catch (err) {
            if (!timedOut) {
                clearTimeout(tid);
                setError(err.response?.data?.error || 'Could not load weather data.');
            }
        } finally {
            if (!timedOut) setLoading(false);
        }
    };

    if (!loading && error && !weather) {
        return (
            <section id="weather" className="space-y-6">
                <div className="farm-section-header">
                    <div className="section-icon" style={{ background: 'hsl(199 92% 95%)', borderColor: 'hsl(199 89% 85%)' }}>
                        <Cloud className="w-[18px] h-[18px] text-farm-sky" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground tracking-tight">Smart Weather Intelligence</h2>
                        <p className="text-sm text-muted-foreground">AI-Powered • ML Forecast • Telangana Districts</p>
                    </div>
                </div>
                <div className="farm-card text-center py-10">
                    <p className="text-4xl mb-3">🌤️</p>
                    <p className="text-sm font-medium text-foreground mb-1">Weather data unavailable</p>
                    <p className="text-xs text-muted-foreground mb-4">{error}</p>
                    <button
                        onClick={() => fetchWeather(district)}
                        style={{
                            background: '#16a34a', color: 'white', border: 'none',
                            borderRadius: 8, padding: '8px 20px', fontSize: 13,
                            fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        ↻ Retry
                    </button>
                </div>
            </section>
        );
    }

    const adv = weather ? getAdvisory(weather.risk) : null;

    return (
        <section id="weather" className="space-y-6">
            <style>{`@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }`}</style>
            <div className="farm-section-header">
                <div className="section-icon" style={{ background: 'hsl(199 92% 95%)', borderColor: 'hsl(199 89% 85%)' }}>
                    <Cloud className="w-[18px] h-[18px] text-farm-sky" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Smart Weather Intelligence</h2>
                    <p className="text-sm text-muted-foreground">AI-Powered • ML Forecast • Telangana Districts</p>
                </div>
            </div>

            {/* District selector */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {DISTRICTS.map((d) => (
                    <button
                        key={d}
                        onClick={() => setDistrict(d)}
                        style={{
                            padding: '6px 14px', borderRadius: 999, fontSize: 12,
                            border: '1px solid',
                            borderColor: district === d ? '#16a34a' : '#e5e7eb',
                            background: district === d ? '#16a34a' : 'white',
                            color: district === d ? 'white' : '#374151',
                            fontWeight: district === d ? 600 : 400,
                            cursor: 'pointer', transition: 'all 0.2s ease',
                        }}
                    >
                        {d}
                    </button>
                ))}
            </div>

            {/* Weather hero card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white"
                style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #16a34a 100%)', minHeight: 180 }}
            >
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-60 h-60 rounded-full blur-3xl" style={{ background: 'rgba(255,255,255,0.08)' }} />
                </div>

                {/* Skeleton while loading */}
                {loading && (
                    <div className="relative z-10">
                        <div style={{ ...shimmerStyle, width: 140, height: 64, marginBottom: 12 }} />
                        <div style={{ ...shimmerStyle, width: 200, height: 18, marginBottom: 8 }} />
                        <div style={{ ...shimmerStyle, width: 140, height: 14 }} />
                    </div>
                )}

                {/* Real weather data */}
                {weather && !loading && (
                    <div className="relative z-10 grid md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-start gap-4">
                                <div>
                                    <p className="text-6xl md:text-7xl font-bold font-mono leading-none">
                                        {weather.forecast?.temperature_c != null ? `${weather.forecast.temperature_c}°` : '--°'}
                                    </p>
                                    <p className="text-lg font-medium mt-2">
                                        {weatherIcon(weather.forecast?.rainfall_mm)} {dist(weather)}
                                    </p>
                                    <p className="text-sm text-white/70 mt-1">📍 {weather.district || district}, Telangana</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4 flex-wrap">
                                {[
                                    { icon: Droplets, label: 'Rainfall', value: `${weather.forecast?.rainfall_mm ?? '--'}mm` },
                                    { icon: Thermometer, label: 'Risk', value: weather.risk_level || weather.risk?.overall_risk || 'N/A' },
                                ].map((s) => (
                                    <div key={s.label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <s.icon className="w-4 h-4 text-white/70" />
                                        <span className="text-white/70">{s.label}:</span>
                                        <span className="font-semibold">{s.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Risk breakdown */}
                        {weather.risk && (
                            <div className="space-y-3">
                                {[
                                    { label: 'Flood Risk', key: 'flood_risk' },
                                    { label: 'Drought Risk', key: 'drought_risk' },
                                    { label: 'Heat Risk', key: 'heat_risk' },
                                ].map(({ label, key }) => (
                                    <div key={key}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white/80">{label}</span>
                                            <span style={{ color: riskColor(weather.risk[key]), fontWeight: 600 }}>
                                                {weather.risk[key] || 'N/A'}
                                            </span>
                                        </div>
                                        <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                                            <div style={{
                                                width: weather.risk[key] === 'High' ? '85%' : weather.risk[key] === 'Medium' ? '50%' : '15%',
                                                height: '100%',
                                                background: riskColor(weather.risk[key]),
                                                borderRadius: 2,
                                                transition: 'width 0.8s ease',
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Agricultural advisory */}
            {adv && !loading && (
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="farm-card md:col-span-3" style={{ borderLeft: `4px solid ${adv.color}` }}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{adv.icon}</span>
                            <h4 className="font-semibold text-foreground text-sm">AI Agricultural Advisory — {weather?.district || district}</h4>
                        </div>
                        <p className="text-sm text-foreground">{adv.text}</p>
                        <p className="text-xs text-muted-foreground mt-2">Based on ML weather model forecast</p>
                    </div>
                </div>
            )}
        </section>
    );
}

function dist(weather) {
    if (!weather?.forecast?.temperature_c) return 'Loading...';
    const temp = weather.forecast.temperature_c;
    if (temp > 35) return 'Hot & Sunny';
    if (temp > 30) return 'Partly Cloudy';
    if (temp > 25) return 'Mild & Pleasant';
    return 'Cool';
}
