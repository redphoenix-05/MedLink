import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import PharmacyMap from '../components/PharmacyMap';
import ReservationForm from '../components/ReservationForm';
import MyReservationsList from '../components/MyReservationsList';
import API from '../services/api';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allPharmacies, setAllPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [reservationRefresh, setReservationRefresh] = useState(0);

  // Fetch all pharmacies for map view
  useEffect(() => {
    fetchAllPharmacies();
  }, []);

  const fetchAllPharmacies = async () => {
    try {
      const response = await API.get('/search/pharmacies/locations');
      if (response.data.success) {
        setAllPharmacies(response.data.data.pharmacies);
      }
    } catch (err) {
      console.error('Error fetching pharmacies:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a medicine name to search');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await API.get(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      
      if (response.data.success) {
        setSearchResults(response.data.data);
        if (response.data.data.length === 0) {
          setError('No pharmacies found with the searched medicine');
        }
      } else {
        setError('Failed to search medicines');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Failed to search medicines');
    } finally {
      setLoading(false);
    }
  };

  const handlePharmacyClick = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError('');
    setSelectedPharmacy(null);
  };

  const handleReserveClick = (result) => {
    // Prepare medicine and pharmacy data for reservation
    setSelectedMedicine({
      id: result.medicineId,
      name: result.medicine,
      brand: result.genericName || result.medicine,
      type: result.type || 'Medicine'
    });
    
    setSelectedPharmacy({
      pharmacyId: result.pharmacyId,
      pharmacyName: result.name,
      pharmacyAddress: result.address,
      pharmacyPhone: result.phone,
      price: result.price,
      stock: result.stock
    });
    
    setShowReservationForm(true);
  };

  const handleReservationSuccess = () => {
    setShowReservationForm(false);
    setReservationRefresh(prev => prev + 1);
    setActiveTab('reservations');
  };

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name}!
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Find medicines and pharmacies in your neighborhood
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
            className="mb-6"
          />
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔍 Medicine Search
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'map'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📍 Pharmacy Map
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reservations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 My Reservations
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Search for Medicines
              </h2>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter medicine name or brand (e.g., Paracetamol, Napa)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? <LoadingSpinner size="small" /> : 'Search'}
                  </button>
                  {(searchResults.length > 0 || searchQuery) && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Results List */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Found in {searchResults.length} {searchResults.length === 1 ? 'Pharmacy' : 'Pharmacies'}
                  </h3>
                  
                  <div className="space-y-4">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPharmacy?.id === result.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handlePharmacyClick(result)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {result.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              📍 {result.address}
                            </p>
                            <p className="text-sm text-gray-600">
                              📞 {result.phone}
                            </p>
                            {result.medicine && (
                              <div className="mt-2 text-sm">
                                <span className="text-blue-600 font-medium">
                                  {result.medicine}
                                </span>
                                {result.genericName && (
                                  <span className="text-gray-500 ml-2">
                                    (Generic: {result.genericName})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-green-600">
                              ৳{parseFloat(result.price || 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Stock: {result.stock || 'N/A'}
                            </div>
                            <div className={`text-xs font-medium ${
                              result.availability ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {result.availability ? '✓ Available' : '✗ Out of Stock'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${result.latitude},${result.longitude}`, '_blank');
                            }}
                            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            Get Directions
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReserveClick(result);
                            }}
                            className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            disabled={!result.availability || result.stock === 0}
                          >
                            Reserve Medicine
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map View */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Pharmacy Locations
                  </h3>
                  <PharmacyMap
                    pharmacies={searchResults}
                    onPharmacyClick={handlePharmacyClick}
                    searchedMedicine={searchQuery}
                    height="500px"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* All Pharmacies Map */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                All Available Pharmacies
              </h2>
              <PharmacyMap
                pharmacies={allPharmacies}
                onPharmacyClick={handlePharmacyClick}
                height="600px"
              />
            </div>

            {/* Pharmacy Details */}
            {selectedPharmacy && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Pharmacy Details
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {selectedPharmacy.name}
                    </h4>
                    <p className="text-gray-600 mt-2">
                      📍 {selectedPharmacy.address}
                    </p>
                    <p className="text-gray-600">
                      📞 {selectedPharmacy.phone}
                    </p>
                    <p className="text-gray-600">
                      📄 License: {selectedPharmacy.licenseNumber}
                    </p>
                    
                    <div className="mt-4">
                      <button
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.latitude},${selectedPharmacy.longitude}`, '_blank')}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                      >
                        Get Directions
                      </button>
                      <button
                        onClick={() => alert('Pharmacy inventory view coming soon!')}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        View Inventory
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">
                      Quick Actions
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">
                      More features will be available in Stage 4:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Reserve medicines</li>
                      <li>• Request delivery</li>
                      <li>• View full inventory</li>
                      <li>• Check operating hours</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <MyReservationsList key={reservationRefresh} />
            </div>
          </div>
        )}

        {/* Reservation Form Modal */}
        {showReservationForm && selectedMedicine && selectedPharmacy && (
          <ReservationForm
            medicine={selectedMedicine}
            pharmacy={selectedPharmacy}
            onClose={() => setShowReservationForm(false)}
            onSuccess={handleReservationSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default CustomerDashboard;