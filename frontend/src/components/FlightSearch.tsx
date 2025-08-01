import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, Plus, Minus } from 'lucide-react';
import { format, isAfter, addDays } from 'date-fns';
import { toast } from "@/hooks/use-toast";

interface FlightSearchProps {
  onSearch: (searchParams: any) => void;
  isLoading: boolean;
}

const FlightSearch: React.FC<FlightSearchProps> = ({ onSearch, isLoading }) => {
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [departureAirport, setDepartureAirport] = useState<string>('');
  const [arrivalAirport, setArrivalAirport] = useState<string>('');
  const [departureDate, setDepartureDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [passengers, setPassengers] = useState<number>(1);
  const [flightClass, setFlightClass] = useState<string>('economy');
  
  // Set initial dates on component mount
  useEffect(() => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const nextWeek = addDays(today, 7);
    
    setDepartureDate(format(tomorrow, 'yyyy-MM-dd'));
    setReturnDate(format(nextWeek, 'yyyy-MM-dd'));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate departure and arrival airports are not the same
    if (departureAirport === arrivalAirport && departureAirport !== '') {
      toast({
        title: "Invalid Selection",
        description: "Departure and arrival airports cannot be the same.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate dates
    const depDate = new Date(departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    if (depDate < today) {
      toast({
        title: "Invalid Date",
        description: "Departure date cannot be in the past.",
        variant: "destructive",
      });
      return;
    }
    
    if (tripType === 'roundtrip') {
      const retDate = new Date(returnDate);
      if (retDate < depDate) {
        toast({
          title: "Invalid Date",
          description: "Return date cannot be before departure date.",
          variant: "destructive",
        });
        return;
      }
    }
    
    onSearch({
      tripType,
      departureAirport,
      arrivalAirport,
      departureDate,
      returnDate: tripType === 'roundtrip' ? returnDate : '',
      passengers,
      flightClass
    });
  };

  const increasePassengers = () => {
    if (passengers < 9) {
      setPassengers(passengers + 1);
    }
  };

  const decreasePassengers = () => {
    if (passengers > 1) {
      setPassengers(passengers - 1);
    }
  };

  // Get minimum date for the return input
  const getMinReturnDate = () => {
    if (departureDate) {
      return departureDate;
    }
    return format(new Date(), 'yyyy-MM-dd');
  };

  return (
    <div className="premium-card shadow-lg transition-all duration-300 hover:shadow-xl animate-fade-in">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy-800">Search Flights</h2>
          <div className="flex bg-navy-50 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tripType === 'roundtrip' 
                  ? 'bg-white text-navy-800 shadow-sm' 
                  : 'text-navy-600 hover:bg-navy-100'
              }`}
              onClick={() => setTripType('roundtrip')}
              type="button"
            >
              Round Trip
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tripType === 'oneway' 
                  ? 'bg-white text-navy-800 shadow-sm' 
                  : 'text-navy-600 hover:bg-navy-100'
              }`}
              onClick={() => setTripType('oneway')}
              type="button"
            >
              One Way
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="departureAirport" className="block text-sm font-medium text-navy-600 mb-1">
                From
              </label>
              <select
                id="departureAirport"
                className="premium-select"
                value={departureAirport}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setDepartureAirport(newValue);
                  
                  // Clear arrival airport if it's the same as the new departure airport
                  if (newValue === arrivalAirport && newValue !== '') {
                    setArrivalAirport('');
                  }
                }}
                required
              >
                <option value="">Select departure airport</option>
                <option value="JFK">New York (JFK)</option>
                <option value="LAX">Los Angeles (LAX)</option>
                <option value="SFO">San Francisco (SFO)</option>
                <option value="ORD">Chicago (ORD)</option>
                <option value="MIA">Miami (MIA)</option>
                <option value="LHR">London (LHR)</option>
                <option value="CDG">Paris (CDG)</option>
                <option value="DXB">Dubai (DXB)</option>
                <option value="SIN">Singapore (SIN)</option>
                <option value="NRT">Tokyo (NRT)</option>
              </select>
            </div>
            
            <div className="relative">
              <label htmlFor="arrivalAirport" className="block text-sm font-medium text-navy-600 mb-1">
                To
              </label>
              <select
                id="arrivalAirport"
                className="premium-select"
                value={arrivalAirport}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setArrivalAirport(newValue);
                  
                  // Clear departure airport if it's the same as the new arrival airport
                  if (newValue === departureAirport && newValue !== '') {
                    setDepartureAirport('');
                  }
                }}
                required
              >
                <option value="">Select arrival airport</option>
                <option value="JFK">New York (JFK)</option>
                <option value="LAX">Los Angeles (LAX)</option>
                <option value="SFO">San Francisco (SFO)</option>
                <option value="ORD">Chicago (ORD)</option>
                <option value="MIA">Miami (MIA)</option>
                <option value="LHR">London (LHR)</option>
                <option value="CDG">Paris (CDG)</option>
                <option value="DXB">Dubai (DXB)</option>
                <option value="SIN">Singapore (SIN)</option>
                <option value="NRT">Tokyo (NRT)</option>
              </select>
              <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-3 bg-navy-100 rounded-full p-1.5 shadow-sm">
                <ArrowRight className="h-4 w-4 text-navy-600" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="departureDate" className="block text-sm font-medium text-navy-600 mb-1">
                Departure Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="departureDate"
                  className="premium-input pl-10"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Calendar className="h-4 w-4 text-navy-500" />
                </div>
              </div>
            </div>
            
            {tripType === 'roundtrip' && (
              <div>
                <label htmlFor="returnDate" className="block text-sm font-medium text-navy-600 mb-1">
                  Return Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="returnDate"
                    className="premium-input pl-10"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={getMinReturnDate()}
                    required={tripType === 'roundtrip'}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Calendar className="h-4 w-4 text-navy-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="passengers" className="block text-sm font-medium text-navy-600 mb-1">
                Passengers
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={decreasePassengers}
                  className="p-2 rounded-l-md bg-navy-50 text-navy-600 hover:bg-navy-100 border border-navy-200 transition-colors"
                  disabled={passengers <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="px-4 py-2 bg-white border-t border-b border-navy-200 text-navy-800 font-medium">
                  {passengers}
                </div>
                <button
                  type="button"
                  onClick={increasePassengers}
                  className="p-2 rounded-r-md bg-navy-50 text-navy-600 hover:bg-navy-100 border border-navy-200 transition-colors"
                  disabled={passengers >= 9}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="flightClass" className="block text-sm font-medium text-navy-600 mb-1">
                Class
              </label>
              <select
                id="flightClass"
                className="premium-select"
                value={flightClass}
                onChange={(e) => setFlightClass(e.target.value)}
              >
                <option value="economy">Economy</option>
            
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            className="premium-button-primary w-full flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : (
              'Search Flights'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FlightSearch;
