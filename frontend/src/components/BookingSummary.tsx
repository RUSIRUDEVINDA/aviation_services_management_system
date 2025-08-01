import React, { useRef } from 'react';
import { Download, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface BookingSummaryProps {
  flightBooking: any;
  airTaxiBooking: any;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ flightBooking, airTaxiBooking }) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  
  const totalAmount = (flightBooking?.totalAmount || 0) + (airTaxiBooking?.totalAmount || 0);
  
  const handlePrint = () => {
    if (summaryRef.current) {
      const content = summaryRef.current;
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Booking Summary</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .summary { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .section { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
                .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: left; }
                th { background-color: #f0f4f9; }
              </style>
            </head>
            <body>
              ${content.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }
  };
  
  const downloadSummary = () => {
    if (summaryRef.current) {
      const content = summaryRef.current;
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Booking Summary</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .summary { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .section { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
                .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: left; }
                th { background-color: #f0f4f9; }
              </style>
            </head>
            <body>
              ${content.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        const blob = new Blob([printWindow.document.documentElement.outerHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Booking-Summary.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };
  
  if (!flightBooking && !airTaxiBooking) {
    return (
      <div className="glass rounded-xl p-6 mt-6 text-center">
        <h2 className="text-2xl font-bold text-navy-800">No Bookings Available</h2>
        <p className="text-navy-600 mt-2">You don't have any confirmed bookings to display.</p>
      </div>
    );
  }
  
  return (
    <div className="glass rounded-xl p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-navy-800">Booking Summary</h2>
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center px-3 py-2 bg-navy-50 text-navy-700 rounded-md hover:bg-navy-100 transition-colors"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            onClick={downloadSummary}
            className="flex items-center px-3 py-2 bg-navy-50 text-navy-700 rounded-md hover:bg-navy-100 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>
      </div>
      
      <div ref={summaryRef} className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center mb-6 border-b border-gray-200 pb-6">
          <h3 className="text-xl font-bold text-navy-800">AirWave Booking Summary</h3>
          <p className="text-navy-600">Thank you for choosing AirWave for your journey</p>
          <div className="mt-4">
            <QRCodeSVG value="AIRWAVE-SUMMARY" size={128} level="H" />
          </div>
        </div>
        
        {flightBooking && flightBooking.flights && flightBooking.flights.departure && (
          <div className="mb-6 border-b border-gray-200 pb-6">
            <h4 className="text-lg font-semibold text-navy-800 mb-4">Flight Booking</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-navy-700 font-medium mb-2">Flight Details</h5>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 text-navy-600">Booking ID:</td>
                      <td className="py-1 text-navy-800 font-medium">{flightBooking.bookingId}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-navy-600">Airline:</td>
                      <td className="py-1 text-navy-800">{flightBooking.flights.departure.airline}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-navy-600">Flight:</td>
                      <td className="py-1 text-navy-800">{flightBooking.flights.departure.id}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-navy-600">Route:</td>
                      <td className="py-1 text-navy-800">
                        {flightBooking.flights.departure.departureCity} ({flightBooking.flights.departure.departureAirport}) to {' '}
                        {flightBooking.flights.departure.arrivalCity} ({flightBooking.flights.departure.arrivalAirport})
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-navy-600">Date:</td>
                      <td className="py-1 text-navy-800">
                        {new Date(flightBooking.flights.departure.departureTime).toLocaleDateString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-navy-600">Time:</td>
                      <td className="py-1 text-navy-800">
                        {new Date(flightBooking.flights.departure.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-navy-600">Class:</td>
                      <td className="py-1 text-navy-800 capitalize">{flightBooking.flights.departure.class}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {flightBooking.passengers && Array.isArray(flightBooking.passengers) && flightBooking.passengers.length > 0 && (
                <div>
                  <h5 className="text-navy-700 font-medium mb-2">Passenger Information</h5>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-navy-600">Name</th>
                        <th className="text-left py-2 text-navy-600">Seat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flightBooking.passengers.map((passenger: any, index: number) => (
                        <tr key={index} className="border-b border-gray-50">
                          <td className="py-2 text-navy-800">
                            {passenger.firstName} {passenger.lastName}
                          </td>
                          <td className="py-2 text-navy-800">
                            {flightBooking.seats && flightBooking.seats[index]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <h5 className="text-navy-700 font-medium mb-2">Price Details</h5>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-navy-600">Base Price:</td>
                    <td className="py-2 text-navy-800 text-right">
                      ${(flightBooking.totalAmount * 0.8).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-navy-600">Taxes & Fees:</td>
                    <td className="py-2 text-navy-800 text-right">
                      ${(flightBooking.totalAmount * 0.2).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-navy-700 font-medium">Total:</td>
                    <td className="py-2 text-navy-800 font-bold text-right">
                      ${flightBooking.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {airTaxiBooking && (
          <div className="mb-6 border-b border-gray-200 pb-6">
            <h4 className="text-lg font-semibold text-navy-800 mb-4">Air Taxi Booking</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-navy-700 font-medium mb-2">Booking Details</h5>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 text-navy-600">Booking ID:</td>
                      <td className="py-1 text-navy-800 font-medium">{airTaxiBooking.bookingId}</td>
                    </tr>
                    {airTaxiBooking.pickup && (
                      <tr>
                        <td className="py-1 text-navy-600">Pickup:</td>
                        <td className="py-1 text-navy-800">{airTaxiBooking.pickup.name}</td>
                      </tr>
                    )}
                    {airTaxiBooking.destination && (
                      <tr>
                        <td className="py-1 text-navy-600">Destination:</td>
                        <td className="py-1 text-navy-800">{airTaxiBooking.destination.name}</td>
                      </tr>
                    )}
                    {airTaxiBooking.dateTime && (
                      <>
                        <tr>
                          <td className="py-1 text-navy-600">Date:</td>
                          <td className="py-1 text-navy-800">
                            {new Date(airTaxiBooking.dateTime).toLocaleDateString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 text-navy-600">Time:</td>
                          <td className="py-1 text-navy-800">
                            {new Date(airTaxiBooking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td className="py-1 text-navy-600">Passengers:</td>
                      <td className="py-1 text-navy-800">{airTaxiBooking.passengers}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h5 className="text-navy-700 font-medium mb-2">Contact Information</h5>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 text-navy-600">Name:</td>
                      <td className="py-1 text-navy-800">{airTaxiBooking.contactName}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-navy-600">Phone:</td>
                      <td className="py-1 text-navy-800">{airTaxiBooking.contactPhone}</td>
                    </tr>
                    {airTaxiBooking.specialRequests && (
                      <tr>
                        <td className="py-1 text-navy-600">Special Requests:</td>
                        <td className="py-1 text-navy-800">{airTaxiBooking.specialRequests}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                <h5 className="text-navy-700 font-medium mb-2 mt-4">Price Details</h5>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-navy-600">Base Price:</td>
                      <td className="py-2 text-navy-800 text-right">$150.00</td>
                    </tr>
                    {airTaxiBooking.passengers > 1 && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-navy-600">
                          Additional Passengers ({airTaxiBooking.passengers - 1}):
                        </td>
                        <td className="py-2 text-navy-800 text-right">
                          ${((airTaxiBooking.passengers - 1) * 50).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-2 text-navy-700 font-medium">Total:</td>
                      <td className="py-2 text-navy-800 font-bold text-right">
                        ${airTaxiBooking.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {(flightBooking || airTaxiBooking) && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-navy-800 mb-4">Total Summary</h4>
            
            <table className="w-full text-sm">
              <tbody>
                {flightBooking && flightBooking.totalAmount && (
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-navy-600">Flight Booking:</td>
                    <td className="py-2 text-navy-800 text-right">${flightBooking.totalAmount.toFixed(2)}</td>
                  </tr>
                )}
                
                {airTaxiBooking && airTaxiBooking.totalAmount && (
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-navy-600">Air Taxi Booking:</td>
                    <td className="py-2 text-navy-800 text-right">${airTaxiBooking.totalAmount.toFixed(2)}</td>
                  </tr>
                )}
                
                <tr>
                  <td className="py-2 text-navy-700 font-medium">Grand Total:</td>
                  <td className="py-2 text-navy-800 font-bold text-right">${totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        
        <div className="text-center text-navy-500 text-sm mt-8">
          <p>Thank you for choosing AirWave for your travel needs.</p>
          <p>For any assistance, please contact our customer service at support@airwave.com</p>
          <p>Booking reference: {flightBooking?.bookingId || airTaxiBooking?.bookingId || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
