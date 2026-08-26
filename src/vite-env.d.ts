/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_MAPBOX_TOKEN: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_OPENAI_API_URL?: string;
  readonly VITE_OPENAI_MODEL?: string;
  readonly VITE_DISABLE_AUTH?: string;
}
