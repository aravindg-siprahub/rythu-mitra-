import apiClient from './api';

/**
 * AI Service - All AI-related API calls
 */

export const aiService = {
    // ============================================
    // CROP RECOMMENDATION
    // ============================================
    getCropRecommendation: async (soilData, landSizeAcres = 1.0) => {
        try {
            const response = await apiClient.post('/ai/crop/recommend/', {
                soil: soilData,
                land_size_acres: landSizeAcres,
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ============================================
    // DISEASE DETECTION
    // ============================================
    detectDisease: async (imageFile) => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await apiClient.post('/ai/disease/detect/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ============================================
    // WEATHER FORECAST
    // ============================================
    getWeatherForecast: async (location, days = 7) => {
        try {
            const response = await apiClient.post('/ai/weather/forecast/', {
                location,
                days,
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ============================================
    // MARKET PREDICTION
    // ============================================
    getMarketPrediction: async (crop, region, quantityKg = 1000, days = 15) => {
        try {
            const response = await apiClient.post('/ai/market/predict/', {
                crop,
                region,
                quantity_kg: quantityKg,
                days,
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ============================================
    // PROFIT MAXIMIZATION
    // ============================================
    maximizeProfit: async (farmerData) => {
        try {
            const response = await apiClient.post('/ai/profit/maximize/', farmerData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ============================================
    // UNIFIED INSIGHTS (Dashboard)
    // ============================================
    getUnifiedInsights: async (farmerData) => {
        try {
            const response = await apiClient.post('/ai/insights/', farmerData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ============================================
    // MODEL METRICS
    // ============================================
    getModelMetrics: async () => {
        try {
            const response = await apiClient.get('/ai/metrics/');
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ============================================
    // HEALTH CHECK
    // ============================================
    healthCheck: async () => {
        try {
            const response = await apiClient.get('/ai/health/');
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ============================================
    // TEST CONNECTION
    // ============================================
    testConnection: async () => {
        try {
            const response = await apiClient.get('/ai/test/');
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default aiService;
