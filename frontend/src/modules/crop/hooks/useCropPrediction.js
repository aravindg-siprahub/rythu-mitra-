import React, { useState, useCallback } from 'react';
import { cropAPI, APIError } from '../../../services/apiService';

// District defaults for Telangana
const DISTRICT_DEFAULTS = {
    Warangal: { N: 80, P: 40, K: 40, temperature: 28, humidity: 70, ph: 6.5, rainfall: 900 },
    Karimnagar: { N: 75, P: 38, K: 42, temperature: 29, humidity: 68, ph: 6.8, rainfall: 850 },
    Nizamabad: { N: 85, P: 45, K: 38, temperature: 27, humidity: 72, ph: 6.3, rainfall: 950 },
    Khammam: { N: 90, P: 50, K: 45, temperature: 28, humidity: 75, ph: 6.2, rainfall: 1000 },
    Nalgonda: { N: 70, P: 35, K: 35, temperature: 30, humidity: 65, ph: 7.0, rainfall: 750 },
};

const INITIAL_FORM = { N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: '' };

/**
 * useCropRecommendation hook — replaces ALL mock data with real API calls.
 */
export function useCropRecommendation() {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const updateField = useCallback((field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear field-level error when user retypes
        if (fieldErrors[field]) {
            setFieldErrors((prev) => { const copy = { ...prev }; delete copy[field]; return copy; });
        }
    }, [fieldErrors]);

    const fillDistrict = useCallback((districtName) => {
        const defaults = DISTRICT_DEFAULTS[districtName];
        if (defaults) setFormData(defaults);
    }, []);

    const recommend = useCallback(async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        setFieldErrors({});

        try {
            const payload = {
                N: parseFloat(formData.N),
                P: parseFloat(formData.P),
                K: parseFloat(formData.K),
                temperature: parseFloat(formData.temperature),
                humidity: parseFloat(formData.humidity),
                ph: parseFloat(formData.ph),
                rainfall: parseFloat(formData.rainfall),
            };
            const data = await cropAPI.recommend(payload);
            setResult(data);
        } catch (err) {
            if (err instanceof APIError) {
                if (err.status === 422) {
                    // Field-level validation error from Django
                    const errors = err.data?.errors || {};
                    setFieldErrors(errors);
                    setError('Please check the highlighted fields above.');
                } else if (err.status === 503) {
                    setError('System is warming up. Please wait 30 seconds and try again.');
                } else {
                    setError(err.message || 'Something went wrong. Please try again.');
                }
            } else {
                setError('Check your internet connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [formData]);

    return {
        formData,
        updateField,
        fillDistrict,
        recommend,
        loading,
        result,
        error,
        fieldErrors,
        districtNames: Object.keys(DISTRICT_DEFAULTS),
    };
}
