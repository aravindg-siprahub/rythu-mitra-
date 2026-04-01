import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TOOLS = [
  { to: '/crop', label: 'Crop AI', emoji: '🌾', desc: 'Recommendations' },
  { to: '/disease', label: 'Disease', emoji: '🔬', desc: 'Detection' },
  { to: '/market', label: 'Market', emoji: '📈', desc: 'Prices' },
  { to: '/weather', label: 'Weather', emoji: '🌤️', desc: 'Forecast' },
];

/**
 * Sticky header + compact Rythu AI tools strip (NeoGlass-style).
 */
export default function LaborMarketHeader({ user, searchQuery, onSearchChange }) {
  const [localQ, setLocalQ] = useState(searchQuery || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchChange?.(localQ.trim());
  };

  return (
    <div className="sticky top-0 z-[40] border-b border-white/20 bg-white/75 backdrop-blur-xl shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight uppercase truncate">
                Labor Market
              </h1>
              <p className="text-sm sm:text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                Jobs · Apply · Hire
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20 border border-white/50">
                {user?.full_name ? user.full_name[0].toUpperCase() : (user?.name ? user.name[0].toUpperCase() : 'R')}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 max-w-xl w-full mx-auto lg:mx-0">
            <div className="relative group rounded-2xl border border-slate-200/80 bg-white/60 shadow-inner shadow-slate-900/5 focus-within:border-emerald-400/50 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" aria-hidden>
                🔍
              </span>
              <input
                type="search"
                value={localQ}
                onChange={(e) => {
                  setLocalQ(e.target.value);
                  onSearchChange?.(e.target.value.trim());
                }}
                placeholder="Search jobs, district, crop..."
                className="w-full bg-transparent border-none rounded-2xl h-11 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>
          </form>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/25 border-2 border-white ring-1 ring-emerald-100">
              {user?.full_name ? user.full_name[0].toUpperCase() : (user?.name ? user.name[0].toUpperCase() : 'R')}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-sm font-bold uppercase tracking-wider text-slate-400 w-full sm:w-auto sm:mr-1">
            Rythu tools
          </span>
          {TOOLS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-gradient-to-br from-white/90 to-slate-50/90 px-2.5 py-1.5 text-sm sm:text-xs font-semibold text-slate-700 shadow-sm hover:border-emerald-300/60 hover:shadow-md hover:shadow-emerald-500/10 transition-all"
            >
              <span className="text-sm" aria-hidden>{t.emoji}</span>
              <span>{t.label}</span>
              <span className="hidden sm:inline text-slate-400 font-medium">· {t.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
