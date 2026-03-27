import React, { useState, useCallback, useEffect } from 'react';
import { cropAPI, APIError } from '../../../services/apiService';
import { getSavedLocation } from '../../../utils/locationService';
import { fetchOpenWeather } from '../../../utils/openWeather';
const ANDHRA_TELANGANA_DEFAULTS = {
  default: {
    nitrogen: 85, phosphorus: 45, potassium: 40,
    ph: 6.5, rainfall: 800,
    description: 'Average values for Andhra Pradesh & Telangana'
  },
  coastal_andhra: {
    nitrogen: 90, phosphorus: 40, potassium: 35,
    ph: 6.2, rainfall: 1100,
    description: 'Coastal Andhra Pradesh (Krishna, Godavari delta)'
  },
  rayalaseema: {
    nitrogen: 70, phosphorus: 35, potassium: 30,
    ph: 7.2, rainfall: 550,
    description: 'Rayalaseema region (dry, low rainfall)'
  },
  telangana: {
    nitrogen: 85, phosphorus: 42, potassium: 38,
    ph: 6.8, rainfall: 750,
    description: 'Telangana region (red & black cotton soil)'
  },
  karnataka: {
    nitrogen: 80, phosphorus: 40, potassium: 45,
    ph: 6.5, rainfall: 850,
    description: 'Karnataka region'
  },
};
function getRegionDefaults(locationState, locationDistrict, 
                           locationCity) {
  const state = (locationState    || '').toLowerCase();
  const dist  = (locationDistrict || '').toLowerCase();
  const city  = (locationCity     || '').toLowerCase();
  // Bengaluru specific
  if (city.includes('bengaluru') || 
      city.includes('bangalore')  ||
      dist.includes('bengaluru')) {
    return {
      nitrogen: 75, phosphorus: 38, potassium: 42,
      ph: 6.3, rainfall: 900,
      description: 'Bengaluru Urban/Rural region'
    };
  }
  // Rest of Karnataka
  if (state.includes('karnataka')) {
    return ANDHRA_TELANGANA_DEFAULTS.karnataka;
  }
  // Rayalaseema
  if (dist.includes('kurnool')    || 
      dist.includes('kadapa')     || 
      dist.includes('anantapur')  || 
      dist.includes('chittoor')) {
    return ANDHRA_TELANGANA_DEFAULTS.rayalaseema;
  }
  // Coastal Andhra
  if (dist.includes('krishna')        || 
      dist.includes('guntur')         || 
      dist.includes('east godavari')  || 
      dist.includes('west godavari')) {
    return ANDHRA_TELANGANA_DEFAULTS.coastal_andhra;
  }
  // Telangana
  if (state.includes('telangana')) {
    return ANDHRA_TELANGANA_DEFAULTS.telangana;
  }
  return ANDHRA_TELANGANA_DEFAULTS.default;
}
// District defaults for Telangana
const DISTRICT_DEFAULTS = {
    Warangal: { N: 80, P: 40, K: 40, temperature: 28, humidity: 70, ph: 6.5, rainfall: 900 },
    Karimnagar: { N: 75, P: 38, K: 42, temperature: 29, humidity: 68, ph: 6.8, rainfall: 850 },
    Nizamabad: { N: 85, P: 45, K: 38, temperature: 27, humidity: 72, ph: 6.3, rainfall: 950 },
    Khammam: { N: 90, P: 50, K: 45, temperature: 28, humidity: 75, ph: 6.2, rainfall: 1000 },
    Nalgonda: { N: 70, P: 35, K: 35, temperature: 30, humidity: 65, ph: 7.0, rainfall: 750 },
};
const INITIAL_FORM = { N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: '' };
export const FIELD_LIMITS = {
  N:           { min: 0,   max: 140,  unit: 'kg/ha',  label: 'Nitrogen'     },
  P:           { min: 0,   max: 145,  unit: 'kg/ha',  label: 'Phosphorus'   },
  K:           { min: 0,   max: 205,  unit: 'kg/ha',  label: 'Potassium'    },
  temperature: { min: 8,   max: 44,   unit: '°C',     label: 'Temperature'  },
  humidity:    { min: 14,  max: 100,  unit: '%',      label: 'Humidity'     },
  ph:          { min: 3.5, max: 9.5,  unit: '',       label: 'Soil pH'      },
  rainfall:    { min: 20,  max: 3000, unit: 'mm',     label: 'Rainfall'     },
};
/**
 * useCropRecommendation hook — replaces ALL mock data with real API calls.
 */
export function useCropRecommendation() {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [weatherPrefilled, setWeatherPrefilled] = useState(false);
    // Auto-detect season based on current month
    const currentMonth = new Date().getMonth() + 1;
    let initialSeason = 'Summer';
    if (currentMonth >= 6 && currentMonth <= 9) {
        initialSeason = 'Monsoon';
    } else if (currentMonth >= 10 || currentMonth <= 2) {
        initialSeason = 'Winter';
    }
    const [selectedSeason, setSelectedSeason] = useState(initialSeason);
    const [fieldErrors, setFieldErrors] = useState({});
    const [defaultsApplied, setDefaultsApplied] = useState(false);
    const [defaultsDescription, setDefaultsDescription] = useState('');
    const updateField = useCallback((field, value) => {
        const limit = FIELD_LIMITS[field];
        if (limit && value !== '') {
            const num = parseFloat(value);
            if (!isNaN(num) && num > limit.max) {
                setFieldErrors(prev => ({
                    ...prev,
                    [field]: `Max ${limit.max} ${limit.unit}`
                }));
                return; // Block the update
            }
            if (!isNaN(num) && num < limit.min) {
                setFieldErrors(prev => ({
                    ...prev,
                    [field]: `Min ${limit.min} ${limit.unit}`
                }));
                return; // Block the update
            }
            // Valid value — clear error
            setFieldErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, [fieldErrors]);
    const fillDistrict = useCallback((districtName) => {
        const defaults = DISTRICT_DEFAULTS[districtName];
        if (defaults) setFormData(defaults);
    }, []);
    useEffect(() => {
        async function prefillWeatherData() {
            const savedLocation = getSavedLocation();
            if (!savedLocation?.lat || !savedLocation?.lon) return;
            try {
                const weather = await fetchOpenWeather(
                    savedLocation.lat,
                    savedLocation.lon
                );
                if (!weather) return;
                if (weather.temperature != null) {
                    updateField('temperature', Math.round(weather.temperature));
                }
                if (weather.humidity != null) {
                    updateField('humidity', Math.round(weather.humidity));
                }
                if (weather.rainfall != null && weather.rainfall > 0) {
                    updateField('rainfall', Math.round(weather.rainfall));
                }
                setWeatherPrefilled(true);
            } catch (err) {
                console.error('Weather prefill failed:', err);
                // Silent fail — farmer can still fill manually
            }
        }
        prefillWeatherData();
    }, [updateField]);
    const recommend = useCallback(async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        setFieldErrors({});
        try {
            const SEASON_MAP = {
                Summer:  { agricultural: ['Zaid', 'Rabi'],   months: 'Mar–May' },
                Monsoon: { agricultural: ['Kharif'],          months: 'Jun–Sep' },
                Winter:  { agricultural: ['Rabi'],            months: 'Oct–Feb' },
            };
            const payload = {
                nitrogen: parseFloat(formData.N || 85),
                phosphorus: parseFloat(formData.P || 45),
                potassium: parseFloat(formData.K || 40),
                temperature: parseFloat(formData.temperature || 25),
                humidity: parseFloat(formData.humidity || 70),
                soil_ph: parseFloat(formData.ph || 6.5),
                annual_rainfall: parseFloat(formData.rainfall || 800),
                season: selectedSeason,
                agricultural_season: SEASON_MAP[selectedSeason]?.agricultural || [],
            };
            const initialResponse = await cropAPI.recommend(payload);
            
            // ─── Case 1: Task ID returned (Async Flow) ───────────────────────
            if (initialResponse.task_id) {
                console.log(`[useCropPrediction] Polling task: ${initialResponse.task_id}`);
                const poll = async () => {
                    try {
                        const statusResp = await cropAPI.getTaskResult(initialResponse.task_id);
                        if (statusResp.status === 'completed') {
                            setResult(statusResp.result);
                            setLoading(false);
                        } else if (statusResp.status === 'failed') {
                            setError(statusResp.error || 'Prediction task failed.');
                            setLoading(false);
                        } else {
                            // Still pending, poll again in 2s
                            setTimeout(poll, 2000);
                        }
                    } catch (pollErr) {
                        setError('Lost connection to task worker.');
                        setLoading(false);
                    }
                };
                poll();
            } 
            // ─── Case 2: Immediate result (Sync Fallback) ────────────────────
            else {
                setResult(initialResponse.result || initialResponse);
                setLoading(false);
            }
        } catch (err) {
            setLoading(false);
            if (err instanceof APIError) {
                if (err.status === 422) {
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
        }
    }, [formData, selectedSeason]);
    const applyRegionalDefaults = useCallback(() => {
        const saved    = getSavedLocation();
        const defaults = getRegionDefaults(
            saved?.state,
            saved?.district,
            saved?.city || saved?.locality
        );
        // Note: form fields use N, P, K instead of full nutrient names
        updateField('N',           defaults.nitrogen);
        updateField('P',           defaults.phosphorus);
        updateField('K',           defaults.potassium);
        updateField('ph',          defaults.ph);
        updateField('rainfall',    defaults.rainfall);
        setDefaultsApplied(true);
        setDefaultsDescription(defaults.description);
    }, [updateField]);
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
        selectedSeason,
        setSelectedSeason,
        weatherPrefilled,
        applyRegionalDefaults,
        defaultsApplied,
        defaultsDescription,
    };
}
