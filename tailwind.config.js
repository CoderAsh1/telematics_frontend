/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C5A028', // Logo Gold
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#94A3B8', // Logo Silver/Slate
          foreground: '#1A1A1A',
        },
        dark: '#1A1A1A', // Logo Dark Grey
        accent: '#D4AF37', // Brighter Gold
      },
    },
  },
  plugins: [],
}
