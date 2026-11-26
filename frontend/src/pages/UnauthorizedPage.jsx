import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-[#F7F6F2] bg-clinical-grid flex items-center justify-center px-5">
      <div className="max-w-md w-full bg-white border border-[#E4E1D8] rounded-2xl p-8 sm:p-10 text-center shadow-[0_16px_40px_-20px_rgba(18,24,22,0.12)]">
        <div className="w-14 h-14 mx-auto rounded-xl bg-[#FBECE6] text-[#C85A32] flex items-center justify-center mb-6">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <span className="font-mono-data text-xs uppercase tracking-[0.16em] text-[#C85A32]">
          403 · Restricted Portal
        </span>
        <h1 className="font-editorial text-4xl text-[#121816] mt-2 mb-3">
          Access Denied
        </h1>
        <p className="text-sm text-[#4E5B55] leading-relaxed mb-8">
          Your current account role does not have permission to view this section. Return to your assigned dashboard or head back home.
        </p>
        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#0F4C3A] text-[#F7F6F2] text-sm font-semibold hover:bg-[#16634C] transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to my dashboard
          </Link>
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#FAF9F6] border border-[#D4D0C5] text-[#121816] text-sm font-semibold hover:bg-[#EFECE5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
