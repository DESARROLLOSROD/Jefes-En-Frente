/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Habilitar modo oscuro con clase 'dark'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados que coinciden con el tema de mobile
        primary: {
          DEFAULT: '#2563eb',
          dark: '#3b82f6',
        },
        secondary: {
          DEFAULT: '#64748b',
          dark: '#94a3b8',
        },
        surface: {
          light: '#ffffff',
          dark: '#1e293b',
        },
        background: {
          light: '#f8fafc',
          dark: '#0f172a',
        },
      },
    },
  },
  plugins: [],
}