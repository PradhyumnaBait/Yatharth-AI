import type { Config } from 'tailwindcss';
import { tailwindTheme } from './src/design/tailwind-theme';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/design/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: tailwindTheme,
  },
  plugins: [],
};

export default config;
