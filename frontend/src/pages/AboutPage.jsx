import React from 'react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">About MedLink</h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              MedLink is a modern pharmacy platform focused on quality medicines, wellness products, and
              professional pharmaceutical care. We aim to make healthcare simple, affordable, and reliable.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              Our team of qualified pharmacists and experts is committed to providing guidance, ensuring
              product authenticity, and delivering an exceptional customer experience both online and in-store.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 mt-8">
              <div className="p-6 rounded-lg bg-green-50">
                <h3 className="text-xl font-semibold text-green-700 mb-2">Our Mission</h3>
                <p className="text-gray-700">To provide accessible and trusted healthcare services for everyone.</p>
              </div>
              <div className="p-6 rounded-lg bg-blue-50">
                <h3 className="text-xl font-semibold text-blue-700 mb-2">Our Vision</h3>
                <p className="text-gray-700">A healthier future built on trust, care, and innovation.</p>
              </div>
            </div>
          </div>
          <div>
            <div className="w-full h-80 rounded-2xl bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center shadow">
              <div className="text-center text-gray-500">
                <div className="w-24 h-24 bg-green-600 text-white rounded-full grid place-items-center text-3xl font-bold mx-auto mb-4">M</div>
                <p className="text-gray-600">MedLink Pharmacies</p>
              </div>
            </div>
            <div className="mt-6 grid sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-gray-600 text-sm">Quality Assured</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-gray-600 text-sm">Customer Support</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="text-2xl font-bold text-gray-900">Fast</div>
                <div className="text-gray-600 text-sm">Home Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
