import React from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">👨‍💼</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome, {user?.name}!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              System administration and oversight controls
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Pharmacy Verification
                </h3>
                <p className="text-gray-600 text-sm">
                  Review and verify pharmacy registrations and credentials
                </p>
                <p className="text-primary-600 font-medium mt-4">
                  Coming Soon!
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="text-3xl mb-3">👥</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  User Management
                </h3>
                <p className="text-gray-600 text-sm">
                  Manage user accounts, roles, and permissions across the platform
                </p>
                <p className="text-primary-600 font-medium mt-4">
                  Coming Soon!
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-6">
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  System Analytics
                </h3>
                <p className="text-gray-600 text-sm">
                  Monitor platform usage, user activity, and system performance
                </p>
                <p className="text-primary-600 font-medium mt-4">
                  Coming Soon!
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="text-3xl mb-3">🛡️</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Security Controls
                </h3>
                <p className="text-gray-600 text-sm">
                  Manage security settings, audit logs, and access controls
                </p>
                <p className="text-primary-600 font-medium mt-4">
                  Coming Soon!
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-6">
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Content Moderation
                </h3>
                <p className="text-gray-600 text-sm">
                  Review and moderate user-generated content and reports
                </p>
                <p className="text-primary-600 font-medium mt-4">
                  Coming Soon!
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="text-3xl mb-3">⚙️</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  System Settings
                </h3>
                <p className="text-gray-600 text-sm">
                  Configure global system settings and platform parameters
                </p>
                <p className="text-primary-600 font-medium mt-4">
                  Coming Soon!
                </p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-red-50 rounded-lg border border-red-200">
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Admin Controls Coming Soon
              </h2>
              <p className="text-red-700">
                Stage 2 will introduce comprehensive admin features including pharmacy verification, 
                user management, system monitoring, and security controls.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;