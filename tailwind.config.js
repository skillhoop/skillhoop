/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Critical for the theme switch to work
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // CertificationsModule.tsx uses dynamic class names like `bg-${color}-50`
    'bg-slate-50',
    'text-slate-600',
    'bg-emerald-50',
    'text-emerald-600',
    'bg-blue-50',
    'text-blue-600',
    'bg-amber-50',
    'text-amber-600',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out',
        'count-up': 'countUp 1s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'fade-in-down': 'fadeInDown 0.3s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
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
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        countUp: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(17, 24, 39, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(17, 24, 39, 0.6)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotateX(0deg) translateZ(50px)' },
          '50%': { transform: 'translateY(-20px) rotateX(2deg) translateZ(50px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

// Refresh build timestamp: 2024-12-23T00:00:00.000Z