import React, { useState } from 'react';
import apiService from '../services/api';
import './CropRecommendation.css'; // Ensure this file exists for animations if needed

const CropRecommendation = () => {
  const [formData, setFormData] = useState({
    N: 90, P: 42, K: 43, temperature: 25, humidity: 60, ph: 6.5, rainfall: 200
  });
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const response = await apiService.getCropRecommendation(formData);
      setRecommendations(response.data.recommendations);
    } catch (err) {
      console.error("Crop API Error:", err);
      setError("Analysis failed. Please check connection or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 drop-shadow-sm">
            🌱 AI Crop Advisor
          </h1>
          <p className="text-green-600 mt-3 text-lg">
            Enterprise-Grade Precision Agriculture Engine
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Input Panel */}
          <div className="md:col-span-5 bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
            <div className="bg-green-700 p-4">
              <h3 className="text-white font-bold text-lg flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.040.547-6.838a2 2 0 00-3.568-1.571L9.428 12.57l-.392 5.087 5.087-.392z"></path></svg>
                Soil Parameters
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nitrogen (N)</label>
                  <input name="N" type="number" value={formData.N} onChange={handleChange} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phosphorus (P)</label>
                  <input name="P" type="number" value={formData.P} onChange={handleChange} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Potassium (K)</label>
                  <input name="K" type="number" value={formData.K} onChange={handleChange} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">pH Level</label>
                  <input name="ph" type="number" step="0.1" value={formData.ph} onChange={handleChange} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Rainfall (mm)</label>
                  <input name="rainfall" type="number" value={formData.rainfall} onChange={handleChange} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" />
                </div>
              </div>

              <button
                disabled={loading}
                className={`w-full mt-6 py-4 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all hover:scale-105 active:scale-95 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Running Models...
                  </span>
                ) : 'Predict Best Crop'}
              </button>
            </form>
          </div>

          {/* Output Panel */}
          <div className="md:col-span-7 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!recommendations && !loading && !error && (
              <div className="bg-white/50 border-2 dashed border-green-200 rounded-2xl p-12 text-center h-full flex flex-col justify-center items-center">
                <span className="text-6xl mb-4">🚜</span>
                <h3 className="text-xl font-medium text-gray-500">Ready to Analyze</h3>
                <p className="text-gray-400">Enter soil data to get AI-powered insights.</p>
              </div>
            )}

            {recommendations && (
              <div className="grid gap-4 animate-fade-in-up">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className={`relative overflow-hidden bg-white rounded-xl shadow-lg border-l-8 ${idx === 0 ? 'border-green-500 transform scale-105 z-10' : 'border-gray-300 opacity-90'}`}>
                    <div className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{idx === 0 ? 'Primary Recommendation' : `Option ${idx + 1}`}</p>
                        <h2 className="text-3xl font-extrabold text-gray-800 mt-1">{rec.crop}</h2>
                        {idx === 0 && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">Highly Recommended</span>}
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-black text-green-600">{rec.confidence}%</div>
                        <p className="text-xs text-gray-500">Confidence Score</p>
                      </div>
                    </div>
                    {/* Progress Bar background */}
                    <div className="absolute bottom-0 left-0 h-1 bg-green-500 opacity-20" style={{ width: `${rec.confidence}%` }}></div>
                  </div>
                ))}

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-700 mt-4 flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p>
                    <strong>AI Insight:</strong> These results are generated using an ensemble of Random Forest and XGBoost models trained on regional historical data.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;
