import React from 'react';

const Topbar = () => {
    return (
        <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-[#050B14]/90 backdrop-blur-md sticky top-0 z-40 ml-0 md:ml-20 lg:ml-[260px] transition-all duration-300"> {/* Margin left compensates for sidebar */}

            {/* Search Command */}
            <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 w-96 focus-within:border-emerald-500/50 transition-colors">
                <span className="text-slate-500 mr-3 text-sm">Command /</span>
                <input
                    type="text"
                    placeholder="Search metrics, farmers, or logs..."
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-600 font-mono"
                />
                <span className="text-[10px] text-slate-600 border border-white/10 rounded px-1.5 py-0.5">⌘K</span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-4">

                {/* Environment Selector */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Region:</span>
                    <select className="bg-transparent border-none text-xs font-bold text-white outline-none cursor-pointer">
                        <option>AP-South-1 (Guntur)</option>
                        <option>AP-East-2 (Vizag)</option>
                        <option>TS-Central (Hyd)</option>
                    </select>
                </div>

                {/* Time Range */}
                <div className="hidden xl:flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
                    {['Live', '1h', '24h', '7d'].map((t, i) => (
                        <button
                            key={t}
                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${i === 0 ? 'bg-emerald-500 text-black' : 'text-slate-500 hover:text-white'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="h-6 w-px bg-white/10 mx-2" />

                <button className="relative text-slate-400 hover:text-white transition-colors">
                    <span className="text-lg">🔔</span>
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>
            </div>
        </header>
    );
};

export default Topbar;
