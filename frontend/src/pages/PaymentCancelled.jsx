import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomerLayout from '../components/CustomerLayout';

const PaymentCancelled = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get('reservation_id');

  useEffect(() => {
    toast.warning('Payment was cancelled.', {
      autoClose: 5000,
    });
  }, []);

  return (
    <CustomerLayout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Warning Icon */}
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Cancelled Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          You cancelled the payment process. Your reservation is still pending.
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>No worries!</strong> Your reservation is still saved. 
            You can complete the payment anytime from your dashboard.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
          >
            Complete Payment
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-200"
          >
            Back to Home
          </button>
        </div>

        {/* Additional Options */}
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-3">Changed your mind?</p>
          <button
            onClick={() => {
              // TODO: Implement reservation cancellation
              toast.info('Reservation cancellation feature coming soon!');
            }}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Cancel Reservation
          </button>
        </div>
      </div>
      </div>
    </CustomerLayout>
  );
};

export default PaymentCancelled;
