import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const productionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export default defineConfig({
  site: productionDomain ? `https://${productionDomain}` : 'https://tulsi-almirah.vercel.app',
  output: 'static',
  trailingSlash: 'always',
  vite: { plugins: [tailwindcss()] },
});
