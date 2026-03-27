import axios from "axios";

// ═══════════════════════════════════════════════════
// RYTHU MITRA — API Endpoint Configuration
// Central place for all backend API endpoint paths.
// ═══════════════════════════════════════════════════

const rawBase = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
const trimmedBase = rawBase.replace(/\/$/, "");
const API_V1 = trimmedBase.endsWith("/api/v1") ? trimmedBase : `${trimmedBase}/api/v1`;

const api = axios.create({
    baseURL: API_V1,
    timeout: 15000, // 15 seconds timeout
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor to add Bearer Token for backend authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token && token.trim() !== "" && token !== "undefined" && token !== "null") {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Simple interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

/**
 * RYTHU MITRA — Core Services
 */

export const authService = {
    login: async (email, password) => {
        const response = await api.post("/auth/login/", { email, password });
        if (response.data && response.data.access) {
            localStorage.setItem("token", response.data.access);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            return response.data;
        }
        return response.data;
    },
    signup: async (userData) => {
        const response = await api.post("/auth/register/", userData);
        return response.data;
    },
    getCurrentUser: async () => {
        const userStr = localStorage.getItem("user");
        if (userStr) return JSON.parse(userStr);
        return null;
    },
    logout: () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    },
};

export default api;
