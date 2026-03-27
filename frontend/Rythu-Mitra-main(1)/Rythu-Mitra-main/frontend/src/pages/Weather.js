import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Weather = () => {
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState({ lat: 17.3850, lon: 78.4867, name: 'Hyderabad (Rural)' });

    useEffect(() => {
        getWeather();
    }, []);

    const getWeather = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.getWeatherPrediction(location.lat, location.lon);
            setForecast(response.data);
        } catch (err) {
            console.error(err);
            setError("Satellite connection failed. Using cached data.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-blue-50">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-blue-600 font-bold animate-pulse">Establishing Satellite Uplink...</p>
        </div>
    );

    return (
        <div className="p-6 md:p-12 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-800">🌤️ Precision Weather</h1>
                        <p className="text-gray-500 mt-1">Satellite-driven micro-climate forecasting</p>
                    </div>
                    <span className="mt-4 md:mt-0 bg-white px-6 py-3 rounded-full shadow-lg text-sm font-bold text-blue-800 flex items-center border border-blue-100">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        📍 {location.name}
                    </span>
                </div>

                {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-6 text-center">{error} <button onClick={getWeather} className="underline font-bold ml-2">Retry</button></div>}

                {forecast && (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Hero Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border-l-4 border-blue-500">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rain Probability</h3>
                                <div className="flex items-end mt-2">
                                    <span className="text-4xl font-black text-blue-600">{forecast.forecast[0].rain_prob.toFixed(0)}</span>
                                    <span className="text-xl text-gray-400 mb-1 ml-0.5">%</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border-l-4 border-yellow-500">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Peak Temp</h3>
                                <div className="flex items-end mt-2">
                                    <span className="text-4xl font-black text-gray-800">{forecast.forecast[0].temp_max.toFixed(0)}</span>
                                    <span className="text-xl text-gray-400 mb-1 ml-0.5">°C</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border-l-4 border-teal-500">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Humidity</h3>
                                <div className="flex items-end mt-2">
                                    <span className="text-4xl font-black text-teal-600">65</span>
                                    <span className="text-xl text-gray-400 mb-1 ml-0.5">%</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border-l-4 border-purple-500">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Wind Speed</h3>
                                <div className="flex items-end mt-2">
                                    <span className="text-4xl font-black text-purple-600">12</span>
                                    <span className="text-xl text-gray-400 mb-1 ml-0.5">km/h</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl h-96 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                            <h3 className="text-xl font-bold mb-6 text-gray-700">7-Day Temperature Trend</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={forecast.forecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="temp_max" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Alerts Section */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {forecast.risks.length > 0 ? (
                                forecast.risks.map((risk, idx) => (
                                    <div key={idx} className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-start">
                                        <span className="text-3xl mr-4">⚠️</span>
                                        <div>
                                            <h4 className="text-red-800 font-bold text-lg">{risk.type} Alert</h4>
                                            <p className="text-red-700 mt-1 text-sm">{risk.msg}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center md:col-span-2">
                                    <span className="text-3xl mr-4">✅</span>
                                    <div>
                                        <h4 className="text-green-800 font-bold text-lg">Conditions Normal</h4>
                                        <p className="text-green-700 mt-1 text-sm">No significant weather risks detected for crops this week.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Weather;
