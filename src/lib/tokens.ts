/**
 * Design Tokens
 * 
 * Centralized design values for consistent theming across the app.
 * Import these in components or reference in tailwind.config.ts
 */

export const tokens = {
    // ===========================================
    // COLORS
    // ===========================================
    colors: {
        // Primary palette (slate-based)
        primary: {
            50: "#f8fafc",
            100: "#f1f5f9",
            200: "#e2e8f0",
            300: "#cbd5e1",
            400: "#94a3b8",
            500: "#64748b",
            600: "#475569",
            700: "#334155",
            800: "#1e293b",
            900: "#0f172a",
        },
        // Accent (blue)
        accent: {
            50: "#eff6ff",
            100: "#dbeafe",
            200: "#bfdbfe",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
        },
        // Status colors
        status: {
            success: {
                bg: "#dcfce7",
                text: "#15803d",
                border: "#bbf7d0",
            },
            warning: {
                bg: "#fef9c3",
                text: "#a16207",
                border: "#fef08a",
            },
            error: {
                bg: "#fee2e2",
                text: "#dc2626",
                border: "#fecaca",
            },
            info: {
                bg: "#dbeafe",
                text: "#1d4ed8",
                border: "#bfdbfe",
            },
            neutral: {
                bg: "#f1f5f9",
                text: "#475569",
                border: "#e2e8f0",
            },
        },
    },

    // ===========================================
    // TYPOGRAPHY
    // ===========================================
    typography: {
        // Font sizes (matching existing component scale)
        size: {
            "2xs": "8px",
            xs: "9px",
            sm: "10px",
            base: "11px",
            md: "13px",
            lg: "15px",
            xl: "18px",
            "2xl": "24px",
        },
        // Font weights
        weight: {
            normal: "400",
            medium: "500",
            semibold: "600",
            bold: "700",
        },
        // Letter spacing
        tracking: {
            tighter: "-0.02em",
            tight: "-0.01em",
            normal: "0",
            wide: "0.05em",
            wider: "0.1em",
            widest: "0.15em",
        },
    },

    // ===========================================
    // SPACING
    // ===========================================
    spacing: {
        px: "1px",
        0.5: "2px",
        1: "4px",
        1.5: "6px",
        2: "8px",
        2.5: "10px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
    },

    // ===========================================
    // COMPONENT SIZES
    // ===========================================
    componentHeight: {
        xs: "24px",  // h-6
        sm: "28px",  // h-7
        md: "36px",  // h-9
        lg: "44px",  // h-11
    },

    // ===========================================
    // BORDERS
    // ===========================================
    border: {
        radius: {
            none: "0",
            sm: "2px",
            md: "4px",
            lg: "8px",
            full: "9999px",
        },
        width: {
            default: "1px",
            thick: "2px",
            heavy: "3px",
        },
    },

    // ===========================================
    // SHADOWS
    // ===========================================
    shadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    },

    // ===========================================
    // TRANSITIONS
    // ===========================================
    transition: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
    },
} as const

// Type exports for TypeScript usage
export type StatusType = keyof typeof tokens.colors.status
export type ComponentSize = "xs" | "sm" | "md" | "lg"