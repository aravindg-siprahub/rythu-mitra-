import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';
import { ThumbsUp, Share2, Bookmark } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../utils/apiService';

const ADVISORY_LABELS = {
    weather_advisory: 'Weather Alert',
    crop_recommendation: 'Crop Tip',
    market_price: 'Market Update',
    disease_alert: 'Disease Alert',
    government_scheme: 'Scheme',
};

const CATEGORY_COLORS = { 
    '🌾 Crop': '#16a34a', 'Crop': '#16a34a', 
    '🌧️ Weather': '#0ea5e9', 'Weather': '#0ea5e9', 
    '📈 Market': '#f59e0b', 'Market': '#f59e0b', 
    '🐛 Pest': '#ef4444', 'Pest': '#ef4444', 
    'Disease': '#ef4444' 
};

const StatValue = ({ value, suffix, label, decimals }) => {
    const { count, ref } = useCountUp(value, 2000, decimals);
    return (
        <div ref={ref} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="font-mono font-bold text-primary">{count}{suffix}</span>
        </div>
    );
};

const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-2.5 text-xs" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <span className="font-medium">{payload[0].name}: {payload[0].value}%</span>
        </div>
    );
};

export default function AdvisorySection() {
    const [advisories, setAdvisories] = useState([]);
    const [stats, setStats] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [advRes, statRes] = await Promise.all([
                    api.get('/ai/advisories/').catch(() => ({ data: null })),
                    api.get('/ai/advisories/stats/').catch(() => ({ data: null }))
                ]);

                const list = advRes?.data?.advisories || advRes?.data || [];
                if (Array.isArray(list) && list.length > 0) {
                    setAdvisories(list.map((a) => ({
                        category: a.category || '🌾 Crop',
                        borderColor: CATEGORY_COLORS[a.category] || CATEGORY_COLORS[a.category?.replace(/[^a-zA-Z]/g, '').trim()] || '#16a34a',
                        text: a.text || a.message,
                        location: a.location || 'India',
                        time: a.time || a.created_at || 'Recently',
                        confidence: a.confidence ?? 90,
                    })));
                }

                const sData = statRes?.data;
                if (sData) {
                    const mappedCats = (sData.categories || sData.pie_data || []).map(c => {
                        const name = c.name || c.category;
                        return {
                            name,
                            value: Number(c.value || c.percentage || c.count),
                            color: CATEGORY_COLORS[name] || CATEGORY_COLORS[name?.replace(/[^a-zA-Z]/g, '').trim()] || '#16a34a'
                        }
                    }).filter(c => c.value > 0);

                    if (sData.total || sData.satisfaction || mappedCats.length > 0) {
                        setStats({
                            total: sData.total || 0,
                            satisfaction: sData.satisfaction || 0,
                            languages: sData.languages || 0,
                            per_week: sData.per_week || sData.avg_per_week || 0,
                        });
                        setCategories(mappedCats);
                    }
                }
            } catch (error) {
                // handle error silently
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return null;
    if (advisories.length === 0 && !stats) return null;

    const showStats = stats && Object.keys(stats).length > 0;

    return (
        <section id="advisory" className="space-y-6">
            <div className="farm-section-header">
                <div className="section-icon">
                    <span className="text-base">💬</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">AI Farming Advisory Feed</h2>
                    <p className="text-sm text-muted-foreground">OpenRouter-Powered • Contextual Updates</p>
                </div>
            </div>

            <div className={showStats ? "grid lg:grid-cols-5 gap-5" : "grid lg:grid-cols-1 gap-5"}>
                {/* Advisory Cards */}
                {advisories.length > 0 && (
                    <div className={showStats ? "lg:col-span-3 space-y-4" : "space-y-4"}>
                        {advisories.map((a, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="farm-card"
                                style={{ borderLeft: `4px solid ${a.borderColor}` }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="farm-badge text-xs">{ADVISORY_LABELS[a.category] || a.category}</span>
                                    {a.confidence > 0 && (
                                        <span className="text-xs text-muted-foreground font-mono">{a.confidence}%</span>
                                    )}
                                </div>
                                <p className="text-sm text-foreground leading-relaxed">{a.text}</p>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <span className="text-xs text-muted-foreground">📍 {a.location} • {a.time}</span>
                                    <div className="flex gap-1">
                                        <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
                                            <ThumbsUp className="w-3.5 h-3.5 text-muted-foreground" />
                                        </button>
                                        <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
                                            <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                                        </button>
                                        <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
                                            <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {advisories.length >= 3 && (
                            <button className="w-full py-3 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors font-medium">
                                Load More Advisories ↓
                            </button>
                        )}
                    </div>
                )}

                {/* Stats */}
                {showStats && (
                    <div className="lg:col-span-2 space-y-4">
                        <div className="farm-card">
                            <h4 className="font-semibold text-foreground text-sm mb-3">Advisory Stats</h4>
                            <StatValue value={stats.total >= 1000000 ? stats.total / 1000000 : stats.total} 
                                      suffix={stats.total >= 1000000 ? "M" : stats.total >= 1000 ? "K" : ""} 
                                      label="📊 Total Advisories Sent" 
                                      decimals={stats.total >= 1000 ? 1 : 0} />
                            <StatValue value={stats.satisfaction} suffix="% 👍" label="😊 Farmer Satisfaction" decimals={1} />
                            <StatValue value={stats.languages} suffix=" languages" label="🌐 Languages Available" decimals={0} />
                            <StatValue value={stats.per_week} suffix="/week" label="📱 Avg per Farmer" decimals={1} />
                        </div>

                        {categories.length > 0 && (
                            <div className="farm-card">
                                <h4 className="font-semibold text-foreground text-sm mb-3">Advisory Categories</h4>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={categories} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                            {categories.map((entry) => (
                                                <Cell key={entry.name} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {categories.map((d) => (
                                        <div key={d.name} className="flex items-center gap-1.5 text-xs">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                                            <span className="text-muted-foreground">{d.name} {d.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
