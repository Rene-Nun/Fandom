/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Aquí luego podrás pegar tu paleta de Fandoom
        // fandoom: { primary: '#...', ... }
      },
      fontFamily: {
        // Aquí luego podrás pegar tus fuentes
        // sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};