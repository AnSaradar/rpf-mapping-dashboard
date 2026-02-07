import { addDataToMap } from '@kepler.gl/actions';
import KeplerGl from '@kepler.gl/components';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Chatbot from '../chatbot/Chatbot';
import Sidebar from '../sidebar/Sidebar';


const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';
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
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

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
 <div className="absolute top-0 right-[23px] h-full w-80 z-[9999] pointer-events-auto">
    <Sidebar />
  </div>

<div className="fixed bottom-4 right-[27rem] z-[10000] pointer-events-auto">
    <Chatbot />
  </div>
    </div>
  );
};

export default MapVisualization;
