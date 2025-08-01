
import React, { useEffect, useState } from 'react';
import { CalendarClock, Users, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { getAirTaxiLocations } from '../services/api';

interface AirTaxiSearchProps {
  onSearch: (searchParams: any) => void;
  isLoading: boolean;
}

interface Location {
  id: number;
  name: string;
  city: string;
  code: string;
}

const AirTaxiSearch: React.FC<AirTaxiSearchProps> = ({ onSearch, isLoading }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [pickup, setPickup] = useState<number | ''>('');
  const [destination, setDestination] = useState<number | ''>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [passengers, setPassengers] = useState<number>(1);
  const [locationError, setLocationError] = useState<string>('');
  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const result = await getAirTaxiLocations() as Location[];
        setLocations(result);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    
    fetchLocations();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that pickup and destination are different
    if (pickup === destination) {
      setLocationError('Pickup and destination cannot be the same');
      return;
    }
    
    setLocationError('');
    
    const pickupLocation = locations.find(loc => loc.id === pickup);
    const destinationLocation = locations.find(loc => loc.id === destination);
    
    onSearch({
      pickup: pickupLocation,
      destination: destinationLocation,
      dateTime: `${date}T${time}`,
      passengers
    });
  };
  
  return (
    <div className="glass rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-navy-800 mb-6">Book Air Taxi</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="pickup" className="block text-sm font-medium text-navy-600 mb-1">
                Pickup Location
              </label>
              <select
                id="pickup"
                className={`form-control ${locationError ? 'border-red-500' : ''}`}
                value={pickup}
                onChange={(e) => setPickup(e.target.value ? parseInt(e.target.value) : '')}
                required
              >
                <option value="">Select pickup location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <label htmlFor="destination" className="block text-sm font-medium text-navy-600 mb-1">
                Destination
              </label>
              <select
                id="destination"
                className={`form-control ${locationError ? 'border-red-500' : ''}`}
                value={destination}
                onChange={(e) => setDestination(e.target.value ? parseInt(e.target.value) : '')}
                required
              >
                <option value="">Select destination</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </option>
                ))}
              </select>
              
              <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-3 bg-navy-100 rounded-full p-1.5">
                <ArrowRight className="h-4 w-4 text-navy-600" />
              </div>
            </div>
          </div>
          
          {locationError && (
            <div className="mb-4 text-red-500 text-sm">{locationError}</div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-navy-600 mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  className="form-control pl-10"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
                <CalendarClock className="h-5 w-5 text-navy-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-navy-600 mb-1">
                Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  id="time"
                  className="form-control pl-10"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
                <CalendarClock className="h-5 w-5 text-navy-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="passengers" className="block text-sm font-medium text-navy-600 mb-1">
              Number of Passengers
            </label>
            <div className="relative">
              <select
                id="passengers"
                className="form-control pl-10"
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value))}
                required
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'passenger' : 'passengers'}
                  </option>
                ))}
              </select>
              <Users className="h-5 w-5 text-navy-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search Air Taxis'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AirTaxiSearch;
