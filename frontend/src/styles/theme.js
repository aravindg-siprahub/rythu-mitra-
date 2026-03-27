/**
 * Premium Theme Configuration for Rythu Mitra
 * Provides a centralized color palette and styling tokens.
 */
export const THEME = {
    colors: {
        primary: '#10b981',        // Emerald-500
        primaryLight: '#34d399',   // Emerald-400
        primaryDark: '#059669',    // Emerald-600
        
        secondary: '#f59e0b',      // Amber-500
        
        background: '#f8fafc',      // Slate-50
        surface: '#ffffff',         // White
        
        border: '#e2e8f0',          // Slate-200
        
        textPrimary: '#0f172a',     // Slate-900
        textSecondary: '#475569',   // Slate-600
        textMuted: '#94a3b8',       // Slate-400
        
        riskLow: '#10b981',         // Green
        riskMedium: '#f59e0b',      // Amber
        riskHigh: '#ef4444',        // Red
        riskUncertain: '#64748b',   // Slate-500
        
        accent: '#06b6d4',          // Cyan-500
    },
    seasons: {
        Summer: {
            name: 'Summer',
            months: 'March – May',
            color: '#d97706',
            bgColor: '#FFFBEB',
            icon: '☀️',
            crops: ['Sugarcane', 'Watermelon', 'Groundnut', 'Vegetables'],
        },
        Monsoon: {
            name: 'Monsoon',
            months: 'June – September',
            color: '#2563eb',
            bgColor: '#EFF6FF',
            icon: '🌧️',
            crops: ['Rice', 'Cotton', 'Maize', 'Soybean', 'Turmeric'],
        },
        Winter: {
            name: 'Winter',
            months: 'October – February',
            color: '#16a34a',
            bgColor: '#F0FDF4',
            icon: '❄️',
            crops: ['Wheat', 'Mustard', 'Chickpea', 'Barley', 'Sunflower'],
        },
    },
    getCurrentSeason: () => {
        const month = new Date().getMonth() + 1; // 1-12
        if (month >= 3 && month <= 5) return 'Summer';
        if (month >= 6 && month <= 9) return 'Monsoon';
        return 'Winter';
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
    },
    radius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
    }
};
