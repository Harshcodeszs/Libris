/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1C1917',
          soft: '#44403C',
          muted: '#57534E',
          faint: '#78716C',
        },
        cream: {
          50: '#FDFCF9',
          100: '#FAF7F1',
          200: '#F3EDE2',
          300: '#E8DECB',
          400: '#D8C8AC',
          500: '#C4AE8C',
        },
        forest: {
          50: '#F1F7F2',
          100: '#DFEDE2',
          200: '#C0DBC7',
          300: '#94C1A1',
          400: '#61A177',
          500: '#3F845A',
          600: '#2E6A47',
          700: '#26553A',
          800: '#204531',
          900: '#1B3A2A',
          950: '#0D2118',
        },
        brass: {
          50: '#FCF8EC',
          100: '#F7EDCB',
          200: '#EFD997',
          300: '#E4BF5C',
          400: '#D9A83A',
          500: '#C98C25',
          600: '#AE6D1C',
          700: '#8B5118',
          800: '#734218',
          900: '#613819',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28,25,23,0.04), 0 8px 24px -16px rgba(28,25,23,0.18)',
        lift: '0 2px 4px rgba(28,25,23,0.05), 0 18px 40px -22px rgba(28,25,23,0.28)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 250ms ease-out both',
        'slide-up': 'slide-up 300ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 180ms ease-out both',
        'slide-in-right': 'slide-in-right 220ms ease-out both',
        'slide-in-left': 'slide-in-left 260ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
