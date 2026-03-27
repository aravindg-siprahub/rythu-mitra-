import React, { useState } from 'react';
import apiService from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

const Market = () => {
    const [crop, setCrop] = useState('Rice');
    const [region, setRegion] = useState('Telangana');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchForecast = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.getMarketForecast(crop, region);
            setData(response.data);
        } catch (err) {
            console.error(err);
            setError("Market intelligence unavailable. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-12 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">📈 Market Intelligence</h1>
                    <p className="text-gray-500 mt-2 text-lg">AI-driven price forecasting & sell-time optimization</p>
                </div>

                {/* Controls */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Crop</label>
                        <select value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg font-semibold focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option>Rice</option>
                            <option>Cotton</option>
                            <option>Maize</option>
                            <option>Tomato</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Region</label>
                        <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg font-semibold focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option>Telangana</option>
                            <option>Andhra Pradesh</option>
                        </select>
                    </div>
                    <button
                        onClick={fetchForecast}
                        disabled={loading}
                        className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transform transition active:scale-95 ${loading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {loading ? 'Analyzing Trends...' : 'Predict Prices'}
                    </button>
                </div>

                {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-8 text-center font-medium">{error}</div>}

                {data && (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Strategy Card */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div>
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-100 mb-1">AI Recommendation</h2>
                                    <div className="text-4xl font-black tracking-tight">{data.best_strategy.action.toUpperCase()}</div>
                                    <p className="mt-2 text-emerald-100 text-lg">Target Date: <span className="font-bold text-white">{data.best_strategy.best_date}</span></p>
                                </div>
                                <div className="mt-6 md:mt-0 text-left md:text-right bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                    <span className="block text-sm font-medium text-emerald-100">Projected Gain</span>
                                    <span className="text-3xl font-bold">+₹{data.best_strategy.expected_gain}</span>
                                    <span className="text-sm text-emerald-200 block">per quintal</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 h-96">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-700">14-Day Price Forecast</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>
                                    <span>Predicted Price</span>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.forecast}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="price" stroke="#4f46e5" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                                    <ReferenceLine x={data.best_strategy.best_date} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top', value: 'OPTIMAL SELL', fill: '#10b981', fontSize: 12, fontWeight: 'bold' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Market;
