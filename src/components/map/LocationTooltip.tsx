import React from 'react';
import { useSelector } from 'react-redux';

const LOCATIONS_DATASET_ID = 'locations';
const JOUBAR_DATASET_ID = 'joubar';

type TooltipField = { key: string; label: string };

const DATASET_TOOLTIP_FIELDS: Record<string, TooltipField[]> = {
  [LOCATIONS_DATASET_ID]: [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'aspect', label: 'Aspect' },
    { key: 'sub_aspect', label: 'Sub aspect' },
    { key: 'category', label: 'Category' },
  ],
  [JOUBAR_DATASET_ID]: [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
  ],
};

const hasValue = (value: unknown): value is string =>
  value !== null && value !== undefined && String(value).trim() !== '';

type KeplerField = { name: string };
type KeplerDataset = {
  fields?: KeplerField[];
  dataContainer?: { row: (index: number) => unknown };
};
type HoverInfo = {
  picked?: boolean;
  index?: number;
  layer?: { props?: { idx?: number } };
  object?: {
    index?: number;
    properties?: Record<string, unknown>;
  };
};

type HoverDataSource = {
  dataId: string;
  row: unknown;
  fields?: KeplerField[];
};

const getFieldValue = (
  row: unknown,
  fields: KeplerField[] | undefined,
  fieldName: string
): unknown => {
  if (!row) return undefined;

  if (typeof row === 'object' && row !== null && fieldName in row && !('valueAt' in row)) {
    return (row as Record<string, unknown>)[fieldName];
  }

  if (!fields) return undefined;

  const fieldIndex = fields.findIndex((f) => f.name === fieldName);
  if (fieldIndex === -1) return undefined;

  if (typeof row === 'object' && row !== null && 'valueAt' in row) {
    return (row as { valueAt: (index: number) => unknown }).valueAt(fieldIndex);
  }

  if (Array.isArray(row)) {
    return row[fieldIndex];
  }

  return undefined;
};

const resolveHover = (visState: Record<string, unknown>): HoverDataSource | null => {
  const hoverInfo = visState.hoverInfo as HoverInfo | undefined;
  if (!hoverInfo?.picked) return null;

  const layerIdx = hoverInfo.layer?.props?.idx;
  const layers = visState.layers as Array<{ config?: { dataId?: string } }> | undefined;
  const layer = layerIdx != null ? layers?.[layerIdx] : undefined;
  const dataId = layer?.config?.dataId;
  if (!dataId || !DATASET_TOOLTIP_FIELDS[dataId]) return null;

  const object = hoverInfo.object;
  const properties = object?.properties;

  // GeoJSON picks expose feature properties directly — fastest path
  if (properties) {
    return { dataId, row: properties, fields: undefined };
  }

  const datasets = visState.datasets as Record<string, KeplerDataset> | undefined;
  const dataset = datasets?.[dataId];
  if (!dataset?.dataContainer) return null;

  const rowIndex =
    object?.index ??
    (typeof hoverInfo.index === 'number' && hoverInfo.index >= 0 ? hoverInfo.index : -1);

  if (rowIndex < 0) return null;

  const row = dataset.dataContainer.row(rowIndex);
  if (!row) return null;

  return { dataId, row, fields: dataset.fields };
};

const LocationTooltip: React.FC = () => {
  const visState = useSelector(
    (state: { keplerGl?: { map?: { visState?: Record<string, unknown> } } }) =>
      state.keplerGl?.map?.visState ?? null
  );

  if (!visState) return null;

  const hoverData = resolveHover(visState);
  const mousePos =
    (visState.mousePos as { mousePosition?: [number, number] } | undefined)
      ?.mousePosition ?? null;

  if (!hoverData || !mousePos) return null;

  const tooltipFields = DATASET_TOOLTIP_FIELDS[hoverData.dataId] ?? [];
  const fieldValues = tooltipFields
    .map(({ key, label }) => ({
      label,
      value: getFieldValue(hoverData.row, hoverData.fields, key),
    }))
    .filter(({ value }) => hasValue(value));

  if (fieldValues.length === 0) return null;

  const [x, y] = mousePos;

  return (
    <div
      className="pointer-events-none absolute z-[10001] max-w-xs rounded-md border border-gray-700 bg-gray-900/95 px-3 py-2 text-xs text-white shadow-lg"
      style={{ left: x + 12, top: y + 12 }}
    >
      <div className="space-y-1">
        {fieldValues.map(({ label, value }) => (
          <div key={label}>
            <span className="font-semibold text-gray-300">{label}: </span>
            <span>{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationTooltip;
