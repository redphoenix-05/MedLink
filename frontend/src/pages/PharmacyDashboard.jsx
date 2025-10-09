import React from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const PharmacyDashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome, {user?.name}!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Manage your pharmacy inventory and serve customers better
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="text-3xl mb-3">📦</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Inventory Management
                </h3>
                <p className="text-gray-600 text-sm">
                  Add, update, and manage your medicine inventory with real-time stock levels
                </p>
                <p className="text-primary-600 font-medium mt-4">
                  Coming Soon!
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Sales Analytics
                </h3>
                <p className="text-gray-600 text-sm">
                  Track sales, popular medicines, and customer demand patterns
                </p>
                <p className="text-primary-600 font-medium mt-4">
                  Coming Soon!
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-6">
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="text-3xl mb-3">👥</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Customer Requests
                </h3>
                <p className="text-gray-600 text-sm">
                  View and respond to customer medicine availability requests
                </p>
                <p className="text-primary-600 font-medium mt-4">
                  Coming Soon!
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="text-3xl mb-3">🔔</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Low Stock Alerts
                </h3>
                <p className="text-gray-600 text-sm">
                  Get notified when medicines are running low in stock
                </p>
                <p className="text-primary-600 font-medium mt-4">
                  Coming Soon!
                </p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-primary-50 rounded-lg">
              <h2 className="text-xl font-semibold text-primary-800 mb-2">
                Pharmacy Features Coming Soon
              </h2>
              <p className="text-primary-700">
                Stage 2 will introduce complete inventory management, customer interaction tools, 
                and analytics dashboard. Get ready to streamline your pharmacy operations!
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PharmacyDashboard;