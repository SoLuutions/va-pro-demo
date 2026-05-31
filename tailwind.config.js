
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ocean: {
          bg:        '#0B0C10',
          surface:   '#111C26',
          secondary: '#0E2433',
          border:    '#1C2A3A',
          accent:    '#1F6FEB',
          'accent-hover': '#00C2FF',
          text:      '#E6EDF3',
          muted:     '#8B949E',
          success:   '#2EA043',
          warning:   '#F0883E',
          error:     '#DA3633',
        },
      },
    },
  },
  plugins: [],
}
