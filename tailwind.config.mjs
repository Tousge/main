/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#803B85',
          50: '#f9f5fa',
          100: '#f3ebf5',
          200: '#e7d7eb',
          300: '#d5b8db',
          400: '#bb8cc4',
          500: '#9B4BA0',
          600: '#803B85',
          700: '#6A2F6E',
          800: '#5a2a5c',
          900: '#4a254c',
          glow: 'rgba(128, 59, 133, 0.3)',
        },
        accent: {
          pink: '#E84A8A',
          rose: '#E991B2',
          purple: '#B855BD',
          magenta: '#9B59B6',
        },
        dark: {
          DEFAULT: '#1d1d1f',
          50: '#f8f8fa',
          100: '#f0f0f5',
          200: '#e5e5ea',
          300: '#d2d2d7',
          400: '#86868b',
          500: '#6e6e73',
          600: '#48484a',
          700: '#3a3a3c',
          800: '#2c2c2e',
          900: '#1d1d1f',
        },
      },
      fontFamily: {
        sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['72px', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-2': ['56px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-3': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading-1': ['40px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading-2': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading-3': ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-large': ['19px', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['17px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-small': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['13px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'md': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'lg': '0 8px 40px rgba(0, 0, 0, 0.08)',
        'xl': '0 24px 80px rgba(0, 0, 0, 0.12)',
        '2xl': '0 40px 100px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 60px rgba(128, 59, 133, 0.25)',
        'glow-strong': '0 0 80px rgba(128, 59, 133, 0.4)',
        'primary': '0 4px 20px rgba(128, 59, 133, 0.3)',
        'primary-lg': '0 8px 32px rgba(128, 59, 133, 0.35)',
        'inner-white': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #803B85 0%, #9B4BA0 100%)',
        'gradient-accent': 'linear-gradient(135deg, #E84A8A 0%, #B855BD 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1d1d1f 0%, #0a0a0a 100%)',
        'gradient-premium': 'linear-gradient(135deg, #803B85 0%, #B855BD 50%, #E84A8A 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
  // Performance: Only generate used styles
  future: {
    hoverOnlyWhenSupported: true,
  },
};
