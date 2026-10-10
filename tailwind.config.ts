import type { Config } from 'tailwindcss'
import { palette } from './src/lib/design/tokens'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B1728',
          800: '#0F2040',
          700: '#132952',
          600: '#1A3566',
          500: '#1E4080',
          400: '#2650A0',
        },
        brand: {
          blue: '#1F5FAD',
          'blue-light': '#2470C8',
          'blue-lighter': '#3B82D4',
          red: '#DC2626',
          'red-dark': '#C41E1E',
          'red-light': '#EF4444',
        },
        // Public site palette: src/lib/design/tokens.ts se (tests bhi wahin se padhte hain).
        paper: palette.ivory,
        line: palette.stone,
        mist: palette.mist,
        ink: palette.ink,
        terra: { DEFAULT: palette.terra, dark: palette.terraDark, light: palette.terraLight },
        field: palette.field,
        error: { bg: palette.error.bg, border: palette.error.border, text: palette.error.text },
      },
      fontSize: {
        // Fluid display scale: badi screens par bade, mobile par bina tootey headings.
        'display-2xl': ['clamp(2.6rem, 1.3rem + 5vw, 6rem)', { lineHeight: '1.0', letterSpacing: '-0.025em' }],
        'display-xl': ['clamp(2.2rem, 1.3rem + 3.2vw, 4.2rem)', { lineHeight: '1.04', letterSpacing: '-0.022em' }],
        'display-lg': ['clamp(1.85rem, 1.25rem + 2.1vw, 3.1rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.45rem, 1.15rem + 1.1vw, 2.1rem)', { lineHeight: '1.18', letterSpacing: '-0.02em' }],
        lead: ['clamp(1.075rem, 1rem + 0.35vw, 1.3rem)', { lineHeight: '1.65' }],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display, var(--font-sora))', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'bounce-slow': 'bounce 2s infinite',
        'ken-burns': 'kenBurns 22s ease-in-out infinite alternate',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        rise: 'rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
        settle: 'settle 1.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'page-in': 'pageIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'logo-in': 'logoIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1.0) translate(0, 0)' },
          '100%': { transform: 'scale(1.06) translate(-1%, -1%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        settle: {
          '0%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        pageIn: {
          '0%': { opacity: '0.01', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        logoIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.07)',
        nav: '0 2px 8px rgba(11,23,40,0.10)',
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
}
export default config