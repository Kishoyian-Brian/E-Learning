/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00173D",    // Dark blue - main background
        secondary: "#1e40af",  // Medium blue - cards, borders
        accent: "#3b82f6",     // Light blue - buttons, highlights
      },
    },
  },
  plugins: [],
} 