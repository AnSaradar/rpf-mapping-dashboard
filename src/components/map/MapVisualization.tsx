import {
  addDataToMap,
  layerVisConfigChange,
  layerVisualChannelConfigChange,
  updateMap,
} from '@kepler.gl/actions';
import KeplerGl from '@kepler.gl/components';
import { processGeojson } from '@kepler.gl/processors';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Chatbot from '../chatbot/Chatbot';
import Sidebar from '../sidebar/Sidebar';
import { getCityLocation } from '../apis/baseUrl';
import {
  AspectColorRange,
  buildAspectColorConfig,
  normalizeAspect,
} from '../../constants/aspectColors';
import { SYRIA_MAP_STATE, SYRIA_MAP_STYLE } from '../../constants/syriaMapConfig';
import { useIsMobile } from '../../hooks/use-mobile';
import { store } from '../../store';
import LocationTooltip from './LocationTooltip';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;
const LOCATIONS_DATASET_ID = 'locations';
const LOCATIONS_LAYER_ID = 'locations_layer';
const LOCATIONS_GEOJSON_URL = '/data/locations.geojson';
const JOUBAR_DATASET_ID = 'joubar';
const JOUBAR_LAYER_ID = 'joubar_layer';
const JOUBAR_GEOJSON_URL = '/data/Joubar.geojson';

const LOCATIONS_VIS_CONFIG = {
  filled: true,
  stroked: true,
  opacity: 0.7,
  strokeWidth: 1,
  radius: 8,
} as const;

const JOUBAR_COLOR: [number, number, number] = [220, 38, 38];

type KeplerLayer = {
  id: string;
  config?: {
    dataId?: string;
    colorField?: { name?: string } | null;
    colorScale?: string;
    visConfig?: { colorRange?: { colorMap?: unknown[] } };
  };
};

const normalizeLocationsGeojson = (geojsonData: {
  type: string;
  features: Array<{
    properties?: Record<string, unknown>;
    [key: string]: unknown;
  }>;
}) => ({
  ...geojsonData,
  features: geojsonData.features.map((feature) => {
    const { points: _points, ...rest } = feature.properties ?? {};
    const aspect = rest.aspect;

    const normalizedAspect =
      typeof aspect === 'string' && aspect.trim() ? normalizeAspect(aspect) : null;

    return {
      ...feature,
      properties: {
        ...rest,
        ...(normalizedAspect ? { aspect: normalizedAspect } : {}),
      },
    };
  }),
});

const normalizeJoubarGeojson = (geojsonData: {
  type: string;
  features: Array<{
    properties?: Record<string, unknown>;
    [key: string]: unknown;
  }>;
}) => ({
  ...geojsonData,
  features: geojsonData.features.map((feature) => {
    const properties = feature.properties ?? {};
    const name = properties.Name;

    return {
      ...feature,
      properties: {
        ...properties,
        name: typeof name === 'string' ? name : null,
      },
    };
  }),
});

const findLayerByDataId = (dataId: string): KeplerLayer | undefined => {
  const keplerState = store.getState().keplerGl as {
    map?: { visState?: { layers?: KeplerLayer[] } };
  };
  return keplerState.map?.visState?.layers?.find(
    (layer) => layer.config?.dataId === dataId
  );
};

const layerNeedsAspectColors = (layer: KeplerLayer): boolean => {
  const { colorField, colorScale, visConfig } = layer.config ?? {};
  const colorMapCount = visConfig?.colorRange?.colorMap?.length ?? 0;
  return (
    colorField?.name !== 'aspect' ||
    colorScale !== 'customOrdinal' ||
    colorMapCount === 0
  );
};

const waitForLayer = (
  dataId: string,
  maxAttempts = 30,
  intervalMs = 100
): Promise<KeplerLayer | null> =>
  new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      const layer = findLayerByDataId(dataId);
      if (layer) {
        resolve(layer);
        return;
      }
      attempts += 1;
      if (attempts >= maxAttempts) {
        resolve(null);
        return;
      }
      setTimeout(check, intervalMs);
    };
    check();
  });

const applyAspectColorsToLayer = (
  dispatch: ReturnType<typeof useDispatch>,
  layer: KeplerLayer,
  colorRange: AspectColorRange
) => {
  dispatch(
    layerVisualChannelConfigChange(
      layer as never,
      {
        colorField: { name: 'aspect', type: 'string' },
        colorScale: 'customOrdinal',
      },
      'color'
    )
  );
  dispatch(
    layerVisConfigChange(layer as never, {
      ...LOCATIONS_VIS_CONFIG,
      colorRange,
    })
  );
};

const fetchGeojson = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const geojsonData = await response.json();
  if (
    !geojsonData ||
    geojsonData.type !== 'FeatureCollection' ||
    !Array.isArray(geojsonData.features)
  ) {
    throw new Error(`Invalid GeoJSON format from ${url}: expected FeatureCollection`);
  }

  return geojsonData;
};

interface MapVisualizationProps {
  className?: string;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleResize = () => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (size.width <= 0 || size.height <= 0) return;

    const loadMapData = async () => {
      try {
        const [locationsGeojson, joubarGeojson] = await Promise.all([
          fetchGeojson(LOCATIONS_GEOJSON_URL),
          fetchGeojson(JOUBAR_GEOJSON_URL),
        ]);

        const normalizedLocations = normalizeLocationsGeojson(locationsGeojson);
        const processedLocations = processGeojson(normalizedLocations);
        if (!processedLocations) {
          throw new Error('Failed to process locations GeoJSON');
        }

        const normalizedJoubar = normalizeJoubarGeojson(joubarGeojson);
        const processedJoubar = processGeojson(normalizedJoubar);
        if (!processedJoubar) {
          throw new Error('Failed to process Joubar GeoJSON');
        }

        const { colorRange: locationsColorRange } = buildAspectColorConfig(processedLocations);

        const locationsLayerConfig = {
          id: LOCATIONS_LAYER_ID,
          type: 'geojson' as const,
          config: {
            dataId: LOCATIONS_DATASET_ID,
            label: 'Locations',
            columns: { geojson: '_geojson' },
            isVisible: true,
            visConfig: {
              ...LOCATIONS_VIS_CONFIG,
              colorRange: locationsColorRange,
            },
          },
          visualChannels: {
            colorField: { name: 'aspect', type: 'string' },
            colorScale: 'customOrdinal',
          },
        };

        const joubarLayerConfig = {
          id: JOUBAR_LAYER_ID,
          type: 'geojson' as const,
          config: {
            dataId: JOUBAR_DATASET_ID,
            label: 'Joubar',
            columns: { geojson: '_geojson' },
            color: JOUBAR_COLOR,
            isVisible: true,
            visConfig: {
              ...LOCATIONS_VIS_CONFIG,
              strokeColor: JOUBAR_COLOR,
            },
          },
        };

        dispatch(
          addDataToMap({
            datasets: [
              {
                info: {
                  label: 'Locations',
                  id: LOCATIONS_DATASET_ID,
                },
                data: processedLocations,
              },
              {
                info: {
                  label: 'Joubar',
                  id: JOUBAR_DATASET_ID,
                },
                data: processedJoubar,
              },
            ],
            options: {
              centerMap: false,
              readOnly: false,
            },
            config: {
              version: 'v1',
              config: {
                visState: {
                  filters: [],
                  layers: [locationsLayerConfig, joubarLayerConfig],
                  interactionConfig: {
                    // Must stay enabled — Kepler sets pickable = tooltip.enabled on geojson layers.
                    // Kepler's popover is hidden via .map-popover CSS; LocationTooltip renders ours.
                    tooltip: {
                      enabled: true,
                      fieldsToShow: {
                        [LOCATIONS_DATASET_ID]: [
                          { name: 'name', format: null },
                          { name: 'description', format: null },
                          { name: 'aspect', format: null },
                          { name: 'sub_aspect', format: null },
                          { name: 'category', format: null },
                        ],
                        [JOUBAR_DATASET_ID]: [
                          { name: 'name', format: null },
                          { name: 'description', format: null },
                        ],
                      },
                      compareMode: false,
                      compareType: null,
                    },
                    coordinate: {
                      enabled: true,
                    },
                  },
                },
                mapState: SYRIA_MAP_STATE,
                mapStyle: SYRIA_MAP_STYLE,
              },
            },
          })
        );

        const locationsLayer = await waitForLayer(LOCATIONS_DATASET_ID);

        if (locationsLayer && layerNeedsAspectColors(locationsLayer)) {
          applyAspectColorsToLayer(dispatch, locationsLayer, locationsColorRange);
        }

        console.log(
          `Loaded locations (${processedLocations.rows.length}) and Joubar (${processedJoubar.rows.length})`
        );
      } catch (error) {
        console.error('Error loading map GeoJSON:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMapData();
  }, [dispatch, size.width, size.height]);

  const handleCitySelectedForMap = async (city: string) => {
    try {
      const location = await getCityLocation(city);
      const { lat, lon } = location.data || location;

      if (typeof lat !== 'number' || typeof lon !== 'number') {
        console.error('Invalid city location data:', location);
        return;
      }

      dispatch(
        updateMap({
          latitude: lat,
          longitude: lon,
          zoom: 14,
          transitionDuration: 500,
        })
      );
    } catch (error) {
      console.error('Failed to focus map on city:', error);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-screen h-screen overflow-hidden ${className}`}>
      {size.width > 0 && size.height > 0 && (
        <KeplerGl
          id="map"
          mapboxApiAccessToken={MAPBOX_TOKEN}
          width={size.width}
          height={size.height}
          onMapLoad={() => {
            console.log('Map loaded successfully');
          }}
          initialConfigLoadingMessage="Loading Syria map..."
        />
      )}

      <LocationTooltip />

      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-20">
          <div className="text-white text-sm">Loading map data...</div>
        </div>
      )}

      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        <button
          className="w-8 h-8 bg-gray-800 rounded text-white hover:bg-gray-700 transition-colors"
          onClick={() => {
            dispatch({
              type: 'ZOOM_IN',
            });
          }}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          className="w-8 h-8 bg-gray-800 rounded text-white hover:bg-gray-700 transition-colors"
          onClick={() => {
            dispatch({
              type: 'ZOOM_OUT',
            });
          }}
          aria-label="Zoom out"
        >
          −
        </button>
      </div>

      <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between py-8 z-10">
        {['Global', 'Mapping'].map((label) => (
          <div key={label} className="flex flex-col items-center">
            <span className="text-white text-xs transform -rotate-90 whitespace-nowrap">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-8 flex flex-col justify-between py-8 z-10">
        {['Evaluation'].map((label) => (
          <div key={label} className="flex flex-col items-center">
            <span className="text-white text-xs transform -rotate-90 whitespace-nowrap">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div
        className={`absolute top-0 right-[23px] h-full w-80 z-[9999] pointer-events-auto transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isMobile && isSidebarOpen ? 'shadow-2xl' : ''}`}
      >
        <Sidebar onCitySelectedForMap={handleCitySelectedForMap} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998]"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar backdrop"
        />
      )}

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`absolute top-4 z-[10000] bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-md transition-all duration-300 ${
          isSidebarOpen ? 'right-[23rem]' : 'right-[23px]'
        }`}
        aria-label={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        {isSidebarOpen ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>

      <div className="fixed bottom-4 right-4 z-[10000] pointer-events-auto">
        <Chatbot />
      </div>
    </div>
  );
};

export default MapVisualization;
