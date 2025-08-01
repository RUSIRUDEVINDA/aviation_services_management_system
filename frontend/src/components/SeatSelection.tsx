import React, { useState } from 'react';
import { Check, ArrowRight, Users, Plane, CreditCard } from 'lucide-react';

interface SeatSelectionProps {
  passengerCount: number;
  onContinue: (selectedSeats: any) => void;
  isRoundTrip?: boolean;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({ passengerCount, onContinue, isRoundTrip = false }) => {
  const [selectedOutboundSeats, setSelectedOutboundSeats] = useState<string[]>([]);
  const [selectedReturnSeats, setSelectedReturnSeats] = useState<string[]>([]);
  const [currentPassenger, setCurrentPassenger] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'outbound' | 'return'>('outbound');

  // unavailable seats
  const unavailableOutboundSeats = ['1A', '1B', '5C', '7D', '8F', '10A', '12B', '14E', '15F', '18A', '20C'];
  const unavailableReturnSeats = ['2C', '3A', '4F', '6B', '9D', '11E', '13A', '16C', '17F', '19B', '22E'];

  const rows = 25;
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

  const handleSeatClick = (seat: string, isReturn: boolean) => {
    const unavailableSeats = isReturn ? unavailableReturnSeats : unavailableOutboundSeats;
    
    if (unavailableSeats.includes(seat)) return;
    
    if (isReturn) {
      if (selectedReturnSeats.includes(seat)) {
        // Remove the seat
        setSelectedReturnSeats(selectedReturnSeats.filter(s => s !== seat));
      } else if (selectedReturnSeats.length < passengerCount) {
        // Add the seat
        setSelectedReturnSeats([...selectedReturnSeats, seat]);
        
        // Move to next passenger if not last
        if (currentPassenger < passengerCount - 1) {
          setCurrentPassenger(currentPassenger + 1);
        }
      }
    } else {
      if (selectedOutboundSeats.includes(seat)) {
        // Remove the seat
        setSelectedOutboundSeats(selectedOutboundSeats.filter(s => s !== seat));
      } else if (selectedOutboundSeats.length < passengerCount) {
        // Add the seat
        setSelectedOutboundSeats([...selectedOutboundSeats, seat]);
        
        // Move to next passenger if not last and if all passengers have outbound seats, switch to return tab
        if (currentPassenger < passengerCount - 1) {
          setCurrentPassenger(currentPassenger + 1);
        } else if (isRoundTrip && selectedOutboundSeats.length === passengerCount - 1) {
          // Reset passenger counter and switch to return tab
          setTimeout(() => {
            setCurrentPassenger(0);
            setActiveTab('return');
          }, 500);
        }
      }
    }
  };

  const getSeatStatus = (seat: string, isReturn: boolean) => {
    const unavailableSeats = isReturn ? unavailableReturnSeats : unavailableOutboundSeats;
    const selectedSeats = isReturn ? selectedReturnSeats : selectedOutboundSeats;
    
    if (unavailableSeats.includes(seat)) return 'unavailable';
    if (selectedSeats.includes(seat)) return 'selected';
    return 'available';
  };

  const selectPassenger = (index: number) => {
    setCurrentPassenger(index);
  };

  const getPassengerSeat = (index: number, isReturn: boolean) => {
    const selectedSeats = isReturn ? selectedReturnSeats : selectedOutboundSeats;
    return selectedSeats[index] || 'Not selected';
  };

  const handleContinue = () => {
    if (isRoundTrip) {
      // Create a combined structure with outbound and return seats
      const seatData = {
        seats: {
          outbound: selectedOutboundSeats,
          return: selectedReturnSeats
        }
      };
      onContinue(seatData);
    } else {
      onContinue({
        seats: {
          outbound: selectedOutboundSeats,
          return: []
        }
      });
    }
  };

  const isContinueDisabled = () => {
    const outboundComplete = selectedOutboundSeats.length === passengerCount;
    
    if (!isRoundTrip) {
      return !outboundComplete;
    }
    
    const returnComplete = selectedReturnSeats.length === passengerCount;
    return !(outboundComplete && returnComplete);
  };

  return (
    <div className="premium-card p-6 mt-6 animate-fade-in">
      <div className="flex items-center mb-6">
        <Plane className="h-6 w-6 text-navy-600 mr-3" />
        <h2 className="text-2xl font-bold text-navy-800">Select Your Seats</h2>
      </div>
      
      {isRoundTrip && (
        <div className="mb-6">
          <div className="flex border-b border-navy-100">
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'outbound' ? 'text-navy-700 border-b-2 border-navy-600' : 'text-navy-400 hover:text-navy-600'}`}
              onClick={() => setActiveTab('outbound')}
            >
              Outbound Flight
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'return' ? 'text-navy-700 border-b-2 border-navy-600' : 'text-navy-400 hover:text-navy-600'}`}
              onClick={() => setActiveTab('return')}
            >
              Return Flight
            </button>
          </div>
          
          <div className="mt-3 text-navy-600 text-sm bg-navy-50 p-2 rounded-md inline-block">
            {activeTab === 'outbound' ? (
              <>Select seats for your outbound flight</>
            ) : (
              <>Select seats for your return flight</>
            )}
          </div>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4">
          <div className="premium-card p-4 h-full">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-navy-600 mr-2" />
              <h3 className="text-lg font-semibold text-navy-700">Passengers</h3>
            </div>
            
            <div className="space-y-3">
              {Array.from({ length: passengerCount }).map((_, index) => (
                <div 
                  key={index}
                  className={`
                    p-3 rounded-md cursor-pointer transition-all
                    ${currentPassenger === index 
                      ? 'bg-navy-100 border-l-4 border-navy-500' 
                      : 'bg-white hover:bg-navy-50 border-l-4 border-transparent'
                    }
                  `}
                  onClick={() => selectPassenger(index)}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-3/4">
                      <div className="font-medium text-navy-800">Passenger {index + 1}</div>
                      <div className="text-sm text-navy-600">
                        {isRoundTrip ? (
                          <div className="space-y-1 mt-1">
                            <div className="flex items-center">
                              <span className="w-20 inline-block">Outbound:</span>
                              <span className={`${selectedOutboundSeats[index] ? 'text-navy-700 font-medium' : 'text-navy-400'}`}>
                                {getPassengerSeat(index, false)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-20 inline-block">Return:</span>
                              <span className={`${selectedReturnSeats[index] ? 'text-navy-700 font-medium' : 'text-navy-400'}`}>
                                {getPassengerSeat(index, true)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center mt-1">
                            <span className="w-12 inline-block">Seat:</span>
                            <span className={`${selectedOutboundSeats[index] ? 'text-navy-700 font-medium' : 'text-navy-400'}`}>
                              {getPassengerSeat(index, false)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {(isRoundTrip ? 
                      (selectedOutboundSeats[index] && selectedReturnSeats[index]) : 
                      selectedOutboundSeats[index]) && (
                      <span className="text-green-500 bg-green-50 p-1 rounded-full">
                        <Check className="h-5 w-5" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 space-y-3 border-t border-navy-100 pt-4">
              <div className="text-sm font-medium text-navy-700 mb-2">Legend:</div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-navy-100 border-2 border-navy-400 rounded mr-2"></div>
                <span className="text-sm text-navy-600">Selected</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-white border border-gray-300 rounded mr-2"></div>
                <span className="text-sm text-navy-600">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded mr-2"></div>
                <span className="text-sm text-navy-600">Unavailable</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-3/4">
          <div className="premium-card p-4 overflow-auto">
            <div className="text-center mb-6">
              <div className="w-full h-10 bg-navy-200 rounded-t-xl mb-8 flex items-center justify-center">
                <span className="text-navy-800 font-medium">Front of Airplane</span>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto mb-8">
              {/* Seat rows */}
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex mt-4">
                  {/* Row number */}
                  <div className="w-12 flex-shrink-0 flex items-center justify-end pr-3">
                    <span className="text-xs font-medium text-navy-600 bg-navy-50 px-2 py-1 rounded">
                      {rowIndex + 1}
                    </span>
                  </div>
                  
                  {/* Seats */}
                  <div className="flex-1 grid grid-cols-6 gap-4">
                    {columns.map((col, colIndex) => {
                      const seat = `${rowIndex + 1}${col}`;
                      const status = getSeatStatus(seat, activeTab === 'return');
                      
                      return (
                        <div 
                          key={`${rowIndex}-${colIndex}`}
                          className={`
                            w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition-all
                            ${status === 'selected' 
                              ? 'bg-navy-100 border-2 border-navy-400 text-navy-800 font-bold transform scale-105' 
                              : status === 'unavailable'
                                ? 'bg-gray-200 border border-gray-300 cursor-not-allowed' 
                                : 'bg-white border border-gray-300 hover:border-navy-400 hover:bg-navy-50'
                            }
                          `}
                          onClick={() => handleSeatClick(seat, activeTab === 'return')}
                        >
                          {col}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-6">
              <div className="w-full h-10 bg-navy-200 rounded-b-xl flex items-center justify-center">
                <span className="text-navy-800 font-medium">Back of Airplane</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <button className="premium-button-secondary" onClick={() => window.history.back()}>
          <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
          Back
        </button>
        <button 
          className="premium-button-primary flex items-center"
          disabled={isContinueDisabled()}
          onClick={handleContinue}
        >
          Continue to Payment
          <CreditCard className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;
