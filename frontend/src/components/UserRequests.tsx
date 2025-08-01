import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, XCircle, RefreshCw, Filter } from 'lucide-react';

interface RequestProps {
  requests: any[];
  onRefresh: () => void;
}

type FilterType = 'all' | 'cancellation' | 'modification';

const UserRequests: React.FC<RequestProps> = ({ requests, onRefresh }) => {
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  

  useEffect(() => {

    const sortedRequests = [...requests].sort((a, b) => {
      const dateA = new Date(a.requestDate || a.createdAt).getTime();
      const dateB = new Date(b.requestDate || b.createdAt).getTime();
      return dateB - dateA;
    });

    // Apply filter
    if (activeFilter === 'all') {
      setFilteredRequests(sortedRequests);
    } else {
      setFilteredRequests(sortedRequests.filter(req => req.requestType === activeFilter));
    }
  }, [requests, activeFilter]);

  // Format date as DD/MM/YYYY HH:mm
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      // Format as DD/MM/YYYY HH:mm
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 mr-1" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };
  
  const handleRefresh = () => {
    setIsLoading(true);
    onRefresh();
    // Add a small delay to simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  // Get requests by type for counts and section display
  const cancellationRequests = filteredRequests.filter(req => req.requestType === 'cancellation');
  const modificationRequests = filteredRequests.filter(req => req.requestType === 'modification');
  
  // Render functions to avoid conditional hooks
  const renderEmptyState = () => {
    return (
      <div className="glass rounded-xl p-6 mt-6 text-center shadow-sm">
        <h2 className="text-xl font-bold text-navy-800 mb-4">My Requests</h2>
        <p className="text-navy-600 mb-6">You don't have any cancellation or modification requests yet.</p>
        <div className="bg-navy-50/70 p-5 rounded-xl max-w-lg mx-auto border border-navy-100/50 shadow-sm">
          <h3 className="font-medium text-navy-700 mb-3">About Requests</h3>
          <p className="text-navy-600 text-sm leading-relaxed">
            When you request a cancellation or modification for a booking, it will appear here.
            You can track the status of your requests and receive updates on their progress.
          </p>
        </div>
      </div>
    );
  };
  
  const renderFilteredEmptyState = () => {
    return (
      <div className="glass rounded-xl p-6 mt-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-navy-800">My Requests</h2>
          <button 
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${isLoading ? 'bg-navy-100 text-navy-600 cursor-not-allowed' : 'bg-navy-50 text-navy-700 hover:bg-navy-100 hover:shadow-sm'}`}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {/* Filter tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-navy-600" />
            <span className="text-navy-600 text-sm font-medium">Filter by type:</span>
          </div>
          <div className="inline-flex p-1 bg-navy-50/50 rounded-lg shadow-sm">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeFilter === 'all' 
                ? 'bg-white text-navy-800 shadow-sm' 
                : 'text-navy-600 hover:bg-navy-100/50'}`}
            >
              All Requests
              <span className="ml-2 bg-navy-100 text-navy-600 text-xs px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('cancellation')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeFilter === 'cancellation' 
                ? 'bg-white text-navy-800 shadow-sm' 
                : 'text-navy-600 hover:bg-navy-100/50'}`}
            >
              Cancellations
              <span className="ml-2 bg-navy-100 text-navy-600 text-xs px-2 py-0.5 rounded-full">
                {requests.filter(req => req.requestType === 'cancellation').length}
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('modification')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeFilter === 'modification' 
                ? 'bg-white text-navy-800 shadow-sm' 
                : 'text-navy-600 hover:bg-navy-100/50'}`}
            >
              Modifications
              <span className="ml-2 bg-navy-100 text-navy-600 text-xs px-2 py-0.5 rounded-full">
                {requests.filter(req => req.requestType === 'modification').length}
              </span>
            </button>
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="bg-navy-50/70 p-5 rounded-xl max-w-lg mx-auto border border-navy-100/50 shadow-sm">
            <h3 className="font-medium text-navy-700 mb-3">No {activeFilter} requests found</h3>
            <p className="text-navy-600 text-sm leading-relaxed">
              {activeFilter === 'cancellation' 
                ? 'You don\'t have any cancellation requests matching the current filter.'
                : activeFilter === 'modification'
                ? 'You don\'t have any modification requests matching the current filter.'
                : 'No requests found matching the current filter.'}
            </p>
            <button 
              onClick={() => setActiveFilter('all')} 
              className="mt-4 px-4 py-2 bg-navy-100 text-navy-700 rounded-lg text-sm hover:bg-navy-200 transition-colors"
            >
              View all requests
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Check conditions and return appropriate view
  if (!requests || requests.length === 0) {
    return renderEmptyState();
  }
  
  if (requests.length > 0 && filteredRequests.length === 0) {
    return renderFilteredEmptyState();
  }
  
  // Main render function for requests
  const renderRequests = () => {
    return (
      <div className="glass rounded-xl p-6 mt-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-navy-800">My Requests</h2>
          <button 
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${isLoading ? 'bg-navy-100 text-navy-600 cursor-not-allowed' : 'bg-navy-50 text-navy-700 hover:bg-navy-100 hover:shadow-sm'}`}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {/* Filter tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-navy-600" />
            <span className="text-navy-600 text-sm font-medium">Filter by type:</span>
          </div>
          <div className="inline-flex p-1 bg-navy-50/50 rounded-lg shadow-sm">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeFilter === 'all' 
                ? 'bg-white text-navy-800 shadow-sm' 
                : 'text-navy-600 hover:bg-navy-100/50'}`}
            >
              All Requests
              <span className="ml-2 bg-navy-100 text-navy-600 text-xs px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('cancellation')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeFilter === 'cancellation' 
                ? 'bg-white text-navy-800 shadow-sm' 
                : 'text-navy-600 hover:bg-navy-100/50'}`}
            >
              Cancellations
              <span className="ml-2 bg-navy-100 text-navy-600 text-xs px-2 py-0.5 rounded-full">
                {requests.filter(req => req.requestType === 'cancellation').length}
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('modification')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeFilter === 'modification' 
                ? 'bg-white text-navy-800 shadow-sm' 
                : 'text-navy-600 hover:bg-navy-100/50'}`}
            >
              Modifications
              <span className="ml-2 bg-navy-100 text-navy-600 text-xs px-2 py-0.5 rounded-full">
                {requests.filter(req => req.requestType === 'modification').length}
              </span>
            </button>
          </div>
        </div>
        
        {cancellationRequests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-navy-700">Cancellation Requests</h3>
              <span className="bg-navy-50 text-navy-600 text-xs px-2 py-0.5 rounded-full">{cancellationRequests.length}</span>
            </div>
            <div className="space-y-4">
              {cancellationRequests.map((request) => (
                <div 
                  key={request._id || request.id || `cancellation-${request.bookingId}-${request._id || Math.random().toString(36).substring(2, 9)}`}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all hover:shadow-md shadow-sm"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-navy-800">
                        Cancellation for {request.bookingType === 'flight' ? 'Flight' : 'Air Taxi'} Booking
                      </h3>
                      <span className="text-navy-500 text-xs font-medium bg-navy-50/50 px-2 py-1 rounded-md">
                        {formatDate(request.requestDate || request.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="w-full">
                        <div className="flex items-center mb-3">
                          <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusBadgeClass(request.status)}`}> 
                            {getStatusIcon(request.status)}
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center bg-navy-50/50 text-navy-700 text-sm px-3 py-1 rounded-lg">
                            Booking ID: {request.bookingId || 'N/A'}
                          </span>
                        </div>
                        {request.reason && (
                          <div className="mt-3 text-navy-600 text-sm">
                            <p className="font-medium text-navy-700">Reason:</p>
                            <p className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">{request.reason}</p>
                          </div>
                        )}
                        {request.details && (
                          <div className="mt-3 text-navy-600 text-sm">
                            <p className="font-medium text-navy-700">Details:</p>
                            <p className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">{request.details}</p>
                          </div>
                        )}
                        {request.adminNotes && request.status !== 'pending' && (
                          <div className="mt-3 text-navy-600 text-sm">
                            <p className="font-medium text-navy-700">Admin Response:</p>
                            <p className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">{request.adminNotes}</p>
                          </div>
                        )}
                        {request.refundAmount > 0 && (
                          <div className="mt-3 flex justify-end">
                            <span className="bg-green-50 text-green-700 font-bold px-4 py-2 rounded-lg border border-green-100 shadow-sm">
                              Refund: ${request.refundAmount.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {modificationRequests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-navy-700">Modification Requests</h3>
              <span className="bg-navy-50 text-navy-600 text-xs px-2 py-0.5 rounded-full">{modificationRequests.length}</span>
            </div>
            <div className="space-y-4">
              {modificationRequests.map((request) => (
                <div 
                  key={request._id || request.id || `modification-${request.bookingId}-${request._id || Math.random().toString(36).substring(2, 9)}`}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all hover:shadow-md shadow-sm"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-navy-800">
                        Modification for {request.bookingType === 'flight' ? 'Flight' : 'Air Taxi'} Booking
                      </h3>
                      <span className="text-navy-500 text-xs font-medium bg-navy-50/50 px-2 py-1 rounded-md">
                        {formatDate(request.requestDate || request.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="w-full">
                        <div className="flex items-center mb-3">
                          <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusBadgeClass(request.status)}`}> 
                            {getStatusIcon(request.status)}
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center bg-navy-50/50 text-navy-700 text-sm px-3 py-1 rounded-lg">
                            Booking ID: {request.bookingId || 'N/A'}
                          </span>
                        </div>
                        {request.reason && (
                          <div className="mt-3 text-navy-600 text-sm">
                            <p className="font-medium text-navy-700">Reason:</p>
                            <p className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">{request.reason}</p>
                          </div>
                        )}
                        {request.details && (
                          <div className="mt-3 text-navy-600 text-sm">
                            <p className="font-medium text-navy-700">Details:</p>
                            <p className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">{request.details}</p>
                          </div>
                        )}
                        {request.adminNotes && request.status !== 'pending' && (
                          <div className="mt-3 text-navy-600 text-sm">
                            <p className="font-medium text-navy-700">Admin Response:</p>
                            <p className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">{request.adminNotes}</p>
                          </div>
                        )}
                        {request.additionalFee > 0 && (
                          <div className="mt-3 flex justify-end">
                            <span className="bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-lg border border-blue-100 shadow-sm">
                              Additional Fee: ${request.additionalFee.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Return the main content
  return renderRequests();
};

export default UserRequests;
