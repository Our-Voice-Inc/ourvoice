/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  mode: 'jit', // Just in time compiler
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ourvoice-purple': '#5267DF',
        'ourvoice-red': '#FA5959',
        'ourvoice-blue': '#242A45',
        'ourvoice-grey': '#9194A2',
        'ourvoice-white': '#f7f7f7'
      }
    },
    fontFamily: {
      Poppins: ['Poppins, sans-serif']
    },
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '425px',
        md: '768px',
        lg: '1024px',
        xl: '1440px',
        '2xl': '2560px'
      }
    }
  },
  plugins: [import('@tailwindcss/forms')]
}
