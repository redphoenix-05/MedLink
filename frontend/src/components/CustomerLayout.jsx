import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  Search, 
  Store, 
  ShoppingCart, 
  User, 
  Home,
  Package,
  Heart,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const CustomerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch cart count
  useEffect(() => {
    if (user?.role === 'customer') {
      fetchCartCount();
    }
  }, [user, location.pathname]);

  const fetchCartCount = async () => {
    try {
      const response = await api.get('/cart');
      if (response.data.success) {
        const cartItems = response.data.data.cartItems || [];
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemCount(totalItems);
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { 
      name: 'Dashboard', 
      icon: Home, 
      path: '/customer/dashboard',
      description: 'Search medicines'
    },
    { 
      name: 'Browse Pharmacies', 
      icon: Store, 
      path: '/customer/browse',
      description: 'Find nearby stores'
    },
    { 
      name: 'Shopping Cart', 
      icon: ShoppingCart, 
      path: '/customer/cart',
      badge: cartItemCount,
      description: 'View your items'
    },
    { 
      name: 'Profile', 
      icon: User, 
      path: '/customer/profile',
      description: 'Account settings'
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="relative px-6 py-6 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 lg:hidden text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center p-1.5 shadow-lg">
                <img src="/logo.png" alt="MedLink Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">MedLink</h1>
                <p className="text-xs text-green-100">Healthcare Simplified</p>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-green-100 font-medium tracking-wide uppercase">Customer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-1.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200
                      ${active 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-200' 
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                      }
                    `}
                  >
                    {/* Active Indicator */}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                    )}
                    
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center transition-all
                      ${active 
                        ? 'bg-white/20' 
                        : 'bg-gray-100 group-hover:bg-green-100'
                      }
                    `}>
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-600 group-hover:text-green-600'}`} />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </span>
                        {item.badge > 0 && (
                          <span className={`
                            px-2 py-0.5 text-xs font-bold rounded-full
                            ${active 
                              ? 'bg-white text-green-600' 
                              : 'bg-red-500 text-white'
                            }
                          `}>
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                        {!item.badge && (
                          <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${active ? 'text-white' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${active ? 'text-green-100' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Page Title - Mobile Hidden */}
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold text-gray-900">
                  {navigationItems.find(item => isActive(item.path))?.name || 'Dashboard'}
                </h2>
                <p className="text-xs text-gray-500">
                  {navigationItems.find(item => isActive(item.path))?.description || 'Welcome back'}
                </p>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-3">
                {/* User Info - Desktop */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-green-700 font-medium tracking-wide uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Customer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
