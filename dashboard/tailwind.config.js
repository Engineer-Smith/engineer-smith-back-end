/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#141416',
          hover: '#1c1c1f',
        },
        border: {
          DEFAULT: '#2a2a2e',
          hover: '#3a3a3f',
        },
        forge: {
          DEFAULT: '#f59e0b',
          hover: '#fbbf24',
          glow: 'rgba(245, 158, 11, 0.15)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundColor: {
        primary: '#0a0a0b',
      },
    },
  },
  plugins: [],
}
