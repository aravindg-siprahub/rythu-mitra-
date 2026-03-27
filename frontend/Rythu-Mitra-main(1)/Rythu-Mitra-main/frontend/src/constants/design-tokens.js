export const COLORS = {
    // Deep Space (Backgrounds)
    background: {
        primary: "#030712",   // Ultra dark blue/black
        secondary: "#0f172a", // Slate 900
        card: "rgba(15, 23, 42, 0.6)", // Glass card
        cardHover: "rgba(30, 41, 59, 0.8)",
    },

    // Brand Accents
    brand: {
        primary: "#3b82f6",   // Azure Blue
        secondary: "#10b981", // Emerald Green
        accent: "#8b5cf6",    // Violet
        warning: "#f59e0b",   // Amber
        error: "#ef4444",     // Red
    },

    // Text
    text: {
        primary: "#f8fafc",   // Slate 50
        secondary: "#94a3b8", // Slate 400
        muted: "#64748b",     // Slate 500
    },

    // Borders
    border: {
        subtle: "rgba(148, 163, 184, 0.1)",
        process: "rgba(59, 130, 246, 0.5)",
    }
};

export const GRADIENTS = {
    primary: "linear-gradient(135deg, #0f172a 0%, #020617 100%)",
    glass: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
    accent: "linear-gradient(to right, #3b82f6, #8b5cf6)",
};

export const SHADOWS = {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    glow: "0 0 20px rgba(59, 130, 246, 0.5)",
};

export const EFFECTS = {
    glass: {
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        backgroundColor: COLORS.background.card,
        border: `1px solid ${COLORS.border.subtle}`,
    }
};
