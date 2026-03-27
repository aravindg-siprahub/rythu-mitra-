import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';
import api, { getCommunityStats } from '../../utils/apiService';

const CommunityStatCard = ({ emoji, value, suffix, label, decimals, index }) => {
    const { count, ref } = useCountUp(value, 2000, decimals);
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl p-5 text-center text-white"
            style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
            }}
        >
            <span className="text-3xl">{emoji}</span>
            <p className="text-3xl font-bold font-mono mt-2">{count}{suffix}</p>
            <p className="text-sm text-white/70 mt-1">{label}</p>
        </motion.div>
    );
};

export default function CommunitySection() {
    const [communityStats, setCommunityStats] = useState(null);
    const [states, setStates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. KPI Stats
                const kpiRes = await getCommunityStats().catch(() => ({ data: null }));
                if (kpiRes?.data) {
                    const d = kpiRes.data;
                    const farmers = Number(d.active_farmers || d.registered_farmers) || 0;
                    const districts = Number(d.active_districts || d.districts_covered) || 0;
                    const statesActive = Number(d.states_active || d.states_covered) || 0;

                    if (farmers > 0 || districts > 0 || statesActive > 0) {
                        setCommunityStats([
                            { emoji: '🌾', value: farmers >= 1e6 ? farmers / 1e6 : farmers, suffix: farmers >= 1e6 ? 'M' : '', label: 'Farmers Registered', decimals: farmers >= 1e6 ? 1 : 0 },
                            { emoji: '📍', value: districts, suffix: '', label: 'Districts Covered', decimals: 0 },
                            { emoji: '🏛️', value: statesActive, suffix: '', label: 'States Active', decimals: 0 },
                            { emoji: '📱', value: farmers >= 1e5 ? (farmers / 1e6).toFixed(1) : 0, suffix: 'M', label: 'App Downloads', decimals: 1 },
                        ]);
                    }
                }

                // 2. States
                const stateRes = await api.get('/farmers/by-state/').catch(() => ({ data: null }));
                if (stateRes?.data && Array.isArray(stateRes.data) && stateRes.data.length > 0) {
                    setStates(stateRes.data);
                }
            } catch (error) {
                // Hide silently on error
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return null;
    if (!communityStats && states.length === 0) return null;

    return (
        <section id="community" className="space-y-6">
            <div className="farm-section-header">
                <div className="section-icon">
                    <span className="text-base">👨‍🌾</span>
                </div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Our Farmer Community</h2>
            </div>

            {/* Hero Stats */}
            {communityStats && (
                <div className="relative overflow-hidden rounded-3xl p-8" style={{
                    background: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #16a34a 100%)',
                }}>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-20 w-40 h-40 rounded-full bg-white/30 blur-3xl" />
                    </div>
                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {communityStats.map((s, i) => (
                            <CommunityStatCard key={s.label} {...s} index={i} />
                        ))}
                    </div>
                </div>
            )}

            {states.length > 0 && (
                <div className="farm-card">
                    <h3 className="font-semibold text-foreground mb-4">Top States by Farmers</h3>
                    <div className="space-y-3">
                        {states.map((s, i) => {
                            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                            const name = s.state || s.name || s.state_name;
                            const count = s.count || s.farmers || s.total_farmers || 0;
                            const maxCount = states[0]?.count || states[0]?.farmers || states[0]?.total_farmers || 1;
                            const pct = Math.min(100, (count / maxCount) * 100);

                            return (
                                <div key={name || i} className="flex items-center gap-3">
                                    <span className="text-sm w-5 text-center">{medal}</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-foreground">{name}</span>
                                            <span className="font-mono text-muted-foreground">{count}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${pct}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: i * 0.15 }}
                                                className="h-full rounded-full"
                                                style={{ background: 'linear-gradient(90deg, #16a34a, #22c55e)' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}
