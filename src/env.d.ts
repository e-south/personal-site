/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_BASE_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
