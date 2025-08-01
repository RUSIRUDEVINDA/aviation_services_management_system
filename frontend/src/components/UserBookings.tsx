import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { modifyBooking, requestCancellation, getUserRequestsAdmin } from '../services/api';
import { getUserBookings, FlightBooking } from '../services/bookingApi';
import { availableLocations, cabinClasses, cabinClassPriceAdjustments } from '../services/mockData';
import { searchReturnFlights } from '../services/flightApi';
import { toast } from "@/hooks/use-toast";
import RequestForm from './RequestForm';

interface UserBookingsProps {
  user: any;
  bookings: FlightBooking[];
  onRefresh: () => void;
  onRequestModification?: (booking: FlightBooking) => void;
}

interface ModificationForm {
  tripType: string;
  from: string;
  to: string;
  departureDate: string;
  returnDate: string | null;
  passengers: number;
  //flightcabin: string;
  outboundFlight: any | null;
  returnFlight: any | null;
  passengersDetails: any[];
  contactInfo: any | null;
  seatSelection: {
    outbound: string[];
    return: string[];
  };
  totalPrice: number;
  //modificationReason: string;
  modificationDetails: string;
  modifyDates: boolean;
  modifyRoute: boolean;
  modifyPassengers: boolean;
  modifySeats: boolean;
}

const UserBookings: React.FC<UserBookingsProps> = ({ user, bookings, onRefresh, onRequestModification }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [showModificationForm, setShowModificationForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<FlightBooking | null>(null);
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isProcessingModification, setIsProcessingModification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<'outbound' | 'return'>('outbound');
  const [availableReturnFlights, setAvailableReturnFlights] = useState<any[]>([]);
  const [isLoadingReturnFlights, setIsLoadingReturnFlights] = useState(false);
  const [modificationForm, setModificationForm] = useState<ModificationForm>({
    tripType: '',
    from: '',
    to: '',
    departureDate: '',
    returnDate: null,
    passengers: 0,
    //flightcabin: '',
    outboundFlight: null,
    returnFlight: null,
    passengersDetails: [],
    contactInfo: null,
    seatSelection: {
      outbound: [],
      return: []
    },
    totalPrice: 0,
    //modificationReason: '',
    modificationDetails: '',
    modifyDates: false,
    modifyRoute: false,
    modifyPassengers: false,
    modifySeats: false,
  });

  useEffect(() => {
    setIsLoading(false);
    fetchUserRequests();
  }, [user?.id]);

  // Fetch user requests
  const fetchUserRequests = async () => {
    if (!user || !user.id) return;
    
    setIsLoadingRequests(true);
    try {
      const requests = await getUserRequestsAdmin(user.id);
      setUserRequests(requests);
    } catch (error) {
      console.error('Error fetching user requests:', error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Get request status for a booking
  const getRequestStatus = (bookingId: string) => {
    if (!userRequests.length) return null;
    
    // Find the most recent request for this booking
    const request = userRequests.find(req => req.bookingId === bookingId);
    
    return request;
  };
  
  // Check if a request of specific type has been rejected
  const isRequestRejected = (bookingId: string, requestType: 'modification' | 'cancellation') => {
    if (!userRequests.length) return false;
    
    const request = userRequests.find(req => 
      req.bookingId === bookingId && 
      req.requestType === requestType && 
      req.status === 'rejected'
    );
    
    return !!request;
  };

  // Handle cancellation request
  const handleRequestCancellation = (booking: FlightBooking) => {
    setSelectedBooking(booking);
    setShowRequestModal(true);
  };

  // Handle modification request
  const handleModifyBooking = (booking: any) => {
    // Store the original booking for reference
    setSelectedBooking(booking);

    // Check if booking is already modified
    if (booking.status === 'modified') {
      toast({
        title: "Cannot Modify",
        description: "This booking has already been modified and cannot be modified again",
        variant: "destructive",
      });
      return;
    }
    
    const request = getRequestStatus(booking._id);
    
    // Check if there's a pending cancellation request
    const isCancellationPending = request && request.requestType === 'cancellation' && request.status === 'pending';
    if (isCancellationPending) {
      toast({
        title: "Cannot Modify",
        description: "This booking has a pending cancellation request and cannot be modified",
        variant: "destructive",
      });
      return;
    }
    
    // If there's an approved modification request, proceed to modification form
    if (request && request.requestType === 'modification' && request.status === 'approved') {
      // Map passenger details from backend format to frontend format
      const mappedPassengerDetails = booking.passengersDetails.map((passenger: any) => ({
        firstName: passenger.firstName || '',
        lastName: passenger.lastName || '',
        dob: passenger.dateOfBirth ? new Date(passenger.dateOfBirth).toISOString().split('T')[0] : '',
        passportNumber: passenger.passportNumber || '',
        nationality: passenger.nationality || '',
        specialRequests: passenger.specialRequests || ''
      }));

      // If modification is approved, show the modification form
      setShowModificationForm(true);
      setModificationForm({
        tripType: booking.tripType === 'round-trip' || booking.tripType === 'Round Trip' ? 'Round Trip' : 'One Way',
        from: booking.from,
        to: booking.to,
        departureDate: booking.departureDate ? new Date(booking.departureDate).toISOString().split('T')[0] : '',
        returnDate: booking.returnDate ? new Date(booking.returnDate).toISOString().split('T')[0] : null,
        passengers: booking.passengers,
        //flightcabin: booking.flightcabin,
        outboundFlight: booking.outboundFlight,
        returnFlight: booking.returnFlight,
        passengersDetails: mappedPassengerDetails,
        contactInfo: booking.contactInfo,
        seatSelection: {
          outbound: [...booking.seatSelection.outbound],
          return: [...booking.seatSelection.return]
        },
        totalPrice: booking.totalPrice,
        //modificationReason: booking.modificationReason,
        modificationDetails: '',
        modifyDates: false,
        modifyRoute: false,
        modifyPassengers: false,
        modifySeats: false,
      });
    } else {
      // Otherwise, show the request form
      setShowModificationModal(true);
    }
  };

  const handlePassengerCountChange = (newCount: number) => {
    setModificationForm(prev => {
      // Create a copy of the current passenger details
      const currentPassengers = [...prev.passengersDetails];
      
      // If increasing passenger count, add new passenger objects with empty fields
      if (newCount > currentPassengers.length) {
        const newPassengers = [...currentPassengers];
        for (let i = currentPassengers.length; i < newCount; i++) {
          newPassengers.push({
            firstName: '',
            lastName: '',
            dob: '',
            passportNumber: '',
            nationality: '',
            specialRequests: ''
          });
        }
        
        return {
          ...prev,
          passengers: newCount,
          passengersDetails: newPassengers,
          seatSelection: {
            outbound: prev.seatSelection.outbound.slice(0, newCount),
            return: prev.seatSelection.return.slice(0, newCount)
          },
          totalPrice: prev.totalPrice * 2 // Double the price when adding passengers
        };
      } 
      // If decreasing passenger count, remove passengers from the end
      else if (newCount < currentPassengers.length) {
        return {
          ...prev,
          passengers: newCount,
          passengersDetails: currentPassengers.slice(0, newCount),
          seatSelection: {
            outbound: prev.seatSelection.outbound.slice(0, newCount),
            return: prev.seatSelection.return.slice(0, newCount)
          },
          totalPrice: Math.max(0, prev.totalPrice - (currentPassengers.length - newCount) * 200) // Ensure price doesn't go below 0
        };
      }
      
      // If count is the same, just return the previous state
      return prev;
    });
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setModificationForm(prev => {
      // Handle trip type change
      if (field === 'tripType') {
        if (value === 'Round Trip' && prev.tripType === 'One Way') {
          // When changing from One Way to Round Trip:
          // 1. Enable return flight selection
          // 2. Add return flight price if available, otherwise add $200
          // 3. Keep the outbound flight unchanged
          fetchReturnFlights(prev.from, prev.to, prev.departureDate, prev.passengers);
          
          // Get the return flight's actual price if available
          const returnFlightPrice = prev.returnFlight?.price || 200;
          
          return {
            ...prev,
            [field]: value,
            returnFlight: null,
            returnDate: '',
            seatSelection: {
              ...prev.seatSelection,
              return: Array(prev.passengers).fill('') // Initialize empty seats for all passengers
            },
            totalPrice: prev.totalPrice + (returnFlightPrice * prev.passengers), // Add return flight price for all passengers
            modifyRoute: false // Disable route modification to preserve outbound flight
          };
        } else if (value === 'One Way' && prev.tripType === 'Round Trip') {
          // When changing from Round Trip to One Way:
          // 1. Clear return flight data
          // 2. Decrease price by the return flight's actual price
          const returnFlightPrice = prev.returnFlight?.price || 200;
          
          return {
            ...prev,
            [field]: value,
            returnFlight: null,
            returnDate: null,
            seatSelection: {
              ...prev.seatSelection,
              return: []
            },
            totalPrice: Math.max(0, prev.totalPrice - (returnFlightPrice * prev.passengers)) // Decrease by return flight price for all passengers
          };
        }
      }

      // If changing departure or destination, clear return flights if in Round Trip mode
      if ((field === 'from' || field === 'to') && modificationForm.tripType === 'Round Trip') {
        // Fetch new return flights based on the updated route
        const from = field === 'from' ? value.toString() : prev.from;
        const to = field === 'to' ? value.toString() : prev.to;
        
        if (from && to) {
          fetchReturnFlights(from, to, prev.departureDate, prev.passengers);
        }
        
        return {
          ...prev,
          [field]: value,
          returnFlight: null
        };
      }

      // Handle passenger count change
      if (field === 'passengers') {
        const newCount = Number(value);
        if (newCount < (selectedBooking?.passengers || 0)) {
          // Calculate price reduction when removing passengers
          const removedPassengers = (selectedBooking?.passengers || 0) - newCount;
          const priceReduction = removedPassengers * 200; // $200 per passenger
          
          return {
            ...prev,
            passengers: newCount,
            passengersDetails: prev.passengersDetails.slice(0, newCount),
            seatSelection: {
              outbound: prev.seatSelection.outbound.slice(0, newCount),
              return: prev.seatSelection.return.slice(0, newCount)
            },
            totalPrice: Math.max(0, prev.totalPrice - priceReduction) // Ensure price doesn't go below 0
          };
        } else if (newCount > prev.passengers) {
          // When adding passengers:
          // Double the current price
          const doubledPrice = prev.totalPrice * 2; // Double the current price
          
          return {
            ...prev,
            passengers: newCount,
            seatSelection: {
              outbound: [...prev.seatSelection.outbound, ...Array(newCount - prev.passengers).fill('')],
              return: prev.tripType === 'Round Trip' ? 
                [...prev.seatSelection.return, ...Array(newCount - prev.passengers).fill('')] : 
                prev.seatSelection.return
            },
            totalPrice: doubledPrice // Double the price when adding passengers
          };
        }
      }

      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handlePassengerDetailsChange = (index: number, field: string, value: string) => {
    setModificationForm(prev => {
      const updatedPassengers = [...(prev.passengersDetails || [])].map(p => ({...p}));
      
      if (!updatedPassengers[index]) {
        updatedPassengers[index] = {
          firstName: '',
          lastName: '',
          dob: '',
          passportNumber: '',
          nationality: '',
          specialRequests: ''
        };
      }

      // Update the field value
      const updatedPassenger = {
        ...updatedPassengers[index],
        [field]: value
      };

      // Validate passport number length
      if (field === 'passportNumber' && value.trim().length > 9) {
        toast({
          title: "Validation Error",
          description: "Passport number cannot be longer than 9 characters",
          variant: "destructive",
        });
        return prev;
      }

      updatedPassengers[index] = updatedPassenger;
      
      return {
        ...prev,
        passengersDetails: updatedPassengers
      };
    });
  };

  const validatePassengerDetails = (passenger: any, index: number): string | null => {
    if (!passenger.firstName || passenger.firstName.trim().length < 2) {
      return `First name must be at least 2 characters for passenger ${index + 1}`;
    }
    if (!passenger.lastName || passenger.lastName.trim().length < 2) {
      return `Last name must be at least 2 characters for passenger ${index + 1}`;
    }
    if (!passenger.passportNumber || passenger.passportNumber.trim().length < 6) {
      return `Passport number must be at least 6 characters for passenger ${index + 1}`;
    }
    if (passenger.passportNumber.trim().length > 9) {
      return `Passport number cannot be longer than 9 characters for passenger ${index + 1}`;
    }
    if (!passenger.nationality || passenger.nationality.trim().length < 2) {
      return `Nationality must be at least 2 characters for passenger ${index + 1}`;
    }
    if (!passenger.dob) {
      return `Date of birth is required for passenger ${index + 1}`;
    }
    return null;
  };

  const validateModificationForm = () => {
    const errors: { [key: string]: string } = {};
    let hasError = false;

    // Check if at least one modification option is selected
    if (!modificationForm.modifyDates && !modificationForm.modifyRoute && 
        !modificationForm.modifyPassengers && !modificationForm.modifySeats) {
      toast({
        title: "Validation Error",
        description: "Please select at least one modification option.",
        variant: "destructive",
      });
      return false;
    }

    // Validate Trip Type and Dates
    if (modificationForm.modifyDates) {
      if (!modificationForm.tripType) {
        errors.tripType = "Trip type is required";
        hasError = true;
      }

      if (!modificationForm.departureDate) {
        errors.departureDate = "Departure date is required";
        hasError = true;
      } else {
        const departureDate = new Date(modificationForm.departureDate);
        const currentDate = new Date();
        // Set hours, minutes, seconds, and milliseconds to 0 to compare only the date
        currentDate.setHours(0, 0, 0, 0);
        
        if (departureDate <= currentDate) {
          errors.departureDate = "Departure date must be in the future";
          hasError = true;
        }
        
        // Check if departure date is within reasonable range (1 year)
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        if (departureDate > oneYearFromNow) {
          errors.departureDate = "Departure date cannot be more than 1 year in the future";
          hasError = true;
        }
      }

      if (modificationForm.tripType === "Round Trip" && !modificationForm.returnDate) {
        errors.returnDate = "Return date is required for round trip";
        hasError = true;
      } else if (modificationForm.tripType === "Round Trip" && modificationForm.returnDate) {
        const returnDate = new Date(modificationForm.returnDate);
        const departureDate = modificationForm.departureDate ? new Date(modificationForm.departureDate) : new Date();
        
        if (returnDate <= departureDate) {
          errors.returnDate = "Return date must be after departure date";
          hasError = true;
        }
        
        // Check if return date is within reasonable range (1 year from departure)
        const oneYearFromDeparture = new Date(departureDate);
        oneYearFromDeparture.setFullYear(oneYearFromDeparture.getFullYear() + 1);
        if (returnDate > oneYearFromDeparture) {
          errors.returnDate = "Return date cannot be more than 1 year after departure date";
          hasError = true;
        }
      }
    }

    // Validate Route/Destination
    if (modificationForm.modifyRoute) {
      if (!modificationForm.from) {
        errors.from = "Departure location is required";
        hasError = true;
      } else if (!/^[A-Za-z\s\-']+$/.test(modificationForm.from)) {
        errors.from = "Departure location contains invalid characters";
        hasError = true;
      }

      if (!modificationForm.to) {
        errors.to = "Destination is required";
        hasError = true;
      } else if (!/^[A-Za-z\s\-']+$/.test(modificationForm.to)) {
        errors.to = "Destination contains invalid characters";
        hasError = true;
      }

      if (modificationForm.from === modificationForm.to) {
        errors.to = "Destination must be different from departure";
        hasError = true;
      }

      // Only validate outbound flight if not converting from one-way to round-trip
      if (!(selectedBooking?.tripType === 'One Way' && modificationForm.tripType === 'Round Trip')) {
        if (!modificationForm.outboundFlight) {
          errors.outboundFlight = "Outbound flight is required";
          hasError = true;
        }
      }

      // Validate return flight for round trip
      if (modificationForm.tripType === "Round Trip" && !modificationForm.returnFlight) {
        errors.returnFlight = "Return flight is required for round trip";
        hasError = true;
      }
    }

    // Validate Passenger Details
    if (modificationForm.modifyPassengers) {
      if (isNaN(modificationForm.passengers) || modificationForm.passengers <= 0) {
        errors.passengers = "Number of passengers must be a positive number";
        hasError = true;
      } else if (modificationForm.passengers > 9) {
        // International standard: most airlines limit group bookings to 9 passengers
        errors.passengers = "Maximum 9 passengers allowed per booking";
        hasError = true;
      }

      // Validate passenger details
      if (modificationForm.passengersDetails.length > 0) {
        for (let i = 0; i < modificationForm.passengers; i++) {
          const passenger = modificationForm.passengersDetails[i];
          
          if (!passenger) {
            errors[`passenger_${i}`] = `Details for passenger ${i + 1} are incomplete`;
            hasError = true;
            continue;
          }
          
          // Validate first name (international standard: 2-50 chars, letters, spaces, hyphens, apostrophes)
          if (!passenger.firstName || passenger.firstName.trim().length < 2) {
            errors[`passenger_${i}_firstName`] = `First name must be at least 2 characters for passenger ${i + 1}`;
            hasError = true;
          } else if (passenger.firstName.trim().length > 50) {
            errors[`passenger_${i}_firstName`] = `First name cannot exceed 50 characters for passenger ${i + 1}`;
            hasError = true;
          } else if (!/^[A-Za-z\s\-']+$/.test(passenger.firstName.trim())) {
            errors[`passenger_${i}_firstName`] = `First name contains invalid characters for passenger ${i + 1}`;
            hasError = true;
          }
          
          // Validate last name (international standard: 2-50 chars, letters, spaces, hyphens, apostrophes)
          if (!passenger.lastName || passenger.lastName.trim().length < 2) {
            errors[`passenger_${i}_lastName`] = `Last name must be at least 2 characters for passenger ${i + 1}`;
            hasError = true;
          } else if (passenger.lastName.trim().length > 50) {
            errors[`passenger_${i}_lastName`] = `Last name cannot exceed 50 characters for passenger ${i + 1}`;
            hasError = true;
          } else if (!/^[A-Za-z\s\-']+$/.test(passenger.lastName.trim())) {
            errors[`passenger_${i}_lastName`] = `Last name contains invalid characters for passenger ${i + 1}`;
            hasError = true;
          }
          
          // Validate date of birth (international standard: must be a valid date, not in future, reasonable age)
          if (!passenger.dob) {
            errors[`passenger_${i}_dob`] = `Date of birth is required for passenger ${i + 1}`;
            hasError = true;
          } else {
            const dob = new Date(passenger.dob);
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) 
              ? age - 1 
              : age;
            
            if (isNaN(dob.getTime())) {
              errors[`passenger_${i}_dob`] = `Invalid date of birth for passenger ${i + 1}`;
              hasError = true;
            } else if (dob > today) {
              errors[`passenger_${i}_dob`] = `Date of birth cannot be in the future for passenger ${i + 1}`;
              hasError = true;
            } else if (actualAge > 120) {
              errors[`passenger_${i}_dob`] = `Age exceeds maximum allowed (120 years) for passenger ${i + 1}`;
              hasError = true;
            }
          }
          
          // Validate passport number (international standard: 6-9 chars, alphanumeric)
          if (!passenger.passportNumber || passenger.passportNumber.trim().length < 6) {
            errors[`passenger_${i}_passportNumber`] = `Passport number must be at least 6 characters for passenger ${i + 1}`;
            hasError = true;
          } else if (passenger.passportNumber.trim().length > 9) {
            errors[`passenger_${i}_passportNumber`] = `Passport number cannot exceed 9 characters for passenger ${i + 1}`;
            hasError = true;
          } else if (!/^[A-Z0-9]+$/.test(passenger.passportNumber.trim().toUpperCase())) {
            errors[`passenger_${i}_passportNumber`] = `Passport number must contain only letters and numbers for passenger ${i + 1}`;
            hasError = true;
          }
          
          // Validate nationality (international standard: 2-50 chars, letters, spaces)
          if (!passenger.nationality || passenger.nationality.trim().length < 2) {
            errors[`passenger_${i}_nationality`] = `Nationality must be at least 2 characters for passenger ${i + 1}`;
            hasError = true;
          } else if (passenger.nationality.trim().length > 50) {
            errors[`passenger_${i}_nationality`] = `Nationality cannot exceed 50 characters for passenger ${i + 1}`;
            hasError = true;
          } else if (!/^[A-Za-z\s]+$/.test(passenger.nationality.trim())) {
            errors[`passenger_${i}_nationality`] = `Nationality must contain only letters and spaces for passenger ${i + 1}`;
            hasError = true;
          }
          
          // Validate special requests (optional, but if provided, must be reasonable length)
          if (passenger.specialRequests && passenger.specialRequests.trim().length > 200) {
            errors[`passenger_${i}_specialRequests`] = `Special requests cannot exceed 200 characters for passenger ${i + 1}`;
            hasError = true;
          }
        }
      }
    }

    // Validate Seat Selection
    if (modificationForm.modifySeats) {
      // Validate outbound seats
      if (modificationForm.seatSelection.outbound.length !== modificationForm.passengers) {
        errors.outboundSeats = `Please select exactly ${modificationForm.passengers} outbound seats`;
        hasError = true;
      } else if (modificationForm.seatSelection.outbound.some(seat => !seat)) {
        errors.outboundSeats = "All outbound seats must be selected";
        hasError = true;
      } else {
        // Validate seat format (e.g., "1A", "23C")
        const invalidOutboundSeats = modificationForm.seatSelection.outbound.filter(
          seat => !seat.match(/^[0-9]{1,2}[A-F]$/)
        );
        if (invalidOutboundSeats.length > 0) {
          errors.outboundSeats = `Invalid outbound seat format: ${invalidOutboundSeats.join(', ')}`;
          hasError = true;
        }
      }
      
      // Validate return seats for round trip
      if (modificationForm.tripType === "Round Trip") {
        if (modificationForm.seatSelection.return.length !== modificationForm.passengers) {
          errors.returnSeats = `Please select exactly ${modificationForm.passengers} return seats`;
          hasError = true;
        } else if (modificationForm.seatSelection.return.some(seat => !seat)) {
          errors.returnSeats = "All return seats must be selected";
          hasError = true;
        } else {
          // Validate seat format (e.g., "1A", "23C")
          const invalidReturnSeats = modificationForm.seatSelection.return.filter(
            seat => !seat.match(/^[0-9]{1,2}[A-F]$/)
          );
          if (invalidReturnSeats.length > 0) {
            errors.returnSeats = `Invalid return seat format: ${invalidReturnSeats.join(', ')}`;
            hasError = true;
          }
        }
      }
    }

    // Validate Contact Information
    if (!modificationForm.contactInfo?.email) {
      errors.contactEmail = "Contact email is required";
      hasError = true;
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(modificationForm.contactInfo.email)) {
      // International standard email format validation
      errors.contactEmail = "Please enter a valid email address";
      hasError = true;
    }

    if (!modificationForm.contactInfo?.phoneNumber) {
      errors.contactPhone = "Contact phone number is required";
      hasError = true;
    } else {
      // International standard: allow +, digits, spaces, hyphens, parentheses
      // Must be at least 7 digits (excluding non-digits)
      const digitsOnly = modificationForm.contactInfo.phoneNumber.replace(/[^\d]/g, '');
      if (!/^[\d\s\-()+]+$/.test(modificationForm.contactInfo.phoneNumber)) {
        errors.contactPhone = "Phone number contains invalid characters";
        hasError = true;
      } else if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        errors.contactPhone = "Phone number must be between 7 and 15 digits";
        hasError = true;
      }
    }

    // Validate Total Price
    if (!modificationForm.totalPrice || modificationForm.totalPrice <= 0) {
      errors.totalPrice = "Total price must be greater than zero";
      hasError = true;
    } else if (modificationForm.totalPrice > 100000) {
      // Reasonable maximum price for a booking
      errors.totalPrice = "Total price exceeds maximum allowed value";
      hasError = true;
    }

    // Display errors if any
    if (hasError) {
      // Display the first error message
      const firstError = Object.values(errors)[0];
      toast({
        title: "Validation Error",
        description: firstError,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const generateAvailableSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seats = [];
    for (let i = 1; i <= 30; i++) {
      for (let j = 0; j < rows.length; j++) {
        seats.push(`${i}${rows[j]}`);
      }
    }
    return seats;
  };

  const handleSeatSelection = (seat: string) => {
    setModificationForm(prev => {
      const updatedSeats = {
        ...prev.seatSelection,
        [selectedFlight]: [...prev.seatSelection[selectedFlight]]
      };
      
      // If we've added passengers, only allow selecting seats for the additional passengers
      if (prev.passengers > (selectedBooking?.passengers || 0)) {
        // Find the first empty seat position for additional passengers
        const startIndex = selectedBooking?.passengers || 0;
        const emptyIndex = updatedSeats[selectedFlight].findIndex((s, idx) => !s && idx >= startIndex);
        
        if (emptyIndex !== -1) {
          // Replace the empty seat with the selected one
          updatedSeats[selectedFlight][emptyIndex] = seat;
        } else if (updatedSeats[selectedFlight].length < prev.passengers) {
          // If there's no empty seat but we haven't filled all passenger seats
          updatedSeats[selectedFlight].push(seat);
        }
      } else {
        // For existing passengers, just find the first empty seat
        const emptyIndex = updatedSeats[selectedFlight].findIndex(s => !s);
        
        if (emptyIndex !== -1) {
          // Replace the empty seat with the selected one
          updatedSeats[selectedFlight][emptyIndex] = seat;
        } else if (updatedSeats[selectedFlight].length < prev.passengers) {
          // If there's no empty seat but we haven't filled all passenger seats
          updatedSeats[selectedFlight].push(seat);
        }
      }

      return {
        ...prev,
        seatSelection: updatedSeats
      };
    });
  };

  const submitModification = async () => {
    if (!selectedBooking) return;
    
    const isValid = validateModificationForm();
    if (!isValid) return;
    
    setIsProcessingModification(true);
    
    try {
      // Prepare passenger details for submission
      const updatedPassengerDetails: any[] = [];
      
      if (modificationForm.passengersDetails.length > 0) {
        for (let i = 0; i < modificationForm.passengers; i++) {
          const newPassenger = modificationForm.passengersDetails[i];
          
          if (newPassenger) {
            updatedPassengerDetails.push({
              firstName: newPassenger.firstName.trim(),
              lastName: newPassenger.lastName.trim(),
              dateOfBirth: newPassenger.dob ? new Date(newPassenger.dob).toISOString() : (
                // If dob is missing, use the original passenger's dateOfBirth if available
                selectedBooking.passengersDetails[i]?.dateOfBirth || new Date().toISOString()
              ),
              nationality: newPassenger.nationality?.trim() || '',
              passportNumber: newPassenger.passportNumber?.trim() || '',
              specialRequests: newPassenger.specialRequests || '', // Include this field as the backend expects it
            });
          } else if (i < selectedBooking.passengersDetails.length) {
            // If no new passenger data, use the original passenger data
            const originalPassenger = selectedBooking.passengersDetails[i];
            updatedPassengerDetails.push({
              ...originalPassenger,
              // Ensure dateOfBirth is properly formatted
              dateOfBirth: originalPassenger.dateOfBirth ? 
                (typeof originalPassenger.dateOfBirth === 'string' ? 
                  originalPassenger.dateOfBirth : 
                  new Date(originalPassenger.dateOfBirth).toISOString())
                : new Date().toISOString()
            });
          }
        }
      } else if (selectedBooking.passengersDetails.length > 0) {
        // If no new passenger details provided, use the original passenger details
        updatedPassengerDetails.push(...selectedBooking.passengersDetails.map(passenger => ({
          ...passenger,
          // Ensure dateOfBirth is properly formatted
          dateOfBirth: passenger.dateOfBirth ? 
            (typeof passenger.dateOfBirth === 'string' ? 
              passenger.dateOfBirth : 
              new Date(passenger.dateOfBirth).toISOString())
            : new Date().toISOString()
        })));
      }
      
      // Format flight objects to match what the backend expects
      const formattedOutboundFlight = modificationForm.outboundFlight ? {
        airline: selectedBooking.outboundFlight.airline || "AeroX", // Ensure airline is included
        flightNumber: modificationForm.outboundFlight.flightNumber,
        departureTime: modificationForm.outboundFlight.departureTime,
        arrivalTime: modificationForm.outboundFlight.arrivalTime,
        price: modificationForm.outboundFlight.price
      } : selectedBooking.outboundFlight;
      
      const formattedReturnFlight = modificationForm.tripType === 'One Way' 
        ? null 
        : (modificationForm.returnFlight 
            ? {
                airline: selectedBooking.returnFlight?.airline || "AeroX", // Ensure airline is included
                flightNumber: modificationForm.returnFlight.flightNumber,
                departureTime: modificationForm.returnFlight.departureTime,
                arrivalTime: modificationForm.returnFlight.arrivalTime,
                price: modificationForm.returnFlight.price
              } 
            : selectedBooking.returnFlight);
      
      // Current date for modification timestamp
      const currentDate = new Date();
      const modifiedAtStr = currentDate.toISOString();
      
      // Prepare the modification data
      const modificationData = {
        bookingId: selectedBooking._id,
        userId: user.id, // Use the current user's ID
        userEmail: user.email, // Use the current user's email
        tripType: modificationForm.tripType, // This should already be "Round Trip" or "One Way"
        from: modificationForm.from || selectedBooking.from,
        to: modificationForm.to || selectedBooking.to,
        departureDate: modificationForm.departureDate || selectedBooking.departureDate,
        returnDate: modificationForm.tripType === 'One Way' ? null : (modificationForm.returnDate || selectedBooking.returnDate),
        passengers: modificationForm.passengers,
        flightcabin: selectedBooking.flightcabin, // Keep the original cabin class
        outboundFlight: formattedOutboundFlight,
        returnFlight: formattedReturnFlight,
        passengersDetails: updatedPassengerDetails.length > 0 ? updatedPassengerDetails : selectedBooking.passengersDetails,
        contactInfo: modificationForm.contactInfo || selectedBooking.contactInfo,
        seatSelection: {
          outbound: modificationForm.seatSelection.outbound.length > 0 
            ? modificationForm.seatSelection.outbound 
            : selectedBooking.seatSelection.outbound,
          return: modificationForm.tripType === 'One Way' 
            ? [] 
            : (modificationForm.seatSelection.return.length > 0 
                ? modificationForm.seatSelection.return 
                : selectedBooking.seatSelection.return)
        },
        totalPrice: modificationForm.totalPrice || selectedBooking.totalPrice,
        modificationReason: "User requested modification", // Add a reason
        modificationDetails: modificationForm.modificationDetails || "Booking modified by user",
        modifiedAt: modifiedAtStr, // Add the modification date
        status: 'modified' // Set the booking status to modified
      };
      
      console.log("Sending modification data:", modificationData);
      
      // Call the API to modify the booking
      const updatedBooking = await modifyBooking(selectedBooking._id, modificationData);
      
      console.log('Booking modified successfully:', updatedBooking);
      
      // Explicitly set the booking status to 'modified'
      const updatedBookingWithStatus = {
        ...selectedBooking,
        ...updatedBooking,  // Include any updates from the server
        status: 'modified', // Force status to be 'modified'
        createdAt: modifiedAtStr
      };
      
      // Update the selected booking with the modified status
      setSelectedBooking(updatedBookingWithStatus);
      
      // Directly update the bookings array to reflect the change in the UI
      // This ensures the status is updated even if the backend doesn't return it correctly
      const updatedBookingsArray = bookings.map(booking => 
        booking._id === selectedBooking._id ? 
          {...booking, status: 'modified'} : 
          booking
      );
      
      // If the parent component provided bookings as a prop, we need to update it
      // This is a workaround since we can't directly modify props
      // The parent component will re-render with the updated bookings
      if (onRequestModification && typeof onRequestModification === 'function') {
        // Call onRequestModification with the updated booking to signal the parent to update
        onRequestModification({...selectedBooking, status: 'modified'});
      }
      
      // Log the updated booking with status for debugging
      console.log('Updated booking with status:', updatedBookingWithStatus);
      
      // Update the bookings array with the modified booking
      // This ensures the UI reflects the change even if the refresh fails
      const updatedBookings = bookings.map(b => 
        b._id === selectedBooking._id ? {...b, status: 'modified'} : b
      );
      
      // Force an immediate refresh to update the UI and disable the button
      if (typeof onRefresh === 'function') {
        // Add a small delay to ensure the backend has time to process the update
        setTimeout(() => {
          console.log('Refreshing bookings...');
          onRefresh();
        }, 500);
      }
      
      toast({
        title: "Success",
        description: "Booking modified successfully",
      });
      
      // Close the modification form
      setShowModificationForm(false);
      
      // Force a complete refresh of the bookings to ensure the UI shows the correct status
      setTimeout(() => {
        if (typeof onRefresh === 'function') {
          console.log('Forcing a complete refresh of bookings...');
          onRefresh();
        }
      }, 1000); // Longer delay to ensure backend has time to process
      setModificationForm({
        tripType: '',
        from: '',
        to: '',
        departureDate: '',
        returnDate: null,
        passengers: 0,
        outboundFlight: null,
        returnFlight: null,
        passengersDetails: [],
        contactInfo: null,
        seatSelection: {
          outbound: [],
          return: []
        },
        totalPrice: 0,
        modificationDetails: '',
        modifyDates: false,
        modifyRoute: false,
        modifyPassengers: false,
        modifySeats: false,
      });
      setIsProcessingModification(false);
    } catch (error: any) {
      console.error('Error submitting modification:', error);
      
      // For errors other than 'already modified' (which is handled in the inner try-catch)
      if (!error.message || !error.message.includes('already been modified')) {
        toast({
          title: "Error",
          description: "Failed to modify booking. Please try again.",
          variant: "destructive",
        });
      }
      
      setIsProcessingModification(false);
      setShowModificationForm(false);
    }
  };



  // Function to fetch available return flights
  const fetchReturnFlights = async (from: string, to: string, departureDate: string, passengers: number) => {
    if (!from || !to || !departureDate || !passengers) return;
    
    setIsLoadingReturnFlights(true);
    try {
      // Instead of trying to fetch flights dynamically, we'll create some mock flights
      // This ensures we always have flights to display
      const mockReturnFlights = [
        {
          id: `${to.substring(0, 3)}-${from.substring(0, 3)}-001`,
          airline: 'AeroX Airways',
          flightNumber: 'AX101',
          departureAirport: to.substring(0, 3).toUpperCase(),
          departureCity: to,
          departureTerminal: 'T1',
          departureGate: 'G10',
          arrivalAirport: from.substring(0, 3).toUpperCase(),
          arrivalCity: from,
          arrivalTerminal: 'T2',
          arrivalGate: 'G20',
          departureTime: '08:00:00',
          arrivalTime: '11:00:00',
          duration: '3h 00m',
          price: 450,
          status: 'scheduled',
          aircraft: 'Boeing 737-800',
          class: 'economy',
          seatsAvailable: 30
        },
        {
          id: `${to.substring(0, 3)}-${from.substring(0, 3)}-002`,
          airline: 'AeroX Airways',
          flightNumber: 'AX202',
          departureAirport: to.substring(0, 3).toUpperCase(),
          departureCity: to,
          departureTerminal: 'T1',
          departureGate: 'G15',
          arrivalAirport: from.substring(0, 3).toUpperCase(),
          arrivalCity: from,
          arrivalTerminal: 'T2',
          arrivalGate: 'G25',
          departureTime: '14:30:00',
          arrivalTime: '17:30:00',
          duration: '3h 00m',
          price: 550,
          status: 'scheduled',
          aircraft: 'Airbus A320',
          class: 'economy',
          seatsAvailable: 25
        },
        {
          id: `${to.substring(0, 3)}-${from.substring(0, 3)}-003`,
          airline: 'AeroX Airways',
          flightNumber: 'AX303',
          departureAirport: to.substring(0, 3).toUpperCase(),
          departureCity: to,
          departureTerminal: 'T1',
          departureGate: 'G20',
          arrivalAirport: from.substring(0, 3).toUpperCase(),
          arrivalCity: from,
          arrivalTerminal: 'T2',
          arrivalGate: 'G30',
          departureTime: '19:45:00',
          arrivalTime: '22:45:00',
          duration: '3h 00m',
          price: 650,
          status: 'scheduled',
          aircraft: 'Boeing 787 Dreamliner',
          class: 'economy',
          seatsAvailable: 20
        }
      ];
      
      setAvailableReturnFlights(mockReturnFlights);
    } catch (error) {
      console.error('Error creating mock return flights:', error);
      toast({
        title: "Error",
        description: "Failed to create return flights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingReturnFlights(false);
    }
  };
  
  // Function to handle return flight selection
  const handleReturnFlightSelect = (flight: any) => {
    setModificationForm(prev => ({
      ...prev,
      returnFlight: flight,
      // Update total price to include return flight
      totalPrice: prev.outboundFlight ? 
        prev.outboundFlight.price * prev.passengers + flight.price * prev.passengers : 
        prev.totalPrice + flight.price * prev.passengers
    }));
  };

  // Function to get available flights for a route
  const getAvailableFlights = (from: string, to: string) => {
    // Generate a deterministic seed based on the route
    const seed = from.charCodeAt(0) + to.charCodeAt(0);
    
    // Mock flight data with consistent values based on the route
    const mockFlights = [
      {
        flightNumber: `AX${100 + (seed % 900)}`,
        from,
        to,
        departureTime: '08:00',
        arrivalTime: '10:30',
        duration: '2h 30m',
        price: 299 + (seed % 200),
        seatsAvailable: 30 + (seed % 50),
        airline: "AeroX"
      },
      {
        flightNumber: `AX${200 + (seed % 900)}`,
        from,
        to,
        departureTime: '12:00',
        arrivalTime: '14:30',
        duration: '2h 30m',
        price: 349 + (seed % 200),
        seatsAvailable: 20 + (seed % 40),
        airline: "AeroX"
      },
      {
        flightNumber: `AX${300 + (seed % 900)}`,
        from,
        to,
        departureTime: '16:00',
        arrivalTime: '18:30',
        duration: '2h 30m',
        price: 399 + (seed % 200),
        seatsAvailable: 15 + (seed % 30),
        airline: "AeroX"
      }
    ];
    
    return mockFlights;
  };

  // Function to handle flight selection
  const handleFlightSelection = (flightType: 'outbound' | 'return', flight: any) => {
    setModificationForm(prev => {
      // Get the previous flight to calculate price difference
      const previousFlight = flightType === 'outbound' ? prev.outboundFlight : prev.returnFlight;
      
      // Calculate price difference
      let priceDifference = 0;
      
      // For outbound flights, we're replacing the existing flight
      if (flightType === 'outbound') {
        if (previousFlight) {
          // If replacing an existing outbound flight, calculate the difference
          priceDifference = flight.price - previousFlight.price;
        } else {
          // If adding a new outbound flight, add its full price
          priceDifference = flight.price;
        }
      } 
      // For return flights, we're adding to the existing outbound flight
      else if (flightType === 'return') {
        if (previousFlight) {
          // If replacing an existing return flight, calculate the difference
          priceDifference = flight.price - previousFlight.price;
        } else {
          // If adding a new return flight, add its full price
          priceDifference = flight.price;
        }
      }
      
      // Update the selected flight
      const updatedForm = {
        ...prev,
        [flightType === 'outbound' ? 'outboundFlight' : 'returnFlight']: flight
      };
      
      // Calculate the new total price by adding the price difference
      // Multiply by number of passengers
      const newTotalPrice = prev.totalPrice + (priceDifference * prev.passengers);
      
      return {
        ...updatedForm,
        totalPrice: newTotalPrice
      };
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-700"></div>
            <p className="text-navy-800 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter out bookings with invalid flight details at the component level as well
  const validBookings = bookings.filter(booking => {
    // Check if booking has valid outbound flight
    const hasValidOutbound = booking.outboundFlight && 
      booking.outboundFlight.flightNumber && 
      booking.outboundFlight.departureTime && 
      booking.outboundFlight.arrivalTime;
    
    // For round trips, check if return flight is valid
    const hasValidReturn = booking.tripType !== "Round Trip" || 
      (booking.returnFlight && 
       booking.returnFlight.flightNumber && 
       booking.returnFlight.departureTime && 
       booking.returnFlight.arrivalTime);
    
    return hasValidOutbound && hasValidReturn;
  });
  
  console.log(`Displaying ${validBookings.length} valid bookings out of ${bookings.length} total bookings`);
  
  if (validBookings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center border border-navy-100">
        {bookings.length > 0 ? (
          <>
            <p className="text-navy-600 mb-2">We found {bookings.length} bookings in your account, but they have incomplete flight details.</p>
            <p className="text-navy-600 mb-4">Please contact customer support for assistance.</p>
          </>
        ) : (
          <p className="text-navy-600 mb-4">You don't have any bookings yet.</p>
        )}
        <Link to="/flights" className="inline-block px-6 py-3 bg-navy-700 text-white rounded-md hover:bg-navy-800 transition-colors">
          Book a Flight
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-navy-800 mb-6">My Bookings</h2>
      
      {isProcessingModification && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-700"></div>
              <p className="text-navy-800 font-medium">Processing your request...</p>
            </div>
          </div>
        </div>
      )}
      
      {validBookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center border border-navy-100">
          <p className="text-navy-600 mb-4">No valid bookings found.</p>
          <Link to="/flights" className="inline-block px-6 py-3 bg-navy-700 text-white rounded-md hover:bg-navy-800 transition-colors">
            Book a Flight
          </Link>
        </div>
      ) : (
      <div className="space-y-6">
        {validBookings.map(booking => (
          <div key={booking._id} className="premium-card p-6 border-l-4 border-l-navy-600">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-navy-800">
                    {booking.tripType === 'round-trip' || booking.tripType === 'Round Trip' ? 'Round Trip' : 'One Way'}
                  </h3>
                  {(() => {
                    // Determine the current status based on request state
                    const request = getRequestStatus(booking._id);
                    const isModificationRequestPending = request && request.requestType === 'modification' && request.status === 'pending';
                    const isCancellationRequestPending = request && request.requestType === 'cancellation' && request.status === 'pending';
                    
                    // Determine the status text and style
                    let statusText = '';
                    let statusClass = '';
                    let requestDateInfo = null;
                    
                    if (booking.status === 'modified') {
                      statusText = 'MODIFIED';
                      statusClass = 'bg-blue-100 text-blue-800';
                      // Display modification date if available
                      if (booking.createdAt) {
                        requestDateInfo = (
                          <span className="text-xs text-navy-500 ml-2">
                            Modified on: {new Date(booking.createdAt).toLocaleDateString()}
                          </span>
                        );
                      }
                    } else if (booking.status === 'cancelled') {
                      statusText = 'CANCELLED';
                      statusClass = 'bg-red-100 text-red-800';
                    } else if (isModificationRequestPending || isCancellationRequestPending) {
                      statusText = 'PENDING';
                      statusClass = 'bg-yellow-100 text-yellow-800';
                      // Display request date if available
                      if (request && request.requestDate) {
                        requestDateInfo = (
                          <span className="text-xs text-navy-500 ml-2">
                            Request date: {new Date(request.requestDate).toLocaleDateString()}
                          </span>
                        );
                      }
                    } else {
                      statusText = 'CONFIRMED';
                      statusClass = 'bg-green-100 text-green-800';
                    }
                    
                    return (
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                          {statusText}
                        </span>
                        {requestDateInfo}
                      </div>
                    );
                  })()}
                </div>
                <p className="text-navy-600 flex items-center mt-1">
                  <span className="font-medium">{booking.from}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="font-medium">{booking.to}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="bg-navy-50 px-3 py-1 rounded-md inline-block">
                  <p className="text-navy-700 font-medium">{new Date(booking.departureDate).toLocaleDateString()}</p>
                  {booking.returnDate && (
                    <p className="text-navy-600 text-sm mt-1">
                      Return: {new Date(booking.returnDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-navy-50/50 p-4 rounded-lg">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-semibold text-navy-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  Outbound Flight
                </h4>
                {(() => {
                  console.log(`Rendering outbound flight for booking ${booking.id}:`, booking.outboundFlight);
                  return booking.outboundFlight ? (
                    <div className="space-y-2">
                      <p className="text-navy-800 font-medium">
                        {booking.outboundFlight.airline || "AeroX"} {booking.outboundFlight.flightNumber || ""}
                      </p>
                      <p className="text-navy-600 flex items-center text-sm">
                        <span className="font-medium">{booking.outboundFlight.departureTime || "N/A"}</span>
                        <span className="mx-2 text-navy-400">-</span>
                        <span className="font-medium">{booking.outboundFlight.arrivalTime || "N/A"}</span>
                      </p>
                      <p className="text-navy-600 text-sm">
                        <span className="text-navy-500">Seat:</span> {booking.seatSelection?.outbound?.join(', ') || 'Not assigned'}
                      </p>
                      <p className="text-navy-600 text-sm">
                        <span className="text-navy-500">Price:</span> ${booking.outboundFlight.price || 0}
                      </p>
                      <p className="text-navy-600 text-sm">
                        <span className="text-navy-500">From:</span> {booking.from}
                      </p>
                      <p className="text-navy-600 text-sm">
                        <span className="text-navy-500">To:</span> {booking.to}
                      </p>
                    </div>
                  ) : (
                    <p className="text-navy-600 italic">Flight details not available</p>
                  );
                })()}
              </div>
              {booking.returnFlight && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="text-sm font-semibold text-navy-700 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    Return Flight
                  </h4>
                  {(() => {
                    console.log(`Rendering return flight for booking ${booking.id}:`, booking.returnFlight);
                    return (
                      <div className="space-y-2">
                        <p className="text-navy-800 font-medium">
                          {booking.returnFlight.airline || "AeroX"} {booking.returnFlight.flightNumber || ""}
                        </p>
                        <p className="text-navy-600 flex items-center text-sm">
                          <span className="font-medium">{booking.returnFlight.departureTime || "N/A"}</span>
                          <span className="mx-2 text-navy-400">-</span>
                          <span className="font-medium">{booking.returnFlight.arrivalTime || "N/A"}</span>
                        </p>
                        <p className="text-navy-600 text-sm">
                          <span className="text-navy-500">Seat:</span> {booking.seatSelection?.return?.join(', ') || 'Not assigned'}
                        </p>
                        <p className="text-navy-600 text-sm">
                          <span className="text-navy-500">Price:</span> ${booking.returnFlight.price || 0}
                        </p>
                        <p className="text-navy-600 text-sm">
                          <span className="text-navy-500">From:</span> {booking.to}
                        </p>
                        <p className="text-navy-600 text-sm">
                          <span className="text-navy-500">To:</span> {booking.from}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-semibold text-navy-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Passengers & Payment
                </h4>
                <div className="space-y-2">
                  <p className="text-navy-800">{booking.passengers} passenger(s)</p>
                  <p className="text-navy-800 font-bold text-lg">
                    ${booking.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end space-x-3">
              {booking.status !== 'cancelled' && (
                <>
                  {/* Determine request status */}
                  {(() => {
                    const request = getRequestStatus(booking._id);
                    const isModificationRequestPending = request && request.requestType === 'modification' && request.status === 'pending';
                    const isCancellationRequestPending = request && request.requestType === 'cancellation' && request.status === 'pending';
                    const isModificationApproved = request && request.requestType === 'modification' && request.status === 'approved';
                    const isCancellationApproved = request && request.requestType === 'cancellation' && request.status === 'approved';
                    const isModificationRejected = isRequestRejected(booking._id, 'modification');
                    const isCancellationRejected = isRequestRejected(booking._id, 'cancellation');
                    // Log booking status for debugging
                    console.log(`Booking ${booking._id} status:`, booking.status);
                    
                    // Check if booking is already modified - use lowercase comparison for case insensitivity
                    const isAlreadyModified = booking.status?.toLowerCase() === 'modified';
                    
                    return (
                      <>
                        {/* Modification Button Logic */}
                        {isAlreadyModified ? (
                          <button
                            className="px-3 py-1.5 bg-gray-400 text-white rounded cursor-not-allowed text-sm"
                            disabled
                          >
                            Already Modified
                          </button>
                        ) : isModificationRejected ? (
                          <button
                            className="px-3 py-1.5 bg-red-400 text-white rounded cursor-not-allowed text-sm"
                            disabled
                          >
                            Modification Rejected
                          </button>
                        ) : isModificationApproved ? (
                          <button
                            className="px-3 py-1.5 bg-navy-600 text-white rounded hover:bg-navy-700 text-sm"
                            onClick={() => handleModifyBooking(booking)}
                            disabled={isCancellationRequestPending}
                          >
                            Modify Booking
                          </button>
                        ) : (
                          <button
                            className="px-3 py-1.5 bg-navy-600 text-white rounded hover:bg-navy-700 text-sm"
                            onClick={() => handleModifyBooking(booking)}
                            disabled={isModificationRequestPending || isCancellationRequestPending}
                          >
                            {isModificationRequestPending ? 'Modification Pending'
                              : isCancellationRequestPending ? 'Modification Disabled'
                              : 'Request Modification'}
                          </button>
                        )}

                        {/* Cancellation Button Logic */}
                        {isCancellationApproved ? (
                          <button
                            className="px-3 py-1.5 bg-gray-400 text-white rounded cursor-not-allowed text-sm"
                            disabled
                          >
                            Cancelled
                          </button>
                        ) : isCancellationRejected ? (
                          <button
                            className="px-3 py-1.5 bg-red-400 text-white rounded cursor-not-allowed text-sm"
                            disabled
                          >
                            Cancellation Rejected
                          </button>
                        ) : (
                          <button
                            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            onClick={() => handleRequestCancellation(booking)}
                            disabled={isCancellationRequestPending}
                          >
                            {isCancellationRequestPending ? 'Cancellation Pending' : 'Request Cancellation'}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
      {showRequestModal && selectedBooking && (
        <RequestForm
          userId={user.id}
          userEmail={user.email}
          userName={user.name || user.email}
          bookingId={selectedBooking._id || ''}
          bookingType="flight"
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            onRefresh();
            fetchUserRequests();
            setShowRequestModal(false);
          }}
          requestType="cancellation"
        />
      )}
      
      {showModificationModal && selectedBooking && (
        <RequestForm
          userId={user.id}
          userEmail={user.email}
          userName={user.name || user.email}
          bookingId={selectedBooking._id || ''}
          bookingType="flight"
          onClose={() => setShowModificationModal(false)}
          onSuccess={() => {
            onRefresh();
            fetchUserRequests();
            setShowModificationModal(false);
          }}
          requestType="modification"
        />
      )}
      
      {/* Modification Form */}
      {showModificationForm && selectedBooking && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-5xl w-full my-8 mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b">
              <h3 className="text-xl font-bold text-navy-800">
                Modify Your Booking
              </h3>
              <button 
                type="button" 
                className="text-navy-500 hover:text-navy-700"
                onClick={() => setShowModificationForm(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modification Options */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-navy-700 mb-3">What would you like to modify?</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex items-center p-3 border border-navy-200 rounded-md hover:bg-navy-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={modificationForm.modifyDates}
                    onChange={(e) => handleInputChange('modifyDates', e.target.checked)}
                  />
                  <span>Travel Dates</span>
                </label>
                <label className="flex items-center p-3 border border-navy-200 rounded-md hover:bg-navy-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={modificationForm.modifyRoute}
                    onChange={(e) => handleInputChange('modifyRoute', e.target.checked)}
                  />
                  <span>Route/Destination</span>
                </label>
                <label className="flex items-center p-3 border border-navy-200 rounded-md hover:bg-navy-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={modificationForm.modifySeats}
                    onChange={(e) => handleInputChange('modifySeats', e.target.checked)}
                  />
                  <span>Seat Selection</span>
                </label>
                <label className="flex items-center p-3 border border-navy-200 rounded-md hover:bg-navy-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={modificationForm.modifyPassengers}
                    onChange={(e) => handleInputChange('modifyPassengers', e.target.checked)}
                  />
                  <span>Passenger Details</span>
                </label>
              </div>
            </div>
            
            {/* Price Modification Instructions */}
            <div className="mb-6 p-4 border border-navy-200 rounded-md bg-navy-50/30">
              <h4 className="text-lg font-semibold text-navy-700 mb-3">Price Modification Guidelines</h4>
              <div className="text-sm text-navy-600 space-y-3">
                <p>Your booking modifications will affect the total price based on the following rules:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <h5 className="font-medium text-navy-700 mb-1">Round Trip to One Way</h5>
                    <p>New price = one-way fare + change fee</p>
                    <p className="text-xs mt-1 text-navy-500">If the new price is less than what you paid, refund applies only if fare rules allow.</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <h5 className="font-medium text-navy-700 mb-1">One Way to Round Trip</h5>
                    <p>New price = original price + (round trip fare - one way fare) + change fee</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <h5 className="font-medium text-navy-700 mb-1">Adding Passengers</h5>
                    <p>New price = original total + (number of new passengers × current fare)</p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center">
                  <div className="flex-1">
                    <p><strong>Original Price:</strong> ${selectedBooking?.totalPrice.toFixed(2)}</p>
                    <p><strong>New Price:</strong> ${modificationForm.totalPrice.toFixed(2)}</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-md shadow-sm">
                    <p className={`font-bold ${modificationForm.totalPrice > selectedBooking?.totalPrice ? 'text-red-600' : 'text-green-600'}`}>
                      Price Difference: ${Math.abs(modificationForm.totalPrice - selectedBooking?.totalPrice).toFixed(2)}
                      {modificationForm.totalPrice > selectedBooking?.totalPrice ? ' (Additional payment required)' : ' (Potential refund)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seat Selection - Moved to top for better visibility */}
            {modificationForm.modifySeats && (
              <div className="p-4 border border-navy-200 rounded-md mb-6">
                <h4 className="text-lg font-semibold text-navy-700 mb-4">Seat Selection</h4>
                
                {/* Flight Selection Tabs */}
                <div className="flex border-b border-navy-200 mb-4">
                  <button
                    type="button"
                    className={`py-2 px-4 font-medium ${selectedFlight === 'outbound' ? 'text-navy-700 border-b-2 border-navy-500' : 'text-navy-500'}`}
                    onClick={() => setSelectedFlight('outbound')}
                  >
                    Outbound Flight
                  </button>
                  {modificationForm.tripType === 'Round Trip' && (
                    <button
                      type="button"
                      className={`py-2 px-4 font-medium ${selectedFlight === 'return' ? 'text-navy-700 border-b-2 border-navy-500' : 'text-navy-500'}`}
                      onClick={() => setSelectedFlight('return')}
                    >
                      Return Flight
                    </button>
                  )}
                </div>
                
                {/* Seat Map */}
                <div className="mb-4">
                  <p className="text-sm text-navy-600 mb-2">
                    Selected Seats: {
                      selectedFlight === 'outbound' 
                        ? modificationForm.seatSelection.outbound.join(', ') || 'None'
                        : modificationForm.seatSelection.return.join(', ') || 'None'
                    }
                  </p>
                  
                  <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
                    {generateAvailableSeats().map((seat) => (
                      <button
                        key={seat}
                        type="button"
                        className={`p-2 text-center text-sm rounded-md ${
                          (selectedFlight === 'outbound' && modificationForm.seatSelection.outbound.includes(seat)) ||
                          (selectedFlight === 'return' && modificationForm.seatSelection.return.includes(seat))
                            ? 'bg-navy-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-navy-700'
                        }`}
                        onClick={() => handleSeatSelection(seat)}
                      >
                        {seat}
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-xs text-navy-500 mt-2 text-center">
                    Please select {modificationForm.passengers} seat(s) for each flight
                  </p>
                </div>
              </div>
            )}
            
            {/* Modification form content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Modifications */}
              {modificationForm.modifyDates && (
                <div className="p-4 border border-navy-200 rounded-md">
                  <h4 className="text-lg font-semibold text-navy-700 mb-4">Travel Dates</h4>
                  
                  {/* Trip Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-navy-600 mb-1">
                      Trip Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          className="mr-2"
                          checked={modificationForm.tripType === 'Round Trip'}
                          onChange={() => handleInputChange('tripType', 'Round Trip')}
                        />
                        Round Trip
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          className="mr-2"
                          checked={modificationForm.tripType === 'One Way'}
                          onChange={() => handleInputChange('tripType', 'One Way')}
                        />
                        One Way
                      </label>
                    </div>
                  </div>
                  
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="departureDate" className="block text-sm font-medium text-navy-600 mb-1">
                        Departure Date
                      </label>
                      <input
                        type="date"
                        id="departureDate"
                        className="w-full p-2 border border-navy-200 rounded-md"
                        value={modificationForm.departureDate}
                        onChange={(e) => handleInputChange('departureDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    {modificationForm.tripType === 'Round Trip' && (
                      <div>
                        <label htmlFor="returnDate" className="block text-sm font-medium text-navy-600 mb-1">
                          Return Date
                        </label>
                        <input
                          type="date"
                          id="returnDate"
                          className="w-full p-2 border border-navy-200 rounded-md"
                          value={modificationForm.returnDate || ''}
                          onChange={(e) => handleInputChange('returnDate', e.target.value)}
                          min={modificationForm.departureDate}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Route Modifications */}
              {modificationForm.modifyRoute && (
                <div className="p-4 border border-navy-200 rounded-md">
                  <h4 className="text-lg font-semibold text-navy-700 mb-4">Route/Destination</h4>
                  
                  {/* From/To */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="from" className="block text-sm font-medium text-navy-600 mb-1">
                        From
                      </label>
                      <select
                        id="from"
                        className="w-full p-2 border border-navy-200 rounded-md"
                        value={modificationForm.from}
                        onChange={(e) => {
                          handleInputChange('from', e.target.value);
                          // Reset the outbound flight when origin changes
                          setModificationForm(prev => ({
                            ...prev,
                            outboundFlight: null
                          }));
                        }}
                      >
                        <option value="">Select Origin</option>
                        {availableLocations.map((location: string) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="to" className="block text-sm font-medium text-navy-600 mb-1">
                        To
                      </label>
                      <select
                        id="to"
                        className="w-full p-2 border border-navy-200 rounded-md"
                        value={modificationForm.to}
                        onChange={(e) => {
                          handleInputChange('to', e.target.value);
                          // Reset the outbound flight when destination changes
                          setModificationForm(prev => ({
                            ...prev,
                            outboundFlight: null
                          }));
                        }}
                      >
                        <option value="">Select Destination</option>
                        {availableLocations.map((location: string) => (
                          <option 
                            key={location} 
                            value={location}
                            disabled={location === modificationForm.from}
                          >
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Flight Selection Section */}
                  {modificationForm.from && modificationForm.to && modificationForm.departureDate && (
                    <div className="mt-4">
                      {/* Only show outbound flight selection if the original booking was NOT a one-way trip being modified to round trip */}
                      {!(selectedBooking?.tripType === 'One Way' && modificationForm.tripType === 'Round Trip') && (
                        <>
                          <h5 className="text-md font-semibold text-navy-700 mb-3">Select Outbound Flight</h5>
                          
                          {/* Outbound Flight Selection */}
                          <div className="mb-4">
                            <div className="grid grid-cols-1 gap-3">
                              {getAvailableFlights(modificationForm.from, modificationForm.to).map((flight, index) => (
                                <div 
                                  key={`outbound-${index}`}
                                  className={`p-3 border rounded-md cursor-pointer transition-all ${
                                    modificationForm.outboundFlight?.flightNumber === flight.flightNumber ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                                  }`}
                                  onClick={() => handleFlightSelection('outbound', flight)}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-medium">{flight.flightNumber}</p>
                                      <p className="text-sm text-gray-600">{modificationForm.from} to {modificationForm.to}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">${flight.price}</p>
                                      <p className="text-sm text-gray-600">Departure: {flight.departureTime}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {getAvailableFlights(modificationForm.from, modificationForm.to).length === 0 && (
                                <div className="p-3 border border-gray-200 rounded-md bg-gray-50 text-gray-600">
                                  No flights available for this route. Please try different dates or destinations.
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Show a message when converting from one-way to round trip */}
                      {selectedBooking?.tripType === 'One Way' && modificationForm.tripType === 'Round Trip' && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-blue-700">
                            <strong>Note:</strong> Your outbound flight remains unchanged. You only need to select a return flight.
                          </p>
                        </div>
                      )}
                      
                      {/* Return Flight Selection - Only show if trip type is round-trip */}
                      {modificationForm.tripType === 'Round Trip' && modificationForm.returnDate && (
                        <div>
                          <h5 className="text-md font-semibold text-navy-700 mb-3">Select Return Flight</h5>
                          <div className="grid grid-cols-1 gap-3">
                            {getAvailableFlights(modificationForm.to, modificationForm.from).map((flight, index) => (
                              <div 
                                key={`return-${index}`}
                                className={`p-3 border rounded-md cursor-pointer transition-all ${
                                  modificationForm.returnFlight?.flightNumber === flight.flightNumber ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                                }`}
                                onClick={() => handleFlightSelection('return', flight)}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{flight.flightNumber}</p>
                                    <p className="text-sm text-gray-600">{modificationForm.to} to {modificationForm.from}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">${flight.price}</p>
                                    <p className="text-sm text-gray-600">Departure: {flight.departureTime}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {getAvailableFlights(modificationForm.to, modificationForm.from).length === 0 && (
                              <div className="p-3 border border-gray-200 rounded-md bg-gray-50 text-gray-600">
                                No return flights available for this route. Please try different dates or destinations.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Note about flight changes */}
                  <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800 mt-4">
                    <p className="font-medium">Note:</p>
                    <p>Changing your route will require selecting new flights. Please select your preferred flights above.</p>
                  </div>
                </div>
              )}
              
              {/* Passenger Modifications */}
              {modificationForm.modifyPassengers && (
                <div className="p-4 border border-navy-200 rounded-md">
                  <h4 className="text-lg font-semibold text-navy-700 mb-4">Passenger Details</h4>
                  
                  {/* Passengers Count */}
                  <div className="mb-4">
                    <label htmlFor="passengers" className="block text-sm font-medium text-navy-600 mb-1">
                      Number of Passengers
                    </label>
                    <select
                      id="passengers"
                      className="w-full p-2 border border-navy-200 rounded-md"
                      value={modificationForm.passengers}
                      onChange={(e) => handlePassengerCountChange(parseInt(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Passenger Details */}
                  <div className="max-h-96 overflow-y-auto pr-2">
                    {Array.from({ length: modificationForm.passengers }).map((_, index) => (
                      <div key={index} className="mb-4 p-3 border border-navy-200 rounded-md">
                        <h5 className="font-medium text-navy-700 mb-2">
                          Passenger {index + 1}
                        </h5>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <label className="block text-sm font-medium text-navy-600 mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              className="w-full p-2 border border-navy-200 rounded-md"
                              value={modificationForm.passengersDetails[index]?.firstName || ''}
                              onChange={(e) => handlePassengerDetailsChange(index, 'firstName', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-navy-600 mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              className="w-full p-2 border border-navy-200 rounded-md"
                              value={modificationForm.passengersDetails[index]?.lastName || ''}
                              onChange={(e) => handlePassengerDetailsChange(index, 'lastName', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <label className="block text-sm font-medium text-navy-600 mb-1">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              className="w-full p-2 border border-navy-200 rounded-md"
                              value={modificationForm.passengersDetails[index]?.dob || ''}
                              onChange={(e) => handlePassengerDetailsChange(index, 'dob', e.target.value)}
                              max={new Date().toISOString().split('T')[0]}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-navy-600 mb-1">
                              Passport Number
                            </label>
                            <input
                              type="text"
                              className="w-full p-2 border border-navy-200 rounded-md"
                              value={modificationForm.passengersDetails[index]?.passportNumber || ''}
                              onChange={(e) => handlePassengerDetailsChange(index, 'passportNumber', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <label className="block text-sm font-medium text-navy-600 mb-1">
                              Nationality
                            </label>
                            <input
                              type="text"
                              className="w-full p-2 border border-navy-200 rounded-md"
                              value={modificationForm.passengersDetails[index]?.nationality || ''}
                              onChange={(e) => handlePassengerDetailsChange(index, 'nationality', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-navy-600 mb-1">
                              Special Requests
                            </label>
                            <input
                              type="text"
                              className="w-full p-2 border border-navy-200 rounded-md"
                              value={modificationForm.passengersDetails[index]?.specialRequests || ''}
                              onChange={(e) => handlePassengerDetailsChange(index, 'specialRequests', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3 sticky bottom-0 bg-white pt-3 border-t">
              <button
                type="button"
                className="px-4 py-2 border border-navy-300 rounded-md text-navy-700 hover:bg-navy-50"
                onClick={() => setShowModificationForm(false)}
                disabled={isProcessingModification}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700"
                onClick={submitModification}
                disabled={isProcessingModification}
              >
                {isProcessingModification ? 'Processing...' : 'Submit Modifications'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookings;
