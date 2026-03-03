import React, { useState } from 'react';
import Button from '../../components/ui/Button'; // Assuming we have a generic UI button

export default function InputForm({ onPredict, loading }) {
    const [formData, setFormData] = useState({
        nitrogen: 120,
        phosphorus: 42,
        potassium: 35,
        ph: 6.5,
        temperature: 28,
        humidity: 72,
        rainfall: 150
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-neo-panel backdrop-blur-md border border-neo-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-blue-500">⚡</span>
                Analysis Parameters
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 block">Nitrogen (N)</label>
                    <input
                        name="nitrogen" type="number" value={formData.nitrogen} onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors font-mono"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 block">Phosphorus (P)</label>
                    <input
                        name="phosphorus" type="number" value={formData.phosphorus} onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors font-mono"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 block">Potassium (K)</label>
                    <input
                        name="potassium" type="number" value={formData.potassium} onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors font-mono"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 block">pH Level</label>
                    <input
                        name="ph" type="number" step="0.1" value={formData.ph} onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors font-mono"
                    />
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Rainfall (mm)</label>
                        <span className="text-xs font-mono text-blue-400">{formData.rainfall}mm</span>
                    </div>
                    <input
                        name="rainfall" type="range" min="0" max="300" value={formData.rainfall} onChange={handleChange}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
            </div>

            <Button variant="primary" className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20" onClick={() => onPredict(formData)} disabled={loading}>
                {loading ? 'Processing Neural Net...' : 'Run Prediction Engine'}
            </Button>
        </div>
    );
}
