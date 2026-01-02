// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

import sitemap from '@astrojs/sitemap';

const mode = process.env.NODE_ENV ?? 'development';
const env = loadEnv(mode, process.cwd(), '');
const isDev = mode === 'development';
const site = env.PUBLIC_SITE_URL || (isDev ? 'http://localhost:4321' : '');
const base = env.PUBLIC_BASE_PATH ?? (isDev ? '' : undefined);

if (!site) {
  throw new Error(
    'PUBLIC_SITE_URL is required (e.g., https://example.com). Set it in .env.',
  );
}

if (base === undefined) {
  throw new Error(
    'PUBLIC_BASE_PATH is required (use "" for root deploys). Set it in .env.',
  );
}

const parsedSite = new URL(site);
if (parsedSite.pathname !== '/' || parsedSite.search || parsedSite.hash) {
  throw new Error(
    'PUBLIC_SITE_URL must not include a path/query/fragment. Use PUBLIC_BASE_PATH instead.',
  );
}

if (base !== '' && (!base.startsWith('/') || base.endsWith('/'))) {
  throw new Error(
    'PUBLIC_BASE_PATH must be empty or start with "/" and not end with "/".',
  );
}

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind(), sitemap()],
  site,
  base,
});
