/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bianca: {
          'baby-blue': '#E3F2FD',
          'blue': '#1D4ED8',
          'dark-blue': '#1E40AF',
        }
      },
    },
  },
  plugins: [],
}