/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f4',
          100: '#e3ebe3',
          200: '#c7d9c7',
          300: '#a1bfa1',
          400: '#759e75',
          500: '#538253',
          600: '#3f673f',
          700: '#345234',
          800: '#2c432c',
          900: '#253825',
        },
        darkGreen: '#2E7D32', // Used in buttons and CTA
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'], // for elegant typography
      }
    },
  },
  plugins: [],
}
