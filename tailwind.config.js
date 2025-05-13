/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.{html,js,ts}'],
  theme: {
    extend: {
      // Add inter var font
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    },
  },
  plugins: [],
};
