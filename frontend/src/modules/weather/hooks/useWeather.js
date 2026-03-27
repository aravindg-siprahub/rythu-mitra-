import { useState, useCallback, useRef } from 'react';
import { weatherAPI } from '../../../services/apiService';
import { getFarmerState, getFarmerCity } from '../../../utils/locationService';

// Removed static DISTRICTS and mock data.
// Now using dynamic location search for accurate weather forecasting.

export function useWeather() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(() => getFarmerCity());
    const [selectedState, setSelectedState] = useState(() => getFarmerState());
    const [selectedCrop, setSelectedCrop] = useState('Rice');
    const timeoutRef = useRef(null);

    const fetchWeather = useCallback(async (districtArg, stateArg, cropArg) => {
        const district = districtArg || selectedDistrict;
        const state = stateArg || selectedState;
        const crop = cropArg || selectedCrop;
        
        // Prevent automatic or accidental calls if fields are empty
        if (!district?.trim() || !state?.trim()) return;

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const initialResponse = await weatherAPI.forecast(state, district, crop);
            
            if (initialResponse.task_id) {
                const poll = async () => {
                    try {
                        const statusResp = await weatherAPI.getTaskResult(initialResponse.task_id);
                        if (statusResp.status === 'completed') {
                            console.log('[WeatherDebug] Full result:', JSON.stringify(statusResp.result, null, 2));
                            console.log('[WeatherDebug] spray_advisory:', statusResp.result?.spray_advisory);
                            console.log('[WeatherDebug] irrigation_advisory:', statusResp.result?.irrigation_advisory);
                            console.log('[WeatherDebug] disease_risk_days:', statusResp.result?.disease_risk_days);
                            console.log('[WeatherDebug] crop_alert:', statusResp.result?.crop_alert);
                            setResult(statusResp.result);
                            setLoading(false);
                        } else if (statusResp.status === 'failed') {
                            setError(statusResp.error || 'Weather analysis failed.');
                            setLoading(false);
                        } else {
                            setTimeout(poll, 2000);
                        }
                    } catch {
                        setError('Lost connection to weather server.');
                        setLoading(false);
                    }
                };
                poll();
            } else {
                setResult(initialResponse.result || initialResponse);
                setLoading(false);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch weather forecast.');
            setLoading(false);
        }
    }, [selectedDistrict, selectedState]);

    return {
        loading, result, error,
        selectedDistrict, setSelectedDistrict,
        selectedState, setSelectedState,
        selectedCrop, setSelectedCrop,
        fetchWeather,
    };
}
