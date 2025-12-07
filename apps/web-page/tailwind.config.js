/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
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
      colors: {
        gold: {
          100: '#F9F1D8',
          200: '#F0DEAA',
          300: '#E6CB7D',
          400: '#D4AF37', // Classic Gold
          500: '#C5A028',
          600: '#B08D1E',
          700: '#997B19',
          800: '#806615',
          900: '#665211',
        },
        sage: {
          100: '#ECFDF5',
          200: '#D1FAE5',
          300: '#A7F3D0',
          400: '#6EE7B7', // Luxury Bright Sage Green - More Contrast
          500: '#34D399',
          600: '#10B981',
          700: '#059669',
          800: '#047857',
          900: '#065F46',
        },
      },

      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        shake: 'shake 0.5s ease-in-out',
        slideUp: 'slideUp 0.5s ease-out forwards',
        zoomIn: 'zoomIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
};
