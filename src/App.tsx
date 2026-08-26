// // import React, { useState } from 'react';
// // import Header from './components/layout/Header';
// // import MapPlaceholder from './components/map/MapPlaceholder';
// // import Sidebar from './components/sidebar/Sidebar';
// // import Chatbot from './components/chatbot/Chatbot';
// // import FilterControls from './components/filters/FilterControls';
// // import KpiTable from './components/kpi/KpiTable';

// // function App() {
// //   const [showKpiTable, setShowKpiTable] = useState(false);
// //   const [activeTab, setActiveTab] = useState('all');
// //   const [showChatbot, setShowChatbot] = useState(false);
// //   const [showFilterControls, setShowFilterControls] = useState(true);
// //   const [showSidebar, setShowSidebar] = useState(true);

// //   // For responsive design
// //   const [isMobile, setIsMobile] = useState(false);

// //   React.useEffect(() => {
// //     const checkMobile = () => {
// //       setIsMobile(window.innerWidth < 768);
// //       if (window.innerWidth < 768) {
// //         setShowFilterControls(false);
// //         setShowSidebar(false);
// //       }
// //     };

// //     checkMobile();
// //     window.addEventListener('resize', checkMobile);
// //     return () => window.removeEventListener('resize', checkMobile);
// //   }, []);

// //   return (
// //     <div className="flex flex-col h-screen bg-black text-white">
// //       <Header />

// //       <div className="flex-1 flex overflow-hidden relative">
// //         {/* Left sidebar for filters */}
// //         <FilterControls 
// //           className={`h-full ${isMobile ? 'responsive-filter' : ''} ${!showFilterControls && isMobile ? 'hidden' : ''}`} 
// //           isExpanded={!isMobile}
// //         />

// //         {/* Optional chatbot panel */}
// //         {showChatbot && <Chatbot className="h-full" />}

// //         {/* Main content area */}
// //         <div className="flex-1 flex flex-col overflow-hidden">
// //           {/* Tabs */}
// //           <div className="bg-[#262626] border-b border-gray-800 px-4 py-2 flex space-x-4 overflow-x-auto">
// //             <button 
// //               className={`px-3 py-1 text-sm rounded ${activeTab === 'all' ? 'tab-active' : 'tab-inactive'}`}
// //               onClick={() => setActiveTab('all')}
// //             >
// //               All
// //             </button>
// //             <button 
// //               className={`px-3 py-1 text-sm rounded ${activeTab === 'supply' ? 'tab-active' : 'tab-inactive'}`}
// //               onClick={() => setActiveTab('supply')}
// //             >
// //               Supply
// //             </button>
// //             <button 
// //               className={`px-3 py-1 text-sm rounded ${activeTab === 'risk' ? 'tab-active' : 'tab-inactive'}`}
// //               onClick={() => setActiveTab('risk')}
// //             >
// //               Risk
// //             </button>
// //             <button 
// //               className={`px-3 py-1 text-sm rounded ${activeTab === 'social' ? 'tab-active' : 'tab-inactive'}`}
// //               onClick={() => setActiveTab('social')}
// //             >
// //               Social
// //             </button>
// //             <button 
// //               className={`px-3 py-1 text-sm rounded ${activeTab === 'economic' ? 'tab-active' : 'tab-inactive'}`}
// //               onClick={() => setActiveTab('economic')}
// //             >
// //               Economic
// //             </button>
// //             <button 
// //               className={`px-3 py-1 text-sm rounded ${activeTab === 'physical' ? 'tab-active' : 'tab-inactive'}`}
// //               onClick={() => setActiveTab('physical')}
// //             >
// //               Physical
// //             </button>
// //           </div>

// //           {/* Main content with map and optional KPI table */}
// //           <div className="flex-1 relative overflow-hidden">
// //             <MapPlaceholder className="absolute inset-0" />

// //             {/* Mobile controls */}
// //             {isMobile && (
// //               <div className="absolute top-4 left-4 z-10 flex space-x-2">
// //                 <button 
// //                   className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-md"
// //                   onClick={() => setShowFilterControls(!showFilterControls)}
// //                 >
// //                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
// //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
// //                   </svg>
// //                 </button>
// //                 <button 
// //                   className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-md"
// //                   onClick={() => setShowSidebar(!showSidebar)}
// //                 >
// //                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
// //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
// //                   </svg>
// //                 </button>
// //               </div>
// //             )}

// //             {/* Chatbot toggle button */}
// //             <div className="absolute bottom-16 left-4 z-10">
// //               <button 
// //                 className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-full shadow-lg"
// //                 onClick={() => setShowChatbot(!showChatbot)}
// //               >
// //                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
// //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
// //                 </svg>
// //               </button>
// //             </div>

// //             {/* Evaluation button */}
// //             <div className="absolute bottom-4 right-4 z-10 ">
// //               <button 
// //                 className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center shadow-lg"
// //                 onClick={() => setShowKpiTable(!showKpiTable)}
// //               >
// //                 <span>Evaluation: </span>
// //                 <span className="text-cyan-400 ml-1">Masadir Bersch</span>
// //                 <svg className={`w-5 h-5 ml-2 transform ${showKpiTable ? 'rotate-180' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
// //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
// //                 </svg>
// //               </button>
// //             </div>

// //             {/* KPI Table (conditionally rendered) */}
// //             {showKpiTable && (
// //               <div className="absolute inset-x-0 bottom-10 z-10 p-4 animate-fade-in-up">
// //                 <KpiTable />
// //               </div>
// //             )}
// //           </div>
// //         </div>

// //         {/* Right sidebar for stats */}
// //         <Sidebar 
// //           className={`h-full ${isMobile ? 'responsive-sidebar' : ''} ${!showSidebar && isMobile ? 'hidden' : ''}`} 
// //         />
// //       </div>
// //     </div>
// //   );
// // }

// // export default App;
// // src/App.tsx
// import React from 'react';
// import KeplerGl from '@kepler.gl/components';
// import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';

// const MAP_KEY = import.meta.env.STADIA_KEY;
// // point Kepler at your Stadia‐hosted style JSON:
// const STADIA_STYLE_URL = `https://tiles.stadiamaps.com/styles/osm_bright/style.json?api_key=${MAP_KEY}`;

// const App: React.FC = () => (
//   <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
//     <AutoSizer>
//       {({ width, height }) => (
//         <KeplerGl
//           id="kepler"
//           width={width}
//           height={height}
//           // override default Mapbox GL URL to use your own tiles:
//           mapboxApiUrl={STADIA_STYLE_URL}
//         />
//       )}
//     </AutoSizer>
//   </div>
// );

// export default App;
// src/App.tsx
import { Provider } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { LoginForm } from './components/Auth/Login';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { RegisterForm } from './components/Auth/Register';
import MapVisualization from './components/map/MapVisualization';
import { AUTH_DISABLED } from './config/env';
import { store } from './store';




const App: React.FC = () => {
  return (
    <div className="w-screen h-screen">
      <Provider store={store}>
        <Router>
          <Routes>
            <Route
              path="/"
              element={AUTH_DISABLED ? <Navigate to="/map" replace /> : <LoginForm />}
            />
            <Route
              path="/register"
              element={AUTH_DISABLED ? <Navigate to="/map" replace /> : <RegisterForm />}
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapVisualization />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </Provider>
    </div>

  );
};

export default App;
