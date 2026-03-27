import React from "react";

export default function Footer() {
    return (
        <footer className="bg-darker border-t border-white/5 pt-32 pb-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-20 md:grid-cols-4 mb-24">
                    <div className="col-span-2">
                        <div className="flex items-center gap-4 mb-10 group cursor-default">
                            <div className="h-12 w-12 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center text-blue-500 font-black text-2xl shadow-2xl group-hover:border-blue-500 transition-colors">R</div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-white tracking-widest uppercase font-title italic">Rythu Mitra</span>
                                <span className="text-[10px] font-black text-blue-500 tracking-[0.4em] uppercase">AI Intelligence OS</span>
                            </div>
                        </div>
                        <p className="text-slate-500 max-w-md font-bold text-xs uppercase tracking-wider leading-relaxed opacity-60">
                            Orchestrating the future of global agriculture through decentralized intelligence and neural-synced land nodes.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-black uppercase text-[10px] tracking-[0.4em] mb-10">OS Terminal</h4>
                        <ul className="space-y-6 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                            <li><a href="#" className="hover:text-blue-500 transition-colors">Command_Dash</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition-colors">Neural_Engine_x64</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition-colors">Marketplace_Core</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition-colors">Kernel_Update</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-black uppercase text-[10px] tracking-[0.4em] mb-10">Corporate Node</h4>
                        <ul className="space-y-6 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                            <li><a href="#" className="hover:text-blue-500 transition-colors">Governance</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition-colors">Ecosystem_Map</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition-colors">Press_Node</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition-colors">Direct_Sync</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col gap-2">
                        <p className="text-slate-700 text-[9px] font-black uppercase tracking-[0.2em]">© 2035 Rythu Mitra OS — Sub-millisecond Precision Agriculture.</p>
                        <div className="flex items-center gap-3">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-[0.3em]">System_Status: Optimal_Sync</span>
                        </div>
                    </div>
                    <div className="flex gap-10 text-slate-700 text-[9px] font-black uppercase tracking-[0.4em]">
                        <a href="#" className="hover:text-white transition-colors">Privacy_Protocol</a>
                        <a href="#" className="hover:text-white transition-colors">Terms_of_Use</a>
                        <a href="#" className="hover:text-white transition-colors">Security_Gate</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
