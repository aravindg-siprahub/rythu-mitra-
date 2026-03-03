/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            fontFamily: {
                display: ['Playfair Display', 'serif'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'], // For data/code
            },
            colors: {
                // Enterprise Neo-Dark Palette
                neo: {
                    bg: "#030712",       // Deepest localized black (gray-950)
                    panel: "rgba(17, 24, 39, 0.7)", // Glass panel (gray-900)
                    border: "rgba(31, 41, 55, 0.5)", // Subtle border
                    text: "#f8fafc",     // Primary text (slate-50)
                    muted: "#94a3b8",    // Muted text (slate-400)
                },
                brand: {
                    primary: "#2563eb",  // Core Action Blue
                    secondary: "#7c3aed", // AI Purple
                    accent: "#db2777",   // Alert Pink
                    success: "#059669",  // Ag-Green
                },
                status: {
                    online: "#10b981",    // Green-500
                    warning: "#f59e0b",   // Amber-500
                    critical: "#ef4444",  // Red-500
                    offline: "#64748b",   // Slate-500
                },
                // Lovable Landing Variables
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                sky: "hsl(var(--sky))",
                "green-light": "hsl(var(--green-light))",
                "green-dark": "hsl(var(--green-dark))",
                "footer-bg": "hsl(var(--footer-bg))",
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    ring: "hsl(var(--sidebar-ring))",
                },
            },
            backgroundImage: {
                'neo-gradient': 'linear-gradient(to right, #2563eb, #db2777, #7c3aed)', // Blue -> Pink -> Purple
                'glass-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.0) 100%)',
                'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231e293b' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
            },
            boxShadow: {
                'neo-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'neo-glow': '0 0 15px rgba(37, 99, 235, 0.3)', // Blue glow
                'alert-glow': '0 0 15px rgba(239, 68, 68, 0.4)', // Red glow
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                "2xl": "20px",
                xl: "12px",
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(37, 99, 235, 0.2)' },
                    '100%': { boxShadow: '0 0 20px rgba(37, 99, 235, 0.6)' },
                },
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            }
        },
    },
    plugins: [require("tailwindcss-animate")],
}
