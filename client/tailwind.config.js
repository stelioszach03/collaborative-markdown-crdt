/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#2196f3',
          600: '#1e88e5',
          700: '#1976d2',
          800: '#1565c0',
          900: '#0d47a1',
        },
        editor: {
          light: '#ffffff',
          dark: '#1e1e2e',
        },
        sidebar: {
          light: '#f8f9fa',
          dark: '#171723',
        },
        subtle: {
          light: '#f3f4f6',
          dark: '#2d2d3d',
        },
        border: {
          light: '#e5e7eb',
          dark: '#313142',
        },
        accent: {
          teal: '#0d9488',
          purple: '#8b5cf6',
          amber: '#f59e0b',
          rose: '#f43f5e',
          emerald: '#10b981',
          indigo: '#6366f1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        subtle: '0 2px 15px 0 rgba(0, 0, 0, 0.05)',
        'subtle-dark': '0 2px 15px 0 rgba(0, 0, 0, 0.3)',
      },
      typography: theme => ({
        DEFAULT: {
          css: {
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            '[class~="lead"]': { color: theme('colors.gray.400') },
            a: { color: theme('colors.primary.400') },
            strong: { color: theme('colors.gray.100') },
            'ol > li::before': { color: theme('colors.gray.400') },
            'ul > li::before': { backgroundColor: theme('colors.gray.600') },
            hr: { borderColor: theme('colors.gray.700') },
            blockquote: {
              color: theme('colors.gray.300'),
              borderLeftColor: theme('colors.gray.700'),
            },
            h1: { color: theme('colors.gray.100') },
            h2: { color: theme('colors.gray.100') },
            h3: { color: theme('colors.gray.100') },
            h4: { color: theme('colors.gray.100') },
            'figure figcaption': { color: theme('colors.gray.400') },
            code: { color: theme('colors.gray.100') },
            pre: {
              color: theme('colors.gray.300'),
              backgroundColor: theme('colors.gray.800'),
            },
            thead: {
              color: theme('colors.gray.100'),
              borderBottomColor: theme('colors.gray.600'),
            },
            'tbody tr': { borderBottomColor: theme('colors.gray.700') },
          },
        },
      }),
    },
  },
  plugins: [],
};