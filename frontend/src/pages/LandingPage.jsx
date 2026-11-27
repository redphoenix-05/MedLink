import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Store,
  Check,
  Navigation,
  Receipt,
  Building2,
  Phone,
  Mail,
  Loader2,
} from 'lucide-react';
import TopNav from '../components/TopNav';
import Reveal from '../components/Reveal';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const QUICK_SEARCH_MEDS = [
  'Napa Extra',
  'Seclo 20',
  'Monas 10',
  'Azithro 500',
  'Sergel 20',
  'Lantus',
];

const CITIES = [
  'All Cities',
  'Dhaka',
  'Chattogram',
  'Khulna',
  'Rajshahi',
  'Sylhet',
  'Barishal',
  'Rangpur',
  'Mymensingh',
];

const WORKFLOW_STEPS = [
  {
    num: '01',
    title: 'Search by brand or generic name',
    description:
      'Type the exact brand on your prescription or its generic salt. MedLink matches live shelf records across every approved neighborhood pharmacy.',
    meta: 'Instant salt & brand matching',
  },
  {
    num: '02',
    title: 'Compare stock, price & distance',
    description:
      'See exact box counts, unit pricing in BDT, and walking or driving distance on an interactive Leaflet map before committing.',
    meta: 'Zero blind phone calls',
  },
  {
    num: '03',
    title: 'Reserve for pickup or courier delivery',
    description:
      'Lock your items from one or multiple pharmacies in a single SSLCommerz checkout, with transparent ৳60/pharmacy delivery or free in-store pickup.',
    meta: 'Real-time order tracking',
  },
];

const TICKER_ITEMS = [
  'DGDA-LICENSED PHARMACIES',
  'REAL-TIME SHELF INVENTORY',
  'GENERIC & BRAND LOOKUP',
  'INTERACTIVE NEIGHBORHOOD MAP',
  'TRANSPARENT BDT PRICING',
  'SSLCOMMERZ PROTECTED CHECKOUT',
  'PICKUP OR DOORSTEP COURIER',
  'VERIFIED BATCH AUTHENTICITY',
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('Napa Extra');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [liveResults, setLiveResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [activeStep, setActiveStep] = useState(0);

  // Auto-cycle workflow preview gently unless user interacts
  const [stepPaused, setStepPaused] = useState(false);
  useEffect(() => {
    if (stepPaused) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % WORKFLOW_STEPS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [stepPaused]);

  // Live API search against all medicines & approved stores in the database
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setLiveResults([]);
      setSearchError('');
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError('');
        const cityParam =
          selectedCity !== 'All Cities' ? `&city=${encodeURIComponent(selectedCity)}` : '';
        const res = await API.get(`/search?query=${encodeURIComponent(q)}${cityParam}`);
        if (!cancelled && res.data?.success) {
          setLiveResults(res.data.data || []);
          setVisibleCount(6);
        }
      } catch (err) {
        if (!cancelled) {
          setLiveResults([]);
          setSearchError(err.response?.data?.message || 'Unable to load live stock right now');
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCity]);

  const displayedResults = liveResults.slice(0, visibleCount);
  const firstMatch = liveResults[0];

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    if (targetId === '#') return;
    const el = document.querySelector(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#121816] overflow-x-hidden">
      <TopNav onSectionClick={handleSmoothScroll} />

      {/* HERO SECTION */}
      <section className="relative bg-clinical-grid border-b border-[#E4E1D8]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-start">
            {/* Left Editorial Column */}
            <div className="lg:col-span-6 lg:pt-4">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-[#E4E1D8] mb-7">
                <span className="w-2 h-2 rounded-full bg-[#1B7A5E] live-dot" />
                <span className="text-[11px] font-mono-data uppercase tracking-[0.12em] text-[#4E5B55]">
                  Live Neighborhood Pharmacy Network
                </span>
              </div>

              <h1 className="font-editorial text-[36px] sm:text-[54px] lg:text-[66px] leading-[1.04] tracking-[-0.02em] text-[#121816] mb-5 sm:mb-6">
                Know which pharmacy has your medicine{' '}
                <span className="italic text-[#0F4C3A]">before you step out.</span>
              </h1>

              <p className="text-[17px] sm:text-[18px] text-[#4E5B55] leading-relaxed max-w-xl mb-9">
                Stop calling five pharmacies in a row. MedLink indexes live shelf stock across licensed local dispensaries so you can verify availability, compare prices, and reserve for pickup or delivery in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-12">
                <Link
                  to={isAuthenticated ? '/dashboard' : '/signup'}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#0F4C3A] text-[#F7F6F2] font-semibold text-sm hover:bg-[#16634C] transition-all cursor-pointer"
                >
                  {isAuthenticated ? 'Go to Medicine Search' : 'Start searching medicines'}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white border border-[#D4D0C5] text-[#121816] font-semibold text-sm hover:border-[#0F4C3A]/40 hover:bg-[#FAF9F6] transition-all"
                >
                  How verification works
                </Link>
              </div>

              {/* Grounded Metric Strip */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-7 sm:pt-8 border-t border-[#E4E1D8]">
                <div>
                  <div className="font-mono-data text-xl sm:text-3xl font-semibold text-[#121816]">
                    180+
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#4E5B55] mt-1">Licensed branches</div>
                </div>
                <div>
                  <div className="font-mono-data text-xl sm:text-3xl font-semibold text-[#121816]">
                    25k+
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#4E5B55] mt-1">Live stock listings</div>
                </div>
                <div>
                  <div className="font-mono-data text-xl sm:text-3xl font-semibold text-[#121816]">
                    ৳60
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#4E5B55] mt-1">Flat local delivery</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Live Dispatch Console */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl border border-[#DFDCD2] shadow-[0_24px_60px_-24px_rgba(15,76,58,0.16)] overflow-hidden">
                {/* Console Top Bar */}
                <div className="px-5 py-3.5 bg-[#0B251D] text-[#F7F6F2] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3DD598] live-dot" />
                    <span className="font-mono-data text-xs tracking-wider uppercase text-[#CBE5DA]">
                      Live Availability Preview
                    </span>
                  </div>
                  <span className="font-mono-data text-[11px] text-[#8FB3A5]">
                    REAL-TIME SHELF SYNC
                  </span>
                </div>

                {/* Search & City Filter Bar */}
                <div className="p-5 border-b border-[#ECE9E0] bg-[#FAF9F6]">
                  <div className="flex flex-col sm:flex-row gap-2.5 mb-3.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-[#78857F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search any BD medicine, generic, or brand..."
                        aria-label="Search live medicines"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-[#DCD8CC] text-sm text-[#121816] placeholder-[#78857F] focus:outline-none focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/10 transition"
                      />
                    </div>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      aria-label="Filter by city"
                      className="px-3 py-2.5 rounded-lg bg-white border border-[#DCD8CC] text-xs font-semibold text-[#121816] focus:outline-none focus:border-[#0F4C3A] cursor-pointer"
                    >
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-mono-data uppercase text-[#78857F] mr-1">
                      Popular:
                    </span>
                    {QUICK_SEARCH_MEDS.map((medName) => {
                      const isSelected = searchQuery.trim().toLowerCase() === medName.toLowerCase();
                      return (
                        <button
                          key={medName}
                          type="button"
                          onClick={() => setSearchQuery(medName)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#0F4C3A] text-[#F7F6F2]'
                              : 'bg-white border border-[#DCD8CC] text-[#4E5B55] hover:border-[#0F4C3A]/40 hover:text-[#121816]'
                          }`}
                        >
                          {medName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Search Summary Header */}
                <div className="px-5 py-3.5 border-b border-[#ECE9E0] flex flex-wrap items-center justify-between gap-2 bg-white">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#121816] truncate">
                      {firstMatch
                        ? firstMatch.medicine
                        : searchQuery.trim().length >= 2
                        ? `Results for "${searchQuery.trim()}"`
                        : 'Type at least 2 characters'}
                    </div>
                    <div className="text-xs text-[#4E5B55] truncate">
                      {firstMatch
                        ? `${firstMatch.genericName || 'Medicine'} · ${firstMatch.brand || 'Verified Brand'}`
                        : 'Searching 180+ Bangladesh medicines across 180+ stores'}
                    </div>
                  </div>
                  <span className="font-mono-data text-[11px] px-2.5 py-1 rounded-md bg-[#E6F2EC] text-[#0F4C3A] font-medium shrink-0">
                    {searchLoading ? 'Syncing...' : `${liveResults.length} stocked store${liveResults.length === 1 ? '' : 's'}`}
                  </span>
                </div>

                {/* Live Pharmacy Stock Rows */}
                <div className="divide-y divide-[#EFECE5] max-h-[340px] overflow-y-auto">
                  {searchLoading ? (
                    <div className="px-5 py-10 flex flex-col items-center justify-center gap-2 text-xs text-[#4E5B55]">
                      <Loader2 className="w-5 h-5 text-[#0F4C3A] animate-spin" />
                      <span className="font-mono-data uppercase tracking-wider">Checking live store stock...</span>
                    </div>
                  ) : searchError ? (
                    <div className="px-5 py-8 text-center text-sm text-[#9A2E1B]">{searchError}</div>
                  ) : displayedResults.length > 0 ? (
                    <>
                      {displayedResults.map((item) => (
                        <div
                          key={`${item.id}-${item.inventoryId || item.medicineId}`}
                          className="px-4 sm:px-5 py-3.5 hover:bg-[#FAF9F6] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-[#121816] truncate">
                                {item.name}
                              </span>
                              <ShieldCheck className="w-3.5 h-3.5 text-[#0F4C3A] shrink-0" />
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-[#4E5B55]">
                              {item.city && (
                                <span className="inline-flex items-center gap-1 font-mono-data text-[11px] text-[#121816]">
                                  <MapPin className="w-3 h-3 text-[#78857F]" />
                                  {item.city}
                                </span>
                              )}
                              <span className="text-[#D4D0C5]">•</span>
                              <span className="truncate max-w-[150px] text-[#78857F]">
                                {item.medicine}
                              </span>
                              <span className="text-[#D4D0C5]">•</span>
                              <span
                                className={`font-mono-data font-medium ${
                                  item.stock <= 15 ? 'text-[#C85A32]' : 'text-[#0F4C3A]'
                                }`}
                              >
                                {item.stock} in stock
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#F2F0E9]">
                            <div className="sm:text-right">
                              <div className="font-mono-data text-sm font-semibold text-[#121816]">
                                ৳{Number(item.price).toFixed(2)}
                              </div>
                            </div>
                            <Link
                              to={isAuthenticated ? '/customer/dashboard' : '/signup'}
                              className="px-3 py-1.5 rounded-md bg-[#F2F8F5] border border-[#CBE5DA] text-[#0F4C3A] text-xs font-semibold hover:bg-[#0F4C3A] hover:text-white transition-colors"
                            >
                              Reserve
                            </Link>
                          </div>
                        </div>
                      ))}

                      {liveResults.length > visibleCount && (
                        <div className="px-5 py-3 text-center bg-[#FAF9F6]">
                          <button
                            type="button"
                            onClick={() => setVisibleCount((c) => c + 10)}
                            className="text-xs font-semibold text-[#0F4C3A] hover:underline cursor-pointer"
                          >
                            Show more stores ({liveResults.length - visibleCount} more available)
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-5 py-8 text-center text-sm text-[#4E5B55]">
                      {searchQuery.trim().length < 2
                        ? 'Enter at least 2 characters (e.g., Napa, Seclo, Omeprazole, Cef-3) to search live stock.'
                        : `No stocked stores found for "${searchQuery.trim()}"${selectedCity !== 'All Cities' ? ` in ${selectedCity}` : ''}.`}
                    </div>
                  )}
                </div>

                {/* Console Footer */}
                <div className="px-5 py-3 bg-[#FAF9F6] border-t border-[#ECE9E0] flex items-center justify-between text-xs text-[#4E5B55]">
                  <span>Want to search real-time inventory near your GPS location?</span>
                  <Link
                    to={isAuthenticated ? '/customer/browse' : '/signup'}
                    className="inline-flex items-center gap-1 font-semibold text-[#0F4C3A] hover:underline shrink-0"
                  >
                    Open full map
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL MARQUEE STRIP */}
      <div className="bg-[#0B251D] text-[#CBE5DA] py-3.5 border-b border-[#193B2F] overflow-hidden">
        <div className="animate-marquee">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <div key={idx} className="flex items-center shrink-0">
              <span className="font-mono-data text-[11px] tracking-[0.16em] uppercase px-6">
                {item}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
            </div>
          ))}
        </div>
      </div>

      {/* ASYMMETRIC BENTO CAPABILITIES */}
      <section id="capabilities" className="py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="max-w-2xl mb-14">
              <span className="font-mono-data text-xs uppercase tracking-[0.16em] text-[#C85A32] font-medium">
                Built for real pharmacy trips
              </span>
              <h2 className="font-editorial text-4xl sm:text-5xl leading-[1.06] text-[#121816] mt-3 mb-4">
                Practical tools for finding urgent medicine without the guesswork.
              </h2>
              <p className="text-base text-[#4E5B55] leading-relaxed">
                Every feature in MedLink is designed around how people actually buy prescriptions — checking stock first, verifying legitimacy, and avoiding wasted trips across town.
              </p>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Bento 1: Live Shelf Ledger (7 cols) */}
            <Reveal className="lg:col-span-7" delay={40}>
              <div className="h-full card-surface card-surface-hover rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono-data text-xs uppercase tracking-wider text-[#0F4C3A] bg-[#E6F2EC] px-2.5 py-1 rounded-md">
                      01 · Live Inventory
                    </span>
                    <Clock className="w-5 h-5 text-[#78857F]" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-[#121816] mb-2.5">
                    Real-time shelf quantities, updated by pharmacists
                  </h3>
                  <p className="text-sm text-[#4E5B55] leading-relaxed max-w-lg mb-7">
                    Pharmacies manage their stock directly from the MedLink portal. When a medicine runs low or restocks, your search results reflect it immediately.
                  </p>
                </div>

                {/* Mini Ledger UI */}
                <div className="rounded-xl border border-[#E4E1D8] bg-[#FAF9F6] overflow-x-auto">
                  <div className="min-w-[360px]">
                    <div className="grid grid-cols-12 px-4 py-2.5 border-b border-[#E4E1D8] font-mono-data text-[10px] uppercase tracking-wider text-[#78857F]">
                      <span className="col-span-5">Medicine</span>
                      <span className="col-span-3">Status</span>
                      <span className="col-span-2 text-right">Stock</span>
                      <span className="col-span-2 text-right">Price</span>
                    </div>
                    {[
                      { name: 'Insulin Glargine', status: 'In Stock', qty: '18 pens', price: '৳890', ok: true },
                      { name: 'Atorvastatin 20mg', status: 'In Stock', qty: '64 strips', price: '৳120', ok: true },
                      { name: 'Clopidogrel 75mg', status: 'Low Stock', qty: '4 strips', price: '৳145', ok: false },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-12 px-4 py-3 text-xs border-b last:border-b-0 border-[#ECE9E0] items-center bg-white"
                      >
                        <span className="col-span-5 font-semibold text-[#121816] truncate pr-2">
                          {row.name}
                        </span>
                        <span className="col-span-3">
                          <span
                            className={`inline-flex items-center gap-1.5 font-mono-data text-[11px] ${
                              row.ok ? 'text-[#0F4C3A]' : 'text-[#C85A32]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                row.ok ? 'bg-[#1B7A5E]' : 'bg-[#C85A32]'
                              }`}
                            />
                            {row.status}
                          </span>
                        </span>
                        <span className="col-span-2 text-right font-mono-data text-[#4E5B55]">
                          {row.qty}
                        </span>
                        <span className="col-span-2 text-right font-mono-data font-semibold text-[#121816]">
                          {row.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Bento 2: Dark Architectural Map Card (5 cols) */}
            <Reveal className="lg:col-span-5" delay={100}>
              <div className="h-full rounded-2xl bg-[#0B251D] bg-clinical-grid-dark text-[#F7F6F2] p-7 sm:p-8 border border-[#193B2F] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono-data text-xs uppercase tracking-wider text-[#CBE5DA] bg-[#163D30] px-2.5 py-1 rounded-md">
                      02 · Geolocation
                    </span>
                    <Navigation className="w-5 h-5 text-[#8FB3A5]" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white mb-2.5">
                    Distance-sorted interactive pharmacy map
                  </h3>
                  <p className="text-sm text-[#B7CEC5] leading-relaxed mb-8">
                    Enable location once to sort every stocked pharmacy by Haversine distance from your exact spot, complete with Leaflet map pins and direct call buttons.
                  </p>
                </div>

                {/* Tactile Distance Rings Graphic */}
                <div className="rounded-xl bg-[#081C16] border border-[#1C4537] p-5">
                  <div className="flex items-center justify-between text-xs font-mono-data text-[#8FB3A5] mb-4">
                    <span>NEAREST VERIFIED DISPENSARIES</span>
                    <span className="text-[#3DD598]">GPS READY</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: '0.4 km · Dhanmondi 27', bar: 'w-[28%]' },
                      { label: '0.9 km · Green Road', bar: 'w-[54%]' },
                      { label: '1.6 km · Kalabagan', bar: 'w-[82%]' },
                    ].map((ring, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs text-[#E4EFEA] mb-1">
                          <span>{ring.label}</span>
                          <span className="font-mono-data text-[11px] text-[#8FB3A5]">Open</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#15352A] overflow-hidden">
                          <div className={`h-full rounded-full bg-[#3DD598] ${ring.bar}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Bento 3: License Verification (5 cols) */}
            <Reveal className="lg:col-span-5" delay={140}>
              <div className="h-full card-surface card-surface-hover rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono-data text-xs uppercase tracking-wider text-[#C85A32] bg-[#FBECE6] px-2.5 py-1 rounded-md">
                      03 · Verification
                    </span>
                    <ShieldCheck className="w-5 h-5 text-[#78857F]" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-[#121816] mb-2.5">
                    Admin-reviewed pharmacy licenses
                  </h3>
                  <p className="text-sm text-[#4E5B55] leading-relaxed mb-7">
                    No unverified sellers. Every pharmacy submits its official drug license number and physical address for manual admin approval before appearing in search.
                  </p>
                </div>

                <div className="rounded-xl border border-[#E4E1D8] bg-[#FAF9F6] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-mono-data uppercase text-[#78857F]">
                      License Registry
                    </div>
                    <div className="font-mono-data text-sm font-semibold text-[#121816] mt-0.5">
                      DGDA-LIC-2026-0842
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F2EC] text-[#0F4C3A] text-xs font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    Approved
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Bento 4: Multi-Pharmacy Cart & Transparent Checkout (7 cols) */}
            <Reveal className="lg:col-span-7" delay={180}>
              <div className="h-full card-surface card-surface-hover rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono-data text-xs uppercase tracking-wider text-[#0F4C3A] bg-[#E6F2EC] px-2.5 py-1 rounded-md">
                      04 · Checkout
                    </span>
                    <Receipt className="w-5 h-5 text-[#78857F]" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-[#121816] mb-2.5">
                    One cart across multiple pharmacies, zero hidden markups
                  </h3>
                  <p className="text-sm text-[#4E5B55] leading-relaxed max-w-xl mb-7">
                    Need two items from different stores? Combine them in one cart, choose pickup or doorstep delivery, and pay securely through SSLCommerz with itemized fee transparency.
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-[#E4E1D8] bg-[#FAF9F6] p-4">
                    <div className="text-xs text-[#78857F]">In-store pickup</div>
                    <div className="font-mono-data text-lg font-semibold text-[#0F4C3A] mt-1">
                      ৳0.00
                    </div>
                    <div className="text-[11px] text-[#4E5B55] mt-1">Skip the counter queue</div>
                  </div>
                  <div className="rounded-xl border border-[#E4E1D8] bg-[#FAF9F6] p-4">
                    <div className="text-xs text-[#78857F]">Home delivery</div>
                    <div className="font-mono-data text-lg font-semibold text-[#121816] mt-1">
                      ৳60.00
                    </div>
                    <div className="text-[11px] text-[#4E5B55] mt-1">Flat fee per pharmacy</div>
                  </div>
                  <div className="rounded-xl border border-[#E4E1D8] bg-[#FAF9F6] p-4">
                    <div className="text-xs text-[#78857F]">Platform fee</div>
                    <div className="font-mono-data text-lg font-semibold text-[#121816] mt-1">
                      0.3%
                    </div>
                    <div className="text-[11px] text-[#4E5B55] mt-1">SSLCommerz secured</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* INTERACTIVE WORKFLOW SWITCHER */}
      <section id="workflow" className="py-24 bg-white border-y border-[#E4E1D8]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div className="max-w-xl">
                <span className="font-mono-data text-xs uppercase tracking-[0.16em] text-[#0F4C3A] font-medium">
                  The Patient Flow
                </span>
                <h2 className="font-editorial text-4xl sm:text-5xl leading-[1.06] text-[#121816] mt-3">
                  From prescription to doorstep in three clear steps.
                </h2>
              </div>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C3A] hover:text-[#16634C]"
              >
                Create a free patient account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Step Selectors */}
            <div className="lg:col-span-5 space-y-3">
              {WORKFLOW_STEPS.map((step, index) => {
                const active = activeStep === index;
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => {
                      setActiveStep(index);
                      setStepPaused(true);
                    }}
                    className={`w-full text-left p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-[#F7F6F2] border-[#0F4C3A] shadow-sm'
                        : 'bg-white border-[#E4E1D8] hover:border-[#C9C4B6]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`font-mono-data text-xs font-semibold ${
                          active ? 'text-[#0F4C3A]' : 'text-[#78857F]'
                        }`}
                      >
                        STEP {step.num}
                      </span>
                      <span className="text-[11px] font-mono-data text-[#78857F]">
                        {step.meta}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#121816] mb-1.5">{step.title}</h3>
                    <p className="text-sm text-[#4E5B55] leading-relaxed">{step.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Interactive Visual Preview Stage */}
            <div className="lg:col-span-7">
              <div className="h-full min-h-[340px] rounded-2xl bg-[#F7F6F2] border border-[#E4E1D8] p-6 sm:p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-4 border-b border-[#E4E1D8]">
                  <span className="font-mono-data text-xs uppercase tracking-wider text-[#4E5B55]">
                    Preview · {WORKFLOW_STEPS[activeStep].num} / 03
                  </span>
                  <div className="flex gap-1.5">
                    {WORKFLOW_STEPS.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === activeStep ? 'w-7 bg-[#0F4C3A]' : 'w-2 bg-[#D4D0C5]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="py-6 flex-1 flex items-center">
                  {activeStep === 0 && (
                    <div className="w-full space-y-4">
                      <div className="bg-white rounded-xl border border-[#DFDCD2] p-4 shadow-sm">
                        <div className="flex items-center gap-3 text-sm text-[#121816] font-medium">
                          <Search className="w-4 h-4 text-[#0F4C3A]" />
                          <span>Napa Extra 500mg</span>
                          <span className="ml-auto font-mono-data text-xs text-[#0F4C3A] bg-[#E6F2EC] px-2 py-0.5 rounded">
                            Generic: Paracetamol
                          </span>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="bg-white rounded-xl border border-[#E4E1D8] p-4">
                          <div className="text-xs font-mono-data text-[#78857F]">EXACT MATCH</div>
                          <div className="text-sm font-bold text-[#121816] mt-1">
                            Napa Extra · Beximco
                          </div>
                          <div className="text-xs text-[#0F4C3A] mt-2 font-medium">
                            Available at 14 pharmacies nearby
                          </div>
                        </div>
                        <div className="bg-white rounded-xl border border-[#E4E1D8] p-4">
                          <div className="text-xs font-mono-data text-[#78857F]">SAME GENERIC</div>
                          <div className="text-sm font-bold text-[#121816] mt-1">
                            Ace Plus · Square
                          </div>
                          <div className="text-xs text-[#4E5B55] mt-2">
                            Available at 11 pharmacies nearby
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="w-full bg-white rounded-xl border border-[#DFDCD2] p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-[#121816]">
                            Lazz Pharma — Dhanmondi 27
                          </div>
                          <div className="text-xs text-[#4E5B55] mt-0.5">
                            House 12, Road 27, Dhanmondi · Open until 11:00 PM
                          </div>
                        </div>
                        <span className="font-mono-data text-xs font-semibold px-2.5 py-1 rounded-md bg-[#E6F2EC] text-[#0F4C3A]">
                          0.4 km away
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#EFECE5]">
                        <div>
                          <div className="text-[11px] text-[#78857F]">Unit Price</div>
                          <div className="font-mono-data text-base font-semibold text-[#121816]">
                            ৳25.00
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-[#78857F]">Verified Stock</div>
                          <div className="font-mono-data text-base font-semibold text-[#0F4C3A]">
                            48 strips
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-[#78857F]">License</div>
                          <div className="font-mono-data text-base font-semibold text-[#121816]">
                            Verified
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="w-full bg-white rounded-xl border border-[#DFDCD2] p-5 shadow-sm">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EFECE5]">
                        <span className="text-sm font-bold text-[#121816]">Order Summary</span>
                        <span className="font-mono-data text-xs text-[#0F4C3A] bg-[#E6F2EC] px-2 py-0.5 rounded">
                          SSLCommerz Verified
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-[#4E5B55]">
                          <span>Napa Extra (×2 strips)</span>
                          <span className="font-mono-data text-[#121816]">৳50.00</span>
                        </div>
                        <div className="flex justify-between text-[#4E5B55]">
                          <span>Courier Delivery (1 pharmacy)</span>
                          <span className="font-mono-data text-[#121816]">৳60.00</span>
                        </div>
                        <div className="flex justify-between text-[#4E5B55]">
                          <span>Platform Fee (0.3%)</span>
                          <span className="font-mono-data text-[#121816]">৳0.15</span>
                        </div>
                        <div className="flex justify-between pt-3 mt-2 border-t border-[#EFECE5] font-bold text-[#121816]">
                          <span>Total Payable</span>
                          <span className="font-mono-data text-[#0F4C3A]">৳110.15</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E4E1D8] flex items-center justify-between text-xs text-[#4E5B55]">
                  <span>{WORKFLOW_STEPS[activeStep].meta}</span>
                  <Link
                    to="/signup"
                    className="font-semibold text-[#0F4C3A] hover:underline inline-flex items-center gap-1"
                  >
                    Try it live
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DUAL AUDIENCE SECTION: PATIENTS & PHARMACIES */}
      <section id="pharmacies" className="py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Reveal>
              <div className="h-full card-surface rounded-2xl p-8 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#E6F2EC] text-[#0F4C3A] flex items-center justify-center mb-6">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="font-mono-data text-xs uppercase tracking-[0.14em] text-[#4E5B55]">
                    For Patients &amp; Caregivers
                  </span>
                  <h3 className="font-editorial text-3xl sm:text-4xl text-[#121816] mt-2 mb-4">
                    Find essential prescriptions without crossing the city.
                  </h3>
                  <p className="text-sm text-[#4E5B55] leading-relaxed mb-8">
                    Search live stock, filter by distance from your location, and track every order from pharmacy confirmation to doorstep arrival.
                  </p>
                </div>
                <div>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0F4C3A] text-[#F7F6F2] text-sm font-semibold hover:bg-[#16634C] transition-colors"
                  >
                    Create customer account
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="h-full rounded-2xl bg-[#0B251D] text-[#F7F6F2] border border-[#193B2F] p-8 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#163D30] text-[#CBE5DA] flex items-center justify-center mb-6">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="font-mono-data text-xs uppercase tracking-[0.14em] text-[#8FB3A5]">
                    For Independent Pharmacies
                  </span>
                  <h3 className="font-editorial text-3xl sm:text-4xl text-white mt-2 mb-4">
                    Turn your counter inventory into neighborhood orders.
                  </h3>
                  <p className="text-sm text-[#B7CEC5] leading-relaxed mb-8">
                    List your licensed dispensary, manage medicine stock in real time, and fulfill verified local pickup and courier orders from one clean dashboard.
                  </p>
                </div>
                <div>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#F7F6F2] text-[#081C16] text-sm font-semibold hover:bg-white transition-colors"
                  >
                    Register your pharmacy
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* EDITORIAL FOOTER */}
      <footer className="bg-[#081C16] text-[#B7CEC5] border-t border-[#16362B]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#16362B]">
            <div className="md:col-span-5">
              <Link to="/" className="inline-flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-[#163D30] flex items-center justify-center p-1.5">
                  <img
                    src="/logo.png"
                    alt="MedLink"
                    className="w-full h-full object-contain brightness-0 invert"
                  />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">MedLink</span>
              </Link>
              <p className="text-sm text-[#8FB3A5] leading-relaxed max-w-sm mb-5">
                Real-time neighborhood medicine availability and licensed pharmacy locator built for faster, more transparent healthcare access.
              </p>
              <div className="space-y-1.5 text-xs font-mono-data text-[#8FB3A5]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#3DD598]" />
                  <span>+880 300-3723666 (Mon–Sun, 8AM–10PM)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#3DD598]" />
                  <span>support@medlinkpharmacies.com</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 md:col-start-7">
              <h4 className="font-mono-data text-xs uppercase tracking-[0.14em] text-white mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a
                    href="#capabilities"
                    onClick={(e) => handleSmoothScroll(e, '#capabilities')}
                    className="hover:text-white transition-colors"
                  >
                    Capabilities
                  </a>
                </li>
                <li>
                  <a
                    href="#workflow"
                    onClick={(e) => handleSmoothScroll(e, '#workflow')}
                    className="hover:text-white transition-colors"
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About MedLink
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="font-mono-data text-xs uppercase tracking-[0.14em] text-white mb-4">
                Account
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-white transition-colors">
                    Customer registration
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-white transition-colors">
                    Pharmacy onboarding
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6E9284]">
            <span>© {new Date().getFullYear()} MedLink Pharmacy Index. All rights reserved.</span>
            <span className="font-mono-data">Verified Dispensary Network · SSLCommerz Integrated</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
