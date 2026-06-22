/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          darkest: '#080c14',
          dark: '#0e1726',
          card: '#131f32',
          light: '#1f2d44',
          green: '#00ff66',
          'green-dim': '#0ea848',
          blue: '#00ccff',
          red: '#ff0055',
          yellow: '#ffcc00'
        }
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'Courier New', 'Courier', 'monospace'],
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-green': '0 0 10px rgba(0, 255, 102, 0.4), 0 0 20px rgba(0, 255, 102, 0.2)',
        'neon-blue': '0 0 10px rgba(0, 204, 255, 0.4), 0 0 20px rgba(0, 204, 255, 0.2)',
        'neon-red': '0 0 10px rgba(255, 0, 85, 0.4), 0 0 20px rgba(255, 0, 85, 0.2)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'terminal-scan': 'scanline 6s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        }
      }
    },
  },
  plugins: [],
}
