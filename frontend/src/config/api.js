// ═══════════════════════════════════════════════════
// RYTHU MITRA — API Endpoint Configuration
// Base URL from env var or defaults to localhost.
// No mock data. All values come from Django REST.
// ═══════════════════════════════════════════════════

const API_BASE =
    process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
    cropRecommend: `${API_BASE}/api/v1/ai/crop-recommend/`,
    diseaseDetect: `${API_BASE}/api/v1/ai/disease-detect/`,
    diseaseResult: (jobId) =>
        `${API_BASE}/api/v1/ai/disease-result/${jobId}/`,
    marketForecast: `${API_BASE}/api/v1/ai/market-forecast/`,
    weatherForecast: `${API_BASE}/api/v1/ai/weather-forecast/`,
    aiStatus: `${API_BASE}/api/v1/ai/status/`,
};

export default API_ENDPOINTS;
