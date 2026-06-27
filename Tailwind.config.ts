import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
      },
      gridTemplateColumns: {
        '8': 'repeat(8, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
} satisfies Config