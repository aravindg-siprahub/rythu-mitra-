import React from 'react';
import Card from '../ui/Card';

const stats = [
    {
        label: 'Active Farmers',
        value: '14,240',
        change: '+124',
        trend: 'up',
        icon: '👨‍🌾',
        subtext: 'vs 7d avg',
        freshness: '2m ago'
    },
    {
        label: 'Yield Accuracy',
        value: '94.2%',
        change: '+1.4%',
        trend: 'up',
        icon: '🎯',
        subtext: 'Model v4.2',
        freshness: 'Live'
    },
    {
        label: 'Risk Index',
        value: 'Low',
        change: '-5%',
        trend: 'down', // down is good for risk
        icon: '🛡️',
        subtext: 'Sector 4 Safe',
        freshness: '5m ago'
    },
    {
        label: 'Market Volatility',
        value: 'High',
        change: '+22%',
        trend: 'warn',
        icon: '📈',
        subtext: 'Tomato / Chili',
        freshness: 'Live'
    },
    {
        label: 'AI Adoption',
        value: '68%',
        change: '+8%',
        trend: 'up',
        icon: '🤖',
        subtext: 'Advisory Click-thru',
        freshness: 'Daily'
    }
];

const StatsCards = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {stats.map((stat, i) => (
                <Card key={i} delay={i * 0.1} className="p-4 flex flex-col justify-between relative overflow-hidden group border border-white/5 bg-black/40 backdrop-blur-xl">

                    <div className="flex justify-between items-start mb-2">
                        {/* Icon Box */}
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5 group-hover:bg-white/10 transition-colors">
                            {stat.icon}
                        </div>
                        {/* Freshness Badge */}
                        <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {stat.freshness}
                        </span>
                    </div>

                    <div>
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-black text-white tracking-tight">{stat.value}</h3>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${stat.trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' :
                                    stat.trend === 'down' ? 'text-blue-400 bg-blue-500/10' : // Risk down is good
                                        'text-amber-400 bg-amber-500/10'
                                }`}>
                                {stat.trend === 'up' && '▲'}
                                {stat.trend === 'down' && '▼'}
                                {stat.trend === 'warn' && '⚠️'}
                                {stat.change}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                                {stat.subtext}
                            </span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default StatsCards;
