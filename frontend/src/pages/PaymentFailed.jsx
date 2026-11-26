import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ShoppingCart, Store } from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  const tranId = searchParams.get('tran_id');
  const reason = searchParams.get('reason');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/customer/cart');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <CustomerLayout>
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-[#E4E1D8] rounded-2xl p-8 text-center shadow-[0_16px_40px_-20px_rgba(18,24,22,0.12)]">
          <div className="mx-auto w-14 h-14 bg-[#FDF2F0] text-[#9A2E1B] rounded-xl flex items-center justify-center mb-5">
            <XCircle className="w-7 h-7" />
          </div>

          <span className="font-mono-data text-xs uppercase tracking-[0.14em] text-[#9A2E1B]">
            Payment Declined
          </span>
          <h1 className="font-editorial text-4xl text-[#121816] mt-1.5 mb-2">
            Payment Failed
          </h1>
          <p className="text-sm text-[#4E5B55] mb-6">
            {reason ? decodeURIComponent(reason) : 'Your payment could not be completed. No charges were made.'}
          </p>

          {tranId && (
            <div className="bg-[#FAF9F6] border border-[#E4E1D8] rounded-xl p-4 mb-6 flex justify-between items-center text-sm">
              <span className="text-[#4E5B55]">Transaction ID</span>
              <span className="font-mono-data text-xs font-semibold text-[#121816]">{tranId}</span>
            </div>
          )}

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => navigate('/customer/cart')}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0F4C3A] text-[#F7F6F2] px-5 py-3 rounded-lg hover:bg-[#16634C] transition text-sm font-semibold cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Return to cart &amp; retry
            </button>
            <button
              type="button"
              onClick={() => navigate('/customer/browse')}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#FAF9F6] border border-[#D4D0C5] text-[#121816] px-5 py-3 rounded-lg hover:bg-[#EFECE5] transition text-sm font-semibold cursor-pointer"
            >
              <Store className="w-4 h-4" />
              Browse pharmacies
            </button>
          </div>

          <p className="font-mono-data text-xs text-[#78857F] mt-6">
            Redirecting to cart in {countdown}s...
          </p>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default PaymentFailed;
