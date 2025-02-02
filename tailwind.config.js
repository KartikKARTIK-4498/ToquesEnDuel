/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#CE585E',
          pink: '#FFF5F5'
        },
        rose: {
          50: '#FFF5F5',
          500: '#CE585E',
          600: '#B54E54',
        },
        gray: {
          500: '#6B7280',
          600: '#4B5563',
          800: '#2B2B2B',
        }
      },
      fontFamily: {
        'alice': ['Alice', 'serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'bounce': 'bounce 3s infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-left': 'slideLeft 0.5s ease-in-out',
        'slide-right': 'slideRight 0.5s ease-in-out',
        'scale-up': 'scaleUp 0.5s ease-in-out',
        'scale-down': 'scaleDown 0.5s ease-in-out',
      },
      keyframes: {
        slideLeft: {
          '0%': { transform: 'translateX(100%) scale(0.9)' },
          '100%': { transform: 'translateX(0) scale(0.9)' }
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%) scale(0.9)' },
          '100%': { transform: 'translateX(0) scale(0.9)' }
        },
        scaleUp: {
          '0%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' }
        },
        scaleDown: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.9)' }
        }
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, #FFF5F5 0%, #FFFFFF 50%, #FFF5F5 100%)',
      },
      borderRadius: {
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'lg': '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography')
  ],
  daisyui: {
    themes: ["light", "dark"],
  }
}
