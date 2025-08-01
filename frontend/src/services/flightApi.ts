
// Real-time flight tracking API integration

// Replace this with your actual API key
const AVIATION_STACK_API_KEY = 'a9d2ceab8df6750979282fd101256954';
const API_BASE_URL = 'http://api.aviationstack.com/v1';

export interface FlightPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
}

export interface Airport {
  name: string;
  code: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface FlightData {
  flightNumber: string;
  status: string;
  airline: string;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureTime: string;
  arrivalTime: string;
  currentPosition?: FlightPosition;
  onTime: boolean;
  terminal: string;
  gate: string;
  aircraft?: string;
  scheduledDepartureTime: string;
  scheduledArrivalTime: string;
  actualDepartureTime?: string;
  actualArrivalTime?: string;
}

// Cache for flight data to ensure consistent results for the same flight number
const flightDataCache: Record<string, FlightData> = {};

export const getFlightData = async (flightNumber: string): Promise<FlightData> => {
  // Clean up flight number format - remove spaces and standardize
  const cleanFlightNumber = flightNumber.replace(/\s+/g, '').toUpperCase();
  
  // If we already have this flight in cache, return it
  if (flightDataCache[cleanFlightNumber]) {
    return flightDataCache[cleanFlightNumber];
  }
  
  try {
    // In a production app, this would be a real API call
    // For demo purposes, we'll simulate the API call using our mock data with the new schema
    const response = await simulateApiCall(cleanFlightNumber);
    
    // Cache the result for consistent responses
    flightDataCache[cleanFlightNumber] = response;
    return response;
  } catch (error) {
    console.error('Error fetching flight data:', error);
    throw new Error('Failed to fetch flight data');
  }
};

// Flight data mock for search - includes many flight options
const mockFlights = [
  // NY to London
  {
    id: 'JFK-LHR-001',
    airline: 'British Airways',
    flightNumber: 'BA112',
    departureAirport: 'JFK',
    departureCity: 'New York',
    departureTerminal: 'T7',
    departureGate: 'G22',
    arrivalAirport: 'LHR',
    arrivalCity: 'London',
    arrivalTerminal: 'T5',
    arrivalGate: 'G45',
    departureTime: addHoursToNow(10),
    arrivalTime: addHoursToNow(22),
    duration: '7h 30m',
    price: 650,
    status: 'scheduled',
    aircraft: 'Boeing 777-300ER',
    class: 'economy',
    seatsAvailable: 23
  },
  {
    id: 'JFK-LHR-002',
    airline: 'Delta Air Lines',
    flightNumber: 'DL302',
    departureAirport: 'JFK',
    departureCity: 'New York',
    departureTerminal: 'T4',
    departureGate: 'G31',
    arrivalAirport: 'LHR',
    arrivalCity: 'London',
    arrivalTerminal: 'T3',
    arrivalGate: 'G28',
    departureTime: addHoursToNow(15),
    arrivalTime: addHoursToNow(27),
    duration: '7h 15m',
    price: 610,
    status: 'scheduled',
    aircraft: 'Airbus A330-300',
    class: 'economy',
    seatsAvailable: 18
  },
  {
    id: 'JFK-LHR-003',
    airline: 'American Airlines',
    flightNumber: 'AA100',
    departureAirport: 'JFK',
    departureCity: 'New York',
    departureTerminal: 'T8',
    departureGate: 'G12',
    arrivalAirport: 'LHR',
    arrivalCity: 'London',
    arrivalTerminal: 'T3',
    arrivalGate: 'G33',
    departureTime: addHoursToNow(13),
    arrivalTime: addHoursToNow(25),
    duration: '7h 20m',
    price: 630,
    status: 'scheduled',
    aircraft: 'Boeing 777-200',
    class: 'premium',
    seatsAvailable: 12
  },
  {
    id: 'JFK-LHR-004',
    airline: 'Virgin Atlantic',
    flightNumber: 'VS26',
    departureAirport: 'JFK',
    departureCity: 'New York',
    departureTerminal: 'T4',
    departureGate: 'G17',
    arrivalAirport: 'LHR',
    arrivalCity: 'London',
    arrivalTerminal: 'T3',
    arrivalGate: 'G10',
    departureTime: addHoursToNow(20),
    arrivalTime: addHoursToNow(32),
    duration: '7h 10m',
    price: 685,
    status: 'scheduled',
    aircraft: 'Airbus A350-1000',
    class: 'business',
    seatsAvailable: 8
  },
  
  // LA to Chicago
  {
    id: 'LAX-ORD-001',
    airline: 'United Airlines',
    flightNumber: 'UA412',
    departureAirport: 'LAX',
    departureCity: 'Los Angeles',
    departureTerminal: 'T7',
    departureGate: 'G73',
    arrivalAirport: 'ORD',
    arrivalCity: 'Chicago',
    arrivalTerminal: 'T1',
    arrivalGate: 'G28',
    departureTime: addHoursToNow(5),
    arrivalTime: addHoursToNow(9),
    duration: '4h 05m',
    price: 320,
    status: 'scheduled',
    aircraft: 'Boeing 737-900',
    class: 'economy',
    seatsAvailable: 32
  },
  {
    id: 'LAX-ORD-002',
    airline: 'American Airlines',
    flightNumber: 'AA600',
    departureAirport: 'LAX',
    departureCity: 'Los Angeles',
    departureTerminal: 'T5',
    departureGate: 'G54',
    arrivalAirport: 'ORD',
    arrivalCity: 'Chicago', 
    arrivalTerminal: 'T3',
    arrivalGate: 'G12',
    departureTime: addHoursToNow(8),
    arrivalTime: addHoursToNow(12),
    duration: '4h 10m',
    price: 310,
    status: 'scheduled',
    aircraft: 'Boeing 787-9',
    class: 'premium',
    seatsAvailable: 14
  },
  
  // SF to Seattle
  {
    id: 'SFO-SEA-001',
    airline: 'Alaska Airlines',
    flightNumber: 'AS1242',
    departureAirport: 'SFO',
    departureCity: 'San Francisco',
    departureTerminal: 'T2',
    departureGate: 'G32',
    arrivalAirport: 'SEA',
    arrivalCity: 'Seattle',
    arrivalTerminal: 'N',
    arrivalGate: 'G8',
    departureTime: addHoursToNow(3),
    arrivalTime: addHoursToNow(5),
    duration: '2h 10m',
    price: 210,
    status: 'scheduled',
    aircraft: 'Boeing 737-800',
    class: 'economy',
    seatsAvailable: 28
  },
  {
    id: 'SFO-SEA-002',
    airline: 'Delta Air Lines',
    flightNumber: 'DL780',
    departureAirport: 'SFO',
    departureCity: 'San Francisco',
    departureTerminal: 'T1',
    departureGate: 'G42',
    arrivalAirport: 'SEA',
    arrivalCity: 'Seattle',
    arrivalTerminal: 'S',
    arrivalGate: 'G16',
    departureTime: addHoursToNow(6),
    arrivalTime: addHoursToNow(8),
    duration: '2h 15m',
    price: 225,
    status: 'scheduled',
    aircraft: 'Airbus A320',
    class: 'first',
    seatsAvailable: 6
  },
  
  // Dubai to Singapore
  {
    id: 'DXB-SIN-001',
    airline: 'Emirates',
    flightNumber: 'EK404',
    departureAirport: 'DXB',
    departureCity: 'Dubai',
    departureTerminal: 'T3',
    departureGate: 'G15',
    arrivalAirport: 'SIN',
    arrivalCity: 'Singapore',
    arrivalTerminal: 'T3',
    arrivalGate: 'G63',
    departureTime: addHoursToNow(14),
    arrivalTime: addHoursToNow(21),
    duration: '7h 40m',
    price: 780,
    status: 'scheduled',
    aircraft: 'Airbus A380-800',
    class: 'economy',
    seatsAvailable: 56
  },
  {
    id: 'DXB-SIN-002',
    airline: 'Singapore Airlines',
    flightNumber: 'SQ495',
    departureAirport: 'DXB',
    departureCity: 'Dubai',
    departureTerminal: 'T1',
    departureGate: 'G9',
    arrivalAirport: 'SIN',
    arrivalCity: 'Singapore',
    arrivalTerminal: 'T3',
    arrivalGate: 'G58',
    departureTime: addHoursToNow(16),
    arrivalTime: addHoursToNow(28),
    duration: '7h 30m',
    price: 820,
    status: 'scheduled',
    aircraft: 'Boeing 777-300ER',
    class: 'business',
    seatsAvailable: 12
  },
  
  // Paris to Rome
  {
    id: 'CDG-FCO-001',
    airline: 'Air France',
    flightNumber: 'AF1204',
    departureAirport: 'CDG',
    departureCity: 'Paris',
    departureTerminal: 'T2E',
    departureGate: 'G26',
    arrivalAirport: 'FCO',
    arrivalCity: 'Rome',
    arrivalTerminal: 'T1',
    arrivalGate: 'G11',
    departureTime: addHoursToNow(4),
    arrivalTime: addHoursToNow(6),
    duration: '2h 05m',
    price: 210,
    status: 'scheduled',
    aircraft: 'Airbus A320neo',
    class: 'economy',
    seatsAvailable: 32
  },
  {
    id: 'CDG-FCO-002',
    airline: 'ITA Airways',
    flightNumber: 'AZ335',
    departureAirport: 'CDG',
    departureCity: 'Paris',
    departureTerminal: 'T1',
    departureGate: 'G16',
    arrivalAirport: 'FCO',
    arrivalCity: 'Rome',
    arrivalTerminal: 'T1',
    arrivalGate: 'G05',
    departureTime: addHoursToNow(9),
    arrivalTime: addHoursToNow(11),
    duration: '2h 10m',
    price: 195,
    status: 'scheduled',
    aircraft: 'Airbus A319',
    class: 'first',
    seatsAvailable: 4
  },
  
  // Additional flights across different classes
  {
    id: 'MIA-ORD-001',
    airline: 'American Airlines',
    flightNumber: 'AA771',
    departureAirport: 'MIA',
    departureCity: 'Miami',
    departureTerminal: 'N',
    departureGate: 'D47',
    arrivalAirport: 'ORD',
    arrivalCity: 'Chicago',
    arrivalTerminal: 'T3',
    arrivalGate: 'G14',
    departureTime: addHoursToNow(7),
    arrivalTime: addHoursToNow(10),
    duration: '3h 15m',
    price: 285,
    status: 'scheduled',
    aircraft: 'Boeing 737-800',
    class: 'economy',
    seatsAvailable: 24
  },
  {
    id: 'LHR-JFK-001',
    airline: 'British Airways',
    flightNumber: 'BA175',
    departureAirport: 'LHR',
    departureCity: 'London',
    departureTerminal: 'T5',
    departureGate: 'G23',
    arrivalAirport: 'JFK',
    arrivalCity: 'New York',
    arrivalTerminal: 'T7',
    arrivalGate: 'G5',
    departureTime: addHoursToNow(11),
    arrivalTime: addHoursToNow(19),
    duration: '8h 05m',
    price: 690,
    status: 'scheduled',
    aircraft: 'Boeing 777-300ER',
    class: 'business',
    seatsAvailable: 10
  },
  {
    id: 'SFO-LAX-001',
    airline: 'United Airlines',
    flightNumber: 'UA580',
    departureAirport: 'SFO',
    departureCity: 'San Francisco',
    departureTerminal: 'T3',
    departureGate: 'G78',
    arrivalAirport: 'LAX',
    arrivalCity: 'Los Angeles',
    arrivalTerminal: 'T7',
    arrivalGate: 'G73B',
    departureTime: addHoursToNow(2),
    arrivalTime: addHoursToNow(3),
    duration: '1h 25m',
    price: 140,
    status: 'scheduled',
    aircraft: 'Airbus A320',
    class: 'economy',
    seatsAvailable: 36
  },
  {
    id: 'CDG-LHR-001',
    airline: 'British Airways',
    flightNumber: 'BA309',
    departureAirport: 'CDG',
    departureCity: 'Paris',
    departureTerminal: 'T2A',
    departureGate: 'G32',
    arrivalAirport: 'LHR',
    arrivalCity: 'London',
    arrivalTerminal: 'T5',
    arrivalGate: 'G24',
    departureTime: addHoursToNow(5),
    arrivalTime: addHoursToNow(6),
    duration: '1h 15m',
    price: 180,
    status: 'scheduled',
    aircraft: 'Airbus A320neo',
    class: 'premium',
    seatsAvailable: 16
  },
  {
    id: 'ORD-JFK-001',
    airline: 'Delta Air Lines',
    flightNumber: 'DL476',
    departureAirport: 'ORD',
    departureCity: 'Chicago',
    departureTerminal: 'T2',
    departureGate: 'G36',
    arrivalAirport: 'JFK',
    arrivalCity: 'New York',
    arrivalTerminal: 'T4',
    arrivalGate: 'G38',
    departureTime: addHoursToNow(3),
    arrivalTime: addHoursToNow(5),
    duration: '2h 15m',
    price: 220,
    status: 'scheduled',
    aircraft: 'Boeing 737-900',
    class: 'first',
    seatsAvailable: 8
  },
  {
    id: 'SIN-NRT-001',
    airline: 'Singapore Airlines',
    flightNumber: 'SQ638',
    departureAirport: 'SIN',
    departureCity: 'Singapore',
    departureTerminal: 'T3',
    departureGate: 'G54',
    arrivalAirport: 'NRT',
    arrivalCity: 'Tokyo',
    arrivalTerminal: 'T1',
    arrivalGate: 'G42',
    departureTime: addHoursToNow(12),
    arrivalTime: addHoursToNow(19),
    duration: '7h 10m',
    price: 740,
    status: 'scheduled',
    aircraft: 'Airbus A350-900',
    class: 'business',
    seatsAvailable: 14
  },
  {
    id: 'JFK-SFO-001',
    airline: 'United Airlines',
    flightNumber: 'UA685',
    departureAirport: 'JFK',
    departureCity: 'New York',
    departureTerminal: 'T7',
    departureGate: 'G2',
    arrivalAirport: 'SFO',
    arrivalCity: 'San Francisco',
    arrivalTerminal: 'T3',
    arrivalGate: 'G72',
    departureTime: addHoursToNow(8),
    arrivalTime: addHoursToNow(14),
    duration: '6h 30m',
    price: 380,
    status: 'scheduled',
    aircraft: 'Boeing 787-9',
    class: 'economy',
    seatsAvailable: 42
  },
  {
    id: 'LHR-CDG-001',
    airline: 'Air France',
    flightNumber: 'AF1681',
    departureAirport: 'LHR',
    departureCity: 'London',
    departureTerminal: 'T2B',
    departureGate: 'G41',
    arrivalAirport: 'CDG',
    arrivalCity: 'Paris',
    arrivalTerminal: 'T2E',
    arrivalGate: 'G21',
    departureTime: addHoursToNow(4),
    arrivalTime: addHoursToNow(6),
    duration: '1h 20m',
    price: 165,
    status: 'scheduled',
    aircraft: 'Airbus A320',
    class: 'economy',
    seatsAvailable: 28
  }
];

// Helper function to add hours to current date
function addHoursToNow(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

// Function to search flights based on parameters
export const searchFlights = async (params: any): Promise<any[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Filter flights based on search parameters
  let results = mockFlights.filter(flight => {
    // Check departure and arrival airports
    const matchesRoute = flight.departureAirport === params.departureAirport && 
                          flight.arrivalAirport === params.arrivalAirport;
    
    // Check if the class matches (if specified)
    const matchesClass = params.flightClass ? flight.class === params.flightClass.toLowerCase() : true;
    
    // Ensure enough seats are available
    const hasEnoughSeats = flight.seatsAvailable >= params.passengers;
    
    return matchesRoute && matchesClass && hasEnoughSeats;
  });
  
  // Sort by departure time
  results.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
  
  return results;
};

// Function to search return flights
export const searchReturnFlights = async (params: any): Promise<any[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Filter flights based on search parameters
  let results = mockFlights.filter(flight => {
    // For return flights, swap departure and arrival
    const matchesRoute = flight.departureAirport === params.arrivalAirport && 
                          flight.arrivalAirport === params.departureAirport;
    
    // Check if the class matches (if specified)
    const matchesClass = params.flightClass ? flight.class === params.flightClass.toLowerCase() : true;
    
    // Ensure enough seats are available
    const hasEnoughSeats = flight.seatsAvailable >= params.passengers;
    
    return matchesRoute && matchesClass && hasEnoughSeats;
  });
  
  // Sort by departure time
  results.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
  
  return results;
};

// This function simulates an API call with consistent responses
const simulateApiCall = async (flightNumber: string): Promise<FlightData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a deterministic status based on the flight number
  const flightNumHash = hashCode(flightNumber);
  const statusOptions = ['scheduled', 'active', 'delayed', 'landed', 'cancelled'];
  const statusIndex = Math.abs(flightNumHash) % statusOptions.length;
  const status = statusOptions[statusIndex];
  
  // Generate airline name from flight number prefix
  let airline = '';
  // Extract airline code from flight number (usually the letters at the beginning)
  const airlineCode = flightNumber.match(/[A-Z]+/i)?.[0] || '';
  
  // Map common airline codes to names
  switch(airlineCode.toUpperCase()) {
    case 'UA': airline = 'United Airlines'; break;
    case 'AA': airline = 'American Airlines'; break;
    case 'DL': airline = 'Delta Air Lines'; break;
    case 'LH': airline = 'Lufthansa'; break;
    case 'BA': airline = 'British Airways'; break;
    case 'AF': airline = 'Air France'; break;
    case 'KL': airline = 'KLM Royal Dutch Airlines'; break;
    case 'EK': airline = 'Emirates'; break;
    case 'SQ': airline = 'Singapore Airlines'; break;
    case 'QF': airline = 'Qantas'; break;
    case 'UN': airline = 'SkyLine Airways'; break;
    case 'JSA': airline = 'SkyLine Airways'; break;
    default: airline = airlineCode ? `${airlineCode} Airlines` : 'Global Airways';
  }
  
  // Special case for JSA333 from the image
  if (flightNumber === 'JSA333') {
    const nowDate = new Date();
    const departureTime = new Date(nowDate);
    departureTime.setHours(8, 0, 0);
    
    const arrivalTime = new Date(nowDate);
    arrivalTime.setHours(20, 0, 0);
    
    const actualDepartureTime = new Date(nowDate);
    actualDepartureTime.setHours(8, 15, 0);
    
    return {
      flightNumber: 'JSA333',
      status: 'active',
      airline: 'SkyLine Airways',
      departureAirport: {
        name: 'John F. Kennedy International Airport',
        code: 'JFK',
        city: 'New York',
        country: 'United States',
        latitude: 40.6413,
        longitude: -73.7781
      },
      arrivalAirport: {
        name: 'London Heathrow Airport',
        code: 'LHR',
        city: 'London',
        country: 'United Kingdom',
        latitude: 51.4694,
        longitude: -0.4502
      },
      departureTime: departureTime.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
      currentPosition: {
        latitude: 51.5074,
        longitude: -0.1278,
        altitude: 35000,
        speed: 550
      },
      onTime: false,
      terminal: 'T4',
      gate: 'G22',
      aircraft: 'Boeing 777-300ER',
      scheduledDepartureTime: departureTime.toISOString(),
      scheduledArrivalTime: arrivalTime.toISOString(),
      actualDepartureTime: actualDepartureTime.toISOString(),
      actualArrivalTime: undefined
    };
  }
  
  // Generate departure and arrival airports based on flight number
  const airportPairs = [
    { dep: { code: 'JFK', city: 'New York', country: 'United States', name: 'John F. Kennedy International Airport', lat: 40.6413, lng: -73.7781 }, 
      arr: { code: 'LHR', city: 'London', country: 'United Kingdom', name: 'London Heathrow Airport', lat: 51.4694, lng: -0.4502 } },
    { dep: { code: 'LAX', city: 'Los Angeles', country: 'United States', name: 'Los Angeles International Airport', lat: 33.9416, lng: -118.4085 }, 
      arr: { code: 'ORD', city: 'Chicago', country: 'United States', name: 'O\'Hare International Airport', lat: 41.9742, lng: -87.9073 } },
    { dep: { code: 'SFO', city: 'San Francisco', country: 'United States', name: 'San Francisco International Airport', lat: 37.6213, lng: -122.3790 }, 
      arr: { code: 'SEA', city: 'Seattle', country: 'United States', name: 'Seattle-Tacoma International Airport', lat: 47.4502, lng: -122.3088 } },
    { dep: { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', name: 'Dubai International Airport', lat: 25.2532, lng: 55.3657 }, 
      arr: { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Singapore Changi Airport', lat: 1.3644, lng: 103.9915 } },
    { dep: { code: 'CDG', city: 'Paris', country: 'France', name: 'Charles de Gaulle Airport', lat: 49.0097, lng: 2.5479 }, 
      arr: { code: 'FCO', city: 'Rome', country: 'Italy', name: 'Leonardo da Vinci International Airport', lat: 41.8003, lng: 12.2389 } },
  ];
  
  const airportPairIndex = Math.abs(flightNumHash) % airportPairs.length;
  const { dep, arr } = airportPairs[airportPairIndex];
  
  // Generate dates (make sure scheduled dates are in the future)
  const now = new Date();
  const scheduledDeparture = new Date(now.getTime() + (Math.abs(flightNumHash % 48) * 60 * 60 * 1000));
  const flightDuration = 2 + (Math.abs(flightNumHash) % 10); // Flight duration in hours
  const scheduledArrival = new Date(scheduledDeparture.getTime() + (flightDuration * 60 * 60 * 1000));
  
  // For active flights, calculate position between departure and arrival
  let currentPosition = null;
  let actualDeparture = null;
  let actualArrival = null;
  
  if (status === 'active') {
    // Flight has departed but not arrived
    actualDeparture = new Date(scheduledDeparture.getTime() - (30 * 60 * 1000)).toISOString(); // 30 minutes before scheduled
    
    // Calculate position as a percentage between departure and arrival
    const totalDistance = calculateDistance(dep.lat, dep.lng, arr.lat, arr.lng);
    const percentComplete = 0.3 + (Math.abs(flightNumHash) % 50) / 100; // 30-80% complete
    
    // Interpolate position
    currentPosition = {
      latitude: dep.lat + (arr.lat - dep.lat) * percentComplete,
      longitude: dep.lng + (arr.lng - dep.lng) * percentComplete,
      altitude: 30000 + (Math.abs(flightNumHash) % 10000),
      speed: 400 + (Math.abs(flightNumHash) % 200)
    };
  } else if (status === 'landed') {
    // Flight has arrived
    actualDeparture = new Date(scheduledDeparture.getTime() - (15 * 60 * 1000)).toISOString(); // 15 minutes before scheduled
    actualArrival = new Date(scheduledArrival.getTime() - (10 * 60 * 1000)).toISOString(); // 10 minutes before scheduled
    
    // Position is at arrival airport
    currentPosition = {
      latitude: arr.lat,
      longitude: arr.lng,
      altitude: 0,
      speed: 0
    };
  } else if (status === 'delayed') {
    // Flight is delayed, adjust departure time
    scheduledDeparture.setHours(scheduledDeparture.getHours() + 1); // 1 hour delay
    scheduledArrival.setHours(scheduledArrival.getHours() + 1); // 1 hour delay on arrival too
  }
  
  // Terminal and gate
  const terminal = `T${1 + Math.abs(flightNumHash) % 5}`;
  const gate = `G${10 + Math.abs(flightNumHash) % 40}`;
  
  // Build the full response
  return {
    flightNumber,
    status,
    airline,
    departureAirport: {
      name: dep.name,
      code: dep.code,
      city: dep.city,
      country: dep.country,
      latitude: dep.lat,
      longitude: dep.lng
    },
    arrivalAirport: {
      name: arr.name,
      code: arr.code,
      city: arr.city,
      country: arr.country,
      latitude: arr.lat,
      longitude: arr.lng
    },
    departureTime: scheduledDeparture.toISOString(),
    arrivalTime: scheduledArrival.toISOString(),
    currentPosition: currentPosition || undefined,
    onTime: (Math.abs(flightNumHash) % 3) !== 0, // 2/3 chance of being on time
    terminal,
    gate,
    aircraft: getAircraftType(flightNumHash),
    scheduledDepartureTime: scheduledDeparture.toISOString(),
    scheduledArrivalTime: scheduledArrival.toISOString(),
    actualDepartureTime: actualDeparture,
    actualArrivalTime: actualArrival
  };
};

// Helper function to generate a hash code from a string
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

// Helper function to calculate distance between two coordinates (simplified)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// Helper to generate aircraft type based on flight number
function getAircraftType(hash: number): string {
  const aircraftTypes = [
    'Boeing 737-800',
    'Boeing 787-9',
    'Airbus A320',
    'Airbus A350-900',
    'Boeing 777-300ER',
    'Airbus A330-300',
    'Boeing 767-300',
    'Airbus A321neo',
    'Boeing 747-8',
    'Embraer E190'
  ];
  
  return aircraftTypes[Math.abs(hash) % aircraftTypes.length];
}
