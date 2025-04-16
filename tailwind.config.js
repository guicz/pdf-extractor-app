/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Exo 2', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#33820D',
          focus: '#64C832',
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        lightcustom: {
          primary: '#33820D',
          'primary-focus': '#64C832',
          'primary-content': '#fff',
          secondary: '#64C832',
          'secondary-focus': '#33820D',
          'secondary-content': '#fff',
          accent: '#A7F5A0',
          'accent-focus': '#33820D',
          'accent-content': '#1C2B17',
          neutral: '#F5FDF4',
          'neutral-content': '#263A23',
          'base-100': '#F9FFF7',
          'base-200': '#EAFBE5',
          'base-300': '#D2F2C6',
          info: '#56B6F7',
          success: '#38E54D',
          warning: '#FFD166',
          error: '#FF616D',
        },
        darkcustom: {
          primary: '#64C832',
          'primary-focus': '#33820D',
          'primary-content': '#1C2B17',
          secondary: '#33820D',
          'secondary-focus': '#64C832',
          'secondary-content': '#fff',
          accent: '#A7F5A0',
          'accent-focus': '#33820D',
          'accent-content': '#1C2B17',
          neutral: '#232D1C',
          'neutral-content': '#EAFBE5',
          'base-100': '#1A2116',
          'base-200': '#232D1C',
          'base-300': '#263A23',
          info: '#56B6F7',
          success: '#38E54D',
          warning: '#FFD166',
          error: '#FF616D',
        }
      }
    ],
    darkTheme: 'darkcustom',
    defaultTheme: 'lightcustom',
    base: true,
    styled: true,
    utils: true,
    logs: false,
    rtl: false,
    prefix: '',
  },
}