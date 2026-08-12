/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        'brand-dark': '#1e1e24',
        'brand-green': '#5ad58f',
        'brand-purple': '#936bfe',
        'brand-blue': '#4c63f6',
        'brand-red': '#f15642',
      }
    },
  },
  plugins: [],
}
