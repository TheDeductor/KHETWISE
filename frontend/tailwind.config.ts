import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Geist Mono", "Courier New", "monospace"],
      },
      colors: {
        // Warm backgrounds
        bg:           "#FFFBF5",
        surface:      "#FFF7ED",
        "surface-2":  "#FEF3C7",

        // Borders
        border:       "#E8DDD0",
        "border-strong": "#D4C5B5",

        // Text
        "text-primary":   "#1C1917",
        "text-secondary": "#78716C",
        "text-muted":     "#A8A29E",

        // Accent — amber
        accent:         "#D97706",
        "accent-hover": "#B45309",
        "accent-light": "#FEF3C7",

        // Semantic
        success:       "#15803D",
        "success-bg":  "#F0FDF4",
        warning:       "#EA580C",
        "warning-bg":  "#FFF7ED",
        danger:        "#DC2626",
        "danger-bg":   "#FEF2F2",
      },
      borderRadius: {
        sm:   "6px",
        DEFAULT: "12px",
        lg:   "16px",
        xl:   "20px",
        full: "999px",
      },
      boxShadow: {
        xs:     "0 1px 2px rgba(28,25,23,0.06)",
        sm:     "0 1px 4px rgba(28,25,23,0.08), 0 0 0 1px rgba(28,25,23,0.04)",
        md:     "0 4px 12px rgba(28,25,23,0.10), 0 1px 3px rgba(28,25,23,0.06)",
        lg:     "0 8px 24px rgba(28,25,23,0.12), 0 2px 6px rgba(28,25,23,0.06)",
        accent: "0 4px 14px rgba(217,119,6,0.30)",
      },
      keyframes: {
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "pulse-ring": {
          "0%":   { transform: "scale(1)",   opacity: "0.8" },
          "70%":  { transform: "scale(1.8)", opacity: "0" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        shimmer: {
          from: { backgroundPosition: "-400px 0" },
          to:   { backgroundPosition:  "400px 0" },
        },
      },
      animation: {
        "slide-up":   "slide-up 0.35s cubic-bezier(0.34,1.4,0.64,1) both",
        "fade-in":    "fade-in 0.25s ease both",
        "pulse-ring": "pulse-ring 1.4s cubic-bezier(0.215,0.61,0.355,1) infinite",
        shimmer:      "shimmer 1.5s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
