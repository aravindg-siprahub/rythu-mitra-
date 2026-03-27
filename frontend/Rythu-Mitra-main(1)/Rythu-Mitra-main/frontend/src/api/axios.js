import axios from 'axios';

// Base URL configuration (auto-switches based on env)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds for heavy AI tasks
});

// Interceptor for Request (Auth token injection)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor for Response (Global Error Handling)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        if (error.response) {
            // Server responded with error status
            console.error('[API Error]', error.response.data);

            // Handle 401 Unauthorized (Token refresh logic could go here)
            if (error.response.status === 401 && !originalRequest._retry) {
                // Redirect to login or refresh token
                // window.location.href = '/login'; 
            }
        } else if (error.request) {
            // No response received (Network error/Offline)
            console.error('[Network Error] Possible offline mode needed');
        } else {
            console.error('[Request Error]', error.message);
        }
        return Promise.reject(error);
    }
);

export const aiService = {
    predictCrop: (data) => api.post('/ai/predict/', { mode: 'crop_recommendation', data }),
    detectDisease: (formData) => api.post('/ai/predict/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' } // let axios set boundary
    }),
    getWeather: (lat, lon) => api.post('/ai/predict/', {
        mode: 'weather_forecast',
        data: { lat, lon, days: 7 }
    }),
    getMarketForecast: (crop, region) => api.post('/ai/predict/', {
        mode: 'market_forecast',
        data: { crop, region, days: 30 }
    }),
    optimizeProfit: (crops, region, acres) => api.post('/ai/predict/', {
        mode: 'profit_optimizer',
        data: { crop_recommendations: crops, region, acres }
    })
};

export default api;
