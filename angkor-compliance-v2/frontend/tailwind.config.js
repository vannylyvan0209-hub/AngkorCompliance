/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Angkor Compliance Brand Colors
        primary: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#D4AF37', // Main brand gold
          600: '#B8941F', // Darker gold
          700: '#8B6914', // Darkest gold
          800: '#6B4E0F',
          900: '#4A350A',
          950: '#2D1F06',
        },
        // Role-specific colors
        worker: '#D4AF37',
        'factory-admin': '#B8941F',
        'hr-staff': '#22c55e',
        'grievance-committee': '#f59e0b',
        auditor: '#3b82f6',
        'analytics-user': '#8b5cf6',
        'super-admin': '#ef4444',
        // Glassmorphism colors
        glass: {
          bg: 'rgba(255, 255, 255, 0.95)',
          border: 'rgba(255, 255, 255, 0.2)',
        },
        // Neumorphism colors
        neu: {
          light: '#ffffff',
          dark: '#d1d9e6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        khmer: ['Noto Sans Khmer', 'Khmer OS', 'Leelawadee UI', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'neu-light': '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
        'neu-inset': 'inset 20px 20px 60px #bebebe, inset -20px -20px 60px #ffffff',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}