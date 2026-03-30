import { addDataToMap, updateMap } from '@kepler.gl/actions';
import KeplerGl from '@kepler.gl/components';
import { processGeojson } from '@kepler.gl/processors';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Chatbot from '../chatbot/Chatbot';
import Sidebar from '../sidebar/Sidebar';
import { getCityLocation } from '../apis/baseUrl';
import { useIsMobile } from '../../hooks/use-mobile';


const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

// Mapping city names to their GeoJSON file paths
// Handles potential name variations from API vs file names
const CITY_GEOJSON_MAP: Record<string, string> = {
  'Afef': '/data/Afef.geojson',
  'Old Damascus': '/data/Old Damascus.geojson',
  'Damascus': '/data/Old Damascus.geojson', // Handle API returning "Damascus"
  'Joubar': '/data/Joubar.geojson',
  'Jaramana': '/data/Jaramana.geojson',
  'Darayaa': '/data/Darayaa.geojson',
};

const SYRIA_CONFIG = {
  version: 'v1',
  config: {
    visState: {
      filters: [],
      layers: []
    },
    mapState: {
      bearing: 0,
      latitude: 34.8021,  // Syria's latitude
      longitude: 38.9968, // Syria's longitude
      pitch: 30,
      zoom: 6,
      dragRotate: true
    },
    mapStyle: {
      styleType: 'dark'
    }
  }
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
  const [selectedCityLocation, setSelectedCityLocation] = useState<{
    lat: number;
    lon: number;
    city: string;
  } | null>(null);

  // Set initial sidebar state based on screen size
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  // Prevent Kepler modal from auto-opening
  // The uiState in the Redux store should prevent the modal from opening initially
  // CSS fallback is also applied below to ensure modal stays hidden

  // Handle container resizing
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

    // Initial size measurement
    handleResize();

    // Set up resize observer for responsive sizing
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Load sample data when component mounts
  useEffect(() => {
    // Only load data if we have valid container dimensions
    if (size.width <= 0 || size.height <= 0) return;

    // Fetch earthquake data
    fetch('https://raw.githubusercontent.com/keplergl/kepler.gl-data/master/earthquakes/data.csv')
      .then(res => res.text())
      .then(csvData => {
        const rows = csvData.split('\n').slice(1).map(row => {
          const [timestamp, latitude, longitude, depth, magnitude, magType, id] = row.split(',');
          return [
            new Date(timestamp).getTime(),
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(depth),
            parseFloat(magnitude),
            magType,
            id
          ];
        });

        // Create dataset in Kepler.gl format
        const dataset = {
          info: {
            label: 'Earthquakes',
            id: 'earthquakes'
          },
          data: {
            fields: [
              { name: 'timestamp', format: 'UNIX', type: 'timestamp' },
              { name: 'latitude', format: '', type: 'real' },
              { name: 'longitude', format: '', type: 'real' },
              { name: 'depth', format: '', type: 'real' },
              { name: 'magnitude', format: '', type: 'real' },
              { name: 'magType', format: '', type: 'string' },
              { name: 'id', format: '', type: 'string' }
            ],
            rows
          }
        };

        // Dispatch action to add data to the map
        dispatch(
          addDataToMap({
            datasets: [dataset],
            options: {
              centerMap: false,
              readOnly: false
            },
            config: {
              version: 'v1',
              config: {
                visState: {
                  filters: [],
                  layers: [
                    {
                      id: 'earthquake',
                      type: 'point',
                      config: {
                        dataId: 'earthquakes',
                        label: 'Earthquakes',
                        color: [255, 0, 0],
                        columns: {
                          lat: 'latitude',
                          lng: 'longitude',
                          altitude: ''
                        },
                        isVisible: true,
                        visConfig: {
                          radius: 10,
                          fixedRadius: false,
                          opacity: 0.8,
                          outline: false,
                          filled: true
                        }
                      }
                    }
                  ]
                },
                mapState: {
                  bearing: 0,
                  latitude: 34.8021,  // Syria's latitude
                  longitude: 38.9968, // Syria's longitude
                  pitch: 30,
                  zoom: 6,           // Increased zoom level for better view of Syria
                  dragRotate: true
                },
                mapStyle: {
                  styleType: 'dark'
                }
              }
            }
          })
        );

        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setIsLoading(false);
      });
  }, [dispatch, size.width, size.height]);

  // Load and display GeoJSON polygon data for a selected city
  const loadCityGeoJSON = async (city: string) => {
    try {
      // Get the GeoJSON file path for this city
      const geojsonPath = CITY_GEOJSON_MAP[city];
      
      if (!geojsonPath) {
        console.warn(`No GeoJSON file found for city: ${city}. Available cities: ${Object.keys(CITY_GEOJSON_MAP).join(', ')}`);
        return;
      }

      // Fetch the GeoJSON file
      const response = await fetch(geojsonPath);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch GeoJSON: ${response.status} ${response.statusText}`);
      }

      const geojsonData = await response.json();

      // Validate GeoJSON structure
      if (!geojsonData || geojsonData.type !== 'FeatureCollection' || !Array.isArray(geojsonData.features)) {
        throw new Error('Invalid GeoJSON format: expected FeatureCollection');
      }

      // Process GeoJSON using Kepler's processor
      const processedData = processGeojson(geojsonData);

      // Handle null result from processor
      if (!processedData) {
        throw new Error('Failed to process GeoJSON data');
      }

      // Create a sanitized ID for the dataset
      const cityId = city.replace(/\s+/g, '_').toLowerCase();
      const datasetId = `city_geojson_${cityId}`;
      const layerId = `geojson_${datasetId}`;

      // Resolve the Name field - processGeojson preserves GeoJSON property names
      const nameField = processedData.fields?.find(
        (f: { name: string }) => f.name === 'Name' || f.name === 'name'
      );
      const colorFieldName = nameField?.name ?? 'Name';

      // Explicit geojson layer config: color polygons by NAME (categorical)
      const geojsonLayerConfig = {
        id: layerId,
        type: 'geojson' as const,
        config: {
          dataId: datasetId,
          label: `${city} Buildings`,
          columns: { geojson: '_geojson' },
          isVisible: true,
          colorField: colorFieldName
            ? { name: colorFieldName, type: 'string' as const }
            : undefined,
          colorScale: 'ordinal' as const,
          visConfig: {
            filled: true,
            stroked: true,
            opacity: 0.8,
            strokeWidth: 1
          }
        }
      };

      dispatch(
        addDataToMap({
          datasets: [
            {
              info: {
                label: `${city} Buildings`,
                id: datasetId
              },
              data: processedData
            }
          ],
          options: {
            centerMap: true,
            readOnly: false,
            keepExistingConfig: true
          },
          config: {
            version: 'v1',
            config: {
              visState: {
                layers: [geojsonLayerConfig]
              }
            }
          }
        })
      );

      console.log(`Successfully loaded GeoJSON for ${city} (${processedData.rows.length} features)`);
    } catch (error) {
      console.error(`Error loading GeoJSON for ${city}:`, error);
    }
  };

  // When a city is selected in the Sidebar, fetch its coordinates and focus the map
  const handleCitySelectedForMap = async (city: string) => {
    try {
      const location = await getCityLocation(city);

      // Expecting shape: { city, lat, lon }
      const { lat, lon } = location.data || location;

      if (
        typeof lat !== 'number' ||
        typeof lon !== 'number'
      ) {
        console.error('Invalid city location data:', location);
        return;
      }

      setSelectedCityLocation({ lat, lon, city });

      // Center and zoom the map on the selected city
      dispatch(
        updateMap({
          latitude: lat,
          longitude: lon,
          zoom: 14, // more focused city-level zoom
          transitionDuration: 500
        })
      );

      // Load and display the GeoJSON polygons for this city
      await loadCityGeoJSON(city);
    } catch (error) {
      console.error('Failed to focus map on city:', error);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-screen h-screen overflow-hidden ${className}`}>
      {/* Only render KeplerGl when we have valid dimensions */}
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

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-20">
          <div className="text-white text-sm">Loading map data...</div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        <button
          className="w-8 h-8 bg-gray-800 rounded text-white hover:bg-gray-700 transition-colors"
          onClick={() => {
            dispatch({
              type: 'ZOOM_IN'
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
              type: 'ZOOM_OUT'
            });
          }}
          aria-label="Zoom out"
        >
          −
        </button>
      </div>

      {/* Side Labels */}
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
      {/* Sidebar with toggle functionality */}
      <div 
        className={`absolute top-0 right-[23px] h-full w-80 z-[9999] pointer-events-auto transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isMobile && isSidebarOpen ? 'shadow-2xl' : ''}`}
      >
        <Sidebar onCitySelectedForMap={handleCitySelectedForMap} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Mobile backdrop when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998]"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar backdrop"
        />
      )}

      {/* Sidebar Toggle Button */}
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

      {/* Modal visibility is controlled by uiState in store.ts */}
      {/* The uiState.currentModal: null should prevent modal from auto-opening */}

      <div className="fixed bottom-4 right-[27rem] z-[10000] pointer-events-auto">
        <Chatbot />
      </div>
    </div>
  );
};

export default MapVisualization;
