import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const modules = [
    { id: 'crop', title: 'Crop Intelligence', desc: 'Yield modeling', icon: '🌱', path: '/crop' },
    { id: 'disease', title: 'Pathogen Lab', desc: 'CV diagnosis', icon: '🔬', path: '/disease' },
    { id: 'market', title: 'Market Exchange', desc: 'Real-time pricing', icon: '📈', path: '/market' },
    { id: 'weather', title: 'Weather Grid', desc: 'Local forecasting', icon: '☁️', path: '/weather' },
    { id: 'logistics', title: 'Logistics Net', desc: 'Fleet dispatch', icon: '🚚', path: '/transport' },
    { id: 'workers', title: 'Workforce Hub', desc: 'Labor demand', icon: '👷', path: '/workers' }
];

const ControlHub = () => {
    return (
        <div id="capabilities" className="py-24 bg-[#020617]">
            <div className="max-w-5xl mx-auto px-6">
                {/* Section Rhythm Divider */}
                <div className="flex items-center gap-4 mb-16 opacity-50">
                    <div className="h-px w-8 bg-white/20" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">Core Capabilities</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((mod) => (
                        <Link key={mod.id} to={mod.path}>
                            <motion.div
                                whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.05)" }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="group relative h-full p-8 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-pointer overflow-hidden"
                            >
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Launch →</span>
                                </div>

                                <div className="w-10 h-10 mb-6 text-2xl grayscale group-hover:grayscale-0 transition-all duration-300">
                                    {mod.icon}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-emerald-50 text-opacity-90">{mod.title}</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed group-hover:text-slate-400 transition-colors">{mod.desc}</p>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ControlHub;
