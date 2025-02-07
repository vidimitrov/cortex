/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        dark: {
          bg: "#1a1a1a",
          card: "#242424",
          border: "#333333",
          hover: "#2a2a2a",
        },
      },
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
      },
      spacing: {
        navbar: "64px",
        sidebar: "250px",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      minHeight: {
        "screen-without-nav": "calc(100vh - 64px)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.5s ease-out",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      boxShadow: {
        "inner-lg": "inset 0 2px 4px 0 rgb(0 0 0 / 0.10)",
        "soft-glow": "0 0 15px -3px rgb(45 212 191 / 0.1)",
        card: "0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};
