import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#5BC2E7',
          light: '#8DD8F0',
          dark: '#007DBA',
        },
        obsidian: {
          DEFAULT: '#07101c',
          '50': '#0c1c30',
          '100': '#0a1826',
          '200': '#091524',
        },
        cream: '#e8f4fa',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        heading: ['Cormorant Garamond', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
