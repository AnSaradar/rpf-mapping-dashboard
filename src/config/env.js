/// <reference types="vite/client" />
/**
 * Single place for Vite env (`import.meta.env`). Import these instead of reading
 * `import.meta.env` in components so types stay consistent and missing vars are obvious.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
export const OPENAI_API_URL = import.meta.env.VITE_OPENAI_API_URL;
export const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL;

/** When true, login is skipped and protected routes are open (local dev only). */
export const AUTH_DISABLED = import.meta.env.VITE_DISABLE_AUTH === "true";
