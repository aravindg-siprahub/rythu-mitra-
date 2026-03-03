import React from 'react';
import Card from '../ui/Card';

const SERVICES = [
    { name: 'Neural Engine', status: 'OK', latency: '42ms', uptime: '99.9%' },
    { name: 'Weather Stream', status: 'OK', latency: '120ms', uptime: '99.8%' },
    { name: 'Market Feed', status: 'WARN', latency: '450ms', uptime: '98.5%' },
    { name: 'Auth Gateway', status: 'OK', latency: '15ms', uptime: '100%' },
    { name: 'DB Shard-1', status: 'OK', latency: '22ms', uptime: '99.9%' },
];

const SystemHealth = () => {
    return (
        <Card className="h-full bg-black/40 border-white/5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">System Health</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-4 text-[9px] font-bold text-slate-600 uppercase mb-2 px-2">
                    <div className="col-span-2">Service</div>
                    <div className="text-center">Lat</div>
                    <div className="text-right">Status</div>
                </div>

                {SERVICES.map((svc, i) => (
                    <div key={i} className="grid grid-cols-4 items-center px-2 py-2 hover:bg-white/5 rounded transition-colors group">
                        <div className="col-span-2 flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${svc.status === 'OK' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-[10px] font-bold text-slate-300 group-hover:text-white">{svc.name}</span>
                        </div>
                        <div className="text-center text-[10px] font-mono text-slate-500">{svc.latency}</div>
                        <div className="text-right">
                            <span className={`text-[9px] font-black px-1.5 py-px rounded ${svc.status === 'OK' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                }`}>
                                {svc.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500">
                <span>Total Requests</span>
                <span className="font-mono text-white">1.2M / hr</span>
            </div>
        </Card>
    );
};

export default SystemHealth;
