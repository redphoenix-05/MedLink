import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, MapPin, Clock, CheckCircle2, Building2 } from 'lucide-react';
import TopNav from '../components/TopNav';
import Reveal from '../components/Reveal';

const PRINCIPLES = [
  {
    num: '01',
    title: 'Verified supply chain only',
    description:
      'Every pharmacy on MedLink submits its official license number and street address for manual admin verification before any medicine is listed publicly.',
  },
  {
    num: '02',
    title: 'Honest local pricing',
    description:
      'Customers see unit prices directly from each pharmacy alongside a clear ৳60 flat delivery fee per store and free in-store pickup.',
  },
  {
    num: '03',
    title: 'Built with independent pharmacists',
    description:
      'Rather than replacing neighborhood dispensaries, MedLink gives local pharmacies modern inventory and order tools to serve their immediate community faster.',
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#121816]">
      <TopNav />

      {/* Editorial Header */}
      <section className="bg-clinical-grid border-b border-[#E4E1D8]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <span className="font-mono-data text-xs uppercase tracking-[0.16em] text-[#C85A32] font-medium">
              About MedLink
            </span>
            <h1 className="font-editorial text-5xl sm:text-6xl leading-[1.04] tracking-[-0.02em] text-[#121816] mt-4 mb-6">
              Healthcare shouldn’t depend on walking from shop to shop hoping a shelf is stocked.
            </h1>
            <p className="text-lg text-[#4E5B55] leading-relaxed">
              MedLink connects patients and caregivers with real-time medicine inventory across licensed neighborhood pharmacies — pairing live stock visibility with interactive map navigation and secure checkout.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Operational Model */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <Reveal className="lg:col-span-5">
              <span className="font-mono-data text-xs uppercase tracking-[0.14em] text-[#0F4C3A]">
                Why we built it
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#121816] mt-3 leading-tight">
                Bridging the gap between prescription and availability.
              </h2>
            </Reveal>

            <Reveal className="lg:col-span-7 space-y-5 text-[#4E5B55] leading-relaxed" delay={80}>
              <p>
                Finding a specific brand or dosage late in the evening often means calling multiple stores or traveling across town only to hear it is out of stock. Meanwhile, licensed pharmacies just a few streets away may have the exact strip sitting on their shelf.
              </p>
              <p>
                MedLink solves this with a shared live index. Pharmacists keep their inventory accurate in one dashboard, administrators verify every dispensary license, and patients can search, compare, and reserve medicines in under a minute.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 pt-6">
                <div className="bg-white border border-[#E4E1D8] rounded-xl p-5">
                  <div className="font-mono-data text-2xl font-semibold text-[#0F4C3A]">500+</div>
                  <div className="text-xs text-[#4E5B55] mt-1">Licensed partner pharmacies</div>
                </div>
                <div className="bg-white border border-[#E4E1D8] rounded-xl p-5">
                  <div className="font-mono-data text-2xl font-semibold text-[#0F4C3A]">50k+</div>
                  <div className="text-xs text-[#4E5B55] mt-1">Tracked medicine SKUs</div>
                </div>
                <div className="bg-white border border-[#E4E1D8] rounded-xl p-5">
                  <div className="font-mono-data text-2xl font-semibold text-[#0F4C3A]">100%</div>
                  <div className="text-xs text-[#4E5B55] mt-1">Admin-verified licenses</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Numbered Principles */}
      <section className="py-20 bg-white border-y border-[#E4E1D8]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="mb-12">
              <span className="font-mono-data text-xs uppercase tracking-[0.14em] text-[#C85A32]">
                Operating Principles
              </span>
              <h2 className="font-editorial text-4xl text-[#121816] mt-2">
                How we earn patient and pharmacist trust.
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {PRINCIPLES.map((item, idx) => (
              <Reveal key={item.num} delay={idx * 70}>
                <div className="h-full bg-[#F7F6F2] border border-[#E4E1D8] rounded-2xl p-7">
                  <div className="font-mono-data text-xs font-semibold text-[#0F4C3A] mb-4">
                    {item.num}
                  </div>
                  <h3 className="text-xl font-bold text-[#121816] mb-3">{item.title}</h3>
                  <p className="text-sm text-[#4E5B55] leading-relaxed">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Highlights */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: MapPin, title: 'Distance Sorting', desc: 'Locate the closest stocked store using live GPS coordinates.' },
              { icon: Clock, title: 'Live Stock Counts', desc: 'Check exact strip availability before placing an order.' },
              { icon: ShieldCheck, title: 'SSLCommerz Checkout', desc: 'Encrypted payments with itemized delivery and pickup options.' },
              { icon: Building2, title: 'Pharmacy Portal', desc: 'Dedicated inventory and order fulfillment workflow for store owners.' },
            ].map((feat, idx) => (
              <Reveal key={idx} delay={idx * 60}>
                <div className="h-full card-surface rounded-xl p-6">
                  <feat.icon className="w-5 h-5 text-[#0F4C3A] mb-4" />
                  <h3 className="text-base font-bold text-[#121816] mb-1.5">{feat.title}</h3>
                  <p className="text-sm text-[#4E5B55] leading-relaxed">{feat.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Grounded CTA */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="rounded-2xl bg-[#0B251D] bg-clinical-grid-dark text-[#F7F6F2] p-10 sm:p-14 border border-[#193B2F] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 text-xs font-mono-data uppercase tracking-wider text-[#3DD598] mb-3">
                  <CheckCircle2 className="w-4 h-4" />
                  Free to join for patients &amp; pharmacies
                </div>
                <h2 className="font-editorial text-4xl sm:text-5xl text-white leading-tight">
                  Ready to find your next prescription faster?
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#F7F6F2] text-[#081C16] text-sm font-semibold hover:bg-white transition-colors"
                >
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg border border-[#2C5A49] text-[#F7F6F2] text-sm font-semibold hover:bg-[#14372B] transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
