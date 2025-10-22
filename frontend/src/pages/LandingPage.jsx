import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pill, Clock, MapPin, ShieldCheck, ArrowRight, ChevronRight, Zap, TrendingUp, Users, Package } from 'lucide-react';

const MedLink = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth'
      });
      
      // Close mobile menu if open
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .gradient-bg-primary {
          background: linear-gradient(135deg, #15803d 0%, #16a34a 100%);
        }
        
        .gradient-bg-secondary {
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
        }
        
        .gradient-bg-tertiary {
          background: linear-gradient(135deg, #4ade80 0%, #86efac 100%);
        }
        
        .gradient-bg-hero {
          background: linear-gradient(135deg, #15803d 0%, #16a34a 50%, #22c55e 100%);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .feature-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        
        .feature-card:hover::before {
          left: 100%;
        }
        
        .feature-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .floating {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .stats-card {
          transition: all 0.3s ease;
        }
        
        .stats-card:hover {
          transform: scale(1.05);
        }
      `}</style>

      {/* Header/Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-card shadow-lg' : 'bg-white/80 backdrop-blur-sm'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
                  <Link to="/" className="flex items-center space-x-2 group">
                    <img src="/logo.png" alt="MedLink Logo" className="w-10 h-10 rounded-lg object-contain" />
                    <span className="text-2xl font-bold gradient-text">MedLink</span>
                  </Link>
                  
                  {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-200 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')} 
                 className="text-gray-700 hover:text-green-600 font-medium transition">Features</a>
              <a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, '#how-it-works')} 
                 className="text-gray-700 hover:text-green-600 font-medium transition">How it Works</a>
              <a href="#stats" onClick={(e) => handleSmoothScroll(e, '#stats')} 
                 className="text-gray-700 hover:text-green-600 font-medium transition">About</a>
              <Link to="/login" className="text-gray-700 hover:text-green-600 font-medium transition">Login</Link>
              <Link to="/signup" className="px-6 py-2.5 gradient-bg-primary text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition">
                Get Started
              </Link>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden mt-4 pb-4 space-y-2`}>
            <a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')} 
               className="block py-2 px-4 rounded-lg hover:bg-gray-100 transition">Features</a>
            <a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, '#how-it-works')} 
               className="block py-2 px-4 rounded-lg hover:bg-gray-100 transition">How it Works</a>
            <a href="#stats" onClick={(e) => handleSmoothScroll(e, '#stats')} 
               className="block py-2 px-4 rounded-lg hover:bg-gray-100 transition">About</a>
            <Link to="/login" className="block py-2 px-4 rounded-lg hover:bg-gray-100 transition">Login</Link>
            <Link to="/signup" className="block py-2.5 px-4 gradient-bg-primary text-white rounded-lg font-semibold text-center">Get Started</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="fade-in-up">
              <div className="inline-block mb-4 px-4 py-2 glass-card rounded-full">
                <span className="text-sm font-semibold gradient-text">Healthcare Made Simple</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                Find Your <span className="gradient-text">Medicines</span> Instantly
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with verified pharmacies in real-time. Check availability, compare prices, and get your medicines delivered to your doorstep.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="group px-8 py-4 gradient-bg-primary text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition flex items-center justify-center">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="px-8 py-4 glass-card rounded-xl font-semibold text-lg hover:shadow-xl transition flex items-center justify-center">
                  Sign In
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="stats-card">
                  <div className="text-3xl font-bold gradient-text">500+</div>
                  <div className="text-sm text-gray-600 mt-1">Pharmacies</div>
                </div>
                <div className="stats-card">
                  <div className="text-3xl font-bold gradient-text">50k+</div>
                  <div className="text-sm text-gray-600 mt-1">Medicines</div>
                </div>
                <div className="stats-card">
                  <div className="text-3xl font-bold gradient-text">99%</div>
                  <div className="text-sm text-gray-600 mt-1">Satisfied</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 floating">
                <div className="glass-card rounded-3xl p-8 shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="gradient-bg-primary rounded-2xl p-6 text-white">
                      <Clock className="w-8 h-8 mb-3" />
                      <div className="text-2xl font-bold">24/7</div>
                      <div className="text-sm opacity-90">Available</div>
                    </div>
                    <div className="gradient-bg-secondary rounded-2xl p-6 text-white">
                      <Zap className="w-8 h-8 mb-3" />
                      <div className="text-2xl font-bold">Fast</div>
                      <div className="text-sm opacity-90">Delivery</div>
                    </div>
                    <div className="gradient-bg-tertiary rounded-2xl p-6 text-white">
                      <ShieldCheck className="w-8 h-8 mb-3" />
                      <div className="text-2xl font-bold">100%</div>
                      <div className="text-sm opacity-90">Verified</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl p-6 text-white">
                      <MapPin className="w-8 h-8 mb-3" />
                      <div className="text-2xl font-bold">Near</div>
                      <div className="text-sm opacity-90">You</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="gradient-text">MedLink</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience healthcare reimagined with cutting-edge technology and user-centric design
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="feature-card group bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 gradient-bg-primary rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Updates</h3>
              <p className="text-gray-600 leading-relaxed">Instant stock availability across all pharmacies in your area</p>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-card group bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 gradient-bg-secondary rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Ordering</h3>
              <p className="text-gray-600 leading-relaxed">Seamless checkout with multiple payment options</p>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-card group bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 gradient-bg-tertiary rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">Express delivery within hours to your location</p>
            </div>
            
            {/* Feature 4 */}
            <div className="feature-card group bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Verified</h3>
              <p className="text-gray-600 leading-relaxed">All pharmacies are licensed and authenticated</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your medicines delivered in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="glass-card p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-full gradient-bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    1
                  </div>
                </div>
                <div className="gradient-bg-primary w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Pill className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Search Medicine</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Enter medicine name and browse through available options with real-time pricing
                </p>
              </div>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-1 bg-gradient-to-r from-green-400 to-emerald-400 transform -translate-y-1/2"></div>
            </div>
            
            {/* Step 2 */}
            <div className="relative">
              <div className="glass-card p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-full gradient-bg-secondary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    2
                  </div>
                </div>
                <div className="gradient-bg-secondary w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Select Pharmacy</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Choose from nearby verified pharmacies based on distance and availability
                </p>
              </div>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-1 bg-gradient-to-r from-emerald-400 to-lime-400 transform -translate-y-1/2"></div>
            </div>
            
            {/* Step 3 */}
            <div className="relative">
              <div className="glass-card p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-full gradient-bg-tertiary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    3
                  </div>
                </div>
                <div className="gradient-bg-tertiary w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Order & Receive</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Complete payment and get medicines delivered or schedule a pickup
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link to="/signup" className="inline-flex items-center px-10 py-4 gradient-bg-primary text-white rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition">
              Start Ordering Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section id="stats" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center stats-card glass-card p-8 rounded-2xl">
              <Users className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <div className="text-4xl font-bold gradient-text mb-2">10k+</div>
              <div className="text-gray-600 font-medium">Happy Users</div>
            </div>
            <div className="text-center stats-card glass-card p-8 rounded-2xl">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <div className="text-4xl font-bold gradient-text mb-2">500+</div>
              <div className="text-gray-600 font-medium">Pharmacies</div>
            </div>
            <div className="text-center stats-card glass-card p-8 rounded-2xl">
              <Package className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <div className="text-4xl font-bold gradient-text mb-2">50k+</div>
              <div className="text-gray-600 font-medium">Orders Delivered</div>
            </div>
            <div className="text-center stats-card glass-card p-8 rounded-2xl">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <div className="text-4xl font-bold gradient-text mb-2">99%</div>
              <div className="text-gray-600 font-medium">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-green-800 via-green-900 to-emerald-900">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Transform Your Healthcare Experience?
            </h2>
            <p className="text-xl text-white mb-10 opacity-90 leading-relaxed">
              Join thousands of users who trust MedLink for their medicine needs. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="px-10 py-4 bg-white text-green-700 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition shadow-2xl">
                Create Free Account
              </Link>
              <Link to="/login" className="px-10 py-4 glass-card text-white rounded-xl font-bold text-lg hover:bg-white hover:bg-opacity-20 transition border-2 border-white border-opacity-50">
                Sign In Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 gradient-bg-primary rounded-lg flex items-center justify-center">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">MedLink</span>
              </Link>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Revolutionizing healthcare access with instant medicine availability and verified pharmacy connections.
              </p>
              <div className="flex space-x-4">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 flex items-center justify-center transition">
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-gray-400 rounded"></div>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4 gradient-text">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')} className="text-gray-400 hover:text-white transition flex items-center"><ChevronRight className="w-4 h-4 mr-1" /> Features</a></li>
                <li><a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, '#how-it-works')} className="text-gray-400 hover:text-white transition flex items-center"><ChevronRight className="w-4 h-4 mr-1" /> How it Works</a></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-white transition flex items-center"><ChevronRight className="w-4 h-4 mr-1" /> Get Started</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition flex items-center"><ChevronRight className="w-4 h-4 mr-1" /> Sign In</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4 gradient-text">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition flex items-center"><ChevronRight className="w-4 h-4 mr-1" /> Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition flex items-center"><ChevronRight className="w-4 h-4 mr-1" /> Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition flex items-center"><ChevronRight className="w-4 h-4 mr-1" /> Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition flex items-center"><ChevronRight className="w-4 h-4 mr-1" /> Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">© 2025 MedLink. All rights reserved. Built with care for better healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MedLink;