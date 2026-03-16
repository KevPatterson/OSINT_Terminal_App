/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',       // near-black green tint
        foreground: 'var(--color-foreground)',        // matrix-green
        border: 'var(--color-border)',                // green-600 variant
        input: 'var(--color-input)',                  // surface
        ring: 'var(--color-ring)',                    // matrix-green

        card: {
          DEFAULT: 'var(--color-card)',               // surface dark
          foreground: 'var(--color-card-foreground)', // matrix-green
        },
        popover: {
          DEFAULT: 'var(--color-popover)',            // surface dark
          foreground: 'var(--color-popover-foreground)', // matrix-green
        },
        primary: {
          DEFAULT: 'var(--color-primary)',            // matrix-green #00ff41
          foreground: 'var(--color-primary-foreground)', // near-black #020a02
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',          // darker-green #00cc33
          foreground: 'var(--color-secondary-foreground)', // near-black #020a02
        },
        muted: {
          DEFAULT: 'var(--color-muted)',              // dark-green-surface #1a2a1a
          foreground: 'var(--color-muted-foreground)', // light-green #66ff66
        },
        accent: {
          DEFAULT: 'var(--color-accent)',             // cyan #00e5ff
          foreground: 'var(--color-accent-foreground)', // near-black #020a02
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)',        // red #ff3131
          foreground: 'var(--color-destructive-foreground)', // white
        },
        success: {
          DEFAULT: 'var(--color-success)',            // matrix-green #00ff41
          foreground: 'var(--color-success-foreground)', // near-black #020a02
        },
        warning: {
          DEFAULT: 'var(--color-warning)',            // amber #ffb000
          foreground: 'var(--color-warning-foreground)', // near-black #020a02
        },
        error: {
          DEFAULT: 'var(--color-error)',              // red #ff3131
          foreground: 'var(--color-error-foreground)', // white
        },
      },

      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        'share-tech': ['Share Tech Mono', 'monospace'],
        jetbrains: ['JetBrains Mono', 'monospace'],
        'roboto-mono': ['Roboto Mono', 'monospace'],
        mono: ['Share Tech Mono', 'JetBrains Mono', 'Roboto Mono', 'monospace'],
      },

      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.2' }],
        'h1': ['2rem', { lineHeight: '1.25' }],
        'h2': ['1.5rem', { lineHeight: '1.3' }],
        'h3': ['1.25rem', { lineHeight: '1.4' }],
        'h4': ['1.125rem', { lineHeight: '1.5' }],
        'caption': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        'data': ['0.875rem', { lineHeight: '1.5' }],
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },

      borderRadius: {
        'terminal': '2px',
        'card': '4px',
        'panel': '6px',
      },

      boxShadow: {
        'glow-sm': '0 0 5px rgba(0, 255, 65, 0.3)',
        'glow': '0 0 10px rgba(0, 255, 65, 0.3)',
        'glow-md': '0 0 15px rgba(0, 255, 65, 0.4)',
        'glow-lg': '0 0 20px rgba(0, 255, 65, 0.5)',
        'glow-xl': '0 0 30px rgba(0, 255, 65, 0.6)',
        'glow-cyan': '0 0 10px rgba(0, 229, 255, 0.4)',
        'glow-warning': '0 0 10px rgba(255, 176, 0, 0.4)',
        'glow-error': '0 0 10px rgba(255, 49, 49, 0.4)',
        'terminal': '0 0 10px rgba(0, 255, 65, 0.3), inset 0 0 30px rgba(0, 255, 65, 0.02)',
      },

      animation: {
        'blink': 'blink 800ms step-end infinite',
        'glitch': 'glitch 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite',
        'terminal-pulse': 'terminal-pulse 1.2s ease-in-out infinite',
        'typing': 'typing 150ms ease-out forwards',
        'scan': 'scan 2s linear infinite',
        'fade-in': 'fadeIn 250ms ease-out forwards',
        'slide-up': 'slideUp 250ms ease-out forwards',
      },

      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 1px)' },
          '40%': { transform: 'translate(2px, -1px)' },
          '60%': { transform: 'translate(-1px, 2px)' },
          '80%': { transform: 'translate(1px, -2px)' },
        },
        'terminal-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        typing: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },

      transitionTimingFunction: {
        'terminal': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },

      transitionDuration: {
        '250': '250ms',
      },

      maxWidth: {
        'terminal': '960px',
        'measure': '80ch',
      },

      zIndex: {
        'base': '0',
        'card': '10',
        'terminal': '20',
        'dropdown': '50',
        'nav': '100',
        'modal': '200',
        'scanlines': '300',
        'tooltip': '2000',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};