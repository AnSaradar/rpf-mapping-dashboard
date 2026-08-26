import { aspectColors, normalizeAspect } from '../components/sidebar/aspectColors';

const FALLBACK_COLOR = '#999999';

export const hexToRgb = (hex: string): [number, number, number] => {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  if (!Number.isFinite(value)) {
    return [153, 153, 153];
  }
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

export const getAspectColor = (aspect: string): string => {
  const normalized = normalizeAspect(aspect);
  return aspectColors[normalized] ?? FALLBACK_COLOR;
};

export const getAspectFillColor = (aspect: string): [number, number, number] =>
  hexToRgb(getAspectColor(aspect));

type ProcessedGeojsonData = {
  fields: Array<{ name: string }>;
  rows: unknown[][];
};

export type AspectColorRange = {
  name: string;
  type: string;
  category: string;
  colors: string[];
  colorMap: [string, string][];
};

export const getUniqueAspects = (processedData: ProcessedGeojsonData): string[] => {
  const aspectIdx = processedData.fields.findIndex((field) => field.name === 'aspect');
  if (aspectIdx < 0) return [];

  const aspects = new Set<string>();
  for (const row of processedData.rows) {
    const value = row[aspectIdx];
    if (typeof value === 'string' && value.trim()) {
      aspects.add(value);
    }
  }
  return [...aspects].sort();
};

export const buildAspectColorConfig = (processedData: ProcessedGeojsonData) => {
  const colorDomain = getUniqueAspects(processedData);
  const colorMap = colorDomain.map(
    (aspect) => [aspect, getAspectColor(aspect)] as [string, string]
  );
  const colorRange: AspectColorRange = {
    name: 'Aspect Colors',
    type: 'customOrdinal',
    category: 'Custom',
    colors: colorMap.map(([, color]) => color),
    colorMap,
  };

  return { colorDomain, colorMap, colorRange };
};

export { aspectColors, normalizeAspect };
