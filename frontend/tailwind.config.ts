import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        "bg-primary": "#0A0E1A",
        "bg-card": "#111827",
        "bg-card2": "#1a2235",
        "accent-blue": "#4F8EF7",
        "accent-green": "#10B981",
        "accent-gold": "#F7C948",
        "accent-purple": "#7C3AED",
        "accent-orange": "#F59E0B",
        "accent-red": "#EF4444",
        "text-primary": "#F0F4FF",
        "text-muted": "#6B7280",
        "text-soft": "#9CA3AF",
        border: "#1e2d45",
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "14px",
        xl: "20px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.3)",
        lifted: "0 8px 32px rgba(0,0,0,0.5)",
        "glow-blue": "0 0 20px rgba(79,142,247,0.25)",
        "glow-green": "0 0 20px rgba(16,185,129,0.25)",
        "glow-gold": "0 0 20px rgba(247,201,72,0.25)",
        "glow-purple": "0 0 20px rgba(124,58,237,0.25)",
      },
      animation: {
        "bounce-slow": "bounce 2s ease-in-out infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
