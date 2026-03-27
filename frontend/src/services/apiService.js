// ═══════════════════════════════════════════════════
// RYTHU MITRA — Central API Service
// All calls go through here. No Supabase client.
// No mock data. Error class included.
// ═══════════════════════════════════════════════════

import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const rawBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const trimmedBase = rawBase.replace(/\/$/, '');
const API_BASE = trimmedBase.endsWith('/api/v1') ? trimmedBase : `${trimmedBase}/api/v1`;

export class APIError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE,
});

// ─── Request interceptor: Attach JWT ─────────────────────────────────────────
// AuthContext stores the token as 'rythu_token' in localStorage
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('rythu_token');
        if (token) {
            console.log(`[services/apiService] Attached token to ${config.url}:`, token.substring(0, 15) + '...');
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            console.warn(`[services/apiService] No token found for ${config.url}`);
        }
        // Don't set Content-Type if payload is FormData — browser sets multipart boundary
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response interceptor: Handle 401 + refresh token ────────────────────────
axiosInstance.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const status = error.response ? error.response.status : null;
        const originalRequest = error.config;
        console.error('[services/apiService] API Error:', status, originalRequest?.url);

        // Bypass interceptor for login and refresh endpoints
        if (originalRequest?.url?.includes('/auth/login') ||
            originalRequest?.url?.includes('/auth/token/refresh')) {
            return Promise.reject(error);
        }

        if (status === 401 && !originalRequest._retry) {
            console.warn('[services/apiService] 401 Unauthorized captured');
            originalRequest._retry = true;
            
            const refresh = localStorage.getItem('rythu_refresh');
            if (refresh) {
                console.log('[services/apiService] Attempting refresh...');
                try {
                    // Use a clean axios instance to avoid interceptor loops
                    const res = await axios.post(
                        `${API_BASE}/auth/token/refresh/`,
                        { refresh }
                    );
                    const newAccess = res.data?.access || res.data?.token || res.data?.data?.access;
                    if (newAccess) {
                        console.log('[services/apiService] Refresh successful');
                        localStorage.setItem('rythu_token', newAccess);
                        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
                        return axiosInstance(originalRequest);
                    }
                } catch (refreshErr) {
                    console.error('[services/apiService] Refresh failed:', refreshErr);
                    // Clear and redirect
                    localStorage.removeItem('rythu_token');
                    localStorage.removeItem('rythu_refresh');
                    localStorage.removeItem('rythu_user');
                    window.location.href = '/login';
                    return Promise.reject(refreshErr);
                }
            }
            
            // No refresh token available, or refresh didn't return a token
            console.warn('[services/apiService] No refresh token - clearing and redirecting');
            localStorage.removeItem('rythu_token');
            localStorage.removeItem('rythu_refresh');
            localStorage.removeItem('rythu_user');
            window.location.href = '/login';
        }

        const data = error.response ? error.response.data : {};
        const message = data.detail || data.message || error.message || 'Request failed';
        return Promise.reject(new APIError(message, status, data));
    }
);


// ─── Crop API ────────────────────────────────────────────────────────────────
export const cropAPI = {
    /**
     * @param {Object} inputs - { N, P, K, temperature, humidity, ph, rainfall }
     * @returns {Promise} API response with recommendations[]
     */
    recommend: (inputs) =>
        axiosInstance.post(API_ENDPOINTS.cropRecommend, inputs),

    /**
     * @param {string} taskId
     * @returns {Promise} { status: "pending"|"completed"|"failed", result: {...} }
     */
    getTaskResult: (taskId) =>
        axiosInstance.get(API_ENDPOINTS.taskStatus(taskId)),
};

// ─── Market API ──────────────────────────────────────────────────────────────
export const marketAPI = {
    /**
     * @param {string} crop - e.g. "Rice"
     * @param {string} market - e.g. "Warangal"
     * @param {number} days - 7 or 14
     */
    forecast: (crop, market, days) =>
        axiosInstance.post(API_ENDPOINTS.marketForecast, {
            crop,          // matching the modified payload format request structure
            state: "Unknown",
            district: market,
            quantity_kg: 1000,
            forecast_days: days,
            harvest_date: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }),

    getTaskResult: (taskId) =>
        axiosInstance.get(API_ENDPOINTS.taskStatus(taskId)),
};

// ─── Weather API ─────────────────────────────────────────────────────────────
export const weatherAPI = {
    /**
     * @param {string} district
     * @param {number} lat
     * @param {number} lng
     */
    forecast: (state, district, crop) =>
        axiosInstance.post(API_ENDPOINTS.weatherForecast, {
            state,
            district,
            crop
        }),

    getTaskResult: (taskId) =>
        axiosInstance.get(API_ENDPOINTS.taskStatus(taskId)),
};

// ─── Disease API ─────────────────────────────────────────────────────────────
export const diseaseAPI = {
    /**
     * @param {FormData} formData — contains 'image' file and text properties
     * @returns {Promise} { status, job_id }
     */
    detect: (formData) =>
        axiosInstance.post(API_ENDPOINTS.diseaseDetect, formData),

    /**
     * @param {string} jobId
     * @returns {Promise} { status, result }
     */
    getResult: (jobId) =>
        axiosInstance.get(API_ENDPOINTS.diseaseResult(jobId)),
};

// ─── Status API ──────────────────────────────────────────────────────────────
export const statusAPI = {
    check: () => axiosInstance.get(API_ENDPOINTS.aiStatus),
};

// ─── Workers API ─────────────────────────────────────────────────────────────
export const workersAPI = {
    /**
     * Search for available workers
     * @param {Object} params - { district, task_type, date, workers_needed }
     */
    search: (params) => {
        return axiosInstance.get(API_ENDPOINTS.workers, { params });
    },

    /**
     * Book a worker
     * @param {Object} body - { task_type, date, district, workers_needed, duration, requirements }
     */
    book: (body) => {
        return axiosInstance.post(API_ENDPOINTS.workerBook, body);
    },
};

// ─── Transport API ────────────────────────────────────────────────────────────
export const transportAPI = {
    /**
     * Search for available transport vehicles
     * @param {Object} params - { origin, destination, vehicle_type, date }
     */
    search: (params) => {
        return axiosInstance.get(API_ENDPOINTS.transport, { params });
    },

    /**
     * Book transport
     * @param {Object} body - { origin, destination, load_type, weight_kg, date, vehicle_type }
     */
    book: (body) => {
        return axiosInstance.post(API_ENDPOINTS.transportBook, body);
    },
};

// ─── Default export: raw axios instance ─────────────────────────────────────
// Used by components that do: import api from '../utils/apiService'
// and call api.get('/ai/advisories/') etc.
export default axiosInstance;
