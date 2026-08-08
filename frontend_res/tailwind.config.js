/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      colors: {
        background: 'var(--color-background)',
        card: 'var(--color-card)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        accent: 'var(--color-accent)',
        secondary: 'var(--color-secondary)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
        text: 'var(--color-text)',
        'secondary-text': 'var(--color-secondary-text)',
        border: 'var(--color-border)',
        divider: 'var(--color-divider)',
        muted: 'var(--color-muted)',
        sidebar: 'var(--color-sidebar)',
      },
      boxShadow: {
        soft: '0 12px 40px rgba(62, 39, 35, 0.08)',
      },
      borderRadius: {
        xl: '20px',
        lg: '16px',
        md: '12px',
      },
    },
  },
  plugins: [],
};
