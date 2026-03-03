import React from 'react';
import Card from '../ui/Card';

const ALERTS = [
    { id: 1, level: 'critical', title: 'Pest Outbreak', location: 'Zone 4-A', time: '10m ago', count: 3 },
    { id: 2, level: 'warning', title: 'Moisture Dip', location: 'Zone 2', time: '35m ago', count: 1 },
    { id: 3, level: 'info', title: 'Market Update', location: 'Global', time: '1h ago', count: 12 },
];

const AlertsPanel = () => {
    return (
        <Card className="h-full bg-gradient-to-b from-[#1a0505] to-black border-red-900/20 p-0 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-red-500/10 flex justify-between items-center bg-red-500/5">
                <div className="flex items-center gap-2">
                    <div className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                    </div>
                    <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.2em]">Active Incidents</h3>
                </div>
                <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-bold text-red-500">
                    2 CRITICAL
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {ALERTS.map((alert) => (
                    <div key={alert.id} className="group p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex gap-3">
                        {/* Status Bar */}
                        <div className={`w-1 rounded-full ${alert.level === 'critical' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' :
                                alert.level === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                            }`} />

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">{alert.title}</h4>
                                <span className="text-[10px] text-slate-500 font-mono">{alert.time}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-[11px] text-slate-400">{alert.location}</p>
                                {alert.count > 1 && (
                                    <span className="text-[9px] px-1.5 py-px rounded bg-white/10 text-white font-mono">+{alert.count}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Action */}
            <div className="p-3 border-t border-white/5 bg-white/5">
                <button className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors border border-dashed border-white/10 hover:border-white/20">
                    View Incident Logs
                </button>
            </div>
        </Card>
    );
};

export default AlertsPanel;
