import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UserProfile from '../components/UserProfile';
import UserBookings from '../components/UserBookings';
import AirTaxiBookings from '../components/AirTaxiBookings';
import UserRequests from '../components/UserRequests';
import UserNotifications from '../components/UserNotifications';
import BookingSummary from '../components/BookingSummary';
import { useAuthContext } from "@asgardeo/auth-react";
import { getUserRequestsByEmail, getUserAirTaxiBookings, getUserNotifications, getUserBookings } from '../services/api';
// ...existing code...
import { useQuery } from '@tanstack/react-query';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');
  // All user data is now managed by React Query
  // (State declarations remain here, only one set)
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modificationReason, setModificationReason] = useState('');
  const [modificationDetails, setModificationDetails] = useState('');
  const [isProcessingModification, setIsProcessingModification] = useState(false);
  
  const navigate = useNavigate();
  const { state } = useAuthContext();
  const user = useMemo(() => {
    return state.isAuthenticated && state.username
      ? { name: state.displayName, email: state.email, id: state.sub, username: state.username, ...state }
      : null;
  }, [state.isAuthenticated, state.displayName, state.email, state.sub, state.username]);
  

  // React Query: fetch user requests
  const {
    data: requests = [],
    refetch: refetchRequests,
    isFetching: isFetchingRequests
  } = useQuery({
    queryKey: ['userRequests', state.username],
    queryFn: () => state.username ? getUserRequestsByEmail(state.username) : Promise.resolve([]),
    enabled: !!state.username
  });

  // React Query: fetch flight bookings
  const {
    data: flightBookings = [],
    refetch: refetchFlightBookings,
    isFetching: isFetchingFlightBookings
  } = useQuery({
    queryKey: ['flightBookings', state.username],
    queryFn: () => state.username ? getUserBookings(state.username) : Promise.resolve([]),
    enabled: !!state.username
  });

  // React Query: fetch air taxi bookings
  const {
    data: airTaxiBookings = [],
    refetch: refetchAirTaxiBookings,
    isFetching: isFetchingAirTaxiBookings
  } = useQuery({
    queryKey: ['airTaxiBookings', state.username],
    queryFn: () => state.username ? getUserAirTaxiBookings(state.username) : Promise.resolve([]),
    enabled: !!state.username
  });

  // React Query: fetch notifications
  const {
    data: notifications = [],
    refetch: refetchNotifications,
    isFetching: isFetchingNotifications
  } = useQuery({
    queryKey: ['notifications', state.username],
    queryFn: () => user && user.id ? getUserNotifications(user.id) : Promise.resolve([]),
    enabled: !!user && !!user.id
  });
  

  // Patch onRefresh handlers for React Query
  const handleRequestsRefresh = () => refetchRequests();
  const handleFlightBookingsRefresh = () => refetchFlightBookings();
  const handleAirTaxiBookingsRefresh = () => refetchAirTaxiBookings();
  const handleNotificationsRefresh = () => refetchNotifications();
  
  // This function serves two purposes:
  // 1. When called with just a booking, it shows the modification modal
  // 2. When called with a booking that has status 'modified', it updates the booking in the UI
  if (!state.isAuthenticated || !user) {
    return <div className="flex items-center justify-center min-h-screen"><span>Loading...</span></div>;
  }
  const handleModificationRequest = (booking: any) => {
    console.log('handleModificationRequest called with booking:', booking);
    
    // If the booking has status 'modified', update it in the flightBookings array
    if (booking.status === 'modified') {
      // Force a refresh to ensure the UI reflects the changes
      setTimeout(() => refetchFlightBookings(), 500);
    } else {
      // Otherwise, just show the modification modal
      setSelectedBooking(booking);
      setShowModificationModal(true);
    }
  };
  
  const submitModification = async () => {
    if (!selectedBooking) return;
    
    setIsProcessingModification(true);
    
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll just simulate a successful request
      setTimeout(() => {
        toast({
          title: "Modification Request Submitted",
          description: "Your modification request has been submitted successfully and is pending approval.",
        });
        setShowModificationModal(false);
        setModificationReason('');
        setModificationDetails('');
        setIsProcessingModification(false);
        refetchFlightBookings();
      }, 1000);
    } catch (error) {
      console.error('Error submitting modification:', error);
      toast({
        title: "Error",
        description: "Failed to submit modification request. Please try again later.",
        variant: "destructive",
      });
      setIsProcessingModification(false);
    }
  };
  
  // Deduplicate bookings by _id to prevent duplicate/looping renders
  const dedupeById = (arr: any[] = []) => {
    const seen = new Set();
    return arr.filter((item) => {
      if (!item || !item._id) return false;
      if (seen.has(item._id)) return false;
      seen.add(item._id);
      return true;
    });
  };

  const uniqueFlightBookings = useMemo(() => dedupeById(flightBookings), [flightBookings]);
  const uniqueAirTaxiBookings = useMemo(() => dedupeById(airTaxiBookings), [airTaxiBookings]);
  const uniqueRequests = useMemo(() => dedupeById(requests), [requests]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <UserProfile />;
      case 'flight-bookings':
        return <UserBookings 
          user={user}
          bookings={uniqueFlightBookings} 
          onRefresh={handleFlightBookingsRefresh} 
          onRequestModification={handleModificationRequest}
        />;
      case 'air-taxi-bookings':
        return <AirTaxiBookings 
          user={user}
          bookings={uniqueAirTaxiBookings}
          onRefresh={handleAirTaxiBookingsRefresh}
        />;
      case 'requests':
        return <UserRequests 
          requests={uniqueRequests} 
          onRefresh={handleRequestsRefresh} 
        />;
      case 'notifications':
        return <UserNotifications 
          notifications={notifications}
          onRefresh={handleNotificationsRefresh}
        />;
      case 'summary':
        // Find confirmed bookings of each type
        const flightBooking = uniqueFlightBookings.find(b => b.status === 'confirmed');
        const airTaxiBooking = uniqueAirTaxiBookings.find(b => b.status === 'confirmed');
        
        // Make sure we have properly structured data for the BookingSummary component
        const flightBookingData = flightBooking ? {
          ...flightBooking,
          flights: {
            departure: flightBooking.outboundFlight || {}
          },
          passengers: flightBooking.passengersDetails || [],
          seats: flightBooking.seatSelection || [],
          totalAmount: flightBooking.totalPrice || 0
        } : null;
        
        const airTaxiBookingData = airTaxiBooking || null;
        
        return <BookingSummary flightBooking={flightBookingData} airTaxiBooking={airTaxiBookingData} />;
      default:
        return <UserProfile />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-navy-800 mb-2">My Dashboard</h1>
            <p className="text-navy-600">
              Welcome back, {user?.name}. Manage your bookings and account.
            </p>
          </div>
          
          <div className="mb-8">
            <nav className="flex border-b border-gray-200">
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'profile' 
                    ? 'border-b-2 border-navy-600 text-navy-700' 
                    : 'text-navy-500 hover:text-navy-700 hover:border-navy-300'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'flight-bookings' 
                    ? 'border-b-2 border-navy-600 text-navy-700' 
                    : 'text-navy-500 hover:text-navy-700 hover:border-navy-300'
                }`}
                onClick={() => setActiveTab('flight-bookings')}
              >
                Flight Bookings
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'air-taxi-bookings' 
                    ? 'border-b-2 border-navy-600 text-navy-700' 
                    : 'text-navy-500 hover:text-navy-700 hover:border-navy-300'
                }`}
                onClick={() => setActiveTab('air-taxi-bookings')}
              >
                Air Taxi Bookings
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'requests' 
                    ? 'border-b-2 border-navy-600 text-navy-700' 
                    : 'text-navy-500 hover:text-navy-700 hover:border-navy-300'
                }`}
                onClick={() => setActiveTab('requests')}
              >
                My Requests
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'notifications' 
                    ? 'border-b-2 border-navy-600 text-navy-700' 
                    : 'text-navy-500 hover:text-navy-700 hover:border-navy-300'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                Notifications
                {notifications.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'summary' 
                    ? 'border-b-2 border-navy-600 text-navy-700' 
                    : 'text-navy-500 hover:text-navy-700 hover:border-navy-300'
                }`}
                onClick={() => setActiveTab('summary')}
              >
                
              </button>
            </nav>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            {renderTabContent()}
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Modification Request Modal */}
      {showModificationModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-navy-800 mb-4">Request Booking Modification</h3>
            <p className="text-navy-600 mb-4">
              Please provide details about the changes you would like to make to your booking.
            </p>
            
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-navy-600 mb-1">
                Reason for Modification
              </label>
              <select
                id="reason"
                className="w-full p-2 border border-navy-200 rounded-md focus:ring-navy-500 focus:border-navy-500"
                value={modificationReason}
                onChange={(e) => setModificationReason(e.target.value)}
              >
                <option value="">Select a reason</option>
                <option value="Change of plans">Change of plans</option>
                <option value="Schedule conflict">Schedule conflict</option>
                <option value="Adding passengers">Adding passengers</option>
                <option value="Removing passengers">Removing passengers</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="details" className="block text-sm font-medium text-navy-600 mb-1">
                Modification Details
              </label>
              <textarea
                id="details"
                className="w-full p-2 border border-navy-200 rounded-md focus:ring-navy-500 focus:border-navy-500"
                rows={4}
                value={modificationDetails}
                onChange={(e) => setModificationDetails(e.target.value)}
                placeholder="Please provide specific details about the changes you need"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-navy-300 rounded-md text-navy-700 hover:bg-navy-50"
                onClick={() => setShowModificationModal(false)}
                disabled={isProcessingModification}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700"
                onClick={submitModification}
                disabled={!modificationReason || !modificationDetails || isProcessingModification}
              >
                {isProcessingModification ? 'Processing...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;