import React from 'react';
import { Plane } from 'lucide-react';

const FlightStatus: React.FC = () => {
  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
      
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-navy-700">Live Flight Tracker</h2>
        </div>
        <div className="h-[700px] w-full">
          <iframe 
            src="https://globe.adsbexchange.com/" 
            width="100%" 
            height="600" 
            frameBorder="0"
            title="ADS-B Exchange Live Flight Tracker"
            className="w-full"
            allow="geolocation; fullscreen"
          ></iframe>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 text-center">
        Flight data provided by Adsbexchange
      </div>
    </div>
  );
};

export default FlightStatus;