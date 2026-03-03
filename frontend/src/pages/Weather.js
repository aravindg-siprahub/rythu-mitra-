import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DashboardLayout from './components/dashboard/DashboardLayout';
import GlassCard from './components/ui/GlassCard';

const FORECAST_DATA = [
    { time: '06:00', temp: 22, rain: 10 },
    { time: '09:00', temp: 25, rain: 5 },
    { time: '12:00', temp: 31, rain: 0 },
    { time: '15:00', temp: 33, rain: 0 },
    { time: '18:00', temp: 28, rain: 20 },
    { time: '21:00', temp: 24, rain: 45 },
];

export default function Weather() {
    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="px-6 py-12 max-w-[1920px] mx-auto"
            >
                <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Live Feed</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                            Weather <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Grid</span>
                            <span className="text-2xl opacity-50">☁️</span>
                        </h1>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Location</p>
                        <p className="text-xl font-bold text-white tracking-tight">Guntur, AP-South-1</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Key Metrics */}
                    {[
                        { label: "Temperature", val: "32°C", unit: "Feels like 36°C", icon: "🌡️", color: "text-amber-400" },
                        { label: "Humidity", val: "68%", unit: "Dew Point 22°", icon: "💧", color: "text-cyan-400" },
                        { label: "Wind Speed", val: "12 km/h", unit: "NE Direction", icon: "💨", color: "text-slate-300" },
                        { label: "Precipitation", val: "15%", unit: "Next 4h", icon: "☔", color: "text-blue-400" },
                    ].map((metric, i) => (
                        <GlassCard key={i} className="p-6 bg-white/[0.02] border-white/5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded bg-white/5 text-xl">{metric.icon}</div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${metric.color}`}>Live</span>
                            </div>
                            <h3 className="text-3xl font-black text-white mb-1">{metric.val}</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{metric.label}</p>
                            <p className="text-xs text-slate-400 mt-2 font-mono">{metric.unit}</p>
                        </GlassCard>
                    ))}
                </div>

                {/* Forecast Chart */}
                <GlassCard className="min-h-[400px] bg-white/[0.02] border-white/5 p-8 relative">
                    <h3 className="absolute top-8 left-8 text-xs font-bold text-slate-400 uppercase tracking-widest">24H Prediction Model</h3>
                    <div className="w-full h-full pt-12">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={FORECAST_DATA}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 12, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" tick={{ fontSize: 12, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px', color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="temp" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

            </motion.div>
        </DashboardLayout>
    );
}
