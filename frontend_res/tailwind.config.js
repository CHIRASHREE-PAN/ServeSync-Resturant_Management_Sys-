/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
        numeric: ['Manrope', 'Inter', 'sans-serif'],
        // kept for backward compatibility with existing `font-body` usage
        body: ['Inter', 'system-ui', 'sans-serif'],
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
        overlay: 'var(--color-overlay)',
        role: {
          admin: 'var(--color-role-admin)',
          kitchen: 'var(--color-role-kitchen)',
          waiter: 'var(--color-role-waiter)',
          customer: 'var(--color-role-customer)',
          billing: 'var(--color-role-billing)',
        },
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        dropdown: 'var(--shadow-dropdown)',
        dialog: 'var(--shadow-dialog)',
        drawer: 'var(--shadow-drawer)',
        // legacy alias used by existing components
        soft: 'var(--shadow-card)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        dialog: 'var(--radius-dialog)',
        table: 'var(--radius-table)',
        image: 'var(--radius-image)',
        button: 'var(--radius-button)',
        input: 'var(--radius-input)',
        hero: 'var(--radius-hero)',
        panel: 'var(--radius-panel)',
        xl: '20px',
        lg: '16px',
        md: '12px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 240ms cubic-bezier(0.4, 0, 0.2, 1) both',
        'slide-up': 'slide-up 280ms cubic-bezier(0.4, 0, 0.2, 1) both',
      },
    },
  },
  plugins: [],
};
