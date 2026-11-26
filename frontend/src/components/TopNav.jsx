import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopNav = ({ onSectionClick }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = location.pathname === '/';
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAnchor = (e, id) => {
    if (isHome && onSectionClick) {
      onSectionClick(e, id);
      setOpen(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#F7F6F2]/92 backdrop-blur-md border-b border-[#E4E1D8] shadow-[0_4px_24px_-12px_rgba(18,24,22,0.08)]'
          : 'bg-[#F7F6F2]/80 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="h-[72px] flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-[#0F4C3A] flex items-center justify-center p-1.5 transition-transform duration-200 group-hover:scale-105">
              <img
                src="/logo.png"
                alt="MedLink"
                className="w-full h-full object-contain brightness-0 invert"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[19px] font-bold tracking-tight text-[#121816] leading-none">
                MedLink
              </span>
              <span className="text-[10px] font-mono-data uppercase tracking-[0.14em] text-[#4E5B55] mt-0.5">
                Pharmacy Index
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isHome ? (
              <>
                <a
                  href="#capabilities"
                  onClick={(e) => handleAnchor(e, '#capabilities')}
                  className="text-sm font-medium text-[#4E5B55] hover:text-[#121816] transition-colors"
                >
                  Capabilities
                </a>
                <a
                  href="#workflow"
                  onClick={(e) => handleAnchor(e, '#workflow')}
                  className="text-sm font-medium text-[#4E5B55] hover:text-[#121816] transition-colors"
                >
                  How it works
                </a>
                <a
                  href="#pharmacies"
                  onClick={(e) => handleAnchor(e, '#pharmacies')}
                  className="text-sm font-medium text-[#4E5B55] hover:text-[#121816] transition-colors"
                >
                  For Pharmacies
                </a>
              </>
            ) : (
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-[#0F4C3A]' : 'text-[#4E5B55] hover:text-[#121816]'
                }`}
              >
                Home
              </Link>
            )}
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors ${
                isActive('/about') ? 'text-[#0F4C3A]' : 'text-[#4E5B55] hover:text-[#121816]'
              }`}
            >
              About
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0F4C3A] text-[#F7F6F2] text-sm font-semibold hover:bg-[#16634C] transition-colors"
              >
                Open Dashboard
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#121816] hover:text-[#0F4C3A] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0F4C3A] text-[#F7F6F2] text-sm font-semibold hover:bg-[#16634C] transition-colors"
                >
                  Get started
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-[#121816] hover:bg-[#EFECE5] transition-colors"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden border-t border-[#E4E1D8] bg-[#F7F6F2]">
          <div className="px-5 py-4 space-y-2">
            {isHome ? (
              <>
                <a
                  href="#capabilities"
                  onClick={(e) => handleAnchor(e, '#capabilities')}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#121816] hover:bg-[#EFECE5]"
                >
                  Capabilities
                </a>
                <a
                  href="#workflow"
                  onClick={(e) => handleAnchor(e, '#workflow')}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#121816] hover:bg-[#EFECE5]"
                >
                  How it works
                </a>
                <a
                  href="#pharmacies"
                  onClick={(e) => handleAnchor(e, '#pharmacies')}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#121816] hover:bg-[#EFECE5]"
                >
                  For Pharmacies
                </a>
              </>
            ) : (
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#121816] hover:bg-[#EFECE5]"
              >
                Home
              </Link>
            )}
            <Link
              to="/about"
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#121816] hover:bg-[#EFECE5]"
            >
              About
            </Link>
            <div className="pt-3 border-t border-[#E4E1D8] flex gap-2.5">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-lg bg-[#0F4C3A] text-[#F7F6F2] text-sm font-semibold"
                >
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-lg border border-[#D4D0C5] text-[#121816] text-sm font-semibold bg-white"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-lg bg-[#0F4C3A] text-[#F7F6F2] text-sm font-semibold"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopNav;
