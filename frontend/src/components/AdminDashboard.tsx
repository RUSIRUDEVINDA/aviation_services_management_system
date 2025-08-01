import React, { useState, useEffect } from 'react';
import { getAllRequests, updateRequestStatus, getUserAirTaxiBookings, cancelBooking, cancelAirTaxiBooking, createNotification } from '../services/api';
import { getAllBookings } from '../services/bookingApi';
import { useAuthContext } from '@asgardeo/auth-react';
import { toast } from "@/hooks/use-toast";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Clock, Plane } from 'lucide-react';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


function generateMonthlyStats(flightBookings: any[], airTaxiBookings: any[]) {
 
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const stats = months.map((name, idx) => ({ name, flights: 0, airTaxis: 0 }));
  flightBookings.forEach(b => {
   
    const dateStr = b.departureDate || b.dateTime || b.createdAt;
    if (!dateStr) return;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;
    const m = date.getMonth();
    if (stats[m]) stats[m].flights++;
  });
  airTaxiBookings.forEach(b => {
   
    const dateStr = b.departureDate || b.pickupDate || b.dateTime || b.createdAt;
    if (!dateStr) return;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;
    const m = date.getMonth();
    if (stats[m]) stats[m].airTaxis++;
  });
  return stats;
}

// Generate status distribution for pie chart
function generateStatusData(flightBookings: any[], airTaxiBookings: any[]) {

  let confirmedCount = 0;
  let pendingCount = 0;
  let modifiedCount = 0;
  
  
  flightBookings.forEach(b => {
    const isModified = (
      (b.status && typeof b.status === 'string' && b.status.toLowerCase() === 'modified') ||
      b.alreadyModified === true ||
      (b.modifiedAt && b.createdAt && b.modifiedAt !== b.createdAt) ||
      b.isModified === true ||
      b.modificationDate != null ||
      (Array.isArray(b.modificationHistory) && b.modificationHistory.length > 0)
    );
    

    if (b.status && typeof b.status === 'string' && 
        (b.status.toLowerCase() === 'cancelled' || b.status.toLowerCase() === 'canceled')) {
      return;
    }
    

    if (isModified) {
      modifiedCount++;
    } else if (b.status && typeof b.status === 'string' && 
              (b.status.toLowerCase() === 'pending' || 
               b.status.toLowerCase() === 'awaiting' || 
               b.status.toLowerCase() === 'processing')) {
      pendingCount++;
    } else {
      confirmedCount++;
    }
  });
  
  airTaxiBookings.forEach(b => {
    const isModified = (
      (b.status && typeof b.status === 'string' && b.status.toLowerCase() === 'modified') ||
      b.alreadyModified === true ||
      (b.modifiedAt && b.createdAt && b.modifiedAt !== b.createdAt) ||
      b.isModified === true ||
      b.modificationDate != null ||
      (Array.isArray(b.modificationHistory) && b.modificationHistory.length > 0)
    );
    

    if (b.status && typeof b.status === 'string' && 
        (b.status.toLowerCase() === 'cancelled' || b.status.toLowerCase() === 'canceled')) {
      return;
    }
    

    if (isModified) {
      modifiedCount++;
    } else if (b.status && typeof b.status === 'string' && 
              (b.status.toLowerCase() === 'pending' || 
               b.status.toLowerCase() === 'awaiting' || 
               b.status.toLowerCase() === 'processing')) {
      pendingCount++;
    } else {
      confirmedCount++;
    }
  });
  
  // Create the final data array for the pie chart
  const statusData = [
    { name: 'Confirmed', value: confirmedCount },
    { name: 'Pending', value: pendingCount },
    { name: 'Modified', value: modifiedCount }
  ];
  
  // Filter out any categories with zero value
  return statusData.filter(item => item.value > 0);
}


function getMostPopularRoute(bookings: any[]) {
  const routeCounts: Record<string, number> = {};
  bookings.forEach(b => {

    let from = b.from || b.pickupCity || b.departureCity || b.pickupLocation || (b.pickup && (b.pickup.name || b.pickup.city || b.pickup.airport)) || '';
    let to = b.to || b.destinationCity || b.arrivalCity || b.destinationLocation || (b.destination && (b.destination.name || b.destination.city || b.destination.airport)) || '';

    if (typeof from === 'object' && from !== null) from = from.name || from.city || from.airport || '';
    if (typeof to === 'object' && to !== null) to = to.name || to.city || to.airport || '';
    from = String(from).trim();
    to = String(to).trim();
    if (!from || !to) return;
    const route = `${from} to ${to}`;
    routeCounts[route] = (routeCounts[route] || 0) + 1;
  });
  const sorted = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return 'No popular route (no data)';
  if (sorted.length === 1 || sorted[0][1] === 1) return 'No popular route (all routes unique)';
  if (sorted[0][0] === 'undefined to undefined') return 'No popular route (invalid data)';
  return `${sorted[0][0]}\n${sorted[0][1]} bookings`;
}

const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [flightBookings, setFlightBookings] = useState<any[]>([]);
  const [airTaxiBookings, setAirTaxiBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [activeRequestType, setActiveRequestType] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  

  
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all requests
      const allRequests = await getAllRequests();
      setRequests(allRequests);

      // Fetch all flight bookings
      const allFlightBookings = await getAllBookings();
      setFlightBookings(allFlightBookings);

   
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProcessRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!adminNotes) {
      toast({
        title: "Error",
        description: "Please provide admin notes",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {

      const requestToProcess = requests.find(req => req._id === requestId);
      
      if (!requestToProcess) {
        throw new Error("Request not found");
      }
      

      await updateRequestStatus(requestId, status, adminNotes);
      

      await createNotification(requestToProcess, status, adminNotes);
      

      if (status === 'approved') {
        try {
          if (requestToProcess.requestType === 'cancellation') {
           
            if (requestToProcess.bookingType === 'flight') {
              // Delete flight booking
              await cancelBooking(requestToProcess.bookingId, `Cancellation approved by admin: ${adminNotes}`);
              
             
              setFlightBookings(flightBookings.filter(booking => booking._id !== requestToProcess.bookingId));
              
              console.log(`Flight booking ${requestToProcess.bookingId} has been deleted from the database`);
            } else if (requestToProcess.bookingType === 'airtaxi') {
              // Delete air taxi booking
              await cancelAirTaxiBooking(requestToProcess.bookingId, `Cancellation approved by admin: ${adminNotes}`);
              
             
              setAirTaxiBookings(airTaxiBookings.filter(booking => booking._id !== requestToProcess.bookingId));
              
              console.log(`Air taxi booking ${requestToProcess.bookingId} has been deleted from the database`);
            }
          } else if (requestToProcess.requestType === 'modification') {
            
            console.log(`Modification request for booking ${requestToProcess.bookingId} has been approved`);
            
          
          }
        } catch (actionError) {
          console.error('Error performing post-approval action:', actionError);
          toast({
            title: "Warning",
            description: `Request status updated, but there was an error completing the ${requestToProcess.requestType} process. Please check the booking status.`,
            variant: "destructive",
          });
        }
      }
      
      // Update local state
      setRequests(requests.map(req => 
        req._id === requestId ? { ...req, status, adminNotes } : req
      ));
      
      toast({
        title: status === 'approved' ? "Request Approved" : "Request Rejected",
        description: `The request has been ${status} successfully. A notification has been sent to the user.`,
      });
      
      setShowResponseModal(false);
      setAdminNotes('');
      
      // Refresh data to ensure everything is up to date
      fetchData();
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const openResponseModal = (request: any) => {
    setSelectedRequest(request);
    setShowResponseModal(true);
  };
  
  const filteredRequests = requests.filter(req => {
    // Filter by tab
    if (activeTab !== 'all' && req.bookingType !== activeTab) {
      return false;
    }
    
    // Filter by request type
    if (activeRequestType !== 'all' && req.requestType !== activeRequestType) {
      return false;
    }
    
    return true;
  });

  // --- SUMMARY STATS ---
  const totalBookings = flightBookings.length + airTaxiBookings.length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const mostPopularFlightRoute = getMostPopularRoute(flightBookings);
  const mostPopularAirTaxiRoute = getMostPopularRoute(airTaxiBookings);



  return (
    <div className="min-h-screen flex flex-col">
      {/* --- SUMMARY CARDS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg border border-gray-100 shadow-sm text-center bg-white flex flex-col items-center text-xs">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-blue-500 mr-1" />
            <span className="font-bold text-blue-600 text-lg">{totalBookings}</span>
          </div>
          <div className="font-semibold text-navy-800">Total Bookings</div>
          <div className="text-navy-600">F: {flightBookings.length} | AT: {airTaxiBookings.length}</div>
        </div>
        <div className="p-3 rounded-lg border border-gray-100 shadow-sm text-center bg-white flex flex-col items-center text-xs">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-yellow-500 mr-1" />
            <span className="font-bold text-yellow-500 text-lg">{pendingRequests}</span>
          </div>
          <div className="font-semibold text-navy-800">Pending Requests</div>
          <div className="text-navy-600">Need attention</div>
        </div>
        <div className="p-3 rounded-lg border border-gray-100 shadow-sm text-center bg-white flex flex-col items-center text-xs">
          <div className="flex items-center justify-center mb-2">
            <Plane className="w-5 h-5 text-purple-500 mr-1" />
            <span className="font-bold text-purple-600 text-lg">{mostPopularFlightRoute.split('\n')[1] || 0}</span>
          </div>
          <div className="font-semibold text-navy-800">Popular Flight Route</div>
          <div className="text-navy-600 whitespace-pre-line">{mostPopularFlightRoute.split('\n')[0]}</div>
        </div>
        <div className="p-3 rounded-lg border border-gray-100 shadow-sm text-center bg-white flex flex-col items-center text-xs">
          <div className="flex items-center justify-center mb-2">
            <Plane className="w-5 h-5 text-green-500 mr-1" />
            <span className="font-bold text-green-600 text-lg">
              {/* Show booking count or 0 if not available */}
              {mostPopularAirTaxiRoute.split('\n')[1] || 0}
            </span>
          </div>
          <div className="font-semibold text-navy-800">Popular Air Taxi Route</div>
          <div className="text-navy-600 whitespace-pre-line">
            {/* Show the actual route or fallback */}
            {mostPopularAirTaxiRoute.split('\n')[0]}
          </div>
        </div>
      </div>

      {/* --- ANALYTICS CARDS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-3 flex flex-col">
          <h4 className="text-base font-semibold text-navy-800 mb-2">Monthly Booking Trends</h4>
          <div className="w-full max-w-xl mx-auto" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={generateMonthlyStats(flightBookings, airTaxiBookings)} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="flights" name="Flight Bookings" fill="#6366f1" barSize={12} />
                <Bar dataKey="airTaxis" name="Air Taxi Bookings" fill="#10b981" barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3 flex flex-col">
          <h4 className="text-base font-semibold text-navy-800 mb-2">Booking Status Distribution</h4>
          <div className="w-full max-w-xs mx-auto" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={generateStatusData(flightBookings, airTaxiBookings)} cx="40%" cy="50%" outerRadius={60} fill="#8884d8" dataKey="value">
                  {generateStatusData(flightBookings, airTaxiBookings).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{ fontSize: 12, right: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- MANAGE BOOKING REQUESTS --- */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-navy-800 mb-3">Manage Booking Requests</h2>
         
          <div className="flex gap-8 border-b border-slate-200 mb-5">
            <button className={`relative pb-2 text-base font-medium transition-colors duration-150 ${activeTab === 'all' ? 'text-navy-800' : 'text-slate-500 hover:text-navy-700'}`} onClick={() => setActiveTab('all')}>
              All Requests
              {activeTab === 'all' && <span className="absolute left-0 -bottom-[2px] w-full h-0.5 bg-navy-700 rounded"></span>}
            </button>
            <button className={`relative pb-2 text-base font-medium transition-colors duration-150 ${activeTab === 'flight' ? 'text-navy-800' : 'text-slate-500 hover:text-navy-700'}`} onClick={() => setActiveTab('flight')}>
              Flight Requests
              {activeTab === 'flight' && <span className="absolute left-0 -bottom-[2px] w-full h-0.5 bg-navy-700 rounded"></span>}
            </button>
            <button className={`relative pb-2 text-base font-medium transition-colors duration-150 ${activeTab === 'airtaxi' ? 'text-navy-800' : 'text-slate-500 hover:text-navy-700'}`} onClick={() => setActiveTab('airtaxi')}>
              Air Taxi Requests
              {activeTab === 'airtaxi' && <span className="absolute left-0 -bottom-[2px] w-full h-0.5 bg-navy-700 rounded"></span>}
            </button>
          </div>
     
          <div className="flex gap-3 mb-6">
            <button className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${activeRequestType === 'all' ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-navy-700 border-slate-300 hover:bg-navy-50'}`} onClick={() => setActiveRequestType('all')}>All Types</button>
            <button className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${activeRequestType === 'cancellation' ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-navy-700 border-slate-300 hover:bg-navy-50'}`} onClick={() => setActiveRequestType('cancellation')}>Cancellations</button>
            <button className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${activeRequestType === 'modification' ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-navy-700 border-slate-300 hover:bg-navy-50'}`} onClick={() => setActiveRequestType('modification')}>Modifications</button>
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-6">
            <p className="text-navy-600">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-navy-600">No requests found matching the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-xs">
              <thead className="bg-navy-50">
                <tr>
                  <th className="px-2 py-2 text-left font-medium text-navy-500 uppercase tracking-wider">Request ID</th>
                  <th className="px-2 py-2 text-left font-medium text-navy-500 uppercase tracking-wider">User</th>
                  <th className="px-2 py-2 text-left font-medium text-navy-500 uppercase tracking-wider">Booking Type</th>
                  <th className="px-2 py-2 text-left font-medium text-navy-500 uppercase tracking-wider">Request Type</th>
                  <th className="px-2 py-2 text-left font-medium text-navy-500 uppercase tracking-wider">Status</th>
                  <th className="px-2 py-2 text-left font-medium text-navy-500 uppercase tracking-wider">Date</th>
                  <th className="px-2 py-2 text-left font-medium text-navy-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-2 py-2 whitespace-nowrap text-navy-800">{request._id}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-navy-800">
                      <div>
                        <p className="font-medium">{request.userName}</p>
                        <p className="text-navy-500">{request.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-navy-800">{request.bookingType === 'flight' ? 'Flight' : 'Air Taxi'}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-navy-800">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.requestType === 'cancellation' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{request.requestType === 'cancellation' ? 'Cancellation' : 'Modification'}</span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-navy-800">{new Date(request.createdAt).toLocaleDateString()}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-navy-800">
                      {request.status === 'pending' ? (
                        <div className="flex space-x-2">
                          <button className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs" onClick={() => openResponseModal(request)}>Process</button>
                        </div>
                      ) : (
                        <span className="text-navy-500">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-navy-800 mb-3">
              Process {selectedRequest.requestType === 'cancellation' ? 'Cancellation' : 'Modification'} Request
            </h3>
            <div className="mb-3">
              <p className="text-navy-600 mb-1"><span className="font-medium">User:</span> {selectedRequest.userName} ({selectedRequest.userEmail})</p>
              <p className="text-navy-600 mb-1"><span className="font-medium">Booking Type:</span> {selectedRequest.bookingType === 'flight' ? 'Flight' : 'Air Taxi'}</p>
              <p className="text-navy-600 mb-1"><span className="font-medium">Request Type:</span> {selectedRequest.requestType === 'cancellation' ? 'Cancellation' : 'Modification'}</p>
              <p className="text-navy-600 mb-1"><span className="font-medium">Reason:</span> {selectedRequest.reason}</p>
              <p className="text-navy-600 mb-2"><span className="font-medium">Details:</span> {selectedRequest.details}</p>
            </div>
            <div className="mb-3">
              <label htmlFor="adminNotes" className="block text-xs font-medium text-navy-600 mb-1">Admin Notes</label>
              <textarea id="adminNotes" className="w-full p-2 border border-navy-200 rounded-md focus:ring-navy-500 focus:border-navy-500 text-xs" rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Provide notes about your decision" required />
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" className="px-3 py-1 border border-navy-300 rounded-md text-navy-700 hover:bg-navy-50 text-xs" onClick={() => setShowResponseModal(false)} disabled={isProcessing}>Cancel</button>
              <button type="button" className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs" onClick={() => handleProcessRequest(selectedRequest._id, 'rejected')} disabled={isProcessing}>{isProcessing ? 'Processing...' : 'Reject'}</button>
              <button type="button" className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs" onClick={() => handleProcessRequest(selectedRequest._id, 'approved')} disabled={isProcessing}>{isProcessing ? 'Processing...' : 'Approve'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
