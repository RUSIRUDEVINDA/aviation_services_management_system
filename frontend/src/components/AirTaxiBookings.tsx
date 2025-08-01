import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import RequestForm from './RequestForm';
import { getUserRequestsAdmin, cancelAirTaxiBooking, modifyAirTaxiBooking, getAirTaxiLocations } from '../services/api';

// Sample air taxi models based on the backend schema
const airTaxiModels = [
  { id: 1, name: 'Standard Helicopter', capacity: 4, price: 500, description: 'Standard helicopter for urban transport', image: '/images/standard-helicopter.jpg' },
  { id: 2, name: 'Executive Helicopter', capacity: 6, price: 800, description: 'Luxury helicopter with premium amenities', image: '/images/executive-helicopter.jpg' },
  { id: 3, name: 'Urban Air Taxi', capacity: 3, price: 400, description: 'Compact electric vertical takeoff and landing aircraft', image: '/images/urban-air-taxi.jpg' },
  { id: 4, name: 'Premium Air Shuttle', capacity: 5, price: 700, description: 'Premium air shuttle with extended range', image: '/images/premium-shuttle.jpg' }
];

interface AirTaxiBookingsProps {
  user: any;
  bookings: any[];
  onRefresh: () => void;
}

interface Location {
  id: number;
  name: string;
  city: string;
  code: string;
}

const AirTaxiBookings: React.FC<AirTaxiBookingsProps> = ({ user, bookings, onRefresh }) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showModificationForm, setShowModificationForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [requestType, setRequestType] = useState<'modification' | 'cancellation'>('cancellation');
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isProcessingModification, setIsProcessingModification] = useState(false);
  const [modifiedBookingData, setModifiedBookingData] = useState<any>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [capacityError, setCapacityError] = useState<string>('');
  const [locationError, setLocationError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchUserRequests();
    fetchLocations();
  }, [user?.id]);

  useEffect(() => {
    if (modifiedBookingData) {
      validateCapacity();
    }
  }, [modifiedBookingData?.passengers, modifiedBookingData?.airTaxiModel]);

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

  // Fetch locations for dropdowns
  const fetchLocations = async () => {
    setIsLoadingLocations(true);
    try {
      const locationsData = await getAirTaxiLocations();
      setLocations(locationsData as Location[]);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // Get request status for a booking
  const getRequestStatus = (bookingId: string) => {
    if (!userRequests.length) return null;
    
    const request = userRequests.find(req => 
      req.bookingId === bookingId && 
      req.status !== 'rejected'
    );
    
    return request;
  };
  
  const handleRequestModification = (booking: any) => {
    setSelectedBooking(booking);
    setRequestType('modification');
    setShowRequestModal(true);
  };
  
  const handleRequestCancellation = (booking: any) => {
    setSelectedBooking(booking);
    setRequestType('cancellation');
    setShowRequestModal(true);
  };

  const handleMakeModifications = (booking: any) => {
    setSelectedBooking(booking);
    
    // Convert backend data structure to frontend format
    const formattedBookingData = {
      pickup: booking.pickup,
      destination: booking.destination,
      date: booking.dateTime ? new Date(booking.dateTime).toISOString().split('T')[0] : '',
      time: booking.dateTime ? new Date(booking.dateTime).toTimeString().substring(0, 5) : '',
      passengerName: booking.contactName,
      passengerEmail: booking.contactEmail,
      passengerPhone: booking.contactPhone,
      airTaxiModel: booking.taxiModel?.name || '',
      specialRequests: booking.specialRequests || '',
      totalAmount: booking.totalAmount,
      estimatedArrival: calculateEstimatedArrival(booking.dateTime),
      passengers: booking.passengers || 1,
      status: 'modified'
    };
    
    setModifiedBookingData(formattedBookingData);
    setShowModificationForm(true);
    
    // Initial validation
    setTimeout(() => {
      validateCapacity();
    }, 0);
  };

  // Helper function to calculate estimated arrival time (2 hours after departure)
  const calculateEstimatedArrival = (dateTimeStr: string) => {
    if (!dateTimeStr) return '';
    
    const dateTime = new Date(dateTimeStr);
    dateTime.setHours(dateTime.getHours() + 2);
    
    return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const validateCapacity = () => {
    if (!modifiedBookingData) return;
    
    const passengers = modifiedBookingData.passengers;
    const modelName = modifiedBookingData.airTaxiModel;
    
    if (!passengers || !modelName) {
      setCapacityError('');
      return;
    }
    
    const selectedModel = airTaxiModels.find(model => model.name === modelName);
    if (selectedModel && passengers > selectedModel.capacity) {
      setCapacityError(`Selected air taxi model can only accommodate up to ${selectedModel.capacity} passengers.`);
    } else {
      setCapacityError('');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field === 'pickup') {
      // For pickup dropdown selection
      if (typeof value === 'string') {
        const selectedLocation = locations.find(loc => loc.name === value);
        if (selectedLocation) {
          // Check if destination is the same as the new pickup
          if (modifiedBookingData.destination && modifiedBookingData.destination.name === selectedLocation.name) {
            setLocationError('Pickup location and destination cannot be the same');
          } else {
            setLocationError('');
          }
          
          setModifiedBookingData(prev => ({
            ...prev,
            pickup: selectedLocation
          }));
        }
      } else {
        setModifiedBookingData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    } else if (field === 'destination') {
      // For destination dropdown selection
      if (typeof value === 'string') {
        const selectedLocation = locations.find(loc => loc.name === value);
        if (selectedLocation) {
          // Check if pickup is the same as the new destination
          if (modifiedBookingData.pickup && modifiedBookingData.pickup.name === selectedLocation.name) {
            setLocationError('Pickup location and destination cannot be the same');
          } else {
            setLocationError('');
          }
          
          setModifiedBookingData(prev => ({
            ...prev,
            destination: selectedLocation
          }));
        }
      } else {
        setModifiedBookingData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    } else if (field === 'airTaxiModel') {
      // For air taxi model dropdown selection
      const selectedModel = airTaxiModels.find(model => model.name === value);
      if (selectedModel) {
        setModifiedBookingData(prev => ({
          ...prev,
          airTaxiModel: value,
          taxiModelData: selectedModel
        }));
      } else {
        setModifiedBookingData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    } else if (field === 'passengers') {
      // Update passengers count
      setModifiedBookingData(prev => ({
        ...prev,
        [field]: parseInt(value) || 1
      }));
    } else {
      // For other fields
      setModifiedBookingData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const submitModification = async () => {
    if (!selectedBooking || !modifiedBookingData) return;
    
    // Validate pickup and destination are not the same
    if (modifiedBookingData.pickup && modifiedBookingData.destination && 
        modifiedBookingData.pickup.name === modifiedBookingData.destination.name) {
      toast({
        title: "Error",
        description: "Pickup location and destination cannot be the same",
        variant: "destructive",
      });
      setLocationError('Pickup location and destination cannot be the same');
      return;
    }
    
    if (capacityError) {
      toast({
        title: "Error",
        description: capacityError,
        variant: "destructive",
      });
      return;
    }
    
    if (locationError) {
      toast({
        title: "Error",
        description: locationError,
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessingModification(true);
    
    try {
      // Convert frontend data structure back to backend format
      const backendFormattedData = {
        pickup: modifiedBookingData.pickup,
        destination: modifiedBookingData.destination,
        dateTime: `${modifiedBookingData.date}T${modifiedBookingData.time}:00`,
        contactName: modifiedBookingData.passengerName,
        contactEmail: modifiedBookingData.passengerEmail,
        contactPhone: modifiedBookingData.passengerPhone,
        passengers: modifiedBookingData.passengers,
        taxiModel: modifiedBookingData.taxiModelData || {
          id: airTaxiModels.find(model => model.name === modifiedBookingData.airTaxiModel)?.id || 1,
          name: modifiedBookingData.airTaxiModel,
          capacity: airTaxiModels.find(model => model.name === modifiedBookingData.airTaxiModel)?.capacity || 4,
          price: airTaxiModels.find(model => model.name === modifiedBookingData.airTaxiModel)?.price || 500
        },
        specialRequests: modifiedBookingData.specialRequests,
        totalAmount: modifiedBookingData.totalAmount,
        status: 'modified'
      };
      
      await modifyAirTaxiBooking(selectedBooking._id, backendFormattedData);
      
      toast({
        title: "Success",
        description: "Your air taxi booking has been successfully modified.",
      });
      
      onRefresh();
      setShowModificationForm(false);
    } catch (error) {
      console.error('Error modifying air taxi booking:', error);
      toast({
        title: "Error",
        description: "Failed to modify booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingModification(false);
    }
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

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-navy-800">My Air Taxi Bookings</h3>
      
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
      
      {bookings.length === 0 ? (
        <div className="bg-navy-50 rounded-lg p-6 text-center">
          <p className="text-navy-600">You don't have any air taxi bookings yet.</p>
          <Link to="/airtaxi" className="mt-4 inline-block px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700">
            Book an Air Taxi
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            // NEW LOGIC: Determine request and modification status
            const requestStatus = getRequestStatus(booking._id);
            const isModificationRequestPending = requestStatus && requestStatus.requestType === 'modification' && requestStatus.status === 'pending';
            const isCancellationRequestPending = requestStatus && requestStatus.requestType === 'cancellation' && requestStatus.status === 'pending';
            const isModificationApproved = requestStatus && requestStatus.requestType === 'modification' && requestStatus.status === 'approved';
            const isCancellationApproved = requestStatus && requestStatus.requestType === 'cancellation' && requestStatus.status === 'approved';
            const isAlreadyModified = booking.status === 'modified';
            const isModificationPendingStatus = booking.status && booking.status.toLowerCase() === 'modification pending';
            const isModificationRejected = isRequestRejected(booking._id, 'modification');
            const isCancellationRejected = isRequestRejected(booking._id, 'cancellation');

            return (
              <div key={booking._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-navy-50 px-4 py-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-navy-800">
                      {booking.pickup?.name} to {booking.destination?.name}
                    </span>
                    <span className="text-sm text-navy-600 ml-2">
                      • Booking ID: {booking._id}
                    </span>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      booking.status === 'modified' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status?.toUpperCase() || 'CONFIRMED'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-navy-600 mb-1">Pickup Details</h4>
                      <div className="text-sm">
                        <p className="font-medium">{booking.pickup?.name}</p>
                        <p>{booking.pickup?.city}, {booking.pickup?.code}</p>
                        <p>{new Date(booking.dateTime).toLocaleDateString()} at {new Date(booking.dateTime).toTimeString().substring(0, 5)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-navy-600 mb-1">Destination</h4>
                      <div className="text-sm">
                        <p className="font-medium">{booking.destination?.name}</p>
                        <p>{booking.destination?.city}, {booking.destination?.code}</p>
                        <p className="text-navy-500">Est. arrival: {calculateEstimatedArrival(booking.dateTime)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-navy-600 mb-1">Booking Details</h4>
                      <div className="text-sm">
                        <p><span className="text-navy-500">Passenger:</span> {booking.contactName}</p>
                        <p><span className="text-navy-500">Air Taxi:</span> {booking.taxiModel?.name}</p>
                        <p><span className="text-navy-500">Total Price:</span> ${booking.totalAmount?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-3">
                    {booking.status !== 'cancelled' && (
                      <>
                        {/* Modification Button Logic */}
                        {isModificationRejected ? (
                          <button
                            className="px-3 py-1.5 bg-gray-400 text-white rounded text-sm cursor-not-allowed"
                            disabled
                          >
                            Modification Rejected
                          </button>
                        ) : isModificationApproved ? (
                          <button
                            className="px-3 py-1.5 bg-navy-600 text-white rounded hover:bg-navy-700 text-sm"
                            onClick={() => handleMakeModifications(booking)}
                            disabled={isAlreadyModified || isModificationPendingStatus || isModificationRequestPending}
                          >
                            {isAlreadyModified ? 'Already Modified' : isModificationPendingStatus || isModificationRequestPending ? 'Modification Pending' : 'Modify Booking'}
                          </button>
                        ) : (
                          <button
                            className="px-3 py-1.5 bg-navy-600 text-white rounded hover:bg-navy-700 text-sm"
                            onClick={() => handleRequestModification(booking)}
                            disabled={isAlreadyModified || isCancellationRequestPending || isModificationPendingStatus || isModificationRequestPending}
                          >
                            {isAlreadyModified ? 'Already Modified'
                              : isModificationPendingStatus || isModificationRequestPending ? 'Modification Pending'
                              : isCancellationRequestPending ? 'Modification Disabled (Cancellation Pending)'
                              : 'Request Modification'}
                          </button>
                        )}

                        {/* Cancellation Button Logic */}
                        {isCancellationRejected ? (
                          <button
                            className="px-3 py-1.5 bg-gray-400 text-white rounded text-sm cursor-not-allowed"
                            disabled
                          >
                            Cancellation Rejected
                          </button>
                        ) : isCancellationApproved ? (
                          <button
                            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            onClick={() => handleRequestCancellation(booking)}
                          >
                            Cancel Booking
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
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Request Form Modal */}
      {showRequestModal && selectedBooking && (
        <RequestForm
          userId={user.id}
          userEmail={user.email}
          userName={user.name || user.email}
          bookingId={selectedBooking._id || ''}
          bookingType="airtaxi"
          requestType={requestType}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            onRefresh();
            fetchUserRequests();
            setShowRequestModal(false);
          }}
        />
      )}

      {/* Modification Form Modal */}
      {showModificationForm && selectedBooking && modifiedBookingData && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl w-full my-8 mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b">
              <h3 className="text-xl font-bold text-navy-800">
                Modify Your Air Taxi Booking
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup and Destination */}
              <div className="p-4 border border-navy-200 rounded-md">
                <h4 className="text-lg font-semibold text-navy-700 mb-4">Pickup & Destination</h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy-600 mb-1">
                    Pickup Location
                  </label>
                  <select
                    className={`w-full p-2 border ${locationError ? 'border-red-500' : 'border-navy-200'} rounded-md`}
                    value={modifiedBookingData.pickup?.name || ''}
                    onChange={(e) => handleInputChange('pickup', e.target.value)}
                  >
                    <option value="">Select Pickup Location</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.name}>{location.name}</option>
                    ))}
                  </select>
                  {locationError && (
                    <p className="text-red-500 text-xs mt-1">{locationError}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy-600 mb-1">
                    Destination
                  </label>
                  <select
                    className={`w-full p-2 border ${locationError ? 'border-red-500' : 'border-navy-200'} rounded-md`}
                    value={modifiedBookingData.destination?.name || ''}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                  >
                    <option value="">Select Destination</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.name}>{location.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Date and Time */}
              <div className="p-4 border border-navy-200 rounded-md">
                <h4 className="text-lg font-semibold text-navy-700 mb-4">Date & Time</h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border border-navy-200 rounded-md"
                    value={modifiedBookingData.date || ''}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy-600 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full p-2 border border-navy-200 rounded-md"
                    value={modifiedBookingData.time || ''}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                  />
                </div>
              </div>
              
              {/* Passenger Details */}
              <div className="p-4 border border-navy-200 rounded-md">
                <h4 className="text-lg font-semibold text-navy-700 mb-4">Passenger Details</h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy-600 mb-1">
                    Passenger Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-navy-200 rounded-md"
                    value={modifiedBookingData.passengerName || ''}
                    onChange={(e) => handleInputChange('passengerName', e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full p-2 border border-navy-200 rounded-md"
                    value={modifiedBookingData.passengerEmail || ''}
                    onChange={(e) => handleInputChange('passengerEmail', e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy-600 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full p-2 border border-navy-200 rounded-md"
                    value={modifiedBookingData.passengerPhone || ''}
                    onChange={(e) => handleInputChange('passengerPhone', e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy-600 mb-1">
                    Number of Passengers
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-navy-200 rounded-md"
                    value={modifiedBookingData.passengers || 1}
                    onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
                    min="1"
                    max="6"
                  />
                </div>
              </div>
              
              {/* Additional Details */}
              <div className="p-4 border border-navy-200 rounded-md">
                <h4 className="text-lg font-semibold text-navy-700 mb-4">Additional Details</h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy-600 mb-1">
                    Air Taxi Model
                  </label>
                  <select
                    className="w-full p-2 border border-navy-200 rounded-md"
                    value={modifiedBookingData.airTaxiModel || ''}
                    onChange={(e) => handleInputChange('airTaxiModel', e.target.value)}
                  >
                    <option value="">Select Air Taxi Model</option>
                    {airTaxiModels
                      .filter(model => !modifiedBookingData.passengers || model.capacity >= modifiedBookingData.passengers)
                      .map((model) => (
                        <option key={model.id} value={model.name}>
                          {model.name} (Capacity: {model.capacity})
                        </option>
                      ))
                    }
                  </select>
                  {capacityError && (
                    <p className="text-sm text-red-600 mt-1">{capacityError}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy-600 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    className="w-full p-2 border border-navy-200 rounded-md"
                    rows={3}
                    value={modifiedBookingData.specialRequests || ''}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy-600 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-navy-200 rounded-md"
                    value={`$${modifiedBookingData.totalAmount?.toFixed(2) || '0.00'}`}
                    disabled
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy-600 mb-1">
                    Estimated Arrival
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-navy-200 rounded-md"
                    value={modifiedBookingData.estimatedArrival || ''}
                    disabled
                  />
                </div>
              </div>
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

export default AirTaxiBookings;
