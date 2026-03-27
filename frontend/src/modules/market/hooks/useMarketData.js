import { useState, useCallback } from 'react';
import { marketAPI, APIError } from '../../../services/apiService';
import { getFarmerMandi } from '../../../utils/locationService';

const COMMODITIES = [
    'Rice', 'Cotton', 'Maize', 'Onion', 'Potato',
    'Soybean', 'Sugarcane', 'Tomato', 'Wheat', 'Groundnut',
];

const fetchWithTimeout = (fetchPromise, timeoutMs = 15000) => {
    return Promise.race([
        fetchPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs))
    ]);
};

export function useMarketData() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [marketError, setMarketError] = useState(null);
    const [loadingMsg, setLoadingMsg] = useState('Fetching prices...');
    
    const [crop, setCrop] = useState('Rice');
    const [market, setMarket] = useState(() => getFarmerMandi() || 'Warangal');
    const [days, setDays] = useState(7);

    const startLoadingMessages = () => {
        const messages = [
            'Fetching prices...',
            'Analysing market trends...',
            'Checking seasonal patterns...',
            'Calculating price forecast...',
            'Generating sell strategy...',
            'Almost ready...',
        ];
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setLoadingMsg(messages[i]);
        }, 2000);
        return interval;
    };

    const fetchForecast = useCallback(async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        setMarketError(null);
        const msgInterval = startLoadingMessages();

        try {
            const initialResponse = await fetchWithTimeout(
                marketAPI.forecast(crop, market, days), 
                15000
            );
            
            if (initialResponse.task_id) {
                const poll = async () => {
                    try {
                        const statusResp = await fetchWithTimeout(
                            marketAPI.getTaskResult(initialResponse.task_id),
                            15000
                        );
                        if (statusResp.status === 'completed') {
                            clearInterval(msgInterval);
                            setResult(statusResp.result);
                            setLoading(false);
                            setLoadingMsg('Fetching prices...');
                        } else if (statusResp.status === 'failed') {
                            clearInterval(msgInterval);
                            setMarketError(statusResp.error || 'Market forecast failed.');
                            setError(statusResp.error || 'Market forecast failed.');
                            setLoading(false);
                            setLoadingMsg('Fetching prices...');
                        } else {
                            setTimeout(poll, 2000);
                        }
                    } catch (e) {
                        clearInterval(msgInterval);
                        setMarketError(e.message === 'timeout' ? 'Polling request timed out' : 'Lost connection to market server.');
                        setError('Lost connection to market server.');
                        setLoading(false);
                        setLoadingMsg('Fetching prices...');
                    }
                };
                poll();
            } else {
                clearInterval(msgInterval);
                setResult(initialResponse.result || initialResponse);
                setLoading(false);
                setLoadingMsg('Fetching prices...');
            }
        } catch (err) {
            clearInterval(msgInterval);
            setLoading(false);
            setLoadingMsg('Fetching prices...');
            
            const isTimeout = err.message === 'timeout';
            const msg = isTimeout 
                ? 'Request timed out — please try again' 
                : 'Could not fetch prices. Check your connection and retry.';
                
            if (err instanceof APIError && err.status === 503) {
                setMarketError('Market forecast model is not available. Please try again shortly.');
                setError('Market forecast model is not available.');
            } else {
                setMarketError(msg);
                setError(msg);
            }
        }
    }, [crop, market, days]);

    return {
        loading, result, error, marketError,
        crop, setCrop,
        market, setMarket,
        days, setDays,
        fetchForecast,
        commodities: COMMODITIES,
        loadingMsg, setMarketError,
    };
}
