import React from 'react';

export default function PriceTicker({ items }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {items.map((item) => (
                <div key={item.commodity} className="bg-neo-panel backdrop-blur border border-neo-border rounded-xl p-4 relative overflow-hidden group">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{item.commodity}</div>
                    <div className="flex items-end justify-between">
                        <div className="text-2xl font-black text-white">₹{item.price}</div>
                        <div className={`text-xs font-bold font-mono ${item.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {item.change > 0 ? '+' : ''}{item.change}%
                        </div>
                    </div>

                    {/* Trend Indicator */}
                    <div className={`absolute top-0 right-0 w-1 h-full ${item.trend === 'UP' ? 'bg-emerald-500' :
                            item.trend === 'DOWN' ? 'bg-red-500' : 'bg-slate-500'
                        } opacity-50`} />
                </div>
            ))}
        </div>
    );
}
