import React, { useState } from 'react';
import apiService from '../services/api';

const DiseaseLab = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [diagnosis, setDiagnosis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setDiagnosis(null);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', image);
        formData.append('mode', 'disease_detection');

        try {
            const response = await apiService.uploadDiseaseImage(formData);
            setDiagnosis(response.data);
        } catch (err) {
            console.error(err);
            setError("Analysis failed. Please ensure the image is clear.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-red-800 drop-shadow-sm">
                        🔬 AI Disease Lab
                    </h1>
                    <p className="text-red-600 mt-3 text-lg">
                        Instant Plant Pathology Diagnosis using Deep Learning
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100">
                    <div className="md:flex">
                        {/* Upload Section */}
                        <div className="md:w-1/2 p-8 bg-gray-50 border-r border-gray-100 flex flex-col justify-center items-center">
                            <div className="relative group w-full">
                                <label className={`flex flex-col justify-center items-center w-full h-80 px-4 transition bg-white border-2 ${preview ? 'border-red-500 border-solid' : 'border-gray-300 border-dashed'} rounded-2xl hover:bg-red-50 hover:border-red-400 cursor-pointer`}>
                                    {preview ? (
                                        <div className="relative w-full h-full">
                                            <img src={preview} alt="Upload" className="w-full h-full object-contain rounded-lg" />
                                            {loading && (
                                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-lg">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                                                    <p className="text-white font-bold mt-4 animate-pulse">Scanning Bio-Markers...</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-6xl mb-4">📸</span>
                                            <span className="text-lg font-bold text-gray-600">Upload Leaf Photo</span>
                                            <span className="text-sm text-gray-400 mt-2 text-center">Click or Drag Image Here<br />Supports JPG, PNG</span>
                                        </>
                                    )}
                                    <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                                </label>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={!image || loading}
                                className={`mt-6 w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition active:scale-95 ${!image || loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700'}`}
                            >
                                {loading ? 'Processing...' : 'Run Diagnosis'}
                            </button>
                        </div>

                        {/* Result Section */}
                        <div className="md:w-1/2 p-8 flex flex-col justify-center">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700">
                                    <p className="font-bold">Diagnosis Error</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            {!diagnosis && !error && (
                                <div className="text-center text-gray-400">
                                    <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-12 h-12 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-600">Awaiting Sample</h3>
                                    <p className="mt-2 text-sm">Upload a leaf image to detect diseases using EfficientNet-B7 AI.</p>
                                </div>
                            )}

                            {diagnosis && (
                                <div className="space-y-6 animate-fade-in-up">
                                    <div className="border-b border-gray-100 pb-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Detected Condition</p>
                                        <h2 className="text-3xl font-extrabold text-gray-800 mt-1">{diagnosis.disease}</h2>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-red-50 p-4 rounded-xl">
                                            <p className="text-xs font-bold text-red-400 uppercase">Confidence</p>
                                            <p className="text-2xl font-black text-red-600">{diagnosis.confidence}%</p>
                                        </div>
                                        <div className={`p-4 rounded-xl ${diagnosis.severity === 'High' ? 'bg-orange-100' : 'bg-green-50'}`}>
                                            <p className={`text-xs font-bold uppercase ${diagnosis.severity === 'High' ? 'text-orange-500' : 'text-green-500'}`}>Severity</p>
                                            <p className={`text-2xl font-black ${diagnosis.severity === 'High' ? 'text-orange-700' : 'text-green-700'}`}>{diagnosis.severity}</p>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                        <h4 className="font-bold text-blue-800 flex items-center mb-2">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.040.547-6.838a2 2 0 00-3.568-1.571L9.428 12.57l-.392 5.087 5.087-.392z"></path></svg>
                                            Recommended Treatment
                                        </h4>
                                        <p className="text-blue-700 text-sm leading-relaxed">
                                            {diagnosis.recommendation}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiseaseLab;
