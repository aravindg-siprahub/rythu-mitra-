import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PulseMetric = ({ label, value, unit, status, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: delay }}
            className="flex flex-col"
        >
            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{label}</h4>
            <div className="flex items-baseline gap-2 font-mono">
                <span className={`text-2xl md:text-3xl tracking-tighter ${status === 'warning' ? 'text-amber-400' : 'text-white'}`}>
                    {value}
                </span>
                {unit && <span className="text-xs text-slate-500">{unit}</span>}
                {status === 'live' && (
                    <span className="relative flex h-2 w-2 ml-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                )}
            </div>
        </motion.div>
    );
};

const LiveMetrics = () => {
    return (
        <div id="metrics" className="bg-[#020617] border-b border-white/5 py-12">
            <div className="max-w-5xl mx-auto px-6">
                <div className="flex items-center gap-4 mb-8 opacity-50">
                    <div className="h-px w-8 bg-white/20" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">System Status</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 border-l border-white/5 pl-8 lg:pl-0 lg:border-l-0">
                    <PulseMetric label="Active Zones" value="12" unit="/ 15" status="live" delay={0.2} />
                    <PulseMetric label="Subsys Health" value="100" unit="%" status="nominal" delay={0.3} />
                    <PulseMetric label="Active Threats" value="02" unit="DETECTED" status="warning" delay={0.4} />
                    <PulseMetric label="Event Stream" value="1.2" unit="M/SEC" status="nominal" delay={0.5} />
                </div>
            </div>
        </div>
    );
};

export default LiveMetrics;
