/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0084ff",
          glow: "rgba(0, 132, 255, 0.2)",
        },
        bg: {
          deep: "#050505",
          card: "rgba(18, 18, 22, 0.7)",
          accent: "rgba(255, 255, 255, 0.03)",
        },
        text: {
          main: "#ffffff",
          dim: "#a1a1aa",
        },
        border: "rgba(255, 255, 255, 0.08)",
        glass: "rgba(18, 18, 22, 0.85)",
        accent: {
          hover: "#00d1ff",
          DEFAULT: "#0084ff",
        },
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: 1, filter: "brightness(1)" },
          "50%": { opacity: 0.7, filter: "brightness(1.5)" },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
      },
      backdropBlur: {
        xl: "20px",
        "2xl": "40px",
      },
    },
    boxShadow: {
      'premium': '0 20px 50px -15px rgba(0,0,0,0.7)',
      'glow': '0 0 20px rgba(0, 132, 255, 0.2)',
    }
  },
  plugins: [],
}
