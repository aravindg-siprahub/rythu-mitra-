import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';
import { getWorkers, getTransport } from '../../utils/apiService';

const vehicleEmoji = (type) => {
    if (!type) return '🚛';
    const t = String(type).toLowerCase();
    if (t.includes('tractor')) return '🚜';
    if (t.includes('truck') || t.includes('lorry')) return '🚛';
    if (t.includes('mini') || t.includes('pickup')) return '🚐';
    return '🚛';
};

export default function ServicesSection() {
    const [workers, setWorkers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getWorkers().then((r) => (Array.isArray(r.data) ? r.data : r.data?.results || r.data?.workers || [])).catch(() => []),
            getTransport().then((r) => (Array.isArray(r.data) ? r.data : r.data?.results || r.data?.vehicles || [])).catch(() => []),
        ]).then(([w, v]) => {
            setWorkers(w.map((x) => ({
                name: x.name || 'Worker',
                rating: 4.5,
                reviews: 12,
                skills: [x.skill || 'General'].concat(x.skills || []).slice(0, 2),
                rate: x.rate || 450,
                available: x.available !== false,
            })));
            setVehicles(v.map((x) => ({
                type: x.vehicle_type || 'Vehicle',
                capacity: `${x.capacity || 5} tons`,
                rate: `₹${x.rate_per_km || 18}/km`,
                rating: 4.5,
                distance: `${(x.distance || 3).toFixed(1)} km`,
                gps: true,
            })));
        }).finally(() => setLoading(false));
    }, []);
    return (
        <section id="services" className="space-y-6">
            <div className="farm-section-header">
                <div className="section-icon-gold">
                    <span className="text-base">👷</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Agricultural Workforce & Transport</h2>
                    <p className="text-sm text-muted-foreground">Instant Booking • Verified Providers</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                {/* Workers */}
                <div className="farm-card">
                    <div className="px-5 py-3 -mx-6 -mt-6 mb-6 rounded-t-[20px]" style={{
                        background: 'linear-gradient(135deg, #052e16, #16a34a)',
                    }}>
                        <h3 className="font-semibold text-sm text-white">👷 Book Farm Workers</h3>
                        <p className="text-xs text-white/70">Skilled agricultural workforce on demand</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="text-xs text-muted-foreground font-medium">Work Type</label>
                            <select className="farm-input text-sm mt-1">
                                <option>Harvesting</option>
                                <option>Planting</option>
                                <option>Spraying</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground font-medium">Workers Needed</label>
                            <input type="number" defaultValue={3} min={1} className="farm-input text-sm mt-1" />
                        </div>
                    </div>

                    <a href="/workers" className="btn-shine w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors mb-4 block text-center no-underline">
                        🔍 Find Available Workers
                    </a>

                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-sm text-muted-foreground py-4">Loading workers...</p>
                        ) : workers.length === 0 ? (
                            <div className="empty-workers">
                                <p>No workers available in your area right now</p>
                                <a href="/workers/post" className="btn-outline" style={{
                                    display: 'inline-block', marginTop: 12,
                                    padding: '8px 16px', borderRadius: 8,
                                    border: '1px solid #16a34a', color: '#16a34a',
                                    fontSize: 13, fontWeight: 500, textDecoration: 'none',
                                    background: 'transparent',
                                }}>
                                    Post a requirement →
                                </a>
                            </div>
                        ) : workers.slice(0, 3).map((w, i) => (
                            <motion.div
                                key={w.name}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-secondary"
                            >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-primary" style={{ background: 'hsl(138 76% 97%)' }}>
                                    {w.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-foreground text-sm">{w.name}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Star className="w-3 h-3 text-farm-warning fill-farm-warning" />
                                        <span>{w.rating} ({w.reviews})</span>
                                    </div>
                                    <div className="flex gap-1 mt-1">
                                        {w.skills.map(s => <span key={s} className="farm-badge text-[10px]">{s}</span>)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-bold text-sm text-foreground">₹{w.rate}</p>
                                    <p className="text-[10px] text-muted-foreground">/day</p>
                                    {w.available && <span className="text-[10px] text-farm-success font-medium">✅ Available</span>}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Transport */}
                <div className="farm-card">
                    <div className="px-5 py-3 -mx-6 -mt-6 mb-6 rounded-t-[20px]" style={{
                        background: 'linear-gradient(135deg, #0ea5e9, #16a34a)',
                    }}>
                        <h3 className="font-semibold text-sm text-white">🚛 Book Transport Vehicle</h3>
                        <p className="text-xs text-white/70">Tractors, trucks with GPS tracking</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="text-xs text-muted-foreground font-medium">Vehicle Type</label>
                            <select className="farm-input text-sm mt-1">
                                <option>Tractor</option>
                                <option>Mini Truck</option>
                                <option>Truck</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground font-medium">Load (tons)</label>
                            <input type="number" defaultValue={5} min={1} className="farm-input text-sm mt-1" />
                        </div>
                    </div>

                    <a href="/transport" className="btn-shine w-full py-2.5 rounded-xl bg-farm-sky text-white text-sm font-semibold hover:opacity-90 transition-colors mb-4 block text-center no-underline">
                        🔍 Find Vehicles
                    </a>

                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-sm text-muted-foreground py-4">Loading vehicles...</p>
                        ) : vehicles.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4">No transport vehicles available in your area right now.</p>
                        ) : vehicles.slice(0, 3).map((v, i) => (
                            <motion.div
                                key={v.type + i}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-secondary"
                            >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'hsl(199 92% 95%)' }}>
                                    {vehicleEmoji(v.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground text-sm">{v.type}</p>
                                    <p className="text-xs text-muted-foreground">Capacity: {v.capacity}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                        <Star className="w-3 h-3 text-farm-warning fill-farm-warning" />
                                        <span>{v.rating}</span>
                                        <MapPin className="w-3 h-3" />
                                        <span>{v.distance}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-bold text-sm text-foreground">{v.rate}</p>
                                    {v.gps && <span className="text-[10px] text-farm-success font-medium">🟢 GPS</span>}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
