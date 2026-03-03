import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
    { day: 'Mon', price: 2100 },
    { day: 'Tue', price: 2120 },
    { day: 'Wed', price: 2150 },
    { day: 'Thu', price: 2140 },
    { day: 'Fri', price: 2180 },
    { day: 'Sat', price: 2200 },
    { day: 'Sun', price: 2190 },
];

export default function ForecastChart() {
    return (
        <div className="bg-neo-panel backdrop-blur border border-neo-border rounded-xl p-6 h-[400px]">
            <h3 className="text-lg font-bold text-white mb-6">Price Forecast Engine</h3>
            <ResponsiveContainer width="100%" height="85%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 100', 'dataMax + 100']} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
