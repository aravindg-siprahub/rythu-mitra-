import React from 'react';
import { motion } from 'framer-motion';

const insights = [
    { id: 1, title: "Yield Risk Detected", desc: "Early blight patterns identified in Sector 4.", confidence: "98%", impact: "HIGH", time: "20m ago" },
    { id: 2, title: "Water Optimization", desc: "Irrigation schedule adjusted for Zone B.", confidence: "92%", impact: "MED", time: "1h ago" },
    { id: 3, title: "Market Volatility", desc: "Tomato prices trending +15% vs baseline.", confidence: "89%", impact: "MED", time: "2h ago" }
];

const AIList = () => {
    return (
        <div id="intelligence" className="py-24 bg-[#020617] border-t border-white/5">
            <div className="max-w-5xl mx-auto px-6">
                <div className="flex items-center gap-4 mb-16 opacity-50">
                    <div className="h-px w-8 bg-white/20" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">Intelligence In Action</span>
                </div>

                <div className="max-w-4xl space-y-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                    {insights.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-[#020617] hover:bg-[#0B1221] transition-colors cursor-default"
                        >
                            <div className="mb-2 md:mb-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-sm font-bold text-white tracking-tight">{item.title}</h4>
                                    {item.impact === 'HIGH' && (
                                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-bold tracking-wider">IMPACT</span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-400 font-light">{item.desc}</p>
                            </div>

                            <div className="flex items-center gap-8 text-xs font-mono text-slate-500 mt-4 md:mt-0">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">Confidence</span>
                                    <span className="text-emerald-500">{item.confidence}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">Time</span>
                                    <span>{item.time}</span>
                                </div>
                                <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity pl-4 border-l border-white/5">
                                    <span className="text-emerald-500 font-bold cursor-pointer hover:text-emerald-400 transition-colors">Review &rarr;</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Predictive Marker */}
                    <div className="p-4 bg-[#020617] flex items-center justify-center border-t border-white/5">
                        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse"></span>
                            Next Prediction: 04:00 PM
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIList;
