/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],  theme: {
    extend: {
      fontFamily: {
        'playfair': ['"Playfair Display"', 'serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },      colors: {
        bianca: {
          'primary': '#0053A1',  // Dark blue for buttons and text
          'background': '#B1DFF9', // Light blue for backgrounds
          'dark-blue': '#0053A1', // For backward compatibility
          'blue': '#B1DFF9',      // For backward compatibility
        }
      },
    },
  },
  plugins: [],
}