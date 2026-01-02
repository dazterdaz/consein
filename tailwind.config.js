/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff5722',
        'primary-light': '#ffccbc',
        'primary-dark': '#e64a19',
        secondary: '#673ab7',
        'secondary-light': '#d1c4e9',
        'secondary-dark': '#512da8',
        accent: '#00bcd4',
        'accent-light': '#b2ebf2',
        'accent-dark': '#0097a7',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336'
      }
    },
  },
  plugins: [],
};