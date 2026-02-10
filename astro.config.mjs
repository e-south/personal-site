// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import { resolvePublicSiteEnv } from './src/lib/env.mjs';

import tailwind from '@astrojs/tailwind';

import sitemap from '@astrojs/sitemap';

const mode = process.env.NODE_ENV ?? 'development';
const env = loadEnv(mode, process.cwd(), '');
const { site, base } = resolvePublicSiteEnv(env, {
  isDev: mode === 'development',
});

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), sitemap()],
  site,
  base,
});
