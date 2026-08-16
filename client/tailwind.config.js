/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#020617',
        surface: '#0f172a',
        elevated: '#1e293b',
        'border-subtle': '#334155',
        crimson: {
          DEFAULT: '#dc2626',
          deep: '#991b1b',
          glow: 'rgba(220, 38, 38, 0.15)',
          soft: 'rgba(220, 38, 38, 0.08)',
        },
        glass: {
          bg: 'rgba(15, 23, 42, 0.65)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(255, 255, 255, 0.14)',
        },
      },
      fontFamily: {
        heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'crimson': '0 0 40px rgba(220, 38, 38, 0.15)',
        'elevated': '0 20px 60px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
