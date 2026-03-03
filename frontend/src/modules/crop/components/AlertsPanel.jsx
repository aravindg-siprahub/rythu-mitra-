import React from 'react';

const AlertItem = ({ level, message }) => (
    <div className={`p-3 rounded-lg border flex items-start gap-3 mb-2 ${level === 'CRITICAL' ? 'bg-red-500/5 border-red-500/20' :
            level === 'WARNING' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-blue-500/5 border-blue-500/20'
        }`}>
        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${level === 'CRITICAL' ? 'bg-red-500' :
                level === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
            }`} />
        <div>
            <div className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${level === 'CRITICAL' ? 'text-red-500' :
                    level === 'WARNING' ? 'text-amber-500' : 'text-blue-500'
                }`}>{level}</div>
            <div className="text-xs text-slate-300 leading-relaxed">{message}</div>
        </div>
    </div>
);

export default function AlertsPanel() {
    return (
        <div className="bg-neo-panel backdrop-blur-md border border-neo-border rounded-2xl p-6 h-full">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-red-500">🚨</span>
                Risk Radar
            </h3>

            <div className="space-y-1 mb-6">
                <AlertItem level="CRITICAL" message="Detected Nitrogen deficiency trend in Nizamabad sector." />
                <AlertItem level="WARNING" message="High probability of Cotton Bollworm in next 48h." />
                <AlertItem level="INFO" message="Market prices for Turmeric up by 12%." />
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-white/5 text-center">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Regional Risk Score</div>
                <div className="text-3xl font-black text-white">18<span className="text-lg text-slate-600">/100</span></div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[18%]" />
                </div>
                <div className="text-[10px] text-emerald-500 mt-2 font-bold uppercase">Safe Zone</div>
            </div>
        </div>
    );
}
