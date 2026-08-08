/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f2f5f8',
          100: '#dfe6ee',
          200: '#b9c8da',
          300: '#8ba3bf',
          400: '#5c7ea1',
          500: '#3c6086',
          600: '#2a4a6b',
          700: '#1f3a56',
          800: '#182c42',
          900: '#0f1c2b'
        },
        seal: {
          100: '#f7e9c9',
          300: '#ecc878',
          500: '#d9a441',
          600: '#b8842a',
          700: '#8f6520'
        },
        paper: '#faf9f6',
        status: {
          reported: '#8ba3bf',
          review: '#d9a441',
          escalated: '#c0483f',
          resolved: '#3f8f5f'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif']
      }
    }
  },
  plugins: []
}
