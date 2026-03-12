/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
          primary: '#006BFF',
          hover: '#005be6',
          light: '#F4F9FF',
          lightBorder: '#D2E5FF',
        },
        page: '#FAFAFB',
        card: '#FFFFFF',
        sidebar: '#FFFFFF',
        text: {
          primary: '#0B0C10',
          secondary: '#4B5563',
          muted: '#9CA3AF',
        },
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#D1D5DB',
        },
        success: '#10B981',
        successLight: '#ECFDF5',
        danger: '#EF4444',
        dangerLight: '#FEF2F2',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        button: '10px',
        input: '10px',
        badge: '999px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.05)',
        'card-hover': '0 12px 32px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0,0,0,0.04)',
        dropdown: '0 10px 40px rgba(0,0,0,0.1)',
        modal: '0 20px 60px rgba(0,0,0,0.15)',
        button: '0 2px 4px rgba(0, 107, 255, 0.1)',
        'button-hover': '0 4px 12px rgba(0, 107, 255, 0.25)',
      },
      transitionDuration: {
        fast: '200ms',
        smooth: '300ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 4s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};

