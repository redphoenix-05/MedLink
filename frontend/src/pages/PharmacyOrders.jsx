import React from 'react';
import PharmacyLayout from '../components/PharmacyLayout';
import PharmacyOrdersPanel from '../components/PharmacyOrders';

const PharmacyOrdersPage = () => {
  return (
    <PharmacyLayout>
      <div className="space-y-6">
        <div className="bg-[#0B251D] bg-clinical-grid-dark rounded-2xl border border-[#193B2F] p-6 sm:p-8 text-[#F7F6F2]">
          <span className="font-mono-data text-[11px] uppercase tracking-[0.16em] text-[#3DD598]">
            Orders &amp; Revenue
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-white mt-1.5">
            Branch Orders &amp; Fulfillment
          </h1>
          <p className="text-sm text-[#B7CEC5] mt-1">
            Review incoming customer orders across all your branches and track net revenue.
          </p>
        </div>

        <PharmacyOrdersPanel />
      </div>
    </PharmacyLayout>
  );
};

export default PharmacyOrdersPage;
