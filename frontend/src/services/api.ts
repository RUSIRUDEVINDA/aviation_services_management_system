// API service for handling requests to backend and external APIs
import axios from 'axios';

// API URL and utility functions
const API_URL = 'http://localhost:3001';

// ...existing code...

const handleApiError = (error: any) => {
  console.error('API Error:', error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error message:', error.message);
  }
};

// Mock flight data - in a real application, this would come from an API
export const mockFlights = [
  {
    id: 'FL123',
    airline: 'Sky Airlines',
    departureAirport: 'JFK',
    departureCity: 'New York',
    arrivalAirport: 'LAX',
    arrivalCity: 'Los Angeles',
    departureTime: '2025-04-02T08:00:00',
    arrivalTime: '2025-04-03T11:15:00',
    duration: '3h 15m',
    price: 320,
    class: 'Economy',
    seatsAvailable: 43,
  },
  {
    id: 'FL124',
    airline: 'Ocean Air',
    departureAirport: 'JFK',
    departureCity: 'New York',
    arrivalAirport: 'LAX',
    arrivalCity: 'Los Angeles',
    departureTime: '2025-04-02T10:30:00',
    arrivalTime: '2025-04-02T13:45:00',
    duration: '3h 15m',
    price: 360,
    class: 'Economy',
    seatsAvailable: 28,
  },
  {
    id: 'FL125',
    airline: 'Cloud Express',
    departureAirport: 'JFK',
    departureCity: 'New York',
    arrivalAirport: 'LAX',
    arrivalCity: 'Los Angeles',
    departureTime: '2025-04-02T14:00:00',
    arrivalTime: '2025-04-03T17:10:00',
    duration: '3h 10m',
    price: 290,
    class: 'Economy',
    seatsAvailable: 15,
  },
  {
    id: 'FL126',
    airline: 'Sky Airlines',
    departureAirport: 'JFK',
    departureCity: 'New York',
    arrivalAirport: 'LAX',
    arrivalCity: 'Los Angeles',
    departureTime: '2025-04-02T16:30:00',
    arrivalTime: '2025-04-02T19:40:00',
    duration: '3h 10m',
    price: 410,
    class: 'Business',
    seatsAvailable: 10,
  },
  {
    id: 'FL127',
    airline: 'Ocean Air',
    departureAirport: 'JFK',
    departureCity: 'New York',
    arrivalAirport: 'LAX',
    arrivalCity: 'Los Angeles',
    departureTime: '2025-04-02T19:00:00',
    arrivalTime: '2025-04-02T22:20:00',
    duration: '3h 20m',
    price: 285,
    class: 'Economy',
    seatsAvailable: 32,
  }
];

// Mock return flights
export const mockReturnFlights = [
  {
    id: 'FL223',
    airline: 'Sky Airlines',
    departureAirport: 'LAX',
    departureCity: 'Los Angeles',
    arrivalAirport: 'JFK',
    arrivalCity: 'New York',
    departureTime: '2025-04-07T07:30:00',
    arrivalTime: '2025-04-07T15:45:00',
    duration: '5h 15m',
    price: 340,
    class: 'Economy',
    seatsAvailable: 38,
  },
  {
    id: 'FL224',
    airline: 'Ocean Air',
    departureAirport: 'LAX',
    departureCity: 'Los Angeles',
    arrivalAirport: 'JFK',
    arrivalCity: 'New York',
    departureTime: '2025-04-07T10:00:00',
    arrivalTime: '2025-04-07T18:15:00',
    duration: '5h 15m',
    price: 380,
    class: 'Economy',
    seatsAvailable: 24,
  },
  {
    id: 'FL225',
    airline: 'Cloud Express',
    departureAirport: 'LAX',
    departureCity: 'Los Angeles',
    arrivalAirport: 'JFK',
    arrivalCity: 'New York',
    departureTime: '2025-04-07T13:30:00',
    arrivalTime: '2025-04-07T21:40:00',
    duration: '5h 10m',
    price: 310,
    class: 'Economy',
    seatsAvailable: 12,
  }
];

// Mock air taxi locations
export const mockAirTaxiLocations = [
  {
    id: 1,
    name: "Bandaranaike International Airport",
    city: "Katunayake",
    code: "CMB",
    type: "airport"
  },
  {
    id: 2,
    name: "Mattala Rajapaksa International Airport",
    city: "Hambantota",
    code: "HRI",
    type: "airport"
  },
  {
    id: 3,
    name: "Colombo City Center",
    city: "Colombo",
    code: "CMB",
    type: "city"
  },
  {
    id: 4,
    name: "Galle Fort",
    city: "Galle",
    code: "GAL",
    type: "city"
  },
  {
    id: 5,
    name: "Kandy City Center",
    city: "Kandy",
    code: "KND",
    type: "city"
  },
  {
    id: 6,
    name: "Negombo Beach",
    city: "Negombo",
    code: "NEG",
    type: "city"
  },
  {
    id: 7,
    name: "Hikkaduwa Beach",
    city: "Hikkaduwa",
    code: "HIK",
    type: "city"
  },
  {
    id: 8,
    name: "Nuwara Eliya",
    city: "Nuwara Eliya",
    code: "NEW",
    type: "city"
  },
  {
    id: 9,
    name: "Trincomalee",
    city: "Trincomalee",
    code: "TRI",
    type: "city"
  },
  {
    id: 10,
    name: "Jaffna",
    city: "Jaffna",
    code: "JAF",
    type: "city"
  }
];

// Mock bookings for user dashboard
export const mockBookings = [
  {
    id: 'B12345',
    type: 'flight',
    status: 'confirmed',
    flight: {
      id: 'FL123',
      airline: 'Sky Airlines',
      departureAirport: 'JFK',
      departureCity: 'New York',
      arrivalAirport: 'LAX',
      arrivalCity: 'Los Angeles',
      departureTime: '2023-07-20T08:00:00',
      arrivalTime: '2023-07-20T11:15:00',
    },
    passengers: [
      { name: 'John Doe', seat: '14A' }
    ],
    totalPrice: 320,
    createdAt: '2023-07-15T10:30:00',
  },
  {
    id: 'B12346',
    type: 'air-taxi',
    status: 'confirmed',
    pickup: 'JFK Airport',
    destination: 'Manhattan Heliport',
    date: '2023-07-21T14:00:00',
    passengers: 2,
    totalPrice: 250,
    createdAt: '2023-07-16T09:45:00',
  },
  {
    id: 'B12347',
    type: 'flight',
    status: 'cancelled',
    flight: {
      id: 'FL127',
      airline: 'Ocean Air',
      departureAirport: 'JFK',
      departureCity: 'New York',
      arrivalAirport: 'LAX',
      arrivalCity: 'Los Angeles',
      departureTime: '2023-06-15T19:00:00',
      arrivalTime: '2023-06-15T22:20:00',
    },
    passengers: [
      { name: 'John Doe', seat: '22C' }
    ],
    totalPrice: 285,
    createdAt: '2023-06-10T11:20:00',
  },
];

// Mock flight status data collection
const mockFlightStatuses = {
  'FL123': {
    flightNumber: 'FL123',
    status: 'active',
    airline: 'Sky Airlines',
    departureAirport: {
      name: 'John F. Kennedy International Airport',
      code: 'JFK',
      city: 'New York',
      country: 'United States',
      latitude: 40.6413,
      longitude: -73.7781
    },
    arrivalAirport: {
      name: 'Los Angeles International Airport',
      code: 'LAX',
      city: 'Los Angeles',
      country: 'United States',
      latitude: 33.9416,
      longitude: -118.4085
    },
    departureTime: '2025-04-02T08:00:00',
    arrivalTime: '2025-04-03T11:15:00',
    terminal: 'T2',
    gate: 'G15'
  },
  'FL124': {
    flightNumber: 'FL124',
    status: 'delayed',
    airline: 'Ocean Air',
    departureAirport: {
      name: 'San Francisco International Airport',
      code: 'SFO',
      city: 'San Francisco',
      country: 'United States',
      latitude: 37.6213,
      longitude: -122.3790,
    },
    arrivalAirport: {
      name: 'Seattle-Tacoma International Airport',
      code: 'SEA',
      city: 'Seattle',
      country: 'United States',
      latitude: 47.4502,
      longitude: -122.3088,
    },
    departureTime: '2023-07-20T10:30:00',
    arrivalTime: '2023-07-20T13:45:00',
    currentPosition: {
      latitude: 42.7500,
      longitude: -122.5000,
      altitude: 31000,
      speed: 520,
    },
    onTime: false,
    terminal: 'T2',
    gate: 'G5',
  },
  'FL125': {
    flightNumber: 'FL125',
    status: 'scheduled',
    airline: 'Cloud Express',
    departureAirport: {
      name: 'O\'Hare International Airport',
      code: 'ORD',
      city: 'Chicago',
      country: 'United States',
      latitude: 41.9742,
      longitude: -87.9073,
    },
    arrivalAirport: {
      name: 'Dallas/Fort Worth International Airport',
      code: 'DFW',
      city: 'Dallas',
      country: 'United States',
      latitude: 32.8968,
      longitude: -97.0380,
    },
    departureTime: '2023-07-21T14:00:00',
    arrivalTime: '2023-07-21T16:30:00',
    currentPosition: null,
    onTime: true,
    terminal: 'T3',
    gate: 'G22',
  },
  'FL126': {
    flightNumber: 'FL126',
    status: 'landed',
    airline: 'Sky Airlines',
    departureAirport: {
      name: 'Miami International Airport',
      code: 'MIA',
      city: 'Miami',
      country: 'United States',
      latitude: 25.7932,
      longitude: -80.2906
    },
    arrivalAirport: {
      name: 'Hartsfield-Jackson Atlanta International Airport',
      code: 'ATL',
      city: 'Atlanta',
      country: 'United States',
      latitude: 33.6407,
      longitude: -84.4277,
    },
    departureTime: '2023-07-20T09:15:00',
    arrivalTime: '2023-07-20T11:00:00',
    currentPosition: {
      latitude: 33.6407,
      longitude: -84.4277,
      altitude: 0,
      speed: 0,
    },
    onTime: true,
    terminal: 'T1',
    gate: 'G8',
  },
  'FL127': {
    flightNumber: 'FL127',
    status: 'cancelled',
    airline: 'Ocean Air',
    departureAirport: {
      name: 'Denver International Airport',
      code: 'DEN',
      city: 'Denver',
      country: 'United States',
      latitude: 39.8561,
      longitude: -104.6737,
    },
    arrivalAirport: {
      name: 'McCarran International Airport',
      code: 'LAS',
      city: 'Las Vegas',
      country: 'United States',
      latitude: 36.0840,
      longitude: -115.1537,
    },
    departureTime: '2023-07-20T16:45:00',
    arrivalTime: '2023-07-20T18:00:00',
    currentPosition: null,
    onTime: false,
    terminal: 'T2',
    gate: 'G15',
  },
};

// Function to search flights
export const searchFlights = async (searchParams: any) => {
  console.log('Searching flights with params:', searchParams);
  
  const { departureAirport, arrivalAirport, departureDate, tripType, flightClass } = searchParams;
  
  // Get airport names from codes
  const airportNames = {
    JFK: 'New York',
    LAX: 'Los Angeles',
    SFO: 'San Francisco',
    ORD: 'Chicago',
    MIA: 'Miami',
    LHR: 'London',
    CDG: 'Paris',
    DXB: 'Dubai',
    SIN: 'Singapore',
    NRT: 'Tokyo'
  };
  
  // Class multipliers for pricing
  const classMultipliers = {
    economy: 1.0,
    premium: 1.5,
    business: 2.0,
    first: 2.5
  };
  
  // Generate dynamic flight data based on selected airports
  const flights = [];
  
  // Generate multiple flights with different times and prices
  for (let i = 0; i < 5; i++) {
    // Base price varies by route length
    const basePrice = Math.floor(Math.random() * 100) + 200;
    const departureTime = new Date(departureDate);
    departureTime.setHours(8 + i * 2, 0, 0); // Flights every 2 hours starting from 8 AM
    
    const arrivalTime = new Date(departureTime);
    arrivalTime.setHours(arrivalTime.getHours() + 5); // 5 hour flight duration
    
    // Calculate price based on class
    const price = Math.round(basePrice * classMultipliers[flightClass]);
    
    // Set seats available based on class
    const seatsAvailable = Math.floor(Math.random() * {
      economy: 40,
      premium: 30,
      business: 20,
      first: 10
    }[flightClass]) + 1;
    
    flights.push({
      id: `FL${123 + i}`,
      airline: Math.random() > 0.5 ? 'Sky Airlines' : 'Ocean Air',
      departureAirport,
      departureCity: airportNames[departureAirport],
      arrivalAirport,
      arrivalCity: airportNames[arrivalAirport],
      departureTime: departureTime.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
      duration: '5h',
      price,
      class: flightClass.charAt(0).toUpperCase() + flightClass.slice(1), // Capitalize first letter
      seatsAvailable
    });
  }
  
  return flights;
};

// Function to search return flights
export const searchReturnFlights = async (searchParams: any) => {
  console.log('Searching return flights with params:', searchParams);
  
  const { departureAirport, arrivalAirport, returnDate, flightClass } = searchParams;
  
  // Swap departure and arrival for return flights
  const temp = departureAirport;
  const departureAirportReturn = arrivalAirport;
  const arrivalAirportReturn = temp;
  
  return searchFlights({
    ...searchParams,
    departureAirport: departureAirportReturn,
    arrivalAirport: arrivalAirportReturn,
    departureDate: returnDate,
    flightClass
  });
};

// Function to get air taxi locations
export const getAirTaxiLocations = async () => {
  // For now, we'll continue using mock data until a backend endpoint is created for locations
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockAirTaxiLocations);
    }, 500);
  });
};

// Function to book an air taxi
export const bookAirTaxi = async (bookingDetails: any) => {
  console.log('Booking air taxi with details:', bookingDetails);
  
  try {
    const response = await fetch('http://localhost:3001/airTaxiBooking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingDetails),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to book air taxi');
    }

    const data = await response.json();
    return {
      success: true,
      bookingId: data.booking._id,
      ...data.booking
    };
  } catch (error) {
    console.error('Error booking air taxi:', error);
    throw error;
  }
};

// Function to book a flight
export const bookFlight = async (bookingDetails: any) => {
  console.log('Booking flight with details:', bookingDetails);
  
  // Simulate API call
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        bookingId: 'BK' + Math.floor(Math.random() * 100000),
        ...bookingDetails,
      });
    }, 1500);
  });
};

// Function to process payment
export const processPayment = async (paymentDetails: any) => {
  console.log('Processing payment:', paymentDetails);
  
  try {
    // For now, we'll simulate payment processing
    // In a real application, this would connect to a payment gateway
    return new Promise(resolve => {
      setTimeout(() => {
        // Generate a random transaction ID
        const transactionId = 'TX' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        
        resolve({
          success: true,
          transactionId: transactionId,
          amount: paymentDetails.amount,
          date: new Date().toISOString()
        });
      }, 1500);
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    throw new Error('Payment processing failed');
  }
};

// Function to get flight status
export const getFlightStatus = async (flightNumber: string) => {
  console.log('Getting status for flight:', flightNumber);
  
  // Return consistent results for the same flight number
  return new Promise(resolve => {
    setTimeout(() => {
      // Check if we have the flight in our mocked flight statuses
      if (mockFlightStatuses[flightNumber]) {
        resolve(mockFlightStatuses[flightNumber]);
      } else {
        // Default response with different airline and airport details based on flight number
        // Use the last 3 characters of the flight number to create some variation
        const lastDigits = flightNumber.slice(-3);
        const statusOptions = ['scheduled', 'active', 'delayed', 'landed', 'cancelled'];
        // Generate a deterministic status based on the flight number
        const statusIndex = (
          lastDigits.charCodeAt(0) + 
          (lastDigits.charCodeAt(1) || 0) + 
          (lastDigits.charCodeAt(2) || 0)
        ) % statusOptions.length;
        
        const airlineOptions = ['SkyWings', 'Oceanic Air', 'Global Express', 'Continental Sky', 'AirWave'];
        const airlineIndex = lastDigits.charCodeAt(0) % airlineOptions.length;
        
        // Deterministic random flight details based on flight number
        resolve({
          flightNumber,
          status: statusOptions[statusIndex],
          airline: airlineOptions[airlineIndex],
          departureAirport: {
            name: 'International Airport ' + lastDigits,
            code: 'DEP' + lastDigits.charAt(0),
            city: 'Departure City ' + lastDigits.charAt(1),
            country: 'United States',
            latitude: 35 + (lastDigits.charCodeAt(0) % 15),
            longitude: -95 + (lastDigits.charCodeAt(1) % 30),
          },
          arrivalAirport: {
            name: 'International Airport ' + lastDigits.charAt(2),
            code: 'ARR' + lastDigits.charAt(2),
            city: 'Arrival City ' + lastDigits.charAt(0),
            country: 'United States',
            latitude: 40 + (lastDigits.charCodeAt(2) % 10),
            longitude: -80 - (lastDigits.charCodeAt(0) % 40),
          },
          departureTime: new Date(
            Date.now() + (lastDigits.charCodeAt(0) * 1000 * 60 * 60)
          ).toISOString(),
          arrivalTime: new Date(
            Date.now() + ((lastDigits.charCodeAt(0) + 3) * 1000 * 60 * 60)
          ).toISOString(),
          currentPosition: statusOptions[statusIndex] === 'active' ? {
            latitude: 37.5 + (lastDigits.charCodeAt(1) % 5),
            longitude: -95 + (lastDigits.charCodeAt(2) % 20),
            altitude: 30000 + (lastDigits.charCodeAt(0) * 100),
            speed: 500 + (lastDigits.charCodeAt(1) % 100),
          } : null,
          onTime: (lastDigits.charCodeAt(0) % 2) === 0,
          terminal: 'T' + (1 + (lastDigits.charCodeAt(1) % 4)),
          gate: 'G' + (1 + (lastDigits.charCodeAt(2) % 30)),
        });
      }
    }, 1500);
  });
};

// Function to get user bookings
export const getUserBookings = async (email: string): Promise<any[]> => {
  try {
    // Fetch flight bookings
    const flightResponse = await fetch(`http://localhost:3001/flightBooking/user/${email}`);
    let flightBookings = [];
    if (flightResponse.ok) {
      const flightData = await flightResponse.json();
      const rawFlightBookings = flightData.flightBookings || [];
      
      console.log('Raw flight bookings from API:', JSON.stringify(rawFlightBookings, null, 2));
      
      // Check if a booking has valid flight details
      const isValidBooking = (booking: any): boolean => {
        // Check if outbound flight has all required details
        const hasValidOutbound = booking.outboundFlight && 
          booking.outboundFlight.flightNumber && 
          booking.outboundFlight.departureTime && 
          booking.outboundFlight.arrivalTime;
        
        // For round trips, check if return flight has all required details
        const hasValidReturn = booking.tripType !== "Round Trip" || 
          (booking.returnFlight && 
           booking.returnFlight.flightNumber && 
           booking.returnFlight.departureTime && 
           booking.returnFlight.arrivalTime);
        
        // Check if other essential booking details are present
        const hasEssentialDetails = booking.from && 
          booking.to && 
          booking.departureDate && 
          booking.passengers && 
          booking.totalPrice;
        
        return hasValidOutbound && hasValidReturn && hasEssentialDetails;
      };
      
      // Filter out invalid bookings and format the valid ones
      const validRawBookings = rawFlightBookings.filter(isValidBooking);
      console.log(`Filtered out ${rawFlightBookings.length - validRawBookings.length} invalid bookings`);
      
      // Format flight bookings to ensure all details are preserved
      flightBookings = validRawBookings.map((booking: any) => {
        // Format dates for display
        const formatDate = (dateString: string) => {
          if (!dateString) return null;
          try {
            return new Date(dateString).toISOString().split('T')[0];
          } catch (e) {
            return dateString;
          }
        };
        
        // Log the outbound and return flight details for debugging
        console.log('Processing valid booking:', booking._id);
        
        // Create a properly formatted booking object
        const formattedBooking = {
          ...booking,
          id: booking._id,
          type: 'flight',
          status: booking.status || 'confirmed',
          createdAt: booking.createdAt || new Date().toISOString(),
          
          // Ensure flight details are properly formatted
          outboundFlight: {
            airline: booking.outboundFlight.airline || 'AeroX',
            flightNumber: booking.outboundFlight.flightNumber,
            departureTime: booking.outboundFlight.departureTime,
            arrivalTime: booking.outboundFlight.arrivalTime,
            price: booking.outboundFlight.price || 0
          },
          
          returnFlight: booking.returnFlight ? {
            airline: booking.returnFlight.airline || 'AeroX',
            flightNumber: booking.returnFlight.flightNumber,
            departureTime: booking.returnFlight.departureTime,
            arrivalTime: booking.returnFlight.arrivalTime,
            price: booking.returnFlight.price || 0
          } : null,
          
          // Format other booking details
          from: booking.from,
          to: booking.to,
          departureDate: formatDate(booking.departureDate),
          returnDate: formatDate(booking.returnDate),
          passengers: booking.passengers,
          totalPrice: booking.totalPrice,
          seatSelection: booking.seatSelection || { outbound: [], return: [] },
          passengersDetails: booking.passengersDetails || []
        };
        
        return formattedBooking;
      });
    }
    
    // Fetch air taxi bookings
    const airTaxiResponse = await fetch(`http://localhost:3001/airTaxiBooking/user/${email}`);
    let airTaxiBookings = [];
    if (airTaxiResponse.ok) {
      const airTaxiData = await airTaxiResponse.json();
      airTaxiBookings = airTaxiData.bookings || [];
    }
    
    // Format air taxi bookings to match the expected structure
    const formattedAirTaxiBookings = airTaxiBookings.map((booking: any) => ({
      id: booking._id,
      type: 'air-taxi',
      status: booking.status,
      pickup: booking.pickup.name,
      destination: booking.destination.name,
      date: booking.dateTime,
      passengers: booking.passengers,
      totalPrice: booking.totalAmount,
      createdAt: booking.createdAt,
      taxiModel: booking.taxiModel.name
    }));
    
    // Combine both types of bookings
    return [...flightBookings, ...formattedAirTaxiBookings];
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }
};

// Function to request booking cancellation
export const requestCancellation = async (bookingId: string, reason: string): Promise<any> => {
  try {
    const response = await fetch(`http://localhost:3001/flightBooking/cancel/${bookingId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to request cancellation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error requesting cancellation:', error);
    throw error;
  }
};

// Function to get all cancellation requests (for admin)
export const getCancellationRequests = async () => {
  // In a real application, this would fetch from a database
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {
          id: 'C12345',
          bookingId: 'B12345',
          userId: 'U1000',
          userName: 'John Doe',
          reason: 'Change of plans',
          status: 'pending',
          requestDate: '2023-07-18T09:30:00',
        },
        {
          id: 'C12346',
          bookingId: 'B12347',
          userId: 'U1001',
          userName: 'Jane Smith',
          reason: 'Found better price',
          status: 'approved',
          requestDate: '2023-07-17T14:45:00',
        },
      ]);
    }, 1000);
  });
};

// Function to approve or reject cancellation
export const processCancellation = async (cancellationId: string, approve: boolean) => {
  console.log(`${approve ? 'Approving' : 'Rejecting'} cancellation:`, cancellationId);
  
  // Simulate API call
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Cancellation request ${approve ? 'approved' : 'rejected'} successfully`,
      });
    }, 1000);
  });
};

// Function to get user requests

// Fetch requests by userId (legacy)
export const getUserRequests = async (userId: string): Promise<any[]> => {
  try {
    const response = await fetch(`http://localhost:3001/requests/user/${userId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return getMockRequests(userId);
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user requests');
    }
    const result = await response.json();
    const requests = result.requests || [];
    if (requests.length === 0) {
      return getMockRequests(userId);
    }
    return requests;
  } catch (error) {
    console.error('Error fetching user requests:', error);
    return getMockRequests(userId);
  }
};

// Fetch requests by userEmail (new, preferred)
export const getUserRequestsByEmail = async (email: string): Promise<any[]> => {
  try {
    const response = await fetch(`http://localhost:3001/requests/user/email/${email}`);
    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user requests by email');
    }
    const result = await response.json();
    return result.requests || [];
  } catch (error) {
    console.error('Error fetching user requests by email:', error);
    return [];
  }
};

// Helper function to generate mock request data
const getMockRequests = (userId: string): any[] => {
  const currentDate = new Date();
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  const lastWeek = new Date(currentDate);
  lastWeek.setDate(currentDate.getDate() - 7);
  
  return [
    {
      id: 'REQ-1001',
      userId: userId,
      userEmail: 'user@example.com',
      userName: 'Rushu Devinda',
      bookingId: 'ATX-1023',
      bookingType: 'airtaxi',
      requestType: 'cancellation',
      reason: 'Change of plans',
      details: 'Need to cancel due to unexpected schedule change',
      status: 'approved',
      requestDate: lastWeek.toISOString(),
      responseDate: yesterday.toISOString(),
      adminNotes: 'Your request has been approved. A refund will be processed within 3 working days.',
      refundAmount: 250.00
    },
    {
      id: 'REQ-1002',
      userId: userId,
      userEmail: 'user@example.com',
      userName: 'Rushu Devinda',
      bookingId: 'FL-2045',
      bookingType: 'flight',
      requestType: 'modification',
      reason: 'Change date/time',
      details: 'Need to reschedule to next week due to work commitments',
      status: 'pending',
      requestDate: yesterday.toISOString(),
      responseDate: null,
      adminNotes: null
    },
    {
      id: 'REQ-1003',
      userId: userId,
      userEmail: 'user@example.com',
      userName: 'Rushu Devinda',
      bookingId: 'FL-1987',
      bookingType: 'flight',
      requestType: 'cancellation',
      reason: 'Emergency',
      details: 'Family emergency requires cancellation',
      status: 'rejected',
      requestDate: lastWeek.toISOString(),
      responseDate: yesterday.toISOString(),
      adminNotes: 'Unfortunately, this booking is non-refundable as per our policy. Please contact customer support for assistance.',
      refundAmount: 0
    }
  ];
};

// Function to get all requests for admin
export const getAllRequests = async (): Promise<any[]> => {
  try {
    const response = await fetch('http://localhost:3001/requests');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch requests');
    }

    const result = await response.json();
    return result.requests || [];
  } catch (error) {
    console.error('Error fetching requests:', error);
    return [];
  }
};

// Function to get booking by ID
export const getBookingById = async (bookingId: string) => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const response = await fetch(`http://localhost:3001/flightBooking/${bookingId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch booking details');
    }
    
    const data = await response.json();
    
    // The backend returns the data in this format: { flightbooking: {...} }
    if (!data || !data.flightbooking) {
      throw new Error('Invalid booking response from server');
    }

    // Return the flightbooking object directly
    return data.flightbooking;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

// Function to modify a booking
export const modifyBooking = async (bookingId: string, bookingData: any) => {
  try {
    // Format dates to yyyy-MM-dd format and ensure status is set to 'modified'
    const formattedData = {
      ...bookingData,
      departureDate: new Date(bookingData.departureDate).toISOString().split('T')[0],
      returnDate: bookingData.returnDate ? new Date(bookingData.returnDate).toISOString().split('T')[0] : null,
      modifiedAt: new Date().toISOString().split('T')[0],
      status: 'modified' // Explicitly set status to 'modified'
    };

    console.log('Sending formatted data to API:', formattedData);

    const response = await fetch(`http://localhost:3001/flightBooking/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to modify booking';
      try {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    if (!data || !data.flightbooking) {
      throw new Error('Invalid booking response from server');
    }

    return data.flightbooking;
  } catch (error) {
    console.error('Error modifying booking:', error);
    throw error;
  }
};

// Function to modify an air taxi booking
export const modifyAirTaxiBooking = async (bookingId: string, bookingData: any) => {
  try {
    // Format dates properly
    const formattedData = {
      ...bookingData,
      modifiedAt: new Date().toISOString(),
    };

    console.log('Sending formatted air taxi data to API:', formattedData);

    const response = await fetch(`http://localhost:3001/airTaxiBooking/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to modify air taxi booking';
      try {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    if (!data || !data.booking) {
      throw new Error('Invalid booking response from server');
    }

    return data.booking;
  } catch (error) {
    console.error('Error modifying air taxi booking:', error);
    throw error;
  }
};

// Function to cancel a booking
export const cancelBooking = async (bookingId: string, reason: string) => {
  try {
    const response = await fetch(`http://localhost:3001/flightBooking/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel booking');
      } catch {
        throw new Error('Failed to cancel booking');
      }
    }
    
    const data = await response.json();
    
    if (!data || !data.flightbooking) {
      throw new Error('Invalid booking response from server');
    }

    return data.flightbooking;
  } catch (error) {
    console.error('Error canceling booking:', error);
    throw error;
  }
};

// Function to get user air taxi bookings
export const getUserAirTaxiBookings = async (email: string): Promise<any[]> => {
  // Special admin mode: fetch all if email is 'all'
  if (email === 'all') {
    try {
      const response = await fetch(`http://localhost:3001/airTaxiBooking/admin/all`);
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch air taxi bookings');
      }
      const result = await response.json();
      return result.bookings || [];
    } catch (error) {
      console.error('Error fetching all air taxi bookings:', error);
      return [];
    }
  }
  // Normal user bookings
  try {
    const response = await fetch(`http://localhost:3001/airTaxiBooking/user/${email}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // No bookings found is not an error, just return empty array
        return [];
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch air taxi bookings');
    }

    const result = await response.json();
    return result.bookings || [];
  } catch (error) {
    console.error('Error fetching air taxi bookings:', error);
    return [];
  }
};

// Function to cancel an air taxi booking
export const cancelAirTaxiBooking = async (bookingId: string, reason: string): Promise<any> => {
  try {
    const response = await fetch(`http://localhost:3001/airTaxiBooking/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel air taxi booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling air taxi booking:', error);
    throw error;
  }
};

// Function to create a new request (modification or cancellation)
export const createRequest = async (requestData: {
  userId: string;
  userEmail: string;
  userName: string;
  bookingId: string;
  bookingType: 'flight' | 'airtaxi';
  requestType: 'modification' | 'cancellation';
  reason: string;
  details: string;
  requestDate: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/requests`, requestData, {
      // TODO: Add Asgardeo access token header if needed
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Function to get all requests (admin)
export const getAllRequestsAdmin = async (): Promise<any[]> => {
  try {
    const response = await axios.get<{requests: any[]}>(`${API_URL}/requests`, {
      // TODO: Add Asgardeo access token header if needed
    });
    return response.data.requests || [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// Function to get user requests
export const getUserRequestsAdmin = async (userId: string): Promise<any[]> => {
  try {
    const response = await axios.get<{requests: any[]}>(`${API_URL}/requests/user/${userId}`, {
      // TODO: Add Asgardeo access token header if needed
    });
    return response.data.requests || [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// Function to update request status (admin)
export const updateRequestStatus = async (
  requestId: string, 
  status: 'approved' | 'rejected', 
  adminNotes?: string
): Promise<any> => {
  try {
    const response = await axios.patch(`${API_URL}/requests/${requestId}`, {
      status,
      adminNotes
    }, {
      // TODO: Add Asgardeo access token header if needed
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Function to create a notification when admin responds to a request
export const createNotification = async (requestData: any, status: 'approved' | 'rejected', adminNotes: string): Promise<any> => {
  try {
    // In a real application, this would be an API call to create a notification in the database
    // For demo purposes, we'll just log it and return a mock response
    console.log(`Notification created for user ${requestData.userId} regarding ${requestData.requestType} request ${status}`);
    
    // The notification object that would be stored in the database
    const notification = {
      id: `notif-${Date.now()}`,
      userId: requestData.userId,
      bookingId: requestData.bookingId,
      requestType: requestData.requestType,
      title: `${requestData.requestType.charAt(0).toUpperCase() + requestData.requestType.slice(1)} Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      status: status,
      adminNote: adminNotes || `Your ${requestData.requestType} request has been ${status}. ${status === 'approved' ? 'A refund will be processed within 3 working days.' : 'Please contact customer support for more information.'}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    
    return notification;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Function to get user notifications
export const getUserNotifications = async (userId: string): Promise<any[]> => {
  try {
    // In a real application, this would be an API call to fetch notifications
    // For demo purposes, we'll create mock notifications based on the user's requests
    const requests = await getUserRequestsAdmin(userId);
    
    // Convert requests to notifications
    const notifications = requests
      .filter(req => req.status === 'approved' || req.status === 'rejected')
      .map(req => ({
        id: `notif-${req.id}`,
        userId: req.userId,
        bookingId: req.bookingId,
        requestType: req.requestType,
        title: `${req.requestType.charAt(0).toUpperCase() + req.requestType.slice(1)} Request ${req.status.charAt(0).toUpperCase() + req.status.slice(1)}`,
        status: req.status,
        adminNote: req.adminNotes || `Your ${req.requestType} request has been ${req.status}. ${req.status === 'approved' ? 'A refund will be processed within 3 working days.' : 'Please contact customer support for more information.'}`,
        createdAt: req.responseDate || new Date().toISOString(),
        read: false
      }));
      
    return notifications;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};
