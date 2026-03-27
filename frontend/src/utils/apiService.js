// ═══════════════════════════════════════════════════
// RYTHU MITRA — apiService alias
// FarmerHomeScreen and older files import from utils/apiService.
// This file re-exports from services/apiService for compatibility.
// ═══════════════════════════════════════════════════

export {
    default,
    APIError,
    cropAPI,
    marketAPI,
    weatherAPI,
    diseaseAPI,
    statusAPI,
    workersAPI,
    transportAPI,
} from '../services/apiService';

