export default {
  content: ['./index.html', './src/**/*.{js,jsx}', './public/**/*.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans TC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        slate: {
          925: '#0b1220',
        },
      },
      boxShadow: {
        soft: '0 12px 35px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
