import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // KifCover brand palette (matches sample pages)
        primary: '#002743',
        'primary-container': '#0a3d62',
        'primary-fixed': '#cfe5ff',
        'primary-fixed-dim': '#a2caf7',
        'on-primary': '#ffffff',
        'on-primary-container': '#80a8d3',
        'on-primary-fixed': '#001d34',
        'inverse-primary': '#a2caf7',

        secondary: '#006d37',
        'secondary-container': '#7bf8a1',
        'secondary-fixed': '#7efba4',
        'secondary-fixed-dim': '#61de8a',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#007239',
        'on-secondary-fixed': '#00210c',

        tertiary: '#002c17',
        'tertiary-container': '#004427',
        'tertiary-fixed': '#95f7bb',
        'tertiary-fixed-dim': '#7adaa1',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#57b781',

        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',

        background: '#f8f9ff',
        'background-main': '#F8FAFC',
        'background-alt': '#FAFBFC',
        'on-background': '#121c2a',

        surface: '#f8f9ff',
        'surface-dim': '#d0dbed',
        'surface-bright': '#f8f9ff',
        'surface-variant': '#d9e3f6',
        'surface-tint': '#386188',
        'surface-glass': 'rgba(255,255,255,0.7)',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e6eeff',
        'surface-container-high': '#dee9fc',
        'surface-container-highest': '#d9e3f6',
        'on-surface': '#121c2a',
        'on-surface-variant': '#42474e',
        'inverse-surface': '#27313f',
        'inverse-on-surface': '#eaf1ff',

        outline: '#72777f',
        'outline-variant': '#c2c7cf',
        'border-subtle': '#E2E8F0',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 4px 20px 0 rgba(10,61,98,0.06)',
        'card-hover': '0 8px 32px 0 rgba(10,61,98,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(16px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}

export default config
