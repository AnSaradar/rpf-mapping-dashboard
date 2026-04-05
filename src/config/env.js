/// <reference types="vite/client" />
/**
 * Single place for Vite env (`import.meta.env`). Import these instead of reading
 * `import.meta.env` in components so types stay consistent and missing vars are obvious.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
/** Stadia / tile API key when not using Mapbox */
export const MAP_KEY = import.meta.env.VITE_MAP_KEY ?? "";
