import React, { useState } from 'react';
import { createRequest } from '../services/api';
import { toast } from "@/hooks/use-toast";

interface RequestFormProps {
  userId: string;
  userEmail: string;
  userName: string;
  bookingId: string;
  bookingType: 'flight' | 'airtaxi';
  requestType?: 'modification' | 'cancellation';
  onClose: () => void;
  onSuccess: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({
  userId,
  userEmail,
  userName,
  bookingId,
  bookingType,
  requestType: initialRequestType,
  onClose,
  onSuccess
}) => {
  const [requestType, setRequestType] = useState<'modification' | 'cancellation'>(initialRequestType || 'cancellation');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!userName || userName.trim() === '') {
      setError('User name is required to submit the request.');
      return;
    }
    if (!reason || !details) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await createRequest({
        userId,
        userEmail,
        userName,
        bookingId,
        bookingType,
        requestType,
        reason,
        details,
        requestDate: new Date().toISOString()
      });
      toast({
        title: "Request Submitted",
        description: `Your ${requestType} request has been submitted successfully and is pending approval.`,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-navy-800">
            {requestType === 'cancellation' ? 'Request Cancellation' : 'Request Modification'}
          </h3>
          <button
            type="button"
            className="text-navy-500 hover:text-navy-700"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {!initialRequestType && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-navy-600 mb-1">
                Request Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="mr-2"
                    checked={requestType === 'cancellation'}
                    onChange={() => setRequestType('cancellation')}
                  />
                  Cancellation
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="mr-2"
                    checked={requestType === 'modification'}
                    onChange={() => setRequestType('modification')}
                  />
                  Modification
                </label>
              </div>
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-navy-600 mb-1">
              Reason for {requestType === 'cancellation' ? 'Cancellation' : 'Modification'}
            </label>
            <select
              id="reason"
              className="w-full p-2 border border-navy-200 rounded-md focus:ring-navy-500 focus:border-navy-500"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            >
              <option value="">Select a reason</option>
              {requestType === 'cancellation' ? (
                <>
                  <option value="Change of plans">Change of plans</option>
                  <option value="Found better alternative">Found better alternative</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Health issues">Health issues</option>
                  <option value="Weather concerns">Weather concerns</option>
                  <option value="Other">Other</option>
                </>
              ) : (
                <>
                  <option value="Change date/time">Change date/time</option>
                  <option value="Change destination">Change destination</option>
                  <option value="Change passenger details">Change passenger details</option>
                  <option value="Add special requests">Add special requests</option>
                  <option value="Other">Other</option>
                </>
              )}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="details" className="block text-sm font-medium text-navy-600 mb-1">
              Additional Details
            </label>
            <textarea
              id="details"
              className="w-full p-2 border border-navy-200 rounded-md focus:ring-navy-500 focus:border-navy-500"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={requestType === 'modification'
                ? "Please provide specific details about your requested changes"
                : "Please provide any additional information about your cancellation request"}
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-navy-300 rounded-md text-navy-700 hover:bg-navy-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;