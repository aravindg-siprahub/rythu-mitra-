import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AnalyticsPanel({ history }) {
    return (
        <div className="bg-neo-panel backdrop-blur-md border border-neo-border rounded-2xl p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-purple-500">📈</span>
                    Yield Forecast Trends
                </h3>
                <select className="bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 px-2 py-1">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                </select>
            </div>

            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                        <defs>
                            <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} unit="q" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="yield" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorYield)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase">Avg Yield</div>
                    <div className="text-lg font-bold text-white">48.2 <span className="text-[10px] text-slate-600">Q/ac</span></div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase">Model Drift</div>
                    <div className="text-lg font-bold text-emerald-500">0.04%</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase">Requests</div>
                    <div className="text-lg font-bold text-blue-500">8.2k</div>
                </div>
            </div>
        </div>
    );
}
