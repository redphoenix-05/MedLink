import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Building2,
  MapPin,
  Phone,
  FileText,
  CheckCircle2,
} from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, loading, error, clearError, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    firstName: '',
    lastName: '',
    pharmacyName: '',
    ownerName: '',
    address: '',
    licenseNumber: '',
    phone: '',
  });

  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, loading]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
    if (validationError) setValidationError('');
  };

  const setRole = (role) => {
    setFormData((prev) => ({ ...prev, role }));
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

    if (formData.role === 'customer') {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setValidationError('First name and last name are required');
        return false;
      }
    } else if (formData.role === 'pharmacy') {
      if (
        !formData.pharmacyName.trim() ||
        !formData.ownerName.trim() ||
        !formData.address.trim() ||
        !formData.licenseNumber.trim() ||
        !formData.phone.trim()
      ) {
        setValidationError('All pharmacy fields are required');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const { confirmPassword, ...signupData } = formData;

      let dataToSend;
      if (formData.role === 'customer') {
        const {
          firstName,
          lastName,
          pharmacyName,
          ownerName,
          address,
          licenseNumber,
          ...customerData
        } = signupData;
        dataToSend = {
          ...customerData,
          name: `${firstName.trim()} ${lastName.trim()}`,
          role: 'customer',
        };
      } else {
        const {
          firstName,
          lastName,
          pharmacyName,
          ownerName,
          address,
          licenseNumber,
          phone,
          ...pharmacyData
        } = signupData;
        dataToSend = {
          ...pharmacyData,
          name: ownerName.trim(),
          role: 'pharmacy',
          pharmacyName: pharmacyName.trim(),
          address: address.trim(),
          licenseNumber: licenseNumber.trim(),
          phone: phone.trim(),
        };
      }

      const response = await signup(dataToSend);

      if (response && response.success) {
        if (formData.role === 'pharmacy') {
          navigate('/pharmacy/dashboard');
        } else {
          navigate('/customer/dashboard');
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  const currentError = validationError || error;
  const inputBase =
    'w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#D4D0C5] rounded-lg text-sm text-[#121816] placeholder-[#78857F] focus:bg-white focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/15 transition outline-none';
  const labelBase =
    'block text-xs font-semibold uppercase tracking-wider text-[#4E5B55] mb-1.5';

  return (
    <div className="min-h-screen bg-[#F7F6F2] grid lg:grid-cols-12">
      {/* Left Architectural Panel */}
      <aside className="hidden lg:flex lg:col-span-5 bg-[#0B251D] bg-clinical-grid-dark text-[#F7F6F2] p-12 flex-col justify-between border-r border-[#193B2F]">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#163D30] flex items-center justify-center p-1.5">
              <img
                src="/logo.png"
                alt="MedLink"
                className="w-full h-full object-contain brightness-0 invert"
              />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block leading-none">
                MedLink
              </span>
              <span className="font-mono-data text-[10px] uppercase tracking-[0.14em] text-[#8FB3A5]">
                Pharmacy Index
              </span>
            </div>
          </Link>

          <div className="mt-16">
            <span className="font-mono-data text-xs uppercase tracking-[0.16em] text-[#3DD598]">
              {formData.role === 'pharmacy' ? 'Dispensary Onboarding' : 'Patient Registration'}
            </span>
            <h1 className="font-editorial text-5xl leading-[1.06] text-white mt-3 mb-5">
              {formData.role === 'pharmacy'
                ? 'Bring your pharmacy inventory online in minutes.'
                : 'Search real-time stock across your neighborhood.'}
            </h1>
            <p className="text-sm text-[#B7CEC5] leading-relaxed max-w-sm">
              {formData.role === 'pharmacy'
                ? 'Submit your license details for admin verification, publish live shelf counts, and receive direct local orders.'
                : 'Create a free account to locate medicines, compare transparent BDT prices, and reserve for pickup or delivery.'}
            </p>
          </div>
        </div>

        <div className="space-y-3.5 pt-8 border-t border-[#193B2F] text-xs text-[#B7CEC5]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#3DD598] shrink-0" />
            <span>No subscription fees for patients</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#3DD598] shrink-0" />
            <span>Direct SSLCommerz encrypted checkout</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#3DD598] shrink-0" />
            <span>Full order &amp; reservation tracking</span>
          </div>
        </div>
      </aside>

      {/* Right Form Panel */}
      <main className="lg:col-span-7 flex flex-col justify-between px-5 sm:px-10 py-10">
        <div className="flex items-center justify-between max-w-lg w-full mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4E5B55] hover:text-[#121816] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#0F4C3A] p-1">
              <img
                src="/logo.png"
                alt="MedLink"
                className="w-full h-full object-contain brightness-0 invert"
              />
            </div>
            <span className="font-bold text-[#121816]">MedLink</span>
          </Link>
        </div>

        <div className="w-full max-w-lg mx-auto my-8">
          <div className="mb-6">
            <h2 className="font-editorial text-4xl text-[#121816] tracking-tight">
              Create your account
            </h2>
            <p className="text-sm text-[#4E5B55] mt-1.5">
              Choose whether you are registering as a patient or a licensed pharmacy.
            </p>
          </div>

          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 sm:p-8 shadow-[0_12px_36px_-18px_rgba(18,24,22,0.1)]">
            {/* Tactile Role Switcher */}
            <div className="grid grid-cols-2 gap-2.5 p-1.5 rounded-xl bg-[#F2F0E9] border border-[#E4E1D8] mb-6">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  formData.role === 'customer'
                    ? 'bg-[#0F4C3A] text-[#F7F6F2] shadow-sm'
                    : 'text-[#4E5B55] hover:text-[#121816]'
                }`}
              >
                <User className="w-4 h-4" />
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('pharmacy')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  formData.role === 'pharmacy'
                    ? 'bg-[#0F4C3A] text-[#F7F6F2] shadow-sm'
                    : 'text-[#4E5B55] hover:text-[#121816]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Pharmacy
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
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

              {formData.role === 'customer' ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>First Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78857F]" />
                      <input
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className={inputBase}
                        placeholder="Ariyan"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelBase}>Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78857F]" />
                      <input
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className={inputBase}
                        placeholder="Rahman"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelBase}>Pharmacy Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78857F]" />
                        <input
                          name="pharmacyName"
                          type="text"
                          required
                          value={formData.pharmacyName}
                          onChange={handleChange}
                          className={inputBase}
                          placeholder="Lazz Pharma"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelBase}>Owner Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78857F]" />
                        <input
                          name="ownerName"
                          type="text"
                          required
                          value={formData.ownerName}
                          onChange={handleChange}
                          className={inputBase}
                          placeholder="Full name"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelBase}>Street Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-[#78857F]" />
                      <textarea
                        name="address"
                        rows="2"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#D4D0C5] rounded-lg text-sm text-[#121816] placeholder-[#78857F] focus:bg-white focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/15 transition outline-none resize-none"
                        placeholder="Full pharmacy street address"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelBase}>License Number</label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78857F]" />
                        <input
                          name="licenseNumber"
                          type="text"
                          required
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          className={inputBase}
                          placeholder="DGDA-XXXX"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelBase}>Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78857F]" />
                        <input
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className={inputBase}
                          placeholder="+880 17XXXXXXXX"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className={labelBase}>Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78857F]" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={inputBase}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelBase}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78857F]" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#FAF9F6] border border-[#D4D0C5] rounded-lg text-sm text-[#121816] placeholder-[#78857F] focus:bg-white focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/15 transition outline-none"
                      placeholder="Min. 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78857F] hover:text-[#121816] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelBase}>Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78857F]" />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#FAF9F6] border border-[#D4D0C5] rounded-lg text-sm text-[#121816] placeholder-[#78857F] focus:bg-white focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/15 transition outline-none"
                      placeholder="Repeat password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78857F] hover:text-[#121816] cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 bg-[#0F4C3A] text-[#F7F6F2] text-sm font-semibold rounded-lg hover:bg-[#16634C] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <LoadingSpinner size="small" />
                  ) : formData.role === 'pharmacy' ? (
                    'Register Pharmacy'
                  ) : (
                    'Create Customer Account'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-[#EFECE5] text-center">
              <p className="text-sm text-[#4E5B55]">
                Already registered?{' '}
                <Link to="/login" className="font-semibold text-[#0F4C3A] hover:underline">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-lg w-full mx-auto text-center text-xs text-[#78857F]">
          By creating an account, you agree to MedLink’s pharmacy verification guidelines.
        </div>
      </main>
    </div>
  );
};

export default SignupPage;
