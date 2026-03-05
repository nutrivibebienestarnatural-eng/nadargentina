/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg: '#08090D',
        surface: '#0F1117',
        border: '#1E2030',
        accent: '#4F6EF7',
        success: '#2DD4A0',
        warn: '#F5A623',
        danger: '#F05A5A',
      }
    },
  },
  plugins: [],
}
