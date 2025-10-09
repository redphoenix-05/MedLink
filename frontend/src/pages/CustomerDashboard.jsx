import React from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const CustomerDashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🏥</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome, {user?.name}!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Find medicines and pharmacies in your neighborhood
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Search Feature
                </h3>
                <p className="text-gray-600 text-sm">
                  Search for medicines and check availability at nearby pharmacies
                </p>
                <p className="text-primary-600 font-medium mt-4">
                  Coming Soon!
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="text-3xl mb-3">📍</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Pharmacy Locator
                </h3>
                <p className="text-gray-600 text-sm">
                  Find pharmacies near your location with directions
                </p>
                <p className="text-primary-600 font-medium mt-4">
                  Coming Soon!
                </p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-primary-50 rounded-lg">
              <h2 className="text-xl font-semibold text-primary-800 mb-2">
                What's Next?
              </h2>
              <p className="text-primary-700">
                Stage 2 will introduce medicine search, pharmacy inventory management, 
                and location-based features. Stay tuned!
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDashboard;