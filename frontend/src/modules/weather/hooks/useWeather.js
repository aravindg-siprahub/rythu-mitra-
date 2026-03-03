import { useState, useCallback } from 'react';
import { weatherAPI, APIError } from '../../../services/apiService';

const DISTRICTS = {
    Warangal: { lat: 17.9784, lng: 79.5941 },
    Karimnagar: { lat: 18.4386, lng: 79.1288 },
    Nizamabad: { lat: 18.6726, lng: 78.0941 },
    Khammam: { lat: 17.2473, lng: 80.1514 },
    Nalgonda: { lat: 17.0575, lng: 79.2690 },
};

export function useWeather() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState('Warangal');

    const fetchWeather = useCallback(async (districtName) => {
        const district = districtName || selectedDistrict;
        const coords = DISTRICTS[district];
        if (!coords) return;

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const data = await weatherAPI.forecast(district, coords.lat, coords.lng);
            setResult(data);
        } catch (err) {
            setError(err.message || 'Failed to load weather data. Check your connection.');
        } finally {
            setLoading(false);
        }
    }, [selectedDistrict]);

    const selectDistrict = useCallback((name) => {
        setSelectedDistrict(name);
        fetchWeather(name);
    }, [fetchWeather]);

    return {
        loading, result, error,
        selectedDistrict, selectDistrict,
        districts: Object.keys(DISTRICTS),
        fetchWeather,
    };
}
