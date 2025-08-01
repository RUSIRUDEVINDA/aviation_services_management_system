import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Printer, Download, CheckCircle, MapPin, Calendar, Clock, Users, CreditCard } from 'lucide-react';

interface AirTaxiReceiptProps {
  bookingDetails: any;
}

const AirTaxiReceipt: React.FC<AirTaxiReceiptProps> = ({ bookingDetails }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading the booking details from the database
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptContent = document.getElementById('receipt-content');
    if (!receiptContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printDocument = printWindow.document;
    printDocument.write('<html><head><title>AeroX Air Taxi Booking Receipt</title>');
    printDocument.write('<link rel="stylesheet" href="/src/index.css" type="text/css" media="print"/>');
    printDocument.write('</head><body>');
    printDocument.write(receiptContent.innerHTML);
    printDocument.write('</body></html>');
    printDocument.close();

    // Convert to PDF or trigger download
    printWindow.print();
  };

  if (isLoading || !bookingDetails) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'h:mm a');
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none">
      {/* Receipt Header */}
      <div className="bg-navy-700 text-white p-6 print:bg-navy-700 print:text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Booking Confirmation</h2>
            <p className="text-navy-100">AeroX Air Taxi Service</p>
          </div>
          <div className="hidden print:block">
            <img src="/images/logo.png" alt="AeroX Logo" className="h-12" />
          </div>
          <div className="flex space-x-3 print:hidden">
            
          </div>
        </div>
      </div>

      {/* Receipt Content */}
      <div id="receipt-content" className="p-6">
        {/* Confirmation Message */}
        <div className="flex items-center mb-6 bg-green-50 p-4 rounded-lg">
          <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-green-700">Booking Confirmed</h3>
            <p className="text-green-600">Your air taxi has been successfully booked!</p>
          </div>
        </div>

        {/* Booking Reference */}
        <div className="mb-6 border-b pb-4">
          <h3 className="text-lg font-semibold text-navy-800 mb-2">Booking Reference</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-navy-600 text-sm">Booking ID</p>
              <p className="text-navy-800 font-medium">{bookingDetails.bookingId || bookingDetails._id}</p>
            </div>
            <div>
              <p className="text-navy-600 text-sm">Booking Date</p>
              <p className="text-navy-800 font-medium">{formatDate(bookingDetails.createdAt || new Date().toISOString())}</p>
            </div>
          </div>
        </div>

        {/* Air Taxi Details */}
        <div className="mb-6 border-b pb-4">
          <h3 className="text-lg font-semibold text-navy-800 mb-2">Air Taxi Details</h3>
          <div className="bg-navy-50 p-4 rounded-lg mb-4">
            <div className="flex items-center">
              <div>
                <h4 className="text-navy-800 font-bold">{bookingDetails.taxiModel?.name || bookingDetails.selectedTaxi?.name}</h4>
                <p className="text-navy-600">{bookingDetails.taxiModel?.description || bookingDetails.selectedTaxi?.description}</p>
                <div className="flex items-center mt-1">
                  <Users className="h-4 w-4 mr-2 text-navy-600" />
                  <span className="text-navy-700">Capacity: {bookingDetails.taxiModel?.capacity || bookingDetails.selectedTaxi?.capacity} passengers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Journey Details */}
        <div className="mb-6 border-b pb-4">
          <h3 className="text-lg font-semibold text-navy-800 mb-2">Journey Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-navy-600 mt-0.5 mr-3" />
              <div>
                <p className="text-navy-600 text-sm">Pickup Location</p>
                <p className="text-navy-800 font-medium">{bookingDetails.pickup?.name}</p>
                <p className="text-navy-600 text-sm">{bookingDetails.pickup?.city}</p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-navy-600 mt-0.5 mr-3" />
              <div>
                <p className="text-navy-600 text-sm">Destination</p>
                <p className="text-navy-800 font-medium">{bookingDetails.destination?.name}</p>
                <p className="text-navy-600 text-sm">{bookingDetails.destination?.city}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-navy-600 mt-0.5 mr-3" />
              <div>
                <p className="text-navy-600 text-sm">Date</p>
                <p className="text-navy-800 font-medium">{formatDate(bookingDetails.dateTime)}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="h-5 w-5 text-navy-600 mt-0.5 mr-3" />
              <div>
                <p className="text-navy-600 text-sm">Time</p>
                <p className="text-navy-800 font-medium">{formatTime(bookingDetails.dateTime)}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Users className="h-5 w-5 text-navy-600 mt-0.5 mr-3" />
              <div>
                <p className="text-navy-600 text-sm">Passengers</p>
                <p className="text-navy-800 font-medium">{bookingDetails.passengers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="mb-6 border-b pb-4">
          <h3 className="text-lg font-semibold text-navy-800 mb-2">Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-navy-600 text-sm">Name</p>
              <p className="text-navy-800 font-medium">{bookingDetails.contactName}</p>
            </div>
            <div>
              <p className="text-navy-600 text-sm">Email</p>
              <p className="text-navy-800 font-medium">{bookingDetails.contactEmail}</p>
            </div>
            <div>
              <p className="text-navy-600 text-sm">Phone</p>
              <p className="text-navy-800 font-medium">{bookingDetails.contactPhone}</p>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {bookingDetails.specialRequests && (
          <div className="mb-6 border-b pb-4">
            <h3 className="text-lg font-semibold text-navy-800 mb-2">Special Requests</h3>
            <p className="text-navy-700">{bookingDetails.specialRequests}</p>
          </div>
        )}

        {/* Payment Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-navy-800 mb-2">Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <CreditCard className="h-5 w-5 text-navy-600 mt-0.5 mr-3" />
              <div>
                <p className="text-navy-600 text-sm">Payment Method</p>
                <p className="text-navy-800 font-medium">
                  {bookingDetails.paymentMethod?.type === 'credit_card' ? 'Credit Card' : 'Online Payment'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-navy-600 text-sm">Total Amount</p>
              <p className="text-navy-800 font-bold text-xl">${bookingDetails.totalAmount}</p>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mt-8 text-sm text-navy-500">
          <h4 className="font-medium text-navy-600 mb-2">Terms and Conditions</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Please arrive at the pickup location 15 minutes before the scheduled departure time.</li>
            <li>Cancellations made less than 24 hours before the scheduled departure may incur a fee.</li>
            <li>A valid ID is required for all passengers at the time of boarding.</li>
            <li>Luggage allowance is limited to one standard-sized bag per passenger.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-navy-500 text-sm">
          <p>Thank you for choosing AeroX Air Taxi Service!</p>
          <p>For any assistance, please contact our customer support at support@aerox.com or call +1-800-AEROX-HELP</p>
        </div>
      </div>
    </div>
  );
};

export default AirTaxiReceipt;
