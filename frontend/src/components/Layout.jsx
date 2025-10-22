import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);

  // Fetch cart count for customer users
  useEffect(() => {
    if (user?.role === 'customer') {
      fetchCartCount();
    }
  }, [user, location.pathname]);

  const fetchCartCount = async () => {
    try {
      const response = await api.get('/cart');
      if (response.data.success) {
        const totalItems = response.data.data.cart.reduce((sum, pharmacy) => 
          sum + pharmacy.items.reduce((s, item) => s + item.quantity, 0), 0
        );
        setCartItemCount(totalItems);
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(user?.role === 'customer' ? '/customer/dashboard' : user?.role === 'pharmacy' ? '/pharmacy/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/')}
                className="text-xl font-bold text-indigo-600 hover:text-indigo-700"
              >
                MedLink
              </button>
            </div>

            {/* Customer Navigation Menu */}
            {user?.role === 'customer' && (
              <nav className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => navigate('/customer/dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/customer/dashboard')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🔍 Search Medicines
                </button>
                <button
                  onClick={() => navigate('/customer/browse')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/customer/browse')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🏪 Browse Pharmacies
                </button>
                <button
                  onClick={() => navigate('/customer/cart')}
                  className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/customer/cart')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🛒 Cart
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </nav>
            )}
            
            {user && (
              <div className="flex items-center space-x-4">
                <span className="hidden sm:inline text-sm text-gray-600">
                  {user.name}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                  {user.role}
                </span>
                
                {/* Profile Button for Customer */}
                {user.role === 'customer' && (
                  <button
                    onClick={() => navigate('/customer/profile')}
                    className={`p-2 rounded-md transition-colors ${
                      isActive('/customer/profile')
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title="Profile"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                )}

                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Navigation Menu for Customer */}
          {user?.role === 'customer' && (
            <div className="md:hidden border-t border-gray-200 py-2">
              <nav className="flex items-center space-x-1 overflow-x-auto">
                <button
                  onClick={() => navigate('/customer/dashboard')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive('/customer/dashboard')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🔍 Search
                </button>
                <button
                  onClick={() => navigate('/customer/browse')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive('/customer/browse')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🏪 Browse
                </button>
                <button
                  onClick={() => navigate('/customer/cart')}
                  className={`relative flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive('/customer/cart')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🛒 Cart
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/customer/profile')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive('/customer/profile')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  👤 Profile
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;