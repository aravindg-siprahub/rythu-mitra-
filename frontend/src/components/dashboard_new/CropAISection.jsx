import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Loader2, Download, Save } from 'lucide-react';
import { predictCrop, pollTaskResult } from '../../utils/apiService';

const topCrops = [
    { name: 'Rice', season: 'Kharif', yield: '5.2 t/acre', trend: '↑', emoji: '🌾' },
    { name: 'Wheat', season: 'Rabi', yield: '4.8 t/acre', trend: '↑', emoji: '🌾' },
    { name: 'Cotton', season: 'Kharif', yield: '3.1 t/acre', trend: '↓', emoji: '🏵️' },
    { name: 'Tomato', season: 'All', yield: '8.5 t/acre', trend: '↑', emoji: '🍅' },
    { name: 'Maize', season: 'Kharif', yield: '4.2 t/acre', trend: '↑', emoji: '🌽' },
    { name: 'Soybean', season: 'Kharif', yield: '2.8 t/acre', trend: '↓', emoji: '🫘' },
    { name: 'Sugarcane', season: 'Annual', yield: '35 t/acre', trend: '↑', emoji: '🎋' },
    { name: 'Onion', season: 'Rabi', yield: '10 t/acre', trend: '↑', emoji: '🧅' },
];

const presets = [
    { label: '🌾 Rice Profile', values: { n: 80, p: 40, k: 40, temp: 25, humidity: 80, ph: 6.5, rainfall: 200 } },
    { label: '🌿 Vegetable', values: { n: 60, p: 50, k: 50, temp: 28, humidity: 65, ph: 6.8, rainfall: 120 } },
    { label: '🌻 Oilseeds', values: { n: 40, p: 60, k: 30, temp: 30, humidity: 55, ph: 7.0, rainfall: 80 } },
];

const fields = [
    { key: 'n', label: 'Nitrogen (N) ppm', max: 140 },
    { key: 'p', label: 'Phosphorus (P) ppm', max: 145 },
    { key: 'k', label: 'Potassium (K) ppm', max: 205 },
    { key: 'temp', label: 'Temperature °C', max: 50 },
    { key: 'humidity', label: 'Humidity %', max: 100 },
    { key: 'ph', label: 'pH Level', max: 14 },
    { key: 'rainfall', label: 'Rainfall mm/year', max: 300 },
];

const riskColor = (risk) => {
    if (!risk) return '#6b7280';
    const r = risk.toLowerCase();
    if (r === 'low') return '#16a34a';
    if (r === 'medium') return '#d97706';
    return '#dc2626';
};

export default function CropAISection() {
    const [values, setValues] = useState({ n: 80, p: 40, k: 40, temp: 25, humidity: 80, ph: 6.5, rainfall: 200 });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const predict = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        const payload = {
            nitrogen: parseFloat(values.nitrogen || values.n),
            phosphorus: parseFloat(values.phosphorus || values.p),
            potassium: parseFloat(values.potassium || values.k),
            temperature: parseFloat(values.temperature || values.temp),
            humidity: parseFloat(values.humidity || values.hum),
            soil_ph: parseFloat(values.soil_ph || values.ph || values.soilPh),
            annual_rainfall: parseFloat(values.annual_rainfall || values.rainfall),
        };

        console.log('Sending payload:', payload);

        const hasInvalid = Object.entries(payload).some(
            ([k, v]) => isNaN(v) || v === null || v === undefined
        );
        if (hasInvalid) {
            setError('Please fill all fields with valid numbers');
            setLoading(false);
            return;
        }

        try {
            const res = await predictCrop(payload);
            console.log('Response:', res.data);

            if (res.data.status === 'completed' && res.data.result) {
                setResult(res.data.result);
            } else if (res.data.task_id) {
                const taskResult = await pollTaskResult(res.data.task_id);
                setResult(taskResult);
            } else {
                setError('No result from AI. Try again.');
            }
        } catch (err) {
            console.error('Error:', err.response?.data);
            setError(err.response?.data?.error || err.message || 'Prediction failed.');
        } finally {
            setLoading(false);
        }
    };

    const top = result?.top_crops?.[0];

    return (
        <section id="crop-ai" className="space-y-6">
            <div className="farm-section-header">
                <div className="section-icon">
                    <Leaf className="w-[18px] h-[18px] text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">AI Crop Recommendation Engine</h2>
                    <p className="text-sm text-muted-foreground">Enter your soil data — get instant AI crop suggestions</p>
                </div>
                <span className="farm-badge-gold ml-auto">99.3% Accuracy</span>
            </div>

            <div className="grid lg:grid-cols-11 gap-5">
                {/* Input */}
                <div className="lg:col-span-6 farm-card">
                    <div className="px-5 py-3 -mx-6 -mt-6 mb-6 rounded-t-[20px]" style={{
                        background: 'linear-gradient(135deg, #052e16, #16a34a)',
                    }}>
                        <h3 className="font-semibold text-sm text-white">🌱 Your Soil Profile</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {fields.map((f) => (
                            <div key={f.key}>
                                <label className="text-xs text-muted-foreground mb-1 block font-medium">{f.label}</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min={0}
                                        max={f.max}
                                        step={f.key === 'ph' ? 0.1 : 1}
                                        value={values[f.key]}
                                        onChange={(e) => setValues({ ...values, [f.key]: Number(e.target.value) })}
                                        className="flex-1 accent-primary h-1.5"
                                        style={{ accentColor: '#16a34a' }}
                                    />
                                    <span className="text-sm font-mono font-semibold text-foreground w-10 text-right">
                                        {values[f.key]}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={predict}
                        disabled={loading}
                        className="btn-shine w-full mt-5 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                        style={{ background: '#16a34a', width: '100%', fontSize: 15, fontWeight: 600, borderRadius: 8, padding: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🤖'}
                        {loading ? 'Analyzing with AI...' : 'Get AI Crop Recommendation →'}
                    </button>

                    <div className="flex gap-2 mt-3">
                        {presets.map((p) => (
                            <button
                                key={p.label}
                                onClick={() => setValues(p.values)}
                                className="flex-1 py-2 text-xs rounded-xl bg-secondary text-secondary-foreground hover:bg-primary/10 transition-colors font-medium"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Result panel */}
                <div className="lg:col-span-5 farm-card flex flex-col items-center justify-center text-center">
                    {!result && !loading && !error && (
                        <div className="empty-state">
                            <span className="empty-icon">🌱</span>
                            <p>Adjust soil sliders and click<br/>"Get AI Crop Recommendation"</p>
                        </div>
                    )}

                    {loading && (
                        <div className="animate-pulse-green w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    )}

                    {error && !loading && (
                        <div style={{
                            background: 'rgba(239,68,68,0.06)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderLeft: '3px solid #ef4444',
                            borderRadius: 12,
                            padding: '12px 16px',
                            textAlign: 'left',
                            width: '100%',
                        }}>
                            <p style={{ color: '#dc2626', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Prediction failed</p>
                            <p style={{ color: '#ef4444', fontSize: 11 }}>{error}</p>
                            <button
                                onClick={() => setError(null)}
                                style={{ marginTop: 8, fontSize: 11, color: '#9ca3af', cursor: 'pointer', background: 'none', border: 'none' }}
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {top && !loading && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
                            <p className="text-5xl mb-2">🌾</p>
                            <h3 className="text-3xl font-bold text-primary mb-1">{top.crop}</h3>

                            {/* Confidence gauge */}
                            <div className="relative w-24 h-24 mx-auto my-4">
                                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                                        strokeDasharray={251}
                                        strokeDashoffset={251 * (1 - (top.confidence_pct || 0) / 100)}
                                        strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="font-mono font-bold text-sm text-foreground">
                                        {typeof top.confidence_pct === 'number' ? top.confidence_pct.toFixed(1) : top.confidence_pct}%
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">AI Confidence Score</p>

                            {/* Risk badge */}
                            <div className="flex justify-center gap-2 flex-wrap mb-4">
                                <span style={{
                                    fontSize: 11, fontWeight: 600,
                                    padding: '2px 10px', borderRadius: 999,
                                    background: `${riskColor(top.risk_level)}18`,
                                    color: riskColor(top.risk_level),
                                    border: `1px solid ${riskColor(top.risk_level)}40`,
                                }}>
                                    {top.risk_level || 'N/A'} Risk
                                </span>
                            </div>

                            {/* Farmer advisory */}
                            {top.explanation?.farmer_advisory && (
                                <div className="rounded-xl p-3 text-left text-xs text-foreground mb-4"
                                    style={{ background: 'hsl(138 76% 97%)' }}>
                                    <p>💡 {top.explanation.farmer_advisory}</p>
                                </div>
                            )}

                            {/* All recommendations list */}
                            {result.length > 1 && (
                                <div className="mt-2 space-y-1 w-full text-left">
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">All Recommendations</p>
                                    {result.slice(1).map((r, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <span className="text-foreground font-medium">{r.crop}</span>
                                            <span className="text-muted-foreground font-mono">
                                                {typeof r.confidence_pct === 'number' ? r.confidence_pct.toFixed(1) : r.confidence_pct}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Download / Save buttons */}
                            <div className="flex gap-2 mt-2">
                                <button
                                    className="flex-1 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-1.5 font-medium"
                                    onClick={() => alert('Report download coming soon')}
                                >
                                    <Download className="w-3.5 h-3.5" /> Report
                                </button>
                                <button
                                    className="btn-shine flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 font-medium"
                                    onClick={() => alert('Save feature coming soon')}
                                >
                                    <Save className="w-3.5 h-3.5" /> Save
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Top Crops Carousel */}
            <p className="season-label">🌾 Rabi / Zaid crops for your region</p>
            <div className="overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
                    {topCrops.map((crop) => (
                        <div key={crop.name} className="farm-card-hover w-36 flex-shrink-0 text-center p-4">
                            <p className="text-3xl mb-1">{crop.emoji}</p>
                            <p className="font-semibold text-sm text-foreground">{crop.name}</p>
                            <span className="farm-badge text-sm mt-1">{crop.season}</span>
                            <p className="text-xs text-muted-foreground mt-1">{crop.yield}</p>
                            <p className={`text-xs font-mono font-semibold ${crop.trend === '↑' ? 'text-farm-success' : 'text-farm-danger'}`}>
                                {crop.trend} Price
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
