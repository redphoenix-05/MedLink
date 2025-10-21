import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MedLink = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Animation on scroll
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.feature-card, .step-card');
      
      elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }
      });
    };

    // Set initial state for animation
    document.querySelectorAll('.feature-card, .step-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    window.addEventListener('scroll', animateOnScroll);
    window.addEventListener('load', animateOnScroll);

    return () => {
      window.removeEventListener('scroll', animateOnScroll);
      window.removeEventListener('load', animateOnScroll);
    };
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
    <div className="font-['Poppins'] bg-gray-50 overflow-x-hidden">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .gradient-bg {
          background: linear-gradient(135deg, #6B73FF 0%, #000DFF 100%);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        
        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .feature-card {
          transition: all 0.3s ease;
        }
        
        .step-card {
          position: relative;
          overflow: hidden;
        }
        
        .step-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(107, 115, 255, 0.1) 0%, rgba(0, 13, 255, 0.1) 100%);
          z-index: -1;
          border-radius: 12px;
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .floating {
          animation: floating 3s ease-in-out infinite;
        }
        
        @keyframes floating {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>

      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 gradient-bg text-white shadow-lg">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <i className="fas fa-prescription-bottle-alt text-3xl mr-2"></i>
              <span className="text-2xl font-bold">MedLink</span>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu}
                className="text-white focus:outline-none"
              >
                <i className="fas fa-bars text-2xl"></i>
              </button>
            </div>
            
            {/* Desktop Navigation */}
                  <div className="hidden md:flex items-center space-x-8">
                    <a href="#" className="text-white hover:text-black hover:bg-white transition px-3 py-2 rounded">Home</a>
                    <a 
                    href="#features" 
                    onClick={(e) => handleSmoothScroll(e, '#features')}
                    className="text-white hover:text-black hover:bg-white transition px-3 py-2 rounded"
                    >
                    Features
                    </a>
                    <a 
                    href="#pharmacies" 
                    onClick={(e) => handleSmoothScroll(e, '#pharmacies')}
                    className="text-white hover:text-black hover:bg-white transition px-3 py-2 rounded"
                    >
                    Pharmacies
                    </a>
                    <a 
                    href="#contact" 
                    onClick={(e) => handleSmoothScroll(e, '#contact')}
                    className="text-white hover:text-black hover:bg-white transition px-3 py-2 rounded"
                    >
                    Contact
                    </a>
                    <div className="flex space-x-4">
                    <Link to="/login" className="px-4 py-2 rounded-lg hover:text-black hover:bg-white transition">Login</Link>
                    <Link to="/signup" className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-opacity-90 transition">Sign Up</Link>
                    </div>
                  </div>
                  </div>
                  
                  {/* Mobile Navigation */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden mt-4 pb-4`}>
            <a href="#" className="block py-2 text-white hover:bg-white hover:bg-opacity-20 px-4 rounded transition">Home</a>
            <a 
              href="#features" 
              onClick={(e) => handleSmoothScroll(e, '#features')}
              className="block py-2 text-white hover:bg-white hover:bg-opacity-20 px-4 rounded transition"
            >
              Features
            </a>
            <a 
              href="#pharmacies" 
              onClick={(e) => handleSmoothScroll(e, '#pharmacies')}
              className="block py-2 text-white hover:bg-white hover:bg-opacity-20 px-4 rounded transition"
            >
              Pharmacies
            </a>
            <a 
              href="#contact" 
              onClick={(e) => handleSmoothScroll(e, '#contact')}
              className="block py-2 text-white hover:bg-white hover:bg-opacity-20 px-4 rounded transition"
            >
              Contact
            </a>
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <Link to="/login" className="block py-2 text-center text-white hover:bg-white hover:bg-opacity-20 px-4 rounded transition mb-2">Login</Link>
              <Link to="/signup" className="block py-2 text-center bg-white text-blue-600 rounded-lg font-medium hover:bg-opacity-90 transition">Sign Up</Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="gradient-bg text-white py-16 md:py-24">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">Find Nearby Pharmacies & Access Medicines Instantly</h1>
            <p className="text-xl mb-8 opacity-90">MedLink connects you with nearby pharmacies showing real-time medicine availability.</p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/signup" className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold text-center hover:bg-opacity-90 transition pulse">Get Started</Link>
              <a href="#" className="px-8 py-3 glass-card rounded-lg font-bold text-center hover:bg-white hover:bg-opacity-20 transition">Join as Pharmacy</a>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/2037/2037071.png" 
              alt="Medical illustration" 
              className="w-full max-w-md floating"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Why Choose MedLink?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Our platform is designed to make medicine access simple, fast and reliable.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="feature-card bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-16 h-16 gradient-bg rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-clock text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Real-time Availability</h3>
              <p className="text-gray-600">Check medicine stock in real-time before visiting the pharmacy.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-card bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-16 h-16 gradient-bg rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-calendar-check text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Easy Reservation</h3>
              <p className="text-gray-600">Reserve your medicines online and pick them up at your convenience.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-card bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-16 h-16 gradient-bg rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-truck text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">Get medicines delivered to your doorstep with our fast delivery service.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="feature-card bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-16 h-16 gradient-bg rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-check-circle text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Verified Pharmacies</h3>
              <p className="text-gray-600">All pharmacies on our platform are verified and licensed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="pharmacies" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">How MedLink Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get your medicines in just 3 simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="step-card bg-white p-8 rounded-xl shadow-md relative">
              <div className="absolute top-0 left-0 w-full h-2 gradient-bg"></div>
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-white text-2xl font-bold mb-6">1</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Search for your medicine</h3>
              <p className="text-gray-600">Enter the name of the medicine you need and your location.</p>
            </div>
            
            {/* Step 2 */}
            <div className="step-card bg-white p-8 rounded-xl shadow-md relative">
              <div className="absolute top-0 left-0 w-full h-2 gradient-bg"></div>
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-white text-2xl font-bold mb-6">2</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Choose a nearby pharmacy</h3>
              <p className="text-gray-600">Browse through verified pharmacies with your medicine in stock.</p>
            </div>
            
            {/* Step 3 */}
            <div className="step-card bg-white p-8 rounded-xl shadow-md relative">
              <div className="absolute top-0 left-0 w-full h-2 gradient-bg"></div>
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-white text-2xl font-bold mb-6">3</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Reserve or order delivery</h3>
              <p className="text-gray-600">Reserve for pickup or get it delivered to your location.</p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link to="/signup" className="px-8 py-3 gradient-bg text-white rounded-lg font-bold inline-block hover:opacity-90 transition">Get Started Now</Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-bg text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to find your medicines faster?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">Join thousands of satisfied users who found their medicines instantly with MedLink.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup" className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-opacity-90 transition">Find Medicine Now</Link>
            <Link to="/signup" className="px-8 py-3 glass-card rounded-lg font-bold hover:bg-white hover:bg-opacity-20 transition">Customer Sign Up</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <i className="fas fa-prescription-bottle-alt text-3xl mr-2"></i>
                <span className="text-2xl font-bold">MedLink</span>
              </div>
              <p className="text-gray-400 mb-4">Connecting patients with pharmacies for instant medicine access.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-twitter"></i></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-instagram"></i></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Home</a></li>
                <li>
                  <a 
                    href="#features" 
                    onClick={(e) => handleSmoothScroll(e, '#features')}
                    className="text-gray-400 hover:text-white transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a 
                    href="#pharmacies" 
                    onClick={(e) => handleSmoothScroll(e, '#pharmacies')}
                    className="text-gray-400 hover:text-white transition"
                  >
                    Pharmacies
                  </a>
                </li>
                <li>
                  <a 
                    href="#contact" 
                    onClick={(e) => handleSmoothScroll(e, '#contact')}
                    className="text-gray-400 hover:text-white transition"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Careers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 MedLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MedLink;