import React, { useState } from 'react';
import { getCitiesList, getData } from '../apis/baseUrl';
import { aspectColors } from './aspectColors';
import CityBarChart from './chart';

interface SidebarProps {
  className?: string;
  onCitySelectedForMap?: (city: string) => void;
  onClose?: () => void;
}

interface StatData {
  label: string;
  value: string;
  unit?: string;
}

interface MedicalBuildingData {
  type: string;
  count: number;
  level: number;
}

interface EquipmentData {
  type: string;
  count: number;
  level: number;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '', onCitySelectedForMap, onClose }) => {  
  const generalStats: StatData[] = [
    { label: 'Population', value: '8,143' },
    { label: 'Area', value: '10', unit: 'km²' },
  ];

  const buildingStats: StatData[] = [
    { label: 'Total Buildings', value: '1036' },
    { label: 'Residential Building Area', value: '6', unit: 'km²' },
    { label: 'Available Building Area', value: '0.2', unit: 'km²' },
  ];

  const medicalBuildingStats: StatData[] = [
    { label: 'Medical Buildings Area', value: '2', unit: 'km²' },
  ];

  const medicalBuildings: MedicalBuildingData[] = [
    { type: 'Hospitals', count: 2, level: 3 },
    { type: 'Clinics', count: 3, level: 10 },
    { type: 'Inpatient beds', count: 800, level: 100 },
    { type: 'Emergency beds', count: 15, level: 40 },
    { type: 'ICU beds', count: 8, level: 20 },
  ];

  const equipmentItems: EquipmentData[] = [
    { type: 'MRI Scanner', count: 1, level: 1 },
    { type: 'CT Scanner', count: 2, level: 2 },
    { type: 'X-Ray Machines', count: 5, level: 5 },
    { type: 'Ultrasound Machines', count: 6, level: 7 },
    { type: 'Ventilators', count: 25, level: 40 },
  ];


const [activeAspect, setActiveAspect] = useState("All");
const [showCities, setShowCities] = useState(false);
const [cities, setCities] = useState<string[]>([]);
const [selectedCity, setSelectedCity] = useState<string | null>(null);
const [cityScores, setCityScores] = useState<any[]>([]);



const handleDropdownClick = async () => {
  setShowCities(prev => !prev); 

  if (cities.length === 0) { 
    try {
      const response = await getCitiesList(); 
      setCities(response.data.cities);         
    } catch (error) {
      console.error("Failed to fetch cities", error);
    }
  }
};

const handleCitySelect = async (city: string) => {
  setSelectedCity(city);

  try {
    const stats = await getCityStats(city);
    setCityScores(stats.data.scores);
    console.log("city scores:", stats.data.scores)
    console.log("City stats:", stats);
  } catch (err) {
    console.error(err);
  }

  // Notify parent (e.g. MapVisualization) so it can focus the map on this city
  if (onCitySelectedForMap) {
    onCitySelectedForMap(city);
  }

  setShowCities(false)
};

const getCityStats = async (city: string) => {
  const result = await getData(`/stats?city=${city}`);

  if (result.success) {
    return result.data;
  } else {
        console.log("error fetching stats:", result.data.error)
    throw new Error(result.error || "Failed to fetch city stats");
  }
};

 return (
  <div className={`bg-[#242730] border-l border-gray-800 w-[22rem] h-screen overflow-y-auto flex-shrink-0 ${className}`}>

    {/* Nav bar */}

<div className="grid grid-cols-5 gap-y-4 py-4 px-4 text-center">

  {Object.keys(aspectColors).map((label, idx) => (    // ← get aspects from the color file
    <button
      key={idx}
      onClick={() => setActiveAspect(label)}           
      className="flex flex-col items-center hover:text-white transition-colors"
    >

      <span
        className={`${
          activeAspect === label
            ? "font-semibold text-white"
            : "text-gray-400"
        } text-[11px] leading-tight h-[28px] flex items-center justify-center transition-colors`}
      >
        {label}                                        
      </span>

      <div
        className={`w-full h-[3px] mt-1 rounded-full transition-transform duration-200 ${
          activeAspect === label ? "scale-105" : "scale-100"
        }`}
        style={{
          backgroundColor: aspectColors[label]         
        }}
      />
    </button>
  ))}

</div>


    <div className="p-4 space-y-6">

      {/* Top Header */}
      <div className="flex items-center justify-between relative">
        <h2 className="text-lg font-semibold text-white">
          Evaluation: <span className="text-[#20BBD6]">{selectedCity || "Select City"}</span>
        </h2>

        <div className="flex items-center gap-2">
          <button className="text-gray-400 hover:text-white" onClick={handleDropdownClick}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {onClose && (
            <button 
              className="text-gray-400 hover:text-white transition-colors" 
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {showCities && (
          <div className={`
            absolute right-0 top-8 w-40 bg-[#29323C] border border-gray-700 rounded-lg shadow-lg z-50
            transform transition-all duration-200 origin-top
            opacity-100 scale-100
          `}>
            {cities.map((city, index) => (
              <div
                key={index}
                className="text-white py-1.5 px-3 hover:bg-gray-700 cursor-pointer"
                onClick={() => handleCitySelect(city)}
              >
                {city}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
    <CityBarChart scores={cityScores} activeAspect={activeAspect} />

      <div className="space-y-4">

<div className="flex items-center justify-between text-sm text-gray-300">
        <div className="flex gap-3 text-sm text-gray-300">
          <span className="font-medium text-white">Sub-Aspect: </span>
           ALL  </div>
           <button className="transition-colors duration-200">
    <svg
      className="w-4 h-4 text-gray-400 hover:text-[#20BBD6] transition-colors"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      />
    </svg>
  </button>
</div>

        <div className="flex gap-3 text-sm text-gray-300">
          <span className="font-medium text-white">Population: </span>
          {generalStats[0].value}
        </div>

        <div className="flex gap-3 text-sm text-gray-300">
          <span className="font-medium text-white">Area: </span>
          {generalStats[1].value} {generalStats[1].unit}
        </div>

        <div className="flex gap-3 text-sm text-gray-300">
          <span className="font-medium text-white">Total Buildings:</span>
          {buildingStats[0].value}
        </div>

        <div className="flex gap-3 text-sm text-gray-300">
          <span className="font-medium text-white">Residential Area:</span>
          {buildingStats[1].value} {buildingStats[1].unit}
        </div>

        <div className="flex gap-3 text-sm text-gray-300">
          <span className="font-medium text-white">Available Area:</span>
          {buildingStats[2].value} {buildingStats[2].unit}
        </div>
      </div>
    </div>
  </div>
);

};

export default Sidebar;
