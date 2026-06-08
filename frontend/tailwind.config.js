/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void:        '#09090f',
        surface:     '#0e0e1a',
        card:        '#131320',
        ink:         '#1e1e30',
        'ink-light': '#2a2a42',
        ghost:       '#7070a0',
        'ghost-bright': '#9898c0',
        snow:        '#e2e2f0',
        'snow-bright': '#f0f0ff',
        iris:        '#6366f1',
        'iris-dim':  '#4338ca',
        'iris-bright': '#818cf8',
        photo:       '#f59e0b',
        'photo-bright': '#fcd34d',
        'photo-dim': '#d97706',
        danger:      '#ef4444',
        success:     '#10b981',
      },
      keyframes: {
        develop: {
          '0%':   { filter: 'brightness(0) blur(6px)', transform: 'scale(0.88) rotate(var(--tilt,0deg))' },
          '25%':  { filter: 'brightness(0.1) blur(4px) sepia(1)', transform: 'scale(0.93) rotate(var(--tilt,0deg))' },
          '60%':  { filter: 'brightness(0.65) blur(1px) sepia(0.4)', transform: 'scale(0.97) rotate(var(--tilt,0deg))' },
          '100%': { filter: 'brightness(1) blur(0px) sepia(0)', transform: 'scale(1) rotate(var(--tilt,0deg))' },
        },
        scanline: {
          '0%':   { top: '-4px', opacity: '0' },
          '5%':   { opacity: '1' },
          '95%':  { opacity: '1' },
          '100%': { top: 'calc(100% + 4px)', opacity: '0' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)', opacity: '0.5' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        blob: {
          '0%':   { borderRadius: '62% 38% 28% 72% / 58% 32% 68% 42%' },
          '50%':  { borderRadius: '32% 58% 72% 28% / 48% 62% 38% 52%' },
          '100%': { borderRadius: '62% 38% 28% 72% / 58% 32% 68% 42%' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(32px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(-360deg)' },
        },
        'glow-breathe': {
          '0%, 100%': { opacity: '0.25' },
          '50%':      { opacity: '0.6' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      animation: {
        develop:        'develop 2s cubic-bezier(0.4,0,0.2,1) forwards',
        scanline:       'scanline 2.2s ease-in-out infinite',
        'pulse-ring':   'pulse-ring 2s ease-out infinite',
        float:          'float 4s ease-in-out infinite',
        blob:           'blob 10s ease-in-out infinite',
        'slide-up':     'slide-up 0.6s ease-out forwards',
        ticker:         'ticker 45s linear infinite',
        'spin-slow':    'spin-slow 22s linear infinite',
        'spin-reverse': 'spin-reverse 16s linear infinite',
        'glow-breathe': 'glow-breathe 3.5s ease-in-out infinite',
        'fade-in':      'fade-in 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}
