import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const PharmacyLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/pharmacy/dashboard',
      description: 'Profile, catalog & stock',
    },
    {
      name: 'Orders',
      icon: ClipboardList,
      path: '/pharmacy/orders',
      description: 'Fulfillment & dispatch',
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

  const currentNav = navigationItems.find((item) => isActive(item.path));

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#121816]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#081C16]/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-[#E4E1D8] transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-5 border-b border-[#E4E1D8] flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleNavigation('/pharmacy/dashboard')}
              className="flex items-center gap-3 text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-[#0B251D] flex items-center justify-center p-1.5">
                <img
                  src="/logo.png"
                  alt="MedLink"
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#121816] tracking-tight leading-none">
                  MedLink
                </h1>
                <p className="font-mono-data text-[10px] uppercase tracking-[0.14em] text-[#0F4C3A] mt-1">
                  Pharmacy Portal
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#4E5B55] hover:bg-[#F7F6F2]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 pt-5 pb-2">
            <div className="bg-[#FAF9F6] border border-[#E4E1D8] rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E6F2EC] text-[#0F4C3A] flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#121816] truncate">{user?.name}</p>
                <p className="font-mono-data text-[10px] uppercase tracking-wider text-[#0F4C3A]">
                  Dispensary Partner
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full group flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-150 cursor-pointer ${
                    active
                      ? 'bg-[#0B251D] text-[#F7F6F2]'
                      : 'text-[#4E5B55] hover:bg-[#F7F6F2] hover:text-[#121816]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      active
                        ? 'bg-white/15 text-white'
                        : 'bg-[#F2F0E9] text-[#4E5B55] group-hover:bg-[#E6F2EC] group-hover:text-[#0F4C3A]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm font-semibold truncate ${
                          active ? 'text-white' : 'text-[#121816]'
                        }`}
                      >
                        {item.name}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 transition-opacity ${
                          active
                            ? 'opacity-70 text-white'
                            : 'opacity-0 group-hover:opacity-60 text-[#78857F]'
                        }`}
                      />
                    </div>
                    <p
                      className={`text-xs mt-0.5 truncate ${
                        active ? 'text-[#B7CEC5]' : 'text-[#78857F]'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#E4E1D8]">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#9A2E1B] hover:bg-[#FDF2F0] transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-[#FDF2F0] flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold">Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 bg-[#F7F6F2]/90 backdrop-blur-md border-b border-[#E4E1D8]">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-[#4E5B55] hover:bg-[#EFECE5]"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base font-bold text-[#121816] leading-tight">
                  {currentNav?.name || 'Pharmacy Portal'}
                </h2>
                <p className="text-xs text-[#78857F] hidden sm:block">
                  {currentNav?.description || 'Manage your dispensary'}
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-white border border-[#E4E1D8]">
              <span className="w-2 h-2 rounded-full bg-[#1B7A5E]" />
              <span className="text-xs font-semibold text-[#121816]">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default PharmacyLayout;
