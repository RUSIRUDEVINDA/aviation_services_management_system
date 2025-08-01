import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Mail, Calendar, LogOut } from 'lucide-react';
import { getUserBookings, getUserAirTaxiBookings } from '../services/api';
import { useAuthContext } from '@asgardeo/auth-react';
import { toast } from "@/hooks/use-toast";

const UserProfile: React.FC = () => {
  const [flightBookings, setFlightBookings] = useState<any[]>([]);
  const [airTaxiBookings, setAirTaxiBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { state, signOut } = useAuthContext();

  useEffect(() => {
    console.log('[UserProfile] Asgardeo state:', state);
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!state.username) {
      console.warn('[UserProfile] Asgardeo state.username (email) is not available yet. Skipping fetch.');
      return;
    }
    fetchFlightBookings(state.username);
    fetchAirTaxiBookings(state.username);
    // Only re-run if user or auth state changes
  }, [state.isAuthenticated, state.username]);
  
  const fetchFlightBookings = async (email) => {
    try {
      setIsLoading(true);
      if (!email) {
        console.warn('[UserProfile] No user email found!');
        setFlightBookings([]);
        return;
      }
      console.log('[UserProfile] Fetching flight bookings for user:', email);
      const userFlightBookings = await getUserBookings(email);
      console.log('[UserProfile] API response for flight bookings:', userFlightBookings);
      setFlightBookings(userFlightBookings);
    } catch (error) {
      console.error('[UserProfile] Error fetching flight bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch flight bookings. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchAirTaxiBookings = async (email) => {
    try {
      if (!email) {
        console.warn('[UserProfile] No user email found for air taxi bookings!');
        setAirTaxiBookings([]);
        return;
      }
      console.log('[UserProfile] Fetching air taxi bookings for user:', email);
      const userAirTaxiBookings = await getUserAirTaxiBookings(email);
      console.log('[UserProfile] API response for air taxi bookings:', userAirTaxiBookings);
      setAirTaxiBookings(userAirTaxiBookings);
    } catch (error) {
      console.error('[UserProfile] Error fetching air taxi bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch air taxi bookings. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = () => {
    signOut();
    navigate('/');
  };
  
  // Filter to include only real flight bookings
  const pureFlightBookings = flightBookings.filter(
    (b) => b.type === 'flight' || b.outboundFlight
  );

  // Calculate statistics
  // Calculate total spent for flight bookings
  const flightTotalSpent = pureFlightBookings.reduce((total, booking) => 
    total + (booking.totalPrice || 0), 0);
  
  // Calculate total spent for air taxi bookings
  const airTaxiTotalSpent = airTaxiBookings.reduce((total, booking) => 
    total + (booking.totalAmount || booking.totalPrice || 0), 0);
  
  // Calculate total spent across all booking types
  const totalSpent = flightTotalSpent + airTaxiTotalSpent;

  // Popular destinations data
  const popularDestinations = [
    {
      id: 1,
      name: 'Maldives',
      image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Pristine beaches and overwater bungalows make the Maldives a perfect tropical getaway.'
    },
    {
      id: 2,
      name: 'Tokyo',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Experience the vibrant blend of traditional culture and cutting-edge technology in Tokyo.'
    },
    {
      id: 3,
      name: 'Paris',
      image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'The city of love and lights, famous for its art, fashion, and gastronomy.'
    },
    {
      id: 4,
      name: 'New York',
      image: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'The bustling metropolis that never sleeps, with iconic landmarks at every turn.'
    }
  ];
  
  return (
    <div className="bg-navy-50 rounded-xl p-6 mt-6 border border-navy-100 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - User Info */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-navy-100">
            <div className="w-24 h-24 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-navy-200">
              <User className="h-12 w-12 text-navy-700" />
            </div>
            
            <h3 className="text-xl font-bold text-navy-900 mb-1">{state.displayName}</h3>
            <p className="text-navy-600 mb-4">{state.username}</p>
            
            <div className="space-y-3 text-left mt-6">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-navy-600 mr-3" />
                <span className="text-navy-800">
                  {/* Show MongoDB email if it matches Asgardeo email, else fallback */}
                  {(() => {
                    const bookingEmail = flightBookings[0]?.contactInfo?.email || airTaxiBookings[0]?.contactEmail;
                    if (bookingEmail && state.username && bookingEmail.toLowerCase() === state.username.toLowerCase()) {
                      return bookingEmail;
                    }
                    return state.username;
                  })()}
                </span>
                {state.displayName && (
                  <span className="ml-2 text-navy-700 font-semibold">({state.displayName})</span>
                )}
              </div>
              
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-navy-600 mr-3" />
                <span className="text-navy-800">+94711431969</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-navy-600 mr-3" />
                <span className="text-navy-800">Colombo, Sri Lanka</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-navy-600 mr-3" />
                <span className="text-navy-800">Member since {new Date(2025, 0, 1).toLocaleDateString()}</span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full mt-6 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700 flex items-center justify-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
            
            <h3 className="text-lg font-semibold text-navy-900 mb-4 mt-8">Account Summary</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-navy-50 rounded-lg p-4 border border-navy-100">
                <p className="text-navy-600 text-sm">Flight Bookings</p>
                <p className="text-navy-900 text-xl font-bold">{pureFlightBookings.length}</p>
              </div>
              
              <div className="bg-navy-50 rounded-lg p-4 border border-navy-100">
                <p className="text-navy-600 text-sm">Air Taxi Bookings</p>
                <p className="text-navy-900 text-xl font-bold">{airTaxiBookings.length}</p>
              </div>
              
              <div className="bg-navy-50 rounded-lg p-4 col-span-2 border border-navy-100">
                <p className="text-navy-600 text-sm">Total Spent</p>
                <p className="text-navy-900 text-xl font-bold">${totalSpent.toFixed(2)}</p>
                {flightTotalSpent > 0 && airTaxiTotalSpent > 0 && (
                  <div className="mt-2 text-xs text-navy-500">
                    <p>Flights: ${flightTotalSpent.toFixed(2)}</p>
                    <p>Air Taxis: ${airTaxiTotalSpent.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-navy-800 font-medium mb-2">Membership Status</h4>
              <div className="bg-navy-100 h-2 rounded-full overflow-hidden">
                <div className="bg-navy-700 h-full rounded-full" style={{ width: '60%' }}></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-navy-600">
                <span>Regular</span>
                <span>Silver</span>
                <span>Gold</span>
              </div>
              <p className="text-center text-navy-600 text-sm mt-2">600 more points to reach Silver</p>
            </div>
          </div>
        </div>
        
        {/* Right Column - Bookings and Destinations */}
        <div className="w-full md:w-2/3">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-navy-100">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Your Travel Dashboard</h2>
            
           
            
            <div>
              <h3 className="text-xl font-semibold text-navy-800 mb-4">Popular Destinations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularDestinations.map(destination => (
                  <div key={destination.id} className="border border-navy-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-40 object-cover bg-gray-200"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x160?text=No+Image'; }}
                    />
                    <div className="p-4">
                      <h4 className="font-bold text-navy-900 mb-2">{destination.name}</h4>
                      <p className="text-navy-700 text-sm">{destination.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;