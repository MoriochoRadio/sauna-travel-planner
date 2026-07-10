/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF6EF",
        "cream-2": "#F3E9DC",
        onsen: "#E8743B",
        "onsen-soft": "#FCE9DD",
        "onsen-deep": "#C75A26",
        bark: "#3A2E26",
        "bark-soft": "#7A6A5E",
        steam: "#6FB7B0",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          '"Apple SD Gothic Neo"',
          '"Malgun Gothic"',
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 4px 20px rgba(58,46,38,0.08)",
        "card-hover": "0 8px 28px rgba(58,46,38,0.12)",
        cta: "0 6px 16px rgba(232,116,59,0.30)",
      },
      borderRadius: {
        card: "20px",
        btn: "14px",
      },
      backgroundImage: {
        "onsen-gradient": "linear-gradient(135deg, #E8743B 0%, #F0A35E 100%)",
        "page-bg":
          "radial-gradient(ellipse at top, #FCE9DD 0%, #FBF6EF 45%, #F3E9DC 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
