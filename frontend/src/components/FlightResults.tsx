import React from 'react';
import {format,parseISO} from 'date-fns';
import { ArrowRight, Clock, Plane, Calendar, CreditCard } from 'lucide-react';

interface Flight {
  id: string;
  airline: string;
  departureAirport: string;
  departureCity: string;
  arrivalAirport: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  class: string;
  seatsAvailable: number;
}

interface FlightResultsProps {
  flights: Flight[];
  selectedFlight: Flight | null;
  returnFlights?: Flight[];
  selectedReturnFlight: Flight | null;
  isRoundTrip: boolean;
  onSelectFlight: (flight: Flight, isReturn?: boolean) => void;
  onContinue: () => void;
}

const FlightResults: React.FC<FlightResultsProps> = ({
  flights,
  selectedFlight,
  returnFlights,
  selectedReturnFlight,
  isRoundTrip,
  onSelectFlight,
  onContinue
}) => {
  if (!flights || flights.length === 0) {
    return (
      <div className="premium-card p-6 mt-6 text-center animate-fade-in">
        <p className="text-navy-600">No flights found matching your criteria. Please try different search parameters.</p>
      </div>
    );
  }

  const renderFlights = (flightList: Flight[], selected: Flight | null, isReturn = false) => (
    <div className="space-y-4">
      {flightList.map((flight, index) => (
        <div 
          key={flight.id}
          className={`premium-card p-4 transition-all duration-300 animate-fade-in`}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${selected?.id === flight.id ? 'bg-navy-600' : 'bg-transparent'}`}></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0 flex items-center">
              <div className="bg-navy-50 rounded-full p-2 mr-3 hidden md:flex">
                <Plane className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-navy-800">{flight.airline}</div>
                <div className="text-sm text-navy-500">{flight.id} • {flight.class}</div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-8 w-full md:w-auto">
              <div className="text-center">
                <div className="text-xl font-bold text-navy-800">
                  {format(parseISO(flight.departureTime), 'HH:mm')}
                </div>
                <div className="text-sm text-navy-600">{flight.departureAirport}</div>
                <div className="text-xs text-navy-400">{flight.departureCity}</div>
              </div>
              
              <div className="hidden md:block w-32 text-center">
                <div className="relative">
                  <div className="absolute left-0 right-0 top-1/2 border-t border-navy-200"></div>
                  <div className="relative flex items-center justify-center">
                    <div className="bg-white px-2 text-xs text-navy-500">
                      <Clock className="h-3 w-3 inline-block mr-1" />
                      {flight.duration}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <div className="w-2 h-2 rounded-full bg-navy-500"></div>
                  <ArrowRight className="h-3 w-3 text-navy-500" />
                  <div className="w-2 h-2 rounded-full bg-navy-500"></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-bold text-navy-800">
                  {format(parseISO(flight.arrivalTime), 'HH:mm')}
                </div>
                <div className="text-sm text-navy-600">{flight.arrivalAirport}</div>
                <div className="text-xs text-navy-400">{flight.arrivalCity}</div>
              </div>
              
              <div className="md:ml-auto">
                <div className="text-2xl font-bold text-navy-800">${flight.price}</div>
                <div className="text-xs text-navy-500">{flight.seatsAvailable} seats left</div>
              </div>
              
              <button
                className={`px-4 py-2 rounded-md transition-colors ${selected?.id === flight.id ? 'premium-button-primary' : 'premium-button-secondary'}`}
                onClick={() => onSelectFlight(flight, isReturn)}
              >
                {selected?.id === flight.id ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const canContinue = selectedFlight && (!isRoundTrip || selectedReturnFlight);

  return (
    <div className="space-y-6 mt-6">
      {isRoundTrip && (
        <>
          <div className="bg-navy-50 p-4 rounded-lg flex items-center animate-fade-in">
            <Calendar className="h-5 w-5 text-navy-600 mr-3" />
            <div>
              <h3 className="text-navy-800 font-medium">Outbound Flights</h3>
              <p className="text-sm text-navy-600">
                {flights[0]?.departureCity} to {flights[0]?.arrivalCity} • {flights.length} flights available
              </p>
            </div>
          </div>
          {renderFlights(flights, selectedFlight)}
          
          {returnFlights && returnFlights.length > 0 && (
            <>
              <div className="bg-navy-50 p-4 rounded-lg flex items-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Calendar className="h-5 w-5 text-navy-600 mr-3" />
                <div>
                  <h3 className="text-navy-800 font-medium">Return Flights</h3>
                  <p className="text-sm text-navy-600">
                    {returnFlights[0]?.departureCity} to {returnFlights[0]?.arrivalCity} • {returnFlights.length} flights available
                  </p>
                </div>
              </div>
              {renderFlights(returnFlights, selectedReturnFlight, true)}
            </>
          )}
        </>
      )}
      
      {!isRoundTrip && (
        <>
          <div className="bg-navy-50 p-4 rounded-lg flex items-center animate-fade-in">
            <Calendar className="h-5 w-5 text-navy-600 mr-3" />
            <div>
              <h3 className="text-navy-800 font-medium">Available Flights</h3>
              <p className="text-sm text-navy-600">
                {flights[0]?.departureCity} to {flights[0]?.arrivalCity} • {flights.length} flights available
              </p>
            </div>
          </div>
          {renderFlights(flights, selectedFlight)}
        </>
      )}
      
      {selectedFlight && (
        <div className="premium-card p-5 rounded-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center mb-4">
            <CreditCard className="h-5 w-5 text-navy-600 mr-2" />
            <h3 className="text-lg font-semibold text-navy-800">Flight Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-navy-100">
              <span className="text-navy-600">Outbound Flight:</span>
              <span className="text-navy-800 font-medium">{selectedFlight.airline} - {selectedFlight.id}</span>
            </div>
            {selectedReturnFlight && (
              <div className="flex justify-between items-center pb-2 border-b border-navy-100">
                <span className="text-navy-600">Return Flight:</span>
                <span className="text-navy-800 font-medium">{selectedReturnFlight.airline} - {selectedReturnFlight.id}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1">
              <span className="text-navy-700 font-medium">Total Price:</span>
              <span className="text-navy-800 text-xl font-bold">
                ${selectedFlight.price + (selectedReturnFlight ? selectedReturnFlight.price : 0)}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          className="premium-button-primary px-6 py-3"
          disabled={!canContinue}
          onClick={onContinue}
        >
          Continue to Passenger Details
        </button>
      </div>
    </div>
  );
};

export default FlightResults;
