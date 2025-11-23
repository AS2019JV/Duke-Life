/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
        display: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px', letterSpacing: '0.5px' }],
        'sm': ['14px', { lineHeight: '20px', letterSpacing: '0.3px' }],
        'base': ['16px', { lineHeight: '24px', letterSpacing: '0.2px' }],
        'lg': ['18px', { lineHeight: '28px', letterSpacing: '0px' }],
        'xl': ['20px', { lineHeight: '30px', letterSpacing: '-0.3px' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.5px' }],
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.8px' }],
        '4xl': ['36px', { lineHeight: '44px', letterSpacing: '-1px' }],
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
      },
    },
  },
  plugins: [],
};
