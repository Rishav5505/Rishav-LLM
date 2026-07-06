/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        urbanist: ['Urbanist', 'sans-serif'],
      },
      colors: {
        'brand-purple': '#740968',
        'brand-purple-hover': '#5e0753',
        'brand-purple-light': '#9c158d',
        'dark-bg': '#0b0f19',
        'dark-sidebar': '#0f1322',
        'dark-surface': '#171d30',
        'dark-border': '#222b45',
        'dark-hover': '#1e263d',
      },
    },
  },
  plugins: [],
}
