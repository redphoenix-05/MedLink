import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get('reservation_id');
  const error = searchParams.get('error');

  useEffect(() => {
    toast.error('Payment failed. Please try again.', {
      autoClose: 5000,
    });
  }, []);

  const getErrorMessage = () => {
    switch (error) {
      case 'missing_params':
        return 'Required payment parameters are missing.';
      case 'invalid_payment':
        return 'Payment validation failed. Please try again.';
      case 'reservation_not_found':
        return 'Reservation not found. Please contact support.';
      case 'transaction_mismatch':
        return 'Transaction ID mismatch. Please contact support.';
      case 'server_error':
        return 'Server error occurred. Please try again later.';
      default:
        return 'An error occurred during payment processing.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-6">
          {getErrorMessage()}
        </p>

        {/* Reservation Details */}
        {reservationId && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Reservation ID:</span>
              <span className="font-semibold text-gray-800">#{reservationId}</span>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Need help?</strong> If you continue experiencing issues, 
            please contact our support team at support@medlink.com
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-200"
          >
            Back to Home
          </button>
        </div>

        {/* Help Links */}
        <div className="mt-6 space-y-2">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium block w-full"
          >
            View My Reservations
          </button>
          <button
            onClick={() => window.location.href = 'mailto:support@medlink.com'}
            className="text-gray-600 hover:text-gray-700 text-sm font-medium block w-full"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
