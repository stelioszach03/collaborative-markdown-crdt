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
            50: '#e6f1ff',
            100: '#cce3ff',
            200: '#99c7ff',
            300: '#66abff',
            400: '#338fff',
            500: '#0073ff',
            600: '#005ccc',
            700: '#004599',
            800: '#002e66',
            900: '#001733',
          },
          editor: {
            background: 'var(--editor-bg)',
            text: 'var(--editor-text)',
            cursor: 'var(--editor-cursor)',
            selection: 'var(--editor-selection)',
            line: 'var(--editor-line)',
          },
        },
        animation: {
          'cursor-blink': 'blink 1s step-end infinite',
          'fade-in': 'fadeIn 0.3s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
        },
        keyframes: {
          blink: {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0 },
          },
          fadeIn: {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
          slideUp: {
            '0%': { transform: 'translateY(10px)', opacity: 0 },
            '100%': { transform: 'translateY(0)', opacity: 1 },
          },
        },
      },
    },
    plugins: [],
  }