/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/partials/*.ejs',
    './views/*.ejs',
    './views/**/*.ejs',
    './public/**/*.css',
    './public/**/*.js' 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

