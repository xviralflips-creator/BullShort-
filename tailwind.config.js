/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#121212',
        primary: '#6d28d9', // Deep Purple
        secondary: '#2563eb', // Blue
        accent: '#d946ef', // Pink
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px -10px rgba(109, 40, 217, 0.5)' },
          '100%': { boxShadow: '0 0 30px 0px rgba(109, 40, 217, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}