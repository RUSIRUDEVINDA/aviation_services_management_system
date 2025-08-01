import React, { useState } from 'react';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PassengerDetailsProps {
  passengerCount: number;
  onContinue: (passengerDetails: any) => void;
  flightDetails: {
    outbound: {
      airline: string;
      id: string;
      departureTime: string;
      arrivalTime: string;
      price: number;
    };
    return?: {
      airline: string;
      id: string;
      departureTime: string;
      arrivalTime: string;
      price: number;
    };
    totalPrice: number;
  };
}

const PassengerDetails: React.FC<PassengerDetailsProps> = ({ passengerCount, onContinue, flightDetails }) => {
  const [formData, setFormData] = useState({
    contactInfo: {
      email: '',
      phoneNumber: ''
    },
    passengers: Array(passengerCount).fill({
      firstName: '',
      lastName: '',
      dob: '',
      nationality: '',
      passportNumber: '',
      specialRequests: '',
    }),
    flightDetails: {
      outbound: {
        airline: flightDetails.outbound.airline,
        flightNumber: flightDetails.outbound.id,
        departureTime: flightDetails.outbound.departureTime,
        arrivalTime: flightDetails.outbound.arrivalTime,
        price: flightDetails.outbound.price
      },
      return: flightDetails.return ? {
        airline: flightDetails.return.airline,
        flightNumber: flightDetails.return.id,
        departureTime: flightDetails.return.departureTime,
        arrivalTime: flightDetails.return.arrivalTime,
        price: flightDetails.return.price
      } : null,
      totalPrice: flightDetails.totalPrice
    }
  });

  const [validationErrors, setValidationErrors] = useState<any>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('passenger')) {
      const [, index, field] = name.split('-');
      const newPassengers = [...formData.passengers];
      newPassengers[parseInt(index)] = {
        ...newPassengers[parseInt(index)],
        [field]: value,
      };
      
      setFormData({
        ...formData,
        passengers: newPassengers,
      });
    } else if (name === 'contactEmail') {
      setFormData({
        ...formData,
        contactInfo: {
          ...formData.contactInfo,
          email: value
        }
      });
    } else if (name === 'contactPhone') {
      setFormData({
        ...formData,
        contactInfo: {
          ...formData.contactInfo,
          phoneNumber: value
        }
      });
    }
  };

  const validateForm = () => {
    const errors: any = {};
    
    // Validate contact details
    if (!formData.contactInfo.email) {
      errors.contactEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactInfo.email)) {
      errors.contactEmail = 'Email is invalid';
    }
    
    if (!formData.contactInfo.phoneNumber) {
      errors.contactPhone = 'Phone number is required';
    } else {
      // Remove all non-digit characters
      const phoneDigits = formData.contactInfo.phoneNumber.replace(/\D/g, '');
      
      // Check phone number length
      if (phoneDigits.length < 7) {
        errors.contactPhone = 'Phone number must be at least 7 digits long';
      } else if (phoneDigits.length > 15) {
        errors.contactPhone = 'Phone number cannot be longer than 15 digits';
      } else {
        // Check if it's a valid NANP number (10 digits)
        if (phoneDigits.length === 10) {
          // Validate NANP format (NXX-NXX-XXXX where N is 2-9 and X is 0-9)
          if (!/^([2-9]\d{2}){2}\d{4}$/.test(phoneDigits)) {
            errors.contactPhone = 'Invalid NANP phone number format';
          }
        }
        // Check if it's a valid international number (7-15 digits)
        else if (phoneDigits.length >= 7 && phoneDigits.length <= 15) {
          // Check for valid country codes
          const validCountryCodes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
          if (!validCountryCodes.includes(phoneDigits[0])) {
            errors.contactPhone = 'Invalid international phone number format';
          }
        }
      }
    }
    
    // Validate passenger details
    formData.passengers.forEach((passenger, index) => {
      // Name validation - no numbers or special characters
      const nameRegex = /^[a-zA-Z\s'-]+$/;
      
      if (!passenger.firstName) {
        errors[`passenger-${index}-firstName`] = 'First name is required';
      } else if (!nameRegex.test(passenger.firstName)) {
        errors[`passenger-${index}-firstName`] = 'Name cannot contain numbers or special characters';
      }
      
      if (!passenger.lastName) {
        errors[`passenger-${index}-lastName`] = 'Last name is required';
      } else if (!nameRegex.test(passenger.lastName)) {
        errors[`passenger-${index}-lastName`] = 'Name cannot contain numbers or special characters';
      }
      
      if (!passenger.dob) {
        errors[`passenger-${index}-dob`] = 'Date of birth is required';
      } else {
        const dobDate = new Date(passenger.dob);
        const today = new Date();
        if (isNaN(dobDate.getTime())) {
          errors[`passenger-${index}-dob`] = 'Invalid date format';
        } else if (dobDate > today) {
          errors[`passenger-${index}-dob`] = 'Date of birth cannot be in the future';
        }
      }
      
      // Nationality validation - only letters allowed
      if (!passenger.nationality) {
        errors[`passenger-${index}-nationality`] = 'Nationality is required';
      } else {
        const nationalityRegex = /^[a-zA-Z\s'-]+$/;
        if (!nationalityRegex.test(passenger.nationality)) {
          errors[`passenger-${index}-nationality`] = 'Nationality can only contain letters, spaces, and hyphens';
        }
      }
      
      // Passport number validation - ICAO standard (6-9 characters)
      if (passenger.passportNumber) {
        const passportNumber = passenger.passportNumber.trim();
        const passportRegex = /^[a-zA-Z0-9]{1,9}$/; // Allows 1-9 alphanumeric characters
        const hasLetter = /[a-zA-Z]/.test(passportNumber);
        const hasNumber = /\d/.test(passportNumber);
      
        if (!passportRegex.test(passportNumber) || !hasLetter || !hasNumber) {
          errors[`passenger-${index}-passportNumber`] =
            'Passport number must be 1-9 characters long, alphanumeric, and contain at least one letter and one number (ICAO standard)';
        }
      }      
      
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onContinue(formData);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Flight Information Form */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Flight Information</h2>
          
          {/* Outbound Flight Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label htmlFor="outboundAirline" className="block text-sm font-medium mb-2">
                Outbound Airline
              </label>
              <Input
                id="outboundAirline"
                name="outboundAirline"
                type="text"
                value={formData.flightDetails.outbound.airline}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <label htmlFor="outboundFlightNumber" className="block text-sm font-medium mb-2">
                Outbound Flight Number
              </label>
              <Input
                id="outboundFlightNumber"
                name="outboundFlightNumber"
                type="text"
                value={formData.flightDetails.outbound.flightNumber}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <label htmlFor="outboundDepartureTime" className="block text-sm font-medium mb-2">
                Outbound Departure Time
              </label>
              <Input
                id="outboundDepartureTime"
                name="outboundDepartureTime"
                type="text"
                value={formData.flightDetails.outbound.departureTime}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <label htmlFor="outboundArrivalTime" className="block text-sm font-medium mb-2">
                Outbound Arrival Time
              </label>
              <Input
                id="outboundArrivalTime"
                name="outboundArrivalTime"
                type="text"
                value={formData.flightDetails.outbound.arrivalTime}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="outboundPrice" className="block text-sm font-medium mb-2">
                Outbound Price
              </label>
              <Input
                id="outboundPrice"
                name="outboundPrice"
                type="text"
                value={`$${formData.flightDetails.outbound.price.toFixed(2)}`}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Return Flight Details (if applicable) */}
          {formData.flightDetails.return && (
            <>
              <h3 className="text-xl font-semibold mt-8 mb-6">Return Flight Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="returnAirline" className="block text-sm font-medium mb-2">
                    Return Airline
                  </label>
                  <Input
                    id="returnAirline"
                    name="returnAirline"
                    type="text"
                    value={formData.flightDetails.return.airline}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="returnFlightNumber" className="block text-sm font-medium mb-2">
                    Return Flight Number
                  </label>
                  <Input
                    id="returnFlightNumber"
                    name="returnFlightNumber"
                    type="text"
                    value={formData.flightDetails.return.flightNumber}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="returnDepartureTime" className="block text-sm font-medium mb-2">
                    Return Departure Time
                  </label>
                  <Input
                    id="returnDepartureTime"
                    name="returnDepartureTime"
                    type="text"
                    value={formData.flightDetails.return.departureTime}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="returnArrivalTime" className="block text-sm font-medium mb-2">
                    Return Arrival Time
                  </label>
                  <Input
                    id="returnArrivalTime"
                    name="returnArrivalTime"
                    type="text"
                    value={formData.flightDetails.return.arrivalTime}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="returnPrice" className="block text-sm font-medium mb-2">
                    Return Price
                  </label>
                  <Input
                    id="returnPrice"
                    name="returnPrice"
                    type="text"
                    value={`$${formData.flightDetails.return.price.toFixed(2)}`}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </>
          )}

          {/* Total Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="totalPrice" className="block text-sm font-medium mb-2">
                Total Price
              </label>
              <Input
                id="totalPrice"
                name="totalPrice"
                type="text"
                value={`$${formData.flightDetails.totalPrice.toFixed(2)}`}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="col-span-2">
              <label htmlFor="contactEmail" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactInfo.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={validationErrors.contactEmail ? 'border-destructive' : ''}
              />
              {validationErrors.contactEmail && (
                <p className="text-destructive text-sm mt-1">
                  {validationErrors.contactEmail}
                </p>
              )}
            </div>
            <div className="col-span-2">
              <label htmlFor="contactPhone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                value={formData.contactInfo.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number (e.g., +1 123-456-7890 or +44 1234 567890)"
                className={validationErrors.contactPhone ? 'border-destructive' : ''}
              />
              {validationErrors.contactPhone && (
                <p className="text-destructive text-sm mt-1">
                  {validationErrors.contactPhone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Passenger Details</h2>
          {formData.passengers.map((passenger, index) => (
            <div key={index} className="border-b pb-8 mb-8">
              <h3 className="text-xl font-semibold mb-6">
                Passenger {index + 1}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="col-span-2">
                  <label htmlFor={`passenger-${index}-firstName`} className="block text-sm font-medium mb-2">
                    First Name
                  </label>
                  <Input
                    id={`passenger-${index}-firstName`}
                    name={`passenger-${index}-firstName`}
                    type="text"
                    value={passenger.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    className={validationErrors[`passenger-${index}-firstName`] ? 'border-destructive' : ''}
                  />
                  {validationErrors[`passenger-${index}-firstName`] && (
                    <p className="text-destructive text-sm mt-1">
                      {validationErrors[`passenger-${index}-firstName`]}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <label htmlFor={`passenger-${index}-lastName`} className="block text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <Input
                    id={`passenger-${index}-lastName`}
                    name={`passenger-${index}-lastName`}
                    type="text"
                    value={passenger.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    className={validationErrors[`passenger-${index}-lastName`] ? 'border-destructive' : ''}
                  />
                  {validationErrors[`passenger-${index}-lastName`] && (
                    <p className="text-destructive text-sm mt-1">
                      {validationErrors[`passenger-${index}-lastName`]}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="col-span-2">
                  <label htmlFor={`passenger-${index}-dob`} className="block text-sm font-medium mb-2">
                    Date of Birth
                  </label>
                  <Input
                    id={`passenger-${index}-dob`}
                    name={`passenger-${index}-dob`}
                    type="date"
                    value={passenger.dob}
                    onChange={handleInputChange}
                    className={validationErrors[`passenger-${index}-dob`] ? 'border-destructive' : ''}
                  />
                  {validationErrors[`passenger-${index}-dob`] && (
                    <p className="text-destructive text-sm mt-1">
                      {validationErrors[`passenger-${index}-dob`]}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <label htmlFor={`passenger-${index}-nationality`} className="block text-sm font-medium mb-2">
                    Nationality
                  </label>
                  <Input
                    id={`passenger-${index}-nationality`}
                    name={`passenger-${index}-nationality`}
                    type="text"
                    value={passenger.nationality}
                    onChange={handleInputChange}
                    placeholder="Enter nationality (e.g., United States, Canada, United Kingdom)"
                    className={validationErrors[`passenger-${index}-nationality`] ? 'border-destructive' : ''}
                  />
                  {validationErrors[`passenger-${index}-nationality`] && (
                    <p className="text-destructive text-sm mt-1">
                      {validationErrors[`passenger-${index}-nationality`]}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="col-span-2">
                  <label htmlFor={`passenger-${index}-passportNumber`} className="block text-sm font-medium mb-2">
                    Passport Number
                  </label>
                  <Input
                    id={`passenger-${index}-passportNumber`}
                    name={`passenger-${index}-passportNumber`}
                    type="text"
                    value={passenger.passportNumber}
                    onChange={handleInputChange}
                    placeholder="Enter passport number (1-9 alphanumeric characters)"
                    className={validationErrors[`passenger-${index}-passportNumber`] ? 'border-destructive' : ''}
                  />
                  {validationErrors[`passenger-${index}-passportNumber`] && (
                    <p className="text-destructive text-sm mt-1">
                      {validationErrors[`passenger-${index}-passportNumber`]}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <label htmlFor={`passenger-${index}-specialRequests`} className="block text-sm font-medium mb-2">
                    Special Requests
                  </label>
                  <Input
                    id={`passenger-${index}-specialRequests`}
                    name={`passenger-${index}-specialRequests`}
                    type="text"
                    value={passenger.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Enter special requests (if any)"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors text-lg font-semibold"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );
};

export default PassengerDetails;
