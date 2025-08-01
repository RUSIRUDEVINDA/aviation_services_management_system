// API service for handling flight booking operations
import { getCurrentUser, getToken } from './auth';

const API_BASE_URL = 'http://localhost:3001'; // Adjust this to match your backend URL

// Interface for flight booking data structure
export interface FlightBooking {
  _id?: string;
  id?: string;
  tripType: string;
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string | null;
  passengers: number;
  flightcabin: string;
  outboundFlight: {
    airline: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
  };
  returnFlight?: {
    airline: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
  } | null;
  passengersDetails: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber: string;
    specialRequests?: string;
  }>;
  contactInfo: {
    email: string;
    phoneNumber: string;
  };
  seatSelection: {
    outbound: string[];
    return: string[];
  };
  totalPrice: number;
  status?: string;
  createdAt?: string;
  modifiedAt?: string; // Added for tracking modification date
  type?: 'flight' | 'air-taxi';
  alreadyModified?: boolean; // Added to track if booking has been modified
}

/**
 * Create a new flight booking
 * @param bookingData The flight booking data
 * @returns The created booking
 */
export const createBooking = async (bookingData: any): Promise<FlightBooking> => {
  try {
    if (!bookingData || !bookingData.flights || !bookingData.flights.departure) {
      throw new Error('Invalid booking data format');
    }

    // Format the booking data to match the backend model
    const formattedData: FlightBooking = {
      tripType: bookingData.flights.return ? 'Round Trip' : 'One Way',
      from: bookingData.flights.departure.departureCity,
      to: bookingData.flights.departure.arrivalCity,
      departureDate: new Date(bookingData.flights.departure.departureTime).toISOString(),
      returnDate: bookingData.flights.return 
        ? new Date(bookingData.flights.return.departureTime).toISOString() 
        : null,
      passengers: bookingData.passengers?.length || 0,
      flightcabin: bookingData.flights.departure.class || 'Economy',
      outboundFlight: {
        airline: bookingData.flights.departure.airline,
        flightNumber: bookingData.flights.departure.id,
        departureTime: new Date(bookingData.flights.departure.departureTime).toLocaleTimeString(),
        arrivalTime: new Date(bookingData.flights.departure.arrivalTime).toLocaleTimeString(),
        price: bookingData.flights.departure.price
      },
      returnFlight: bookingData.flights.return ? {
        airline: bookingData.flights.return.airline,
        flightNumber: bookingData.flights.return.id,
        departureTime: new Date(bookingData.flights.return.departureTime).toLocaleTimeString(),
        arrivalTime: new Date(bookingData.flights.return.arrivalTime).toLocaleTimeString(),
        price: bookingData.flights.return.price
      } : null,
      passengersDetails: bookingData.passengers?.map((passenger: any) => ({
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        dateOfBirth: passenger.dob 
          ? new Date(passenger.dob).toISOString()
          : new Date().toISOString(),
        nationality: passenger.nationality,
        passportNumber: passenger.passportNumber,
        specialRequests: passenger.specialRequests || ''
      })) || [],
      contactInfo: {
        email: bookingData.contactInfo.email,
        phoneNumber: bookingData.contactInfo.phoneNumber
      },
      seatSelection: {
        outbound: bookingData.seats?.outbound || [],
        return: bookingData.flights.return ? (bookingData.seats?.return || []) : []
      },
      totalPrice: bookingData.totalAmount
    };

    // Validate seat selection
    if (bookingData.seats?.outbound?.length !== bookingData.passengers?.length) {
      throw new Error('Number of outbound seats must match number of passengers');
    }
    if (bookingData.flights.return && bookingData.seats?.return?.length !== bookingData.passengers?.length) {
      throw new Error('Number of return seats must match number of passengers for round trip');
    }

    // Make API call
    const response = await fetch(`${API_BASE_URL}/flightBooking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(formattedData)
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Booking API response:', responseData);
      throw new Error(responseData.message || 'Failed to create booking');
    }

    // Extract the flightBooking object from the response
    const booking = responseData.flightBooking;
    if (!booking || !booking._id) {
      console.error('Invalid booking response:', responseData);
      throw new Error('Invalid booking response from server');
    }

    return booking;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Get all bookings for a specific user
 * @param userId The user ID
 * @returns Array of bookings
 */
export const getUserBookings = async (userId: string): Promise<FlightBooking[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/flightBooking/user/${userId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user bookings');
    }

    const result = await response.json();
    const bookings = result.bookings || [];
    
    return bookings.map((booking: any) => ({
      ...booking,
      id: booking._id, // Map MongoDB _id to id for frontend consistency
      status: 'confirmed', // Add status for UI display
      type: 'flight', // Add type for UI display
      createdAt: booking.createdAt || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

/**
 * Get all bookings (admin function)
 * @returns Array of all bookings
 */
export const getAllBookings = async (): Promise<FlightBooking[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/flightBooking`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch bookings');
    }
    const result = await response.json();
    const bookings = result.flightBookings || [];
    return bookings.map((booking: any) => ({
      ...booking,
      id: booking._id, // Map MongoDB _id to id for frontend consistency
      status: 'confirmed', // Add status for UI display
      type: 'flight', // Add type for UI display
      createdAt: booking.createdAt || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
};

/**
 * Get a specific booking by ID
 * @param bookingId The booking ID
 * @returns The booking details
 */
export const getBookingById = async (bookingId: string): Promise<FlightBooking> => {
  try {
    const response = await fetch(`${API_BASE_URL}/flightBooking/${bookingId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch booking');
    }

    const result = await response.json();
    const booking = result.flightbooking;
    
    return {
      ...booking,
      id: booking._id, // Map MongoDB _id to id for frontend consistency
      status: 'confirmed', // Add status for UI display
      type: 'flight', // Add type for UI display
      createdAt: booking.createdAt || new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching booking ${bookingId}:`, error);
    throw error;
  }
};

/**
 * Update a booking
 * @param bookingId The booking ID
 * @param updateData The data to update
 * @returns The updated booking
 */
export const updateBooking = async (bookingId: string, updateData: Partial<FlightBooking>): Promise<FlightBooking> => {
  try {
    // Always set the status to 'modified' when updating a booking
    const dataWithStatus = {
      ...updateData,
      status: 'modified',
      modifiedAt: new Date().toISOString()
    };
    
    const response = await fetch(`${API_BASE_URL}/flightBooking/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(dataWithStatus),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update booking');
    }

    const result = await response.json();
    return result.flightbooking;
  } catch (error) {
    console.error(`Error updating booking ${bookingId}:`, error);
    throw error;
  }
};

/**
 * Delete a booking
 * @param bookingId The booking ID
 * @returns The deleted booking
 */
export const deleteBooking = async (bookingId: string): Promise<FlightBooking> => {
  try {
    const response = await fetch(`${API_BASE_URL}/flightBooking/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete booking');
    }

    const result = await response.json();
    return result.flightbooking;
  } catch (error) {
    console.error(`Error deleting booking ${bookingId}:`, error);
    throw error;
  }
};