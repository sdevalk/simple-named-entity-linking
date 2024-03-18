import formsPlugin from '@tailwindcss/forms';
import type {Config} from 'tailwindcss';

export default {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        'brand-red': '#e4493e',
      },
    },
  },
  plugins: [formsPlugin],
} satisfies Config;
