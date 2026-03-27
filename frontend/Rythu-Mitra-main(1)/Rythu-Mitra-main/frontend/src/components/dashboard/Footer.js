import React from "react";

export default function Footer() {
    return (
        <footer className="bg-darker text-white py-24 px-8 mt-24 border-t border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />

            <div className="max-w-[1600px] mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-16 mb-20">
                    <div className="col-span-2">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-10 w-10 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center text-blue-500 font-black text-xl shadow-2xl">R</div>
                            <span className="font-black text-xl tracking-tighter uppercase">Rythu Mitra OS</span>
                        </div>
                        <p className="text-sm text-slate-500 max-w-sm leading-relaxed font-medium">
                            The world's first AI Intelligence OS for Agriculture. Enterprise-grade autonomous farming logistics, satellite intelligence, and neural market discovery.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black text-white mb-6 uppercase tracking-[0.3em]">Platform</h4>
                        <ul className="space-y-4 text-xs text-slate-500 font-bold uppercase tracking-widest">
                            <li className="hover:text-blue-400 cursor-pointer transition-all duration-300">Architecture</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-all duration-300">Neural Sync</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-all duration-300">Satellite Map</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-all duration-300">API Console</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black text-white mb-6 uppercase tracking-[0.3em]">Security</h4>
                        <ul className="space-y-4 text-xs text-slate-500 font-bold uppercase tracking-widest">
                            <li className="hover:text-blue-400 cursor-pointer transition-all duration-300">Compliance</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-all duration-300">Encrypted Logs</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-all duration-300">Bio-Auth</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black text-white mb-6 uppercase tracking-[0.3em]">Resources</h4>
                        <ul className="space-y-4 text-xs text-slate-500 font-bold uppercase tracking-widest">
                            <li className="hover:text-blue-400 cursor-pointer transition-all duration-300">Whitepapers</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-all duration-300">Training</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-all duration-300">Case Studies</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black text-white mb-6 uppercase tracking-[0.3em]">Support</h4>
                        <ul className="space-y-4 text-xs text-slate-500 font-bold uppercase tracking-widest">
                            <li className="hover:text-blue-400 cursor-pointer transition-all duration-300">Help Center</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-all duration-300">Neural Link</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-all duration-300">Status</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <p>© 2035 Rythu Mitra AI Intelligence OS. Global Enterprise Edition.</p>
                    <div className="flex gap-8 mt-6 md:mt-0">
                        <span className="hover:text-white cursor-pointer transition-colors">Privacy Protocol</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Terms of Command</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Neural Config</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
