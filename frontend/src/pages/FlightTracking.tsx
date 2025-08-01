
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FlightStatus from '../components/FlightStatus';

const FlightTracking = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-navy-800 mb-2">Flight Status Tracking</h1>
            <p className="text-navy-600 mb-4">
              Get real-time information about your flight status, location, and details.
            </p>
          </div>
          
          <FlightStatus />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FlightTracking;
