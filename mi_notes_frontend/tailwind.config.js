/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
theme: {
  extend: {
    colors: {
      palette: {
        900: "#001D39", // deep navy
          800: "#0A4174", // dark blue
          700: "#49769F", // slate blue
          600: "#4E8EA2", // teal-blue
          500: "#6EA2B3", // muted aqua
          400: "#7BBDE8", // soft blue
          300: "#BDD8E9", // pale blue
          // 200: "#E0F2FE", // light blue
          100: "#F0F9FF", // very light blue
          white: "#FFFFFF", // white
      },
    },
    backgroundImage: {
      'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      'gradient-dark': 'linear-gradient(135deg, #03122F 0%, #19305C 100%)',
      'gradient-purple': 'linear-gradient(135deg, #413B61 0%, #AE7DAC 100%)',
      'gradient-soft': 'linear-gradient(135deg, #F3DADF 0%, #F1916D 100%)',
    },
    boxShadow: {
      glow: '0 0 20px rgba(174, 125, 172, 0.5)',
      'glow-lg': '0 0 40px rgba(174, 125, 172, 0.8)',
      dark: '0 10px 40px rgba(3, 18, 47, 0.5)',
      card: '0 4px 6px -1px rgba(25, 48, 92, 0.3), 0 2px 4px -1px rgba(65, 59, 97, 0.2)',
    },
    animation: {
      'fade-in': 'fadeIn 0.5s ease-in-out',
      'fade-in-up': 'fadeInUp 0.5s ease-out',
      'fade-in-down': 'fadeInDown 0.5s ease-out',
      'slide-in-right': 'slideInRight 0.3s ease-out',
      'slide-in-left': 'slideInLeft 0.3s ease-out',
      'scale-up': 'scaleUp 0.3s ease-out',
      'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      float: 'float 3s ease-in-out infinite',
      glow: 'glow 2s ease-in-out infinite',
      gradient: 'gradient 3s ease infinite',
      shimmer: 'shimmer 2s linear infinite',
      'rotate-slow': 'rotate 8s linear infinite',
      shake: 'shake 0.5s ease-in-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      fadeInUp: {
        '0%': { opacity: '0', transform: 'translateY(20px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      fadeInDown: {
        '0%': { opacity: '0', transform: 'translateY(-20px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      slideInRight: {
        '0%': { transform: 'translateX(100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      slideInLeft: {
        '0%': { transform: 'translateX(-100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      scaleUp: {
        '0%': { transform: 'scale(0.8)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      bounceIn: {
        '0%': { transform: 'scale(0.3)', opacity: '0' },
        '50%': { transform: 'scale(1.05)' },
        '70%': { transform: 'scale(0.9)' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      float: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-10px)' },
      },
      glow: {
        '0%, 100%': { boxShadow: '0 0 20px rgba(174, 125, 172, 0.5)' },
        '50%': { boxShadow: '0 0 40px rgba(174, 125, 172, 0.8)' },
      },
      gradient: {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' },
      },
      shimmer: {
        '0%': { backgroundPosition: '-1000px 0' },
        '100%': { backgroundPosition: '1000px 0' },
      },
      rotate: {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
      shake: {
        '0%, 100%': { transform: 'translateX(0)' },
        '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
        '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
      },
    },
  },
},
plugins: [],
}