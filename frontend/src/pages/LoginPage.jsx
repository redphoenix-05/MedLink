import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { Eye, EyeOff, ArrowLeft, Lock, Mail, ShieldCheck, MapPin, Clock } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData);
      if (response && response.success && response.data?.user?.role) {
        const userRole = response.data.user.role;
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'pharmacy') {
          navigate('/pharmacy/dashboard');
        } else {
          navigate('/customer/dashboard');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] grid lg:grid-cols-12">
      {/* Left Architectural Editorial Panel */}
      <aside className="hidden lg:flex lg:col-span-5 bg-[#0B251D] bg-clinical-grid-dark text-[#F7F6F2] p-12 flex-col justify-between border-r border-[#193B2F]">
        <div>
          <Link to="/" className="inline-flex items-center gap-3 group">
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
              Welcome Back
            </span>
            <h1 className="font-editorial text-5xl leading-[1.06] text-white mt-3 mb-5">
              Real-time stock from licensed pharmacies near you.
            </h1>
            <p className="text-sm text-[#B7CEC5] leading-relaxed max-w-sm">
              Sign in to search live inventory, manage your multi-pharmacy cart, track active deliveries, or administer your dispensary.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-8 border-t border-[#193B2F]">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-[#3DD598] mt-0.5 shrink-0" />
            <p className="text-xs text-[#B7CEC5]">
              Every dispensary is manually verified by drug license before going live.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#3DD598] mt-0.5 shrink-0" />
            <p className="text-xs text-[#B7CEC5]">
              GPS distance sorting &amp; live Leaflet map directions built in.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-[#3DD598] mt-0.5 shrink-0" />
            <p className="text-xs text-[#B7CEC5]">
              Choose free in-store pickup or flat ৳60/pharmacy local courier delivery.
            </p>
          </div>
        </div>
      </aside>

      {/* Right Form Panel */}
      <main className="lg:col-span-7 flex flex-col justify-between px-5 sm:px-10 py-10">
        <div className="flex items-center justify-between max-w-md w-full mx-auto">
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

        <div className="w-full max-w-md mx-auto my-10">
          <div className="mb-8">
            <h2 className="font-editorial text-4xl text-[#121816] tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-sm text-[#4E5B55] mt-2">
              Enter your email and password to access your MedLink portal.
            </p>
          </div>

          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-7 sm:p-8 shadow-[0_12px_36px_-18px_rgba(18,24,22,0.1)]">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && <Alert type="error" message={error} onClose={clearError} />}

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-[#4E5B55] mb-2"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78857F]" />
                  <input
                    id="email"
                    name="email"
                    type="text"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#D4D0C5] rounded-lg text-sm text-[#121816] placeholder-[#78857F] focus:bg-white focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/15 transition outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider text-[#4E5B55]"
                    htmlFor="password"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78857F]" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-11 py-3 bg-[#FAF9F6] border border-[#D4D0C5] rounded-lg text-sm text-[#121816] placeholder-[#78857F] focus:bg-white focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/15 transition outline-none"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#78857F] hover:text-[#121816] transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 bg-[#0F4C3A] text-[#F7F6F2] text-sm font-semibold rounded-lg hover:bg-[#16634C] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? <LoadingSpinner size="small" /> : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#EFECE5] text-center">
              <p className="text-sm text-[#4E5B55]">
                New to MedLink?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-[#0F4C3A] hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto text-center text-xs text-[#78857F]">
          Protected session · MedLink Pharmacy Network
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
