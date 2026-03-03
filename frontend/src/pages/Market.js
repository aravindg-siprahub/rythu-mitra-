import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Bar } from 'recharts';
import DashboardLayout from './components/dashboard/DashboardLayout';
import GlassCard from './components/ui/GlassCard';
import Button from './components/ui/Button';

// --- MOCK DATA ---
const MARKET_DATA = [
    { time: '09:00', price: 2100, vol: 1200 },
    { time: '10:00', price: 2150, vol: 1500 },
    { time: '11:00', price: 2120, vol: 900 },
    { time: '12:00', price: 2200, vol: 2000 },
    { time: '13:00', price: 2250, vol: 3200 },
    { time: '14:00', price: 2300, vol: 2800 },
    { time: '15:00', price: 2380, vol: 4100 },
];

const ORDER_BOOK = [
    { price: 2385, size: 450, type: 'ask' },
    { price: 2384, size: 120, type: 'ask' },
    { price: 2382, size: 850, type: 'ask' },
    { price: 2380, size: 1100, type: 'bid' },
    { price: 2378, size: 500, type: 'bid' },
    { price: 2375, size: 1200, type: 'bid' },
];

export default function Market() {
    const [selectedCrop, setSelectedCrop] = useState('Rice');
    const [orderType, setOrderType] = useState('limit');

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="px-6 py-12 max-w-[1920px] mx-auto"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6 border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Market Open
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Latency: 12ms</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                            RythuMitra <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">TradeX</span>
                        </h1>
                    </div>

                    <div className="flex gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/5">
                        {['Rice', 'Cotton', 'Chilli', 'Maize'].map(crop => (
                            <button
                                key={crop}
                                onClick={() => setSelectedCrop(crop)}
                                className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${selectedCrop === crop
                                        ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-900/40'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {crop}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Chart Area */}
                    <GlassCard className="col-span-12 lg:col-span-8 min-h-[500px] border-white/5 bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white tracking-tight">{selectedCrop} / INR</h2>
                            <span className="text-2xl font-mono font-bold text-emerald-400">₹2,380.50</span>
                        </div>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={MARKET_DATA}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} orientation="right" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                                        itemStyle={{ fontSize: '12px', color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="price" stroke="#a855f7" strokeWidth={2} fill="url(#colorPrice)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    {/* Order Interface */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                        {/* Order Book */}
                        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden flex flex-col">
                            <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Book</h3>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            </div>
                            <div className="p-2 space-y-0.5 font-mono text-xs">
                                {ORDER_BOOK.map((row, i) => (
                                    <div key={i} className="flex justify-between px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer group transition-colors">
                                        <span className={row.type === 'ask' ? 'text-rose-400' : 'text-emerald-400'}>{row.price}</span>
                                        <span className="text-slate-400 group-hover:text-white">{row.size}</span>
                                        <div className="w-12 h-3 bg-white/5 rounded-sm overflow-hidden mt-0.5">
                                            <div className="h-full bg-slate-700" style={{ width: `${Math.random() * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trade Control */}
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded-lg">
                                <button
                                    onClick={() => setOrderType('limit')}
                                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${orderType === 'limit' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Limit
                                </button>
                                <button
                                    onClick={() => setOrderType('market')}
                                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${orderType === 'market' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Market
                                </button>
                            </div>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 block">Quantity (Kg)</label>
                                    <input type="number" className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-blue-500 outline-none transition-colors font-mono" placeholder="0" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button className="bg-emerald-600 hover:bg-emerald-500 text-[#020617] w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-all">
                                    Buy
                                </Button>
                                <Button className="bg-rose-600 hover:bg-rose-500 text-white w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-all">
                                    Sell
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
