// ═══════════════════════════════════════════════════
// RYTHU MITRA — API Endpoint Configuration
// Central place for all backend API endpoint paths.
// ═══════════════════════════════════════════════════

const rawBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const trimmedBase = rawBase.replace(/\/$/, '');
const API_BASE = trimmedBase.endsWith('/api/v1') ? trimmedBase : `${trimmedBase}/api/v1`;

export const API_ENDPOINTS = {
    // ── Auth ──────────────────────────────────────────
    login:           '/auth/login/',
    register:        '/auth/register/',
    logout:          '/auth/logout/',
    tokenRefresh:    '/auth/token/refresh/',
    profile:         '/auth/profile/',

    // ── Crop AI (Django: /api/v1/ai/crop-recommend/) ─────────────────────────
    cropRecommend:   '/ai/crop-recommend/',

    // ── Disease Detection (Django: /api/v1/ai/disease-detect/) ──────────────
    diseaseDetect:   '/ai/disease-detect/',
    diseaseResult:   (jobId) => `/ai/disease-result/${jobId}/`,

    // ── Market / Prices (Django: /api/v1/ai/market-predict/) ────────────────
    marketForecast:  '/ai/market-predict/',
    mandiPrices:     '/market/prices/',
    mandiPrice:      '/market/mandi-price/',   // live api.data.gov.in via backend


    // ── Weather (Django: /api/v1/ai/weather-forecast/) ──────────────────────
    weatherForecast: '/ai/weather-forecast/',

    // ── AI Advisories ─────────────────────────────────
    advisories:      '/ai/advisories/',
    aiStatus:        '/ai/status/',

    // ── Workers / Labour ─────────────────────────────
    workers:         '/workers/',
    workerBook:      '/workers/book/',

    // ── Transport ─────────────────────────────────────
    transport:       '/transport/',
    transportBook:   '/transport/book/',

    // ── Governance / Schemes ─────────────────────────
    schemes:         '/governance/schemes/',
    schemeApply:     '/governance/apply/',

    // ── Task Polling (Django: /api/v1/ai/task/<id>/) ────────────────────────
    taskStatus:      (taskId) => `/ai/task/${taskId}/`,

    // ── Farmers ──────────────────────────────────────
    farmersRecent:   '/farmers/recent/',
};

export default API_ENDPOINTS;
