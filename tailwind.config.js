/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      colors: {
        accent:   { DEFAULT: '#4361ee', dark: '#3451d1' },
        emerald:  '#10b981',
        amber:    '#f59e0b',
        rose:     '#f43f5e',
        violet:   '#8b5cf6',
        ink:      { DEFAULT: '#0d0f14', 2: '#3a3e4e', 3: '#7a7f96', 4: '#b0b5c8' },
        surface:  { DEFAULT: '#ffffff', 2: '#f5f6fa', 3: '#eef0f7' },
        border:   { DEFAULT: '#e4e6f0', 2: '#d0d4e8' },
      },
      boxShadow: {
        accent: '0 8px 32px rgba(67,97,238,.25)',
      },
      animation: {
        'fade-up': 'fadeUp .25s ease forwards',
        'pulse-dot': 'pulseDot 2s infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: .6, transform: 'scale(.8)' } },
      },
    },
  },
  plugins: [],
}
