import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AlertTriangle, ArrowLeft, LayoutDashboard } from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';

const PaymentCancelled = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get('reservation_id');

  useEffect(() => {
    toast.warning('Payment was cancelled.', { autoClose: 5000 });
  }, []);

  return (
    <CustomerLayout>
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-[#E4E1D8] rounded-2xl p-8 text-center shadow-[0_16px_40px_-20px_rgba(18,24,22,0.12)]">
          <div className="mx-auto w-14 h-14 bg-[#FDF8EC] text-[#B45309] rounded-xl flex items-center justify-center mb-5">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <span className="font-mono-data text-xs uppercase tracking-[0.14em] text-[#B45309]">
            Checkout Interrupted
          </span>
          <h1 className="font-editorial text-4xl text-[#121816] mt-1.5 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-sm text-[#4E5B55] mb-6">
            You cancelled the payment flow. Your items remain saved so you can complete checkout anytime.
          </p>

          {reservationId && (
            <div className="bg-[#FAF9F6] border border-[#E4E1D8] rounded-xl p-4 mb-6 flex justify-between items-center text-sm">
              <span className="text-[#4E5B55]">Reservation ID</span>
              <span className="font-mono-data font-semibold text-[#121816]">#{reservationId}</span>
            </div>
          )}

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => navigate('/customer/dashboard')}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0F4C3A] text-[#F7F6F2] px-5 py-3 rounded-lg hover:bg-[#16634C] transition text-sm font-semibold cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              Return to dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#FAF9F6] border border-[#D4D0C5] text-[#121816] px-5 py-3 rounded-lg hover:bg-[#EFECE5] transition text-sm font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default PaymentCancelled;
