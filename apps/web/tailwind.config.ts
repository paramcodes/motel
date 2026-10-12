import type { Config } from 'tailwindcss';
import { motelTailwindPreset } from '@motel/ui';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  presets: [motelTailwindPreset],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
