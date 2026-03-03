import { useState, useCallback } from 'react';
import { marketAPI, APIError } from '../../../services/apiService';

const COMMODITIES = [
    'Rice', 'Cotton', 'Maize', 'Onion', 'Potato',
    'Soybean', 'Sugarcane', 'Tomato', 'Wheat', 'Groundnut',
];

export function useMarketData() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [crop, setCrop] = useState('Rice');
    const [market, setMarket] = useState('Warangal');
    const [days, setDays] = useState(7);

    const fetchForecast = useCallback(async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const data = await marketAPI.forecast(crop, market, days);
            setResult(data);
        } catch (err) {
            if (err instanceof APIError && err.status === 503) {
                setError('Market forecast model is not available. Please try again shortly.');
            } else {
                setError(err.message || 'Failed to fetch market forecast.');
            }
        } finally {
            setLoading(false);
        }
    }, [crop, market, days]);

    return {
        loading, result, error,
        crop, setCrop,
        market, setMarket,
        days, setDays,
        fetchForecast,
        commodities: COMMODITIES,
    };
}
