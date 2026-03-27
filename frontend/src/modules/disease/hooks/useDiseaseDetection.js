import { useState, useCallback } from 'react';
import { diseaseAPI } from '../../../services/apiService';
import { getFarmerDistrict, getFarmerState } from '../../../utils/locationService';

// ── Weather + season helpers ─────────────────────────────────────────────────
function getCurrentSeason() {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 5) return 'Zaid';
    if (month >= 6 && month <= 9) return 'Kharif';
    return 'Rabi';
}

function getWeatherFromCache() {
    try {
        const raw = localStorage.getItem('rm_weather_cache');
        if (!raw) return { temperature: 28, humidity: 65 };
        const data = JSON.parse(raw);
        // Support both nested {data: {...}} and flat { main: {...} } formats
        const payload = data.data || data;
        return {
            temperature: Math.round(payload.main?.temp    ?? 28),
            humidity:    Math.round(payload.main?.humidity ?? 65),
        };
    } catch {
        return { temperature: 28, humidity: 65 };
    }
}

export function useDiseaseDetection() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [jobId, setJobId] = useState(null);
    const [modelTraining, setModelTraining] = useState(false);
    const [error, setError] = useState(null);

    const analyzeImage = useCallback(async (file, cropName = 'Unknown') => {
        setLoading(true);
        setResult(null);
        setError(null);
        setModelTraining(false);
        setUploadedImage(URL.createObjectURL(file));

        const weather = getWeatherFromCache();

        const formData = new FormData();
        formData.append('image',       file);
        formData.append('crop_name',   cropName);
        // Inject weather + location context
        formData.append('temperature', weather.temperature);
        formData.append('humidity',    weather.humidity);
        formData.append('district',    getFarmerDistrict() || '');
        formData.append('state',       getFarmerState()    || 'Andhra Pradesh');
        formData.append('season',      getCurrentSeason());

        try {
            const resp = await diseaseAPI.detect(formData);

            if (resp.status === 503 || resp.status === 'model_not_found') {
                setModelTraining(true);
                setLoading(false);
                return;
            }

            if (resp.job_id) {
                setJobId(resp.job_id);
                // Poll for result
                let attempts = 0;
                const poll = setInterval(async () => {
                    attempts++;
                    try {
                        const resultResp = await diseaseAPI.getResult(resp.job_id);
                        if (resultResp.status === 'completed') {
                            clearInterval(poll);
                            setResult(resultResp.result);
                            setLoading(false);
                        } else if (resultResp.status === 'failed') {
                            clearInterval(poll);
                            setError(resultResp.error || 'Disease analysis failed. Please try again.');
                            setLoading(false);
                        } else if (attempts >= 30) {
                            clearInterval(poll);
                            setError('Analysis timed out. Please try again.');
                            setLoading(false);
                        }
                    } catch (pollErr) {
                        // Don't clear on single network blip, but limit retries
                        if (attempts >= 30) {
                            clearInterval(poll);
                            setError('Failed to check analysis status.');
                            setLoading(false);
                        }
                    }
                }, 2000);
            } else {
                // Direct result (no async job)
                setResult(resp);
                setLoading(false);
            }
        } catch (err) {
            if (err?.status === 503) {
                setModelTraining(true);
            } else {
                setError(err.message || 'Upload failed. Check your connection.');
            }
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setUploadedImage(null);
        setJobId(null);
        setModelTraining(false);
        setError(null);
    }, []);

    return { analyzeImage, reset, loading, result, uploadedImage, modelTraining, error, jobId };
}
