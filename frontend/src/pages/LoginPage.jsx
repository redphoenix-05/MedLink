import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Emergency reset function
  const handleEmergencyReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Redirect if already authenticated
  useEffect(() => {
    console.log('LoginPage auth state:', { isAuthenticated, loading });
    if (isAuthenticated && !loading) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate('/dashboard'); // Let DashboardRouter handle role-based routing
    }
  }, [isAuthenticated, navigate, loading]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData);
      console.log('Login response:', response);
      // After successful login, navigate to dashboard
      // DashboardRouter will handle role-based routing
      if (response && response.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  // Debug info
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <LoadingSpinner size="large" text="Logging in..." />
        <p className="mt-4 text-gray-600">Auth loading: {String(loading)}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg mr-3 flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">MedLink</span>
          </Link>
          <p className="mt-4 text-lg text-gray-600">Connect with your healthcare provider</p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Alert */}
            {error && (
              <Alert 
                type="error" 
                message={error} 
                onClose={clearError}
              />
            )}

            {/* Email or Username */}
            <div>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="Email address or username"
              />
            </div>

            {/* Password */}
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="Password"
              />
            </div>

            {/* Login Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  'Log In'
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-center">
              <a
                href="#"
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                Forgotten password?
              </a>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
          </div>

          {/* Sign Up Button */}
          <div className="mt-6">
            <Link
              to="/signup"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
            >
              Create New Account
            </Link>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-4 p-4 bg-yellow-100 rounded-lg text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Loading: {String(loading)}</p>
          <p>Authenticated: {String(isAuthenticated)}</p>
          <p>Error: {error || 'None'}</p>
          <button
            onClick={handleEmergencyReset}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-xs"
          >
            Clear Storage & Reload
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;