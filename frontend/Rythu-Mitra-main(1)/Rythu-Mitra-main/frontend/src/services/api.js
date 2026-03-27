import axios from 'axios';

// Environment-aware Base URL
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create Axios Instance
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15s timeout
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Retry Logic (2 Retries)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error;

        // Retry logic for network errors or 5xx server errors
        if (!config || !config.retry) {
            config.retry = 0;
        }

        // Retry limit: 2
        if (config.retry < 2 && (!response || response.status >= 500)) {
            config.retry += 1;
            console.log(`[API Retry] Attempt ${config.retry} for ${config.url}`);

            // Exponential backoff delay
            const delay = config.retry * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));

            return apiClient(config);
        }

        return Promise.reject(error);
    }
);

// API Service Methods
const apiService = {
    // AI Predictions
    getCropRecommendation: (data) =>
        apiClient.post('/ai/predict/', { mode: 'crop_recommendation', data }),

    uploadDiseaseImage: (formData) =>
        apiClient.post('/ai/predict/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    getWeatherPrediction: (lat, lon) =>
        apiClient.post('/ai/predict/', { mode: 'weather_forecast', data: { lat, lon } }),

    getMarketForecast: (crop, region) =>
        apiClient.post('/ai/predict/', { mode: 'market_forecast', data: { crop, region } }),

    // Operational Endpoints
    getWorkerAvailability: (region) =>
        apiClient.get(`/workers/availability/?region=${region}`),

    getTransportStatus: (bookingId) =>
        apiClient.get(`/transport/status/${bookingId}/`),

    // User Management
    registerFarmer: (userData) =>
        apiClient.post('/farmers/register/', userData),

    login: (credentials) =>
        apiClient.post('/auth/login/', credentials),
};

export default apiService;
