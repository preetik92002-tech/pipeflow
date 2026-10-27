import type { Config } from 'tailwindcss'
import { palette } from './src/lib/design/tokens'

const config: Config = {
  // Dark mode is a manual toggle (ThemeToggle writes the "dark" class to <html>), not the OS setting alone, so a
  // visitor's choice sticks. The site's own CSS does the actual dark styling (see "Dark mode" in globals.css),
  // scoped to html.site.dark so it never touches the separately-themed admin.
  darkMode: ['selector', '.dark'],
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
        // Restrained display scale: strong hierarchy without headings that wrap into five lines on a phone.
        'display-2xl': ['clamp(1.9rem, 1.4rem + 2.6vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-xl': ['clamp(1.85rem, 1.4rem + 1.9vw, 2.9rem)', { lineHeight: '1.1', letterSpacing: '-0.018em' }],
        'display-lg': ['clamp(1.55rem, 1.25rem + 1.2vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.25rem, 1.1rem + 0.6vw, 1.6rem)', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        lead: ['clamp(1.02rem, 0.98rem + 0.2vw, 1.15rem)', { lineHeight: '1.65' }],
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
        prose: '68ch',
      },
    },
  },
  plugins: [],
}
export default config