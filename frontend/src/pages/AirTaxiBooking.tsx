import React, { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { CarTaxiFront } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AirTaxiSearch from '../components/AirTaxiSearch';
import AirTaxiConfirmation from '../components/AirTaxiConfirmation';
import Payment from '../components/Payment';
import Confirmation from '../components/Confirmation';
import { bookAirTaxi, processPayment } from '../services/api';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const airTaxiModels = [
  {
    id: 1,
    name: "City Hopper",
    image: "/images/City_Hopper.jpeg",
    capacity: 2,
    description: "Compact and efficient for short city trips",
    price: 150
  },
  {
    id: 2,
    name: "Executive",
    image: "/images/Nimbus.jpg",
    capacity: 5,
    description: "Comfortable travel for business and small groups",
    price: 250
  },
  {
    id: 3,
    name: "Luxury Cruiser",
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    capacity: 6,
    description: "Premium experience with extra space and amenities",
    price: 350
  },
  {
    id: 4,
    name: "Urban Explorer",
    image: "/images/urban_explore.jpg",
    capacity: 3,
    description: "Perfect for city sightseeing and photography",
    price: 200
  },
  {
    id: 5,
    name: "Family Flyer",
    image: "/images/Family_flyer.jpg",
    capacity: 6,
    description: "Spacious cabin with extra luggage capacity for family travel",
    price: 325
  },
  {
    id: 6,
    name: "Eco Glider",
    image: "/images/eco_glider.jpg",
    capacity: 2,
    description: "Energy-efficient electric taxi with minimal carbon footprint",
    price: 175
  },
  {
    id: 7,
    name: "Business Class",
    image: "/images/bussiness_class.jpg",
    capacity: 4,
    description: "Luxury amenities with work space and high-speed connectivity",
    price: 400
  },
  {
    id: 8,
    name: "Night Owl",
    image: "/images/AeroX_Heli.jpeg",
    capacity: 3,
    description: "Equipped with special night vision technology for evening flights",
    price: 275
  },
  {
    id: 9,
    name: "Ocean Wings",
    image: "/images/Ocean Wings.jpg",
    capacity: 5,
    description: "Engineered for smooth takeoffs and landings on water, ensuring a seamless travel experience between islands",
    price: 340
  },
  {
    id: 10,
    name: "Sea Smoke",
    image: "/images/Horizon.jpg",
    capacity: 4,
    description: "Optimized for quick access to remote coastal destinations with minimal infrastructure",
    price: 320
  }
];

const AirTaxiBooking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchParams, setSearchParams] = useState<any>(null);
  const [contactDetails, setContactDetails] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTaxiModel, setSelectedTaxiModel] = useState<any>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);
  
  const handleSearch = (params: any) => {
    setSearchParams(params);
    setCurrentStep(1.5);
  };
  
  const handleTaxiSelection = (taxiModel: any) => {
    setSelectedTaxiModel(taxiModel);
    setCurrentStep(2);
  };
  
  const handleContactDetailsContinue = (details: any) => {
    setContactDetails({
      ...details,
      selectedTaxi: details.selectedTaxi,
    });
    setCurrentStep(3);
  };
  
  const calculateTotalPrice = () => {
    if (!contactDetails) return 0;
    return contactDetails.totalAmount;
  };
  
  const handlePaymentComplete = async (paymentDetails: any) => {
    setIsProcessingPayment(true);
    
    try {
      const paymentResult = await processPayment({
        ...paymentDetails,
        amount: calculateTotalPrice(),
      }) as { success: boolean; transactionId: string };
      
      if (paymentResult.success) {
        const bookingData = {
          pickup: contactDetails.pickup,
          destination: contactDetails.destination,
          dateTime: contactDetails.dateTime,
          passengers: contactDetails.passengerCount,
          taxiModel: contactDetails.selectedTaxi,
          contactName: contactDetails.contactName,
          contactPhone: contactDetails.contactPhone,
          contactEmail: contactDetails.contactEmail,
          specialRequests: contactDetails.specialRequests || "",
          totalAmount: contactDetails.totalAmount,
          paymentMethod: {
            type: 'credit_card',
            cardNumber: paymentDetails.cardNumber,
            transactionId: paymentResult.transactionId
          }
        };
        
        try {
          const bookingResult = await bookAirTaxi(bookingData);
          setBookingDetails(bookingResult);
          setCurrentStep(4);
          toast({
            title: "Booking Confirmed!",
            description: "Your air taxi has been booked successfully.",
          });
          toast({
            title: "Confirmation Email Sent",
            description: `A confirmation email has been sent to ${contactDetails.contactEmail}.`,
            duration: 6000,
          });
        } catch (bookingError: any) {
          // This will catch errors from the backend, including email failures
          toast({
            title: "Booking Failed",
            description: bookingError.message || "Failed to complete your booking. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please check your details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  const renderTaxiSelection = () => {
    if (!searchParams) return null;
    
    // Filter air taxis based on passenger capacity
    const filteredTaxiModels = airTaxiModels.filter(taxi => 
      taxi.capacity >= searchParams.passengers
    );
    
    return (
      <div className="glass rounded-xl p-6 mt-6">
        <h2 className="text-2xl font-bold text-navy-800 mb-6">Select Your Air Taxi</h2>
        
        <div className="mb-6">
          <p className="text-navy-600 mb-4">
            Choose the perfect air taxi for your journey from {searchParams.pickup.name} to {searchParams.destination.name}
          </p>
          
          {filteredTaxiModels.length > 0 ? (
            <Carousel className="w-full mx-auto">
              <CarouselContent>
                {filteredTaxiModels.map((taxi) => (
                  <CarouselItem key={taxi.id} className="md:basis-1/2 lg:basis-1/2 px-2">
                    <div className="bg-white rounded-xl overflow-hidden shadow-md h-full flex flex-col">
                      <div className="relative h-56 bg-navy-100">
                        {taxi.image ? (
                          <img 
                            src={taxi.image} 
                            alt={taxi.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CarTaxiFront size={64} className="text-navy-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold text-navy-800">{taxi.name}</h3>
                        <p className="text-navy-600 text-sm my-3">{taxi.description}</p>
                        <div className="text-navy-700 text-sm mb-2">
                          <span className="font-medium">Capacity:</span> {taxi.capacity} passengers
                        </div>
                        <div className="text-navy-800 font-bold mt-auto mb-4 text-lg">
                          ${taxi.price.toFixed(2)}
                        </div>
                        <button 
                          className="w-full py-3 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium"
                          onClick={() => handleTaxiSelection(taxi)}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="-left-12" />
                <CarouselNext className="-right-12" />
              </div>
            </Carousel>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-navy-700 mb-4">No air taxis available for {searchParams.passengers} passengers.</p>
              <p className="text-navy-600">Please modify your search with fewer passengers or try a different date/time.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <button className="btn-secondary" onClick={() => setCurrentStep(1)}>
            Back to Search
          </button>
        </div>
      </div>
    );
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <AirTaxiSearch onSearch={handleSearch} isLoading={isLoading} />;
      case 1.5:
        return renderTaxiSelection();
      case 2:
        return (
          <AirTaxiConfirmation
            bookingDetails={{
              ...searchParams,
              taxiModel: selectedTaxiModel
            }}
            onConfirm={handleContactDetailsContinue}
            isLoading={isLoading}
          />
        );
      case 3:
        return (
          <Payment
            amount={calculateTotalPrice()}
            onComplete={handlePaymentComplete}
            isProcessing={isProcessingPayment}
          />
        );
      case 4:
        return <Confirmation bookingDetails={bookingDetails} bookingType="air-taxi" />;
      default:
        return <AirTaxiSearch onSearch={handleSearch} isLoading={isLoading} />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {currentStep < 4 && (
            <div className="mb-8">
              <nav className="flex justify-center">
                <ol className="flex items-center w-full max-w-2xl">
                  {['Search', 'Select Taxi', 'Confirm Details', 'Payment'].map((step, index) => {
                    let stepNumber;
                    if (index === 0) stepNumber = 1;
                    else if (index === 1) stepNumber = 1.5;
                    else if (index === 2) stepNumber = 2;
                    else stepNumber = 3;
                    
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;
                    
                    return (
                      <li key={step} className={`flex items-center ${index < 3 ? 'w-full' : ''}`}>
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
                              index + 1
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
                        
                        {index < 3 && (
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

export default AirTaxiBooking;
