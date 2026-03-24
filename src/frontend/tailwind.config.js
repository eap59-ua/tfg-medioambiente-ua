module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#EBF5FB', 100: '#D6EAF8', 200: '#AED6F1',
          300: '#85C1E9', 400: '#41A2E0', 500: '#0080FF',
          600: '#006ACC', 700: '#005099', 800: '#003566', 900: '#001A33',
        },
        severity: {
          low: '#27AE60',
          moderate: '#F39C12',
          high: '#E67E22',
          critical: '#E74C3C',
        },
      },
    },
  },
  plugins: [],
};
