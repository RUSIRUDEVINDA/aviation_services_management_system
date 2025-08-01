import React, { useState } from 'react';
import { Bell, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface NotificationProps {
  notifications: any[];
  onRefresh: () => void;
}

const UserNotifications: React.FC<NotificationProps> = ({ notifications, onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 border-green-100';
      case 'rejected':
        return 'bg-red-50 border-red-100';
      case 'pending':
        return 'bg-yellow-50 border-yellow-100';
      default:
        return 'bg-blue-50 border-blue-100';
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="glass rounded-xl p-6 mt-6 text-center">
        <h2 className="text-xl font-bold text-navy-800 mb-4">My Notifications</h2>
        <div className="flex justify-center mb-6">
          <Bell className="h-16 w-16 text-navy-300" />
        </div>
        <p className="text-navy-600 mb-4">You don't have any notifications yet.</p>
        <div className="bg-navy-50 p-4 rounded-lg max-w-lg mx-auto">
          <h3 className="font-medium text-navy-700 mb-2">About Notifications</h3>
          <p className="text-navy-600 text-sm">
            When an admin responds to your cancellation or modification requests, 
            you'll receive notifications here. You'll also be notified about important 
            updates regarding your bookings.
          </p>
        </div>
      </div>
    );
  }

  // Group notifications by date
  const groupedNotifications: { [key: string]: any[] } = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.createdAt).toLocaleDateString();
    if (!groupedNotifications[date]) {
      groupedNotifications[date] = [];
    }
    groupedNotifications[date].push(notification);
  });

  return (
    <div className="glass rounded-xl p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-navy-800">My Notifications</h2>
        <button 
          className="px-3 py-1.5 bg-navy-50 text-navy-700 rounded hover:bg-navy-100 text-sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="space-y-6">
        {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
          <div key={date} className="mb-6">
            <h3 className="text-sm font-medium text-navy-500 mb-3">{date}</h3>
            <div className="space-y-3">
              {dateNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`border rounded-lg overflow-hidden transition-all hover:shadow-md ${getStatusColor(notification.status)}`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getStatusIcon(notification.status)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-navy-800 font-medium">
                          {notification.title}
                        </h4>
                        <div className="text-navy-600 text-sm mt-1">
                          <p><span className="font-medium">Booking ID:</span> {notification.bookingId}</p>
                          <p><span className="font-medium">Request Type:</span> {notification.requestType}</p>
                          <p><span className="font-medium">Status:</span> {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}</p>
                          
                          {notification.adminNote && (
                            <div className="mt-2 bg-white bg-opacity-50 p-3 rounded-md">
                              <p className="font-medium">Admin Note:</p>
                              <p className="mt-1">{notification.adminNote}</p>
                            </div>
                          )}
                        </div>
                        <p className="text-navy-400 text-xs mt-2">
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserNotifications;
