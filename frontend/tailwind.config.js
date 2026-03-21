/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a4d2e',
          dark: '#0d1b13',
          light: '#2d6a4f',
        },
        accent: {
          DEFAULT: '#4ade80',
          dark: '#22c55e',
        },
        surface: {
          DEFAULT: '#16241c',
          light: '#f1f5f9',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.1)',
          light: 'rgba(0,0,0,0.1)',
        }
      },
    },
  },
  plugins: [],
}
