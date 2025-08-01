import React, { useState } from 'react';
import { CalendarClock, Users, Clock, MapPin, Plane, Shield, Umbrella } from 'lucide-react';
import { format, addHours, isBefore } from 'date-fns';
import { parseISO } from "date-fns";



interface AirTaxiConfirmationProps {
  bookingDetails: {
    pickup: { name: string, city: string };
    destination: { name: string, city: string };
    dateTime: string;
    passengers: number;
    taxiModel?: {
      id: number;
      name: string;
      image: string;
      capacity: number;
      description: string;
      price: number;
    };
  };
  onConfirm: (contactDetails: any) => void;
  isLoading: boolean;
}

const AirTaxiConfirmation: React.FC<AirTaxiConfirmationProps> = ({ bookingDetails, onConfirm, isLoading }) => {
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [weatherInfo, setWeatherInfo] = useState<any>({
    temperature: 72,
    condition: 'Sunny',
    windSpeed: 8,
    visibility: 'Excellent'
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const estimatedDuration = 30; 

  // Calculate price based on selected taxi model or use default pricing - with safer null checks
  const basePrice = bookingDetails.taxiModel ? bookingDetails.taxiModel.price : 150;
  const passengerCount = bookingDetails.passengers || 1;


  const totalPrice = bookingDetails.taxiModel 
    ? bookingDetails.taxiModel.price 
    : basePrice + (passengerCount - 1) * 50;

  const validateForm = () => {
    const newErrors: any = {};

    // Name validation - no numbers or special characters
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    } else if (!nameRegex.test(contactName)) {
      newErrors.contactName = 'Name cannot contain numbers or special characters';
    }

    // Phone validation - improved for international standards
    if (!contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    } else {
      // Only digits, +, spaces and hyphens allowed
      const phoneRegex = /^[+\d\s-]+$/;
      if (!phoneRegex.test(contactPhone)) {
        newErrors.contactPhone = 'Invalid characters in phone number';
      } else {
      
        const digitsOnly = contactPhone.replace(/\D/g, '');
        // Check for valid length according to international standards (E.164)
        if (digitsOnly.length < 7) {
          newErrors.contactPhone = 'Phone number is too short';
        } else if (digitsOnly.length > 15) {
          newErrors.contactPhone = 'Phone number exceeds maximum length (15 digits)';
        }
      }
    }

    // Email validation
    if (!contactEmail.trim()) {
      newErrors.contactEmail = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail)) {
        newErrors.contactEmail = 'Please enter a valid email address';
      }
    }

    // Validate booking date is not in the past
    if (bookingDetails.dateTime) {
      const bookingDate = parseISO(bookingDetails.dateTime);
      const now = new Date();

      if (isBefore(bookingDate, now)) {
        newErrors.dateTime = 'Booking date cannot be in the past';
      }
    }

    // Terms and conditions validation
    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions to proceed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onConfirm({
        ...bookingDetails,
        contactName,
        contactPhone,
        contactEmail,
        specialRequests,
        totalAmount: totalPrice,
        passengerCount: passengerCount,
        selectedTaxi: bookingDetails.taxiModel // Include full taxi details
      });
    } else if (errors.dateTime) {
      // Show date time error if present
      alert(errors.dateTime);
    }
  };

  return (
    <div className="glass rounded-xl p-6 mt-6">
      <h2 className="text-2xl font-bold text-navy-800 mb-6">Confirm Air Taxi Booking</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-navy-700 mb-4">Booking Details</h3>

          <div className="space-y-4">
            {/* Taxi Details Section - Prominently Displayed at the Top */}
            {bookingDetails.taxiModel && (
              <div className="bg-navy-50 p-4 rounded-lg mb-4">
                <div className="flex items-center">
                  <Plane className="h-6 w-6 text-navy-600 mr-3" />
                  <div>
                    <h3 className="text-navy-800 font-bold text-lg">Selected Air Taxi</h3>
                    <div className="flex items-center mt-2">
                      {bookingDetails.taxiModel.image && (
                        <img 
                          src={bookingDetails.taxiModel.image} 
                          alt={bookingDetails.taxiModel.name} 
                          className="w-16 h-16 object-cover rounded-md mr-4"
                        />
                      )}
                      <div>
                        <p className="text-navy-800 font-semibold text-xl">{bookingDetails.taxiModel.name}</p>
                        <p className="text-navy-600">{bookingDetails.taxiModel.description}</p>
                        <div className="flex items-center mt-1">
                          <Users className="h-4 w-4 mr-2 text-navy-600" />
                          <span className="text-navy-700">{bookingDetails.taxiModel.capacity} passengers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-navy-600 mt-0.5 mr-3" />
              <div>
                <p className="text-navy-600 text-sm">Pickup Location</p>
                <p className="text-navy-800 font-medium">{bookingDetails.pickup.name}</p>
                <p className="text-navy-600 text-sm">{bookingDetails.pickup.city}</p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-navy-600 mt-0.5 mr-3" />
              <div>
                <p className="text-navy-600 text-sm">Destination</p>
                <p className="text-navy-800 font-medium">{bookingDetails.destination.name}</p>
                <p className="text-navy-600 text-sm">{bookingDetails.destination.city}</p>
              </div>
            </div>

            <div className="flex items-start">
              <CalendarClock className="h-5 w-5 text-navy-600 mt-0.5 mr-3" />
              <div>
                <p className="text-navy-600 text-sm">Date & Time</p>
                <p className="text-navy-800 font-medium">
                  {format(parseISO(bookingDetails.dateTime), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-navy-800 font-medium">
                  {format(parseISO(bookingDetails.dateTime), 'h:mm a')}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Users className="h-5 w-5 text-navy-600 mt-0.5 mr-3" />
              <div>
                <p className="text-navy-600 text-sm">Passengers</p>
                <p className="text-navy-800 font-medium">
                  {passengerCount} {passengerCount === 1 ? 'passenger' : 'passengers'}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="h-5 w-5 text-navy-600 mt-0.5 mr-3" />
              <div>
                <p className="text-navy-600 text-sm">Estimated Duration</p>
                <p className="text-navy-800 font-medium">{estimatedDuration} minutes</p>
                <p className="text-navy-600 text-sm">
                  Arrival: {format(addHours(parseISO(bookingDetails.dateTime), estimatedDuration / 60), 'h:mm a')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-navy-700 mb-4">Price Details</h3>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-navy-600">Base Price:</span>
              <span className="text-navy-800 font-medium">${basePrice.toFixed(2)}</span>
            </div>

            {passengerCount > 1 && !bookingDetails.taxiModel && (
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-navy-600">
                  Additional Passengers ({passengerCount - 1}):
                </span>
                <span className="text-navy-800 font-medium">
                  ${((passengerCount - 1) * 50).toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between pt-1">
              <span className="text-navy-800 font-semibold">Total:</span>
              <span className="text-navy-800 font-bold">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-navy-50 p-3 rounded-lg text-sm text-navy-700">
            <p>Price includes:</p>
            <ul className="list-disc list-inside mt-1 text-navy-600">
              <li>Professional pilot</li>
              <li>Fuel and airport fees</li>
              <li>15 kg luggage allowance per passenger</li>
              <li>Complimentary refreshments</li>
              {bookingDetails.taxiModel && bookingDetails.taxiModel.description && (
                <li className="font-medium text-navy-700 mt-2">{bookingDetails.taxiModel.description}</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Weather Information Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-navy-700 mb-4">Weather Forecast</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-navy-50 p-3 rounded-full mr-4">
              {weatherInfo.condition === 'Sunny' && (
                <svg className="h-8 w-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
              {weatherInfo.condition === 'Cloudy' && (
                <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                </svg>
              )}
              {weatherInfo.condition === 'Rainy' && (
                <Umbrella className="h-8 w-8 text-blue-500" />
              )}
            </div>
            <div>
              <h4 className="text-xl font-bold text-navy-800">{weatherInfo.temperature}°F</h4>
              <p className="text-navy-600">{weatherInfo.condition}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="mb-2">
              <span className="text-navy-600 text-sm">Wind Speed:</span>
              <span className="text-navy-800 ml-2 font-medium">{weatherInfo.windSpeed} mph</span>
            </div>
            <div>
              <span className="text-navy-600 text-sm">Visibility:</span>
              <span className="text-navy-800 ml-2 font-medium">{weatherInfo.visibility}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-navy-600 bg-navy-50 p-3 rounded-lg">
          <p>Weather conditions are favorable for your flight. Our pilots will continuously monitor conditions and notify you of any significant changes.</p>
        </div>
      </div>

      {/* Cancellation Policy Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-navy-700 mb-4">Cancellation Policy</h3>

        <div className="space-y-3">
          <div className="flex items-start">
            <div className="bg-green-100 p-1 rounded-full mr-3">
              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-navy-800 font-medium">Free cancellation up to 24 hours before departure</p>
              <p className="text-navy-600 text-sm">Full refund with no questions asked</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-yellow-100 p-1 rounded-full mr-3">
              <svg className="h-4 w-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-navy-800 font-medium">Cancellation within 12-24 hours of departure</p>
              <p className="text-navy-600 text-sm">75% refund of the total booking amount</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-red-100 p-1 rounded-full mr-3">
              <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-navy-800 font-medium">Cancellation within 12 hours of departure</p>
              <p className="text-navy-600 text-sm">50% refund of the total booking amount</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-red-100 p-1 rounded-full mr-3">
              <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-navy-800 font-medium">No-show</p>
              <p className="text-navy-600 text-sm">No refund will be provided</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-navy-700 mb-4">Contact Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-navy-600 mb-1">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="contactName"
                className={`form-control ${errors.contactName ? 'border-red-500' : ''}`}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Enter your full name"
              />
              {errors.contactName && (
                <p className="mt-1 text-sm text-red-500">{errors.contactName}</p>
              )}
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-navy-600 mb-1">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="contactPhone"
                className={`form-control ${errors.contactPhone ? 'border-red-500' : ''}`}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (123) 456-7890"
              />
              {errors.contactPhone && (
                <p className="mt-1 text-sm text-red-500">{errors.contactPhone}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="contactEmail" className="block text-sm font-medium text-navy-600 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="contactEmail"
              className={`form-control ${errors.contactEmail ? 'border-red-500' : ''}`}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
            {errors.contactEmail && (
              <p className="mt-1 text-sm text-red-500">{errors.contactEmail}</p>
            )}
          </div>

          <div>
            <label htmlFor="specialRequests" className="block text-sm font-medium text-navy-600 mb-1">
              Special Requests (Optional)
            </label>
            <textarea
              id="specialRequests"
              className="form-control h-24"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requirements or requests"
            ></textarea>
          </div>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className={`h-4 w-4 text-navy-600 focus:ring-navy-500 border-gray-300 rounded ${errors.terms ? 'border-red-500' : ''}`}
                checked={acceptedTerms}
                onChange={() => setAcceptedTerms(!acceptedTerms)}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium text-navy-700">I accept the terms and conditions</label>
              <p className="text-navy-500">By checking this box, you agree to our <a href="#" className="text-navy-600 underline">Terms of Service</a>, <a href="#" className="text-navy-600 underline">Privacy Policy</a>, and the cancellation policy outlined above.</p>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-500">{errors.terms}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
            Back
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span>Continue to Payment (${totalPrice.toFixed(2)})</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AirTaxiConfirmation;
