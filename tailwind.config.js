/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink:      '#1A1612',
        espresso: '#2E2118',
        amber:    '#C8813A',
        wheat:    '#EDD9B4',
        cream:    '#FAF5EC',
        stone:    '#6B6059',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
