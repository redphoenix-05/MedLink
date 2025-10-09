import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, loading, error, clearError, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' // Default to customer
  });

  const [validationError, setValidationError] = useState('');

  // Emergency reset function
  const handleEmergencyReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Only redirect if authenticated and not loading
  useEffect(() => {
    console.log('SignupPage auth state:', { isAuthenticated, loading });
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
    if (validationError) setValidationError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setValidationError('First name and last name are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
  const { confirmPassword, firstName, lastName, ...signupData } = formData;
      // Combine first and last name for backend
      const dataToSend = {
        ...signupData,
        name: `${firstName.trim()} ${lastName.trim()}`,
        role: formData.role // Use the selected role
      };
      await signup(dataToSend);
      navigate('/dashboard'); // Let DashboardRouter handle role-based routing
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  const currentError = validationError || error;

  // Debug info
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <LoadingSpinner size="large" text="Loading..." />
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
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Sign Up</h2>
          <p className="mt-2 text-gray-600">It's quick and easy.</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Error Alert */}
            {currentError && (
              <Alert 
                type="error" 
                message={currentError} 
                onClose={() => {
                  clearError();
                  setValidationError('');
                }}
              />
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="First name"
                />
              </div>
              <div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email address"
              />
            </div>

            {/* Role Selection */}
            <div>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="customer">Customer</option>
                <option value="pharmacy">Pharmacy</option>
              </select>
              <div className="text-xs text-gray-500 mt-1">
                Choose your account type
              </div>
            </div>
            
            {/* Password */}
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength="6"
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="New password"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength="6"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm password"
              />
            </div>

            {/* Terms and Privacy */}
            <div className="text-xs text-gray-500 leading-relaxed">
              By clicking Sign Up, you agree to our Terms, Data Policy and Cookie Policy. 
              You may receive SMS notifications from us and can opt out at any time.
            </div>

            {/* Sign Up Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Already have an account?
          </Link>
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

export default SignupPage;