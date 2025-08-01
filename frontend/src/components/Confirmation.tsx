import React, { useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, Printer, Download, Mail, Users, Plane } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import AirTaxiReceipt from './AirTaxiReceipt';

interface ConfirmationProps {
  bookingDetails: any;
  bookingType: 'flight' | 'air-taxi';
}

const Confirmation: React.FC<ConfirmationProps> = ({ bookingDetails, bookingType }) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  // Generate random terminal and gate information
  const generateRandomTerminal = () => {
    const terminals = ['T1', 'T2', 'T3', 'T4', 'International'];
    return terminals[Math.floor(Math.random() * terminals.length)];
  };

  const generateRandomGate = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const number = Math.floor(Math.random() * 30) + 1;
    return `${letter}${number}`;
  };

  // Memoize the generated values so they don't change on re-renders
  const outboundTerminal = useMemo(() => bookingDetails?.outbound?.terminal || generateRandomTerminal(), [bookingDetails?.outbound?.terminal]);
  const outboundGate = useMemo(() => bookingDetails?.outbound?.gate || generateRandomGate(), [bookingDetails?.outbound?.gate]);
  const returnTerminal = useMemo(() => bookingDetails?.return?.terminal || generateRandomTerminal(), [bookingDetails?.return?.terminal]);
  const returnGate = useMemo(() => bookingDetails?.return?.gate || generateRandomGate(), [bookingDetails?.return?.gate]);

  const createQRCodeValue = (details: any, type: 'flight' | 'air-taxi') => {
    const qrData = {
      id: details._id,
      type,
      date: type === 'flight' 
        ? details.departureDate 
        : details.dateTime,
      from: type === 'flight' 
        ? details.from 
        : details.pickup.name,
      to: type === 'flight' 
        ? details.to 
        : details.destination.name,
      status: 'confirmed',
      passengers: type === 'flight' 
        ? details.passengersDetails.length 
        : details.passengerCount,
    };
    
    return `AeroX:${JSON.stringify(qrData)}`;
  };

  const handlePrint = () => {
    if (ticketRef.current) {
      const content = ticketRef.current;
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>E-Ticket</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .e-ticket { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .flight-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
                .passenger-info { margin-bottom: 20px; }
                .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
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

  const downloadTicket = () => {
    if (ticketRef.current) {
      const element = ticketRef.current;
      
      const opt = {
        margin: 1,
        filename: `${bookingType === 'flight' ? 'Flight' : 'Air Taxi'}-Ticket-${bookingDetails._id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
    }
  };

  return (
    <div className="glass rounded-xl p-6 mt-6 animate-fade-in">
      <div className="bg-green-50 rounded-lg p-4 mb-6 flex items-center">
        <div className="bg-green-100 rounded-full p-2 mr-3">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-green-800 font-medium">Booking Confirmed!</h3>
          <p className="text-green-700 text-sm">
            {bookingType === 'flight' 
              ? 'Your flight booking has been confirmed.' 
              : 'Your air taxi booking has been confirmed.'
            } 
            {bookingDetails?.contactInfo?.email && (
              <span>A confirmation email has been sent to {bookingDetails.contactInfo.email}.</span>
            )}
          </p>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-navy-800 mb-6">Booking Details</h2>
      
      <div ref={ticketRef} className="bg-white rounded-xl overflow-hidden shadow-md p-6 mb-6">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-navy-800">AeroX</h3>
            <p className="text-navy-600 text-sm">E-Ticket</p>
          </div>
          <div>
            <p className="text-right text-navy-800 font-semibold">Booking ID: {bookingDetails?.bookingId}</p>
            <p className="text-right text-navy-600 text-sm">Issued: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        {bookingType === 'flight' ? (
          <>
            <h4 className="text-lg font-semibold text-navy-800 mb-3">Booking Information</h4>
            <div className="bg-navy-50/50 p-4 rounded-lg mb-6">
              <div className="text-sm text-navy-600">
                <p>Booking Date: {new Date().toLocaleDateString()}</p>
                <p>Status: {bookingDetails?.status || 'Confirmed'}</p>
                <p>Departure City: {bookingDetails?.outbound?.departureCity || 'Not specified'}</p>
                <p>Arrival City: {bookingDetails?.outbound?.arrivalCity || 'Not specified'}</p>
                <p>Departure Date: {bookingDetails?.outbound?.departureDate || 'Not specified'}</p>
                {bookingDetails?.return && (
                  <p>Return Date: {bookingDetails?.return?.departureDate || 'Not specified'}</p>
                )}
              </div>
            </div>

            <h4 className="text-lg font-semibold text-navy-800 mb-3">Flight Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="bg-navy-50/50 p-4 rounded-lg">
                <p className="text-navy-600 text-sm mb-1">Outbound Flight</p>
                {bookingDetails?.outbound && (
                  <>
                    <p className="text-navy-800 font-semibold">
                      {bookingDetails.outbound.airline} - {bookingDetails.outbound.id}
                    </p>
                    
                    <div className="flex items-center gap-2 text-navy-600 mb-2">
                      <Plane className="w-4 h-4" />
                      <span>{bookingDetails.outbound.departureTime} - {bookingDetails.outbound.arrivalTime}</span>
                    </div>
                    <div className="text-sm text-navy-600">
                      <p>Departure Airport: {bookingDetails.outbound.departureAirport}</p>
                      <p>Arrival Airport: {bookingDetails.outbound.arrivalAirport}</p>
                      <p>Terminal: {outboundTerminal}</p>
                      <p>Gate: {outboundGate}</p>
                      <p>Class: {bookingDetails?.flightcabin || 'Economy'}</p>
                      <p>Departure Date: {bookingDetails.outbound.departureDate || 'Not specified'}</p>
                      <p>Seat: {bookingDetails.seats?.outbound?.join(', ') || 'Not assigned'}</p>
                    </div>
                  </>
                )}
              </div>
              
              {bookingDetails?.return && (
                <div className="bg-navy-50/50 p-4 rounded-lg">
                  <p className="text-navy-600 text-sm mb-1">Return Flight</p>
                  <p className="text-navy-800 font-semibold">
                    {bookingDetails.return.airline} - {bookingDetails.return.id}
                  </p>
                  <div className="flex items-center gap-2 text-navy-600 mb-2">
                    <Plane className="w-4 h-4" />
                    <span>{bookingDetails.return.departureTime} - {bookingDetails.return.arrivalTime}</span>
                  </div>
                  <div className="text-sm text-navy-600">
                    <p>Departure Airport: {bookingDetails.return.departureAirport}</p>
                    <p>Arrival Airport: {bookingDetails.return.arrivalAirport}</p>
                    <p>Terminal: {returnTerminal}</p>
                    <p>Gate: {returnGate}</p>
                    <p>Class: {bookingDetails?.flightcabin || 'Economy'}</p>
                    <p>Return Date: {bookingDetails.return.departureDate || 'Not specified'}</p>
                    <p>Seat: {bookingDetails.seats?.return?.join(', ') || 'Not assigned'}</p>
                  </div>
                </div>
              )}
            </div>

            <h4 className="text-lg font-semibold text-navy-800 mt-6 mb-3">Passenger Details</h4>
            <div className="space-y-4">
              {bookingDetails?.passengers?.map((passenger: any, index: number) => (
                <div key={index} className="bg-navy-50/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-navy-800 font-medium">
                        {passenger.firstName} {passenger.lastName}
                      </p>
                      <p className="text-sm text-navy-600">Nationality: {passenger.nationality}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-navy-600" />
                      <span className="text-sm text-navy-600">Passenger {index + 1}</span>
                    </div>
                  </div>
                  <div className="text-sm text-navy-600">
                    <p>Passport: {passenger.passportNumber}</p>
                    <p>Date of Birth: {new Date(passenger.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="text-lg font-semibold text-navy-800 mt-6 mb-3">Contact Information</h4>
            <div className="bg-navy-50/50 p-4 rounded-lg">
              <div className="text-sm text-navy-600">
                <p>Email: {bookingDetails?.contactInfo?.email}</p>
                <p>Phone: {bookingDetails?.contactInfo?.phoneNumber}</p>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-navy-800 mt-6 mb-3">Total Amount</h4>
            <div className="bg-navy-50/50 p-4 rounded-lg">
              <div className="text-sm text-navy-600">
                <p>Total Amount: ${bookingDetails?.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </>
        ) : (
          // Air taxi details
          <AirTaxiReceipt bookingDetails={bookingDetails} />
        )}
      </div>

      <div className="flex justify-center space-x-4 mt-6">
        <button 
          onClick={downloadTicket}
          className="flex items-center gap-2 px-4 py-2 bg-navy-500 text-white rounded-lg hover:bg-navy-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download E-ticket
        </button>
        {/* Print button removed for all booking types */}
      </div>
    </div>
  );
};

export default Confirmation;