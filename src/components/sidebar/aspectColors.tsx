export const aspectColors: { [key: string]: string } = {
  "All": "#D3D3D3",
  "Building Code": "#c18325",
  "Urban Planning": "#b4562b",
  "Social Factor": "#ac2428",
  "Economic Factor": "#781a35",
  "Culture & Heritage": "#8b8888",
  "Ecological Factor": "#3ba140",
  "Public Health": "#2e7a4a",
  "Resources Management": "#4079a1",
  "Technology": "#204876"
};
export const aspectNormalize: Record<string, string> = {
  "Building Code & Policy": "Building Code",
  "Resource Management": "Resources Management",
  "Technology & Infrastructure": "Technology",
  "Data Collection": "Data Collection"
};

export const normalizeAspect = (aspect: string) =>
  aspectNormalize[aspect] || aspect;