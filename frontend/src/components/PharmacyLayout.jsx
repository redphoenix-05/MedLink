import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Package,
  ClipboardList,
  Store,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Plus
} from 'lucide-react';

const PharmacyLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/pharmacy/dashboard',
      description: 'Manage pharmacy'
    },
    { 
      name: 'Orders', 
      icon: ClipboardList, 
      path: '/pharmacy/orders',
      description: 'View all orders'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
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
          <div className="relative px-6 py-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
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
                <p className="text-xs text-blue-100">Pharmacy Portal</p>
              </div>
            </div>

            {/* Pharmacy Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-blue-100 font-medium tracking-wide uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Pharmacy
                  </p>
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
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200' 
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
                        : 'bg-gray-100 group-hover:bg-blue-100'
                      }
                    `}>
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'}`} />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </span>
                        <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${active ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <p className={`text-xs mt-0.5 ${active ? 'text-blue-100' : 'text-gray-500'}`}>
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
                  {navigationItems.find(item => isActive(item.path))?.description || 'Manage your pharmacy'}
                </p>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-3">
                {/* User Info - Desktop */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                    <Store className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-blue-700 font-medium tracking-wide uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Pharmacy
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

export default PharmacyLayout;
