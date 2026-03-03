import React from 'react';
import Card from '../ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const data = [
    { time: '09:00', price: 2400, prediction: 2420, range: [2380, 2460], vol: 120 },
    { time: '10:00', price: 2380, prediction: 2400, range: [2350, 2450], vol: 150 },
    { time: '11:00', price: 2500, prediction: 2480, range: [2400, 2550], vol: 300 },
    { time: '12:00', price: 2600, prediction: 2650, range: [2550, 2700], vol: 450 },
    { time: '13:00', price: 2580, prediction: 2600, range: [2500, 2650], vol: 200 },
    { time: '14:00', price: 2700, prediction: 2750, range: [2600, 2800], vol: 180 },
    { time: '15:00', price: 2800, prediction: 2820, range: [2700, 2900], vol: 250 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0f172a] border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
                <p className="text-xs font-mono text-slate-400 mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-[10px] uppercase font-bold">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-300 w-16">{entry.name}:</span>
                        <span className="text-white">₹{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const MarketChart = () => {
    return (
        <Card className="h-full flex flex-col bg-black/40 border-blue-500/20 col-span-1 lg:col-span-2">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <span className="text-blue-500">📈</span> Market Intelligence
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                        Regional Index: <span className="text-white">Nizamabad (NZB)</span> • Volatility: <span className="text-amber-500">HIGH</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">Tomato</button>
                    <button className="px-3 py-1 rounded bg-white/5 text-slate-500 text-[10px] font-bold hover:text-white">Chili</button>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20' }} />
                        <ReferenceLine y={2400} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Support', fill: '#ef4444', fontSize: 9 }} />

                        <Area
                            name="Forecast"
                            type="monotone"
                            dataKey="prediction"
                            stroke="#8b5cf6"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            fill="url(#colorPred)"
                        />
                        <Area
                            name="Actual"
                            type="monotone"
                            dataKey="price"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#colorPrice)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default MarketChart;
