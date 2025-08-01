import React, { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FlightSearch from '../components/FlightSearch';
import FlightResults from '../components/FlightResults';
import PassengerDetails from '../components/PassengerDetails';
import SeatSelection from '../components/SeatSelection';
import Payment from '../components/Payment';
import Confirmation from '../components/Confirmation';
import { searchFlights, searchReturnFlights, processPayment, getBookingById } from '../services/api';
import { createBooking } from '../services/bookingApi';

interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  error?: string;
}

const FlightBooking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [searchParams, setSearchParams] = useState<any>(null);
  const [flights, setFlights] = useState<any[]>([]);
  const [returnFlights, setReturnFlights] = useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<any>(null);
  const [passengerDetails, setPassengerDetails] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<any>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [flightDetails, setFlightDetails] = useState<any>(null);
  
  useEffect(() => {
    // Scroll to top when changing steps
    window.scrollTo(0, 0);
  }, [currentStep]);
  
  const handleSearch = async (params: any) => {
    setIsLoading(true);
    setSearchParams(params);
    
    // Validate departure and arrival airports are not the same
    if (params.departureAirport === params.arrivalAirport) {
      toast({
        title: "Invalid Selection",
        description: "Departure and arrival airports cannot be the same.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const flightsData = await searchFlights(params) as any[];
      setFlights(flightsData);
      
      if (params.tripType === 'roundtrip') {
        const returnFlightsData = await searchReturnFlights(params) as any[];
        setReturnFlights(returnFlightsData);
      }
      
      setCurrentStep(2);
    } catch (error) {
      console.error('Error searching flights:', error);
      toast({
        title: "Error",
        description: "Failed to fetch flights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectFlight = (flight: any, isReturn = false) => {
    if (isReturn) {
      setSelectedReturnFlight(flight);
    } else {
      setSelectedFlight(flight);
    }
  };
  
  const handleContinueToPassengerDetails = () => {
    // Calculate total price based on number of passengers
    const passengers = searchParams?.passengers || 1;
    let totalPrice = selectedFlight.price * passengers;
    if (selectedReturnFlight) {
      totalPrice += selectedReturnFlight.price * passengers;
    }
    
    // Format times
    const outboundTime = new Date(selectedFlight.departureTime);
    const outboundDepartureTime = outboundTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const outboundArrivalTime = new Date(selectedFlight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let returnDetails = null;
    if (selectedReturnFlight) {
      const returnTime = new Date(selectedReturnFlight.departureTime);
      returnDetails = {
        airline: selectedReturnFlight.airline,
        id: selectedReturnFlight.id,
        departureTime: returnTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        arrivalTime: new Date(selectedReturnFlight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: selectedReturnFlight.price * passengers,
        class: selectedReturnFlight.class
      };
    }
    
    const flightDetails = {
      outbound: {
        airline: selectedFlight.airline,
        id: selectedFlight.id,
        departureTime: outboundDepartureTime,
        arrivalTime: outboundArrivalTime,
        price: selectedFlight.price * passengers,
        class: selectedFlight.class,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.tripType === 'roundtrip' ? searchParams.returnDate : null
      },
      return: returnDetails,
      totalPrice
    };
    
    setFlightDetails(flightDetails);
    setCurrentStep(3);
  };
  
  const handlePassengerDetailsContinue = (details: any) => {
    // Validate passenger details
    for (const passenger of details.passengers) {
      const nameRegex = /^[a-zA-Z\s'-]+$/;
      if (!nameRegex.test(passenger.firstName) || !nameRegex.test(passenger.lastName)) {
        toast({
          title: "Invalid Name",
          description: "Names cannot contain numbers or special characters (@#$%&, etc).",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Validate contact information
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(details.contactInfo.email)) {
      toast({
        title: "Invalid Email",
        description: "Please provide a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(details.contactInfo.phoneNumber.replace(/[\s-]/g, ''))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please provide a valid phone number.",
        variant: "destructive",
      });
      return;
    }
    
    setPassengerDetails(details);
    setCurrentStep(4);
  };
  
  const handleSeatSelectionContinue = (seats: any) => {
    // Validate that seats are selected for all passengers
    if (Array.isArray(seats)) {
      if (seats.length < (searchParams?.passengers || 1)) {
        toast({
          title: "Invalid Selection",
          description: "Please select seats for all passengers.",
          variant: "destructive",
        });
        return;
      }
    } else if (seats?.seats) {
      if (seats.seats.length < (searchParams?.passengers || 1)) {
        toast({
          title: "Invalid Selection",
          description: "Please select seats for all passengers.",
          variant: "destructive",
        });
        return;
      }
    } else {
      toast({
        title: "Invalid Selection",
        description: "Please select seats for all passengers.",
        variant: "destructive",
      });
      return;
    }

    setSelectedSeats(seats);
    setCurrentStep(5);
  };
  
  const handlePaymentComplete = async (paymentDetails: any) => {
    try {
      setIsProcessingPayment(true);
      
      // Process payment
      const paymentResult = await processPayment(paymentDetails) as PaymentResult;
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      // Prepare booking data
      const bookingData = {
        flights: {
          departure: {
            departureCity: selectedFlight.departureCity,
            arrivalCity: selectedFlight.arrivalCity,
            departureTime: selectedFlight.departureTime,
            arrivalTime: selectedFlight.arrivalTime,
            airline: selectedFlight.airline,
            id: selectedFlight.id,
            price: selectedFlight.price,
            class: selectedFlight.class || 'Economy',
            departureAirport: selectedFlight.departureAirport,
            arrivalAirport: selectedFlight.arrivalAirport
          },
          return: selectedReturnFlight ? {
            departureCity: selectedReturnFlight.departureCity,
            arrivalCity: selectedReturnFlight.arrivalCity,
            departureTime: selectedReturnFlight.departureTime,
            arrivalTime: selectedReturnFlight.arrivalTime,
            airline: selectedReturnFlight.airline,
            id: selectedReturnFlight.id,
            price: selectedReturnFlight.price,
            class: selectedReturnFlight.class || 'Economy',
            departureAirport: selectedReturnFlight.departureAirport,
            arrivalAirport: selectedReturnFlight.arrivalAirport
          } : null
        },
        passengers: passengerDetails?.passengers || [],
        contactInfo: passengerDetails?.contactInfo || {},
        seats: {
          outbound: selectedSeats?.seats?.outbound || [],
          return: selectedReturnFlight ? (selectedSeats?.seats?.return || []) : []
        },
        totalAmount: flightDetails?.totalPrice || 0,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.tripType === 'roundtrip' ? searchParams.returnDate : null
      };

      // Create booking
      const booking = await createBooking(bookingData);
      if (!booking || !booking._id) {
        throw new Error('Failed to create booking');
      }
      
      // Fetch the complete booking data from database
      const completeBooking = await getBookingById(booking._id);
      if (!completeBooking) {
        throw new Error('Failed to fetch complete booking details');
      }

      // Update flight details with database data
      const updatedFlightDetails = {
        outbound: {
          airline: completeBooking.outboundFlight?.airline || selectedFlight.airline,
          id: completeBooking.outboundFlight?.flightNumber || selectedFlight.id,
          departureTime: completeBooking.outboundFlight?.departureTime || new Date(selectedFlight.departureTime).toLocaleTimeString(),
          arrivalTime: completeBooking.outboundFlight?.arrivalTime || new Date(selectedFlight.arrivalTime).toLocaleTimeString(),
          class: completeBooking.flightcabin || selectedFlight.class || 'Economy',
          price: completeBooking.outboundFlight?.price || selectedFlight.price,
          departureDate: searchParams.departureDate,
          returnDate: searchParams.tripType === 'roundtrip' ? searchParams.returnDate : null,
          departureAirport: completeBooking.outboundFlight?.departureAirport || selectedFlight.departureAirport,
          arrivalAirport: completeBooking.outboundFlight?.arrivalAirport || selectedFlight.arrivalAirport,
          departureCity: completeBooking.outboundFlight?.departureCity || completeBooking.from || selectedFlight.departureCity,
          arrivalCity: completeBooking.outboundFlight?.arrivalCity || completeBooking.to || selectedFlight.arrivalCity
        },
        return: completeBooking.returnFlight ? {
          airline: completeBooking.returnFlight?.airline || selectedReturnFlight?.airline,
          id: completeBooking.returnFlight?.flightNumber || selectedReturnFlight?.id,
          departureTime: completeBooking.returnFlight?.departureTime || new Date(selectedReturnFlight?.departureTime).toLocaleTimeString(),
          arrivalTime: completeBooking.returnFlight?.arrivalTime || new Date(selectedReturnFlight?.arrivalTime).toLocaleTimeString(),
          class: completeBooking.flightcabin || selectedReturnFlight?.class || 'Economy',
          price: completeBooking.returnFlight?.price || selectedReturnFlight?.price,
          departureDate: searchParams.returnDate,
          departureAirport: completeBooking.returnFlight?.departureAirport || selectedReturnFlight?.departureAirport,
          arrivalAirport: completeBooking.returnFlight?.arrivalAirport || selectedReturnFlight?.arrivalAirport,
          departureCity: completeBooking.returnFlight?.departureCity || completeBooking.to || selectedReturnFlight?.arrivalCity,
          arrivalCity: completeBooking.returnFlight?.arrivalCity || completeBooking.from || selectedReturnFlight?.departureCity
        } : null,
        totalPrice: completeBooking.totalPrice || flightDetails?.totalPrice || 0
      };
      
      // Update both flightDetails and bookingDetails
      setFlightDetails(updatedFlightDetails);
      setBookingDetails({
        ...updatedFlightDetails,
        bookingId: booking._id,
        contactInfo: completeBooking.contactInfo || {},
        passengers: completeBooking.passengersDetails || [],
        seats: completeBooking.seatSelection || {},
        totalAmount: completeBooking.totalPrice || flightDetails?.totalPrice || 0
      });

      // Navigate to confirmation page
      setCurrentStep(6);
      setIsProcessingPayment(false);
    } catch (error) {
      console.error('Error in payment completion:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete booking",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <FlightSearch onSearch={handleSearch} isLoading={isLoading} />;
      case 2:
        return (
          <FlightResults
            flights={flights}
            selectedFlight={selectedFlight}
            returnFlights={searchParams?.tripType === 'roundtrip' ? returnFlights : undefined}
            selectedReturnFlight={selectedReturnFlight}
            isRoundTrip={searchParams?.tripType === 'roundtrip'}
            onSelectFlight={handleSelectFlight}
            onContinue={handleContinueToPassengerDetails}
          />
        );
      case 3:
        return (
          <PassengerDetails
            passengerCount={searchParams?.passengers || 1}
            onContinue={handlePassengerDetailsContinue}
            flightDetails={flightDetails}
          />
        );
      case 4:
        return (
          <SeatSelection
            passengerCount={searchParams?.passengers || 1}
            onContinue={handleSeatSelectionContinue}
            isRoundTrip={searchParams?.tripType === 'roundtrip'}
          />
        );
      case 5:
        return (
          <Payment
            amount={flightDetails.totalPrice}
            onComplete={handlePaymentComplete}
            isProcessing={isProcessingPayment}
          />
        );
      case 6:
        return <Confirmation bookingDetails={bookingDetails} bookingType="flight" />;
      default:
        return <FlightSearch onSearch={handleSearch} isLoading={isLoading} />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {currentStep < 6 && (
            <div className="mb-8">
              <nav className="flex justify-center">
                <ol className="flex items-center w-full max-w-3xl">
                  {['Search', 'Select Flights', 'Passenger Details', 'Seat Selection', 'Payment'].map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;
                    
                    return (
                      <li key={step} className={`flex items-center ${index < 4 ? 'w-full' : ''}`}>
                        <div className="flex flex-col items-center">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              isActive 
                                ? 'bg-navy-600 text-white' 
                                : isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {isCompleted ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              stepNumber
                            )}
                          </div>
                          <span className={`mt-2 text-xs ${
                            isActive 
                              ? 'text-navy-600 font-medium' 
                              : isCompleted 
                                ? 'text-green-500' 
                                : 'text-gray-500'
                          }`}>
                            {step}
                          </span>
                        </div>
                        
                        {index < 4 && (
                          <div 
                            className={`w-full h-0.5 ${
                              stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          ></div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </div>
          )}
          
          {renderStepContent()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FlightBooking;
