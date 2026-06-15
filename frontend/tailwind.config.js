/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        apple: {
          50: "#f5f5f7",
          100: "#e8e8ed",
          200: "#d2d2d7",
          300: "#aeaeb2",
          400: "#8e8e93",
          500: "#636366",
          600: "#48484a",
          700: "#363639",
          800: "#2c2c2e",
          900: "#1c1c1e",
          blue: "#0071e3",
          "blue-hover": "#0077ed",
          "blue-active": "#006edb",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        apple: "12px",
      },
    },
  },
  plugins: [],
};
