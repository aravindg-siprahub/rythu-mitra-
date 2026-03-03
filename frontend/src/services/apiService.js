// ═══════════════════════════════════════════════════
// RYTHU MITRA — Central API Service
// All calls go through here. No Supabase client.
// No mock data. Error class included.
// ═══════════════════════════════════════════════════

import { API_ENDPOINTS } from '../config/api';

export class APIError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

const apiCall = async (url, method = 'GET', body = null) => {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
            errorData.detail || errorData.message || 'Request failed',
            response.status,
            errorData
        );
    }
    return response.json();
};

// ─── Crop API ────────────────────────────────────────────────────────────────
export const cropAPI = {
    /**
     * @param {Object} inputs - { N, P, K, temperature, humidity, ph, rainfall }
     * @returns {Promise} API response with recommendations[]
     */
    recommend: (inputs) =>
        apiCall(API_ENDPOINTS.cropRecommend, 'POST', inputs),
};

// ─── Market API ──────────────────────────────────────────────────────────────
export const marketAPI = {
    /**
     * @param {string} crop - e.g. "Rice"
     * @param {string} market - e.g. "Warangal"
     * @param {number} days - 7 or 14
     */
    forecast: (crop, market, days) =>
        apiCall(API_ENDPOINTS.marketForecast, 'POST', {
            crop_name: crop,
            market_name: market,
            forecast_days: days,
        }),
};

// ─── Weather API ─────────────────────────────────────────────────────────────
export const weatherAPI = {
    /**
     * @param {string} district
     * @param {number} lat
     * @param {number} lng
     */
    forecast: (district, lat, lng) =>
        apiCall(API_ENDPOINTS.weatherForecast, 'POST', {
            district,
            latitude: lat,
            longitude: lng,
        }),
};

// ─── Disease API ─────────────────────────────────────────────────────────────
export const diseaseAPI = {
    /**
     * @param {FormData} formData — contains 'image' file
     * @returns {Promise} { status, job_id }
     */
    detect: async (formData) => {
        const response = await fetch(API_ENDPOINTS.diseaseDetect, {
            method: 'POST',
            body: formData, // Do NOT set Content-Type — browser sets multipart boundary
        });
        return response.json();
    },

    /**
     * @param {string} jobId
     * @returns {Promise} { status, result }
     */
    getResult: (jobId) =>
        apiCall(API_ENDPOINTS.diseaseResult(jobId)),
};

// ─── Status API ──────────────────────────────────────────────────────────────
export const statusAPI = {
    check: () => apiCall(API_ENDPOINTS.aiStatus),
};
