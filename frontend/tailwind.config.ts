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
        sans: ["Geist", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Geist Mono", "Courier New", "monospace"],
      },
      colors: {
        accent:       "#FF5722",
        "accent-hover": "#E64A19",
        "accent-light": "#FFF3F0",
        surface:      "#FAFAFA",
        border:       "#E5E5E5",
        "border-strong": "#D4D4D4",
        "text-primary":   "#0A0A0A",
        "text-secondary": "#737373",
        "text-muted":     "#A3A3A3",
      },
      borderRadius: {
        card: "8px",
        btn:  "6px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
