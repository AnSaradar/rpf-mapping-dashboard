export const SYRIA_MAP_STATE = {
  bearing: 0,
  latitude: 34.8021,
  longitude: 38.9968,
  pitch: 30,
  zoom: 6,
  dragRotate: true,
};

/** Carto MapLibre basemap — no Mapbox API token required (unlike `styleType: 'dark'`). */
export const SYRIA_MAP_STYLE = {
  styleType: 'dark-matter' as const,
};
