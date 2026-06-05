import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        space: '#05070f',
        'space-mid': '#0a0e1a',
        nebula: '#111827',
        'nebula-light': '#1a2235',
        cosmos: '#1e2a42',
        starlight: '#e8d5a3',
        'starlight-dim': '#b8a882',
        'starlight-muted': '#7a6e55',
        aurora: '#7b6ef6',
        'aurora-light': '#9d93f8',
        'aurora-dim': '#4a45a0',
        'aurora-glow': 'rgba(123,110,246,0.15)',
        sol: '#f4a236',
        'sol-light': '#f7bc6a',
        'sol-dim': '#b07520',
        'sol-glow': 'rgba(244,162,54,0.15)',
        mystic: '#c084fc',
        'mystic-dim': '#7e22ce',
        teal: '#2dd4bf',
        'rose-cosmos': '#fb7185',
        'gold': '#d4af37',
        'gold-light': '#f0d060',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        display: ['Cinzel', 'serif'],
      },
      backgroundImage: {
        'cosmic-gradient': 'radial-gradient(ellipse at top, #1a1f35 0%, #05070f 70%)',
        'aurora-gradient': 'linear-gradient(135deg, #7b6ef6 0%, #c084fc 100%)',
        'sol-gradient': 'linear-gradient(135deg, #f4a236 0%, #f7bc6a 100%)',
        'star-gradient': 'radial-gradient(circle at 20% 50%, rgba(123,110,246,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(244,162,54,0.06) 0%, transparent 40%)',
        'card-gradient': 'linear-gradient(135deg, rgba(26,34,53,0.8) 0%, rgba(17,24,39,0.9) 100%)',
        'message-user': 'linear-gradient(135deg, rgba(244,162,54,0.12) 0%, rgba(244,162,54,0.06) 100%)',
        'message-ai': 'linear-gradient(135deg, rgba(123,110,246,0.1) 0%, rgba(26,34,53,0.8) 100%)',
      },
      boxShadow: {
        'aurora': '0 0 30px rgba(123,110,246,0.25), 0 4px 15px rgba(0,0,0,0.3)',
        'aurora-sm': '0 0 15px rgba(123,110,246,0.15), 0 2px 8px rgba(0,0,0,0.2)',
        'sol': '0 0 30px rgba(244,162,54,0.3), 0 4px 15px rgba(0,0,0,0.3)',
        'sol-sm': '0 0 15px rgba(244,162,54,0.2)',
        'inner-aurora': 'inset 0 1px 0 rgba(123,110,246,0.2)',
        'card': '0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.03)',
        'glow-sm': '0 0 20px rgba(123,110,246,0.2)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 7s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 2s infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'orbit': 'orbit 20s linear infinite',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'typing': 'typing 1.4s steps(3) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-12px) rotate(1deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-1deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(60px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(60px) rotate(-360deg)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(123,110,246,0.3)' },
          '50%': { boxShadow: '0 0 35px rgba(123,110,246,0.6)' },
        },
        typing: {
          '0%': { content: '""' },
          '33%': { content: '"."' },
          '66%': { content: '".."' },
          '100%': { content: '"..."' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        'xs': '390px',
      },
    },
  },
  plugins: [],
} satisfies Config;
