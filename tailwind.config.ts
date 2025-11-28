import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            animation: {
                "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
                "spin-slow": "spin 3s linear infinite",
                "scan": "scan 2s ease-in-out infinite",
            },
            keyframes: {
                "border-beam": {
                    "100%": {
                        "offset-distance": "100%",
                    },
                },
                "scan": {
                    "0%, 100%": { top: "0%" },
                    "50%": { top: "100%" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
