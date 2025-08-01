import React, { useState } from 'react';
import { CreditCard, Calendar, Lock } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface PaymentProps {
  amount: number;
  onComplete: (paymentDetails: any) => void;
  isProcessing: boolean;
}

const Payment: React.FC<PaymentProps> = ({ amount, onComplete, isProcessing }) => {
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveCard: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate cardholder name - no numbers or special characters
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    } else if (!nameRegex.test(formData.cardholderName)) {
      newErrors.cardholderName = 'Name cannot contain numbers or special characters';
    }
    
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else {
      // More lenient validation - only check if it has at least 13 digits after removing spaces
      const digits = formData.cardNumber.replace(/\s/g, '');
      if (!/^\d{13,19}$/.test(digits)) {
        newErrors.cardNumber = 'Card number must be between 13 and 19 digits';
      }
    }
    
    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Expiry date must be in MM/YY format';
    } else {
      // Check if expiry date is valid and not in the past
      const [expiryMonth, expiryYear] = formData.expiryDate.split('/').map(Number);
      const expiryDate = new Date(2000 + expiryYear, expiryMonth - 1, 1);
      
      // Set to end of month
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      expiryDate.setDate(0);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      if (expiryDate < tomorrow) {
        newErrors.expiryDate = 'Card expiry date must be in the future';
      }
    }
    
    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{1,4}/g);
    const match = matches ? matches.join(' ') : '';
    return match;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData({
      ...formData,
      cardNumber: formatted,
    });
    
    if (errors.cardNumber) {
      setErrors({
        ...errors,
        cardNumber: '',
      });
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    value = value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    
    setFormData({
      ...formData,
      expiryDate: value,
    });
    
    if (errors.expiryDate) {
      setErrors({
        ...errors,
        expiryDate: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Call the onComplete callback
        onComplete({
          ...formData,
          amount,
          success: true,
          transactionId: Math.random().toString(36).substring(2, 15)
        });
      } catch (error) {
        console.error('Payment error:', error);
        toast({
          title: "Payment Failed",
          description: "Failed to process payment. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="glass rounded-xl p-6 mt-6">
      <h2 className="text-2xl font-bold text-navy-800 mb-6">Payment</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="cardholderName" className="block text-sm font-medium text-navy-600 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                id="cardholderName"
                name="cardholderName"
                className={`form-control ${errors.cardholderName ? 'border-red-500' : ''}`}
                value={formData.cardholderName}
                onChange={handleInputChange}
                placeholder="John Smith"
              />
              {errors.cardholderName && (
                <p className="mt-1 text-sm text-red-500">{errors.cardholderName}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="cardNumber" className="block text-sm font-medium text-navy-600 mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  className={`form-control pl-10 ${errors.cardNumber ? 'border-red-500' : ''}`}
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                <CreditCard className="h-5 w-5 text-navy-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-navy-600 mb-1">
                  Expiry Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    className={`form-control pl-10 ${errors.expiryDate ? 'border-red-500' : ''}`}
                    value={formData.expiryDate}
                    onChange={handleExpiryDateChange}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  <Calendar className="h-5 w-5 text-navy-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                {errors.expiryDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-navy-600 mb-1">
                  CVV
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="cvv"
                    name="cvv"
                    className={`form-control pl-10 ${errors.cvv ? 'border-red-500' : ''}`}
                    value={formData.cvv}
                    onChange={handleInputChange}
                    maxLength={4}
                    autoComplete="off"
                    required
                  />
                  <Lock className="h-5 w-5 text-navy-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                {errors.cvv && (
                  <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="saveCard"
                  name="saveCard"
                  className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-gray-300 rounded"
                  checked={formData.saveCard}
                  onChange={handleInputChange}
                />
                <label htmlFor="saveCard" className="ml-2 block text-sm text-navy-600">
                  Save card for future payments
                </label>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.history.back()}
                disabled={isProcessing}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span>Pay ${amount.toFixed(2)}</span>
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-navy-800 mb-4">Payment Summary</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-navy-600">Ticket Price:</span>
              <span className="text-navy-800 font-medium">${(amount * 0.85).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-navy-600">Taxes & Fees:</span>
              <span className="text-navy-800 font-medium">${(amount * 0.15).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-navy-800 font-semibold">Total:</span>
              <span className="text-navy-800 font-bold">${amount.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="bg-navy-50 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="mr-3 text-navy-600">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-navy-800 font-medium text-sm">Secure Payment</h4>
                <p className="text-navy-600 text-sm mt-1">
                  Your payment information is encrypted and secure. We do not store your credit card details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
