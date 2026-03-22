/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#005aaf',
          light: '#e8f0fa',
          dark: '#004a8f',
        },
      },
    },
  },
  plugins: [],
}
