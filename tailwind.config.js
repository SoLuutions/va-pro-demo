
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: { 
    extend: {
      colors: {
        primary: '#1FB6FF',
        accentLavender: '#B9AFFF',
        accentMint: '#A0F0E4',
        navaDarkPrimary: '#3CC9FF',
        navaDarkLavender: '#C1B4FF',
        navaDarkMint: '#53E1CC',
      },
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        manrope: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        outfit: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    } 
  },
  plugins: [],
}
