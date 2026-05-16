import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        equalizer: {
          '0%': { transform: 'scaleY(0.3)' },
          '100%': { transform: 'scaleY(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        equalizer: 'equalizer 0.8s ease-in-out infinite alternate',
        fadeIn: 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
