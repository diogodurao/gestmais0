import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                white: "var(--color-white)",
                pearl: {
                    DEFAULT: "var(--color-pearl)",
                    dark: "var(--color-pearl-dark)",
                },
                gray: {
                    50: "var(--color-gray-50)",
                    100: "var(--color-gray-100)",
                    200: "var(--color-gray-200)",
                    300: "var(--color-gray-300)",
                    400: "var(--color-gray-400)",
                    500: "var(--color-gray-500)",
                    600: "var(--color-gray-600)",
                    700: "var(--color-gray-700)",
                    800: "var(--color-gray-800)",
                    900: "var(--color-gray-900)",
                },
                primary: {
                    DEFAULT: "var(--color-primary)",
                    hover: "var(--color-primary-hover)",
                    light: "var(--color-primary-light)",
                    dark: "var(--color-primary-dark)",
                },
                secondary: {
                    DEFAULT: "var(--color-secondary)",
                    hover: "var(--color-secondary-hover)",
                    light: "var(--color-secondary-light)",
                },
                success: {
                    DEFAULT: "var(--color-success)",
                    light: "var(--color-success-light)",
                },
                warning: {
                    DEFAULT: "var(--color-warning)",
                    light: "var(--color-warning-light)",
                },
                error: {
                    DEFAULT: "var(--color-error)",
                    light: "var(--color-error-light)",
                },
                info: {
                    DEFAULT: "var(--color-info)",
                    light: "var(--color-info-light)",
                }
            },
            borderRadius: {
                sm: "var(--radius-sm)",
                md: "var(--radius-md)",
                lg: "var(--radius-lg)",
            },
            fontSize: {
                label: "var(--text-xs)", // 10px - mapped to label class usage logic
                body: "var(--text-sm)", // 11px
                base: "var(--text-base)", // 12px
                subtitle: "var(--text-lg)", // 13px
                heading: "var(--text-xl)", // 14px
            },
            spacing: {
                0: "var(--space-0)",
                1: "var(--space-1)", // 4px
                1.5: "var(--space-1-5)", // 6px
                2: "var(--space-2)", // 8px
                3: "var(--space-3)", // 12px
                4: "var(--space-4)", // 16px
                5: "var(--space-5)", // 20px
                6: "var(--space-6)", // 24px
                8: "var(--space-8)", // 32px
            },
            boxShadow: {
                sm: "var(--shadow-sm)",
                md: "var(--shadow-md)",
            },
            transitionDuration: {
                fast: "150ms",
                normal: "200ms",
            },
        },
    },
    plugins: [],
};
export default config;
