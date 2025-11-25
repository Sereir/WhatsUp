/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#25D366',
        secondary: '#128C7E',
        dark: '#075E54',
        light: '#DCF8C6',
      }
    },
  },
  plugins: [],
}
