/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_BASE_PATH: string;
  readonly PUBLIC_LISTMONK_URL?: string;
  readonly PUBLIC_LISTMONK_LIST_UUIDS?: string;
  readonly PUBLIC_GOATCOUNTER_ENDPOINT?: string;
  readonly PUBLIC_GOATCOUNTER_VIEW_COUNTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
