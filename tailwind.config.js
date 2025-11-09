/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          50: "#e6fffa",
          100: "#b3fff0",
          200: "#80ffe6",
          300: "#4dffdb",
          400: "#1affd1",
          500: "#00e6c7",
          600: "#00b399",
          700: "#00806b",
          800: "#004d3d",
          900: "#001a0f",
        },
        dark: {
          50: "#f8f8f8",
          100: "#e0e0e0",
          200: "#c0c0c0",
          300: "#9a9a9a",
          400: "#666666",
          500: "#404040",
          600: "#2d2d2d",
          700: "#1a1a1a",
          800: "#0f0f0f",
          900: "#050505",
        },
      },
      fontFamily: {
        cyber: ["Aileron", "monospace"],
      },
      boxShadow: {
        cyber: "0 0 20px rgba(0, 230, 199, 0.5)",
        "cyber-sm": "0 0 10px rgba(0, 230, 199, 0.3)",
      },
    },
  },
  plugins: [],
};
