// ═══════════════════════════════════════════════════
// RYTHU MITRA — Agriculture Design System Tokens
// Light theme only. No dark mode.
// ═══════════════════════════════════════════════════

export const THEME = {
    colors: {
        // Primary agriculture greens
        primary: '#2D6A4F',
        primaryLight: '#52B788',
        primaryXLight: '#D8F3DC',

        // Season colors
        kharif: '#2D6A4F',
        rabi: '#F4A261',
        zaid: '#E76F51',

        // Soil health indicators
        soilPoor: '#D62828',
        soilFair: '#F4A261',
        soilGood: '#52B788',
        soilExcellent: '#2D6A4F',

        // Risk levels — consistent across all modules
        riskLow: '#52B788',
        riskMedium: '#F4A261',
        riskHigh: '#D62828',
        riskUncertain: '#6C757D',

        // UI neutrals
        background: '#F8FAF8',
        surface: '#FFFFFF',
        border: '#C7E8CA',
        textPrimary: '#1B2E1E',
        textSecondary: '#4A6741',
        textMuted: '#8FAF8F',
    },

    /** Returns 'kharif' | 'rabi' | 'zaid' based on current month */
    getCurrentSeason: () => {
        const month = new Date().getMonth() + 1; // 1-12
        if (month >= 6 && month <= 9) return 'kharif';
        if (month >= 10 || month <= 2) return 'rabi';
        return 'zaid';
    },

    seasons: {
        kharif: {
            name: 'Kharif Season',
            months: 'June – September',
            color: '#2D6A4F',
            bgColor: '#D8F3DC',
            icon: '🌧️',
            crops: ['Rice', 'Cotton', 'Maize'],
        },
        rabi: {
            name: 'Rabi Season',
            months: 'October – February',
            color: '#B5451B',
            bgColor: '#FEF0E7',
            icon: '☀️',
            crops: ['Wheat', 'Wheat', 'Potato'],
        },
        zaid: {
            name: 'Zaid Season',
            months: 'March – May',
            color: '#E76F51',
            bgColor: '#FDE8E0',
            icon: '🌤️',
            crops: ['Sugarcane', 'Vegetables', 'Groundnut'],
        },
    },
};
