import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const TopNav = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      {/* Top strip */}
      <div className="hidden md:block bg-green-600 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>📞 0300-3723666</span>
            <span>✉️ info@medlinkpharmacies.com</span>
          </div>
          <div className="flex items-center gap-4">
            <span>🕒 Mon–Sat: 8AM–10PM</span>
            <span>Sun: 9AM–9PM</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-green-600 text-white grid place-items-center font-extrabold">M</div>
            <span className="text-2xl font-bold text-green-700">MedLink</span>
          </Link>

          {/* Desktop menu */}
          <ul className="hidden md:flex items-center gap-8">
            <li>
              <Link
                to="/"
                className={`font-medium transition-colors ${isActive('/') ? 'text-green-700' : 'text-gray-700 hover:text-green-700'}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={`font-medium transition-colors ${isActive('/about') ? 'text-green-700' : 'text-gray-700 hover:text-green-700'}`}
              >
                About Us
              </Link>
            </li>
            <li className="flex items-center gap-4">
              <Link to="/login" className="font-medium text-green-700 hover:text-green-800">
                Login
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white font-semibold shadow hover:bg-green-700 transition-colors"
              >
                Sign Up
              </Link>
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-700 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg className={`h-6 w-6 ${open ? 'hidden' : 'block'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg className={`h-6 w-6 ${open ? 'block' : 'hidden'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md ${isActive('/') ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`block px-3 py-2 rounded-md ${isActive('/about') ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setOpen(false)}
            >
              About Us
            </Link>
            <div className="flex items-center gap-3 pt-2">
              <Link
                to="/login"
                className="flex-1 text-center px-4 py-2 rounded-md border border-green-600 text-green-700 font-medium hover:bg-green-50"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="flex-1 text-center px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
                onClick={() => setOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopNav;
