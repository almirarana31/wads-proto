/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],  theme: {
    extend: {
      fontFamily: {
        'playfair': ['"Playfair Display"', 'serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
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