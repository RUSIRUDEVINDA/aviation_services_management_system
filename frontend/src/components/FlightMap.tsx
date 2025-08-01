
import React from 'react';

interface FlightMapProps {
  flightData: any;
}

const FlightMap: React.FC<FlightMapProps> = ({ flightData }) => {
  // Check if flight is active to determine whether to show the map
  const isActive = flightData.status.toLowerCase() === 'active';
  
  return (
    <div className="w-full h-full min-h-[300px]">
      {isActive ? (
        <iframe 
          src="https://www.flightradar24.com/simple" 
          className="w-full h-full min-h-[300px] border-0 rounded-lg"
          title="Flightradar24 Map"
          allow="geolocation"
        ></iframe>
      ) : (
        <div className="w-full h-full min-h-[300px] bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-1">Flight Map</h3>
            <p className="text-sm text-gray-500">
              Flight tracking map will be available when the flight is active.
              {flightData.status.toLowerCase() === 'scheduled' && " Your flight is currently scheduled."}
              {flightData.status.toLowerCase() === 'delayed' && " Your flight is currently delayed."}
              {flightData.status.toLowerCase() === 'cancelled' && " Your flight has been cancelled."}
              {flightData.status.toLowerCase() === 'landed' && " Your flight has already landed."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightMap;
