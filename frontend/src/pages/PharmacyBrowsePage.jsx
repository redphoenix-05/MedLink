import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation } from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import ReservationForm from '../components/ReservationForm';
import api from '../services/api';

const PharmacyBrowsePage = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [pharmacyDetails, setPharmacyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/search/pharmacies/locations');
      setPharmacies(response.data.data.pharmacies || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pharmacies');
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance; // Distance in kilometers
  };

  // Get user's current location
  const getUserLocation = () => {
    setGettingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(location);
        setSuccess('Location detected! Showing pharmacies sorted by distance.');
        setTimeout(() => setSuccess(''), 3000);
        setGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
        }
        setError(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const fetchPharmacyDetails = async (pharmacyId) => {
    try {
      setDetailsLoading(true);
      const response = await api.get(`/search/pharmacies/${pharmacyId}/details`);
      setPharmacyDetails(response.data.data.pharmacy);
      setSelectedPharmacy(pharmacyId);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pharmacy details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAddToCart = (medicineItem) => {
    // Prepare medicine and pharmacy data for the reservation form
    const medicine = {
      id: medicineItem.medicine.id,
      name: medicineItem.medicine.name,
      brand: medicineItem.medicine.brand,
      type: medicineItem.medicine.category,
      genericName: medicineItem.medicine.genericName,
    };

    const pharmacy = {
      pharmacyId: selectedPharmacy,
      pharmacyName: pharmacyDetails.name,
      pharmacyAddress: pharmacyDetails.address,
      price: medicineItem.price,
      stock: medicineItem.stock,
    };

    setSelectedMedicine({ medicine, pharmacy });
    setShowReservationForm(true);
  };

  const handleReservationSuccess = () => {
    setSuccess('Medicine added to cart successfully!');
    setTimeout(() => setSuccess(''), 3000);
    setShowReservationForm(false);
    setSelectedMedicine(null);
  };

  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add distance to pharmacies if user location is available
  const pharmaciesWithDistance = filteredPharmacies.map(pharmacy => {
    if (userLocation && pharmacy.latitude && pharmacy.longitude) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        pharmacy.latitude,
        pharmacy.longitude
      );
      return { ...pharmacy, distance };
    }
    return pharmacy;
  });

  // Sort by distance if user location is available
  const sortedPharmacies = userLocation
    ? pharmaciesWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
    : pharmaciesWithDistance;

  if (loading) {
    return (
      <CustomerLayout>
        <LoadingSpinner />
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Pharmacies</h1>
          
          {/* Search Bar and Location Button */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search pharmacies by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Locate Me Button */}
            <button
              onClick={getUserLocation}
              disabled={gettingLocation}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                gettingLocation
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : userLocation
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200'
                  : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg'
              }`}
            >
              {gettingLocation ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Getting Location...</span>
                </>
              ) : userLocation ? (
                <>
                  <MapPin className="w-5 h-5" />
                  <span className="hidden sm:inline">Location Active</span>
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5" />
                  <span className="hidden sm:inline">Locate Me</span>
                </>
              )}
            </button>
          </div>

          {/* Location Info */}
          {userLocation && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">
              <MapPin className="w-4 h-4" />
              <span>Showing pharmacies sorted by distance from your location</span>
            </div>
          )}
        </div>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pharmacy List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {sortedPharmacies.length} Pharmacies {userLocation && '(Sorted by Distance)'}
            </h2>
            
            {sortedPharmacies.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No pharmacies found</p>
              </div>
            ) : (
              sortedPharmacies.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  onClick={() => fetchPharmacyDetails(pharmacy.id)}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
                    selectedPharmacy === pharmacy.id
                      ? 'ring-2 ring-green-500 shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{pharmacy.address}</p>
                      <p className="text-sm text-gray-500 mt-1">📞 {pharmacy.phone}</p>
                    </div>
                    {pharmacy.distance !== undefined && (
                      <div className="ml-2 flex flex-col items-end">
                        <div className="flex items-center gap-1 text-green-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-semibold">
                            {pharmacy.distance < 1 
                              ? `${(pharmacy.distance * 1000).toFixed(0)}m`
                              : `${pharmacy.distance.toFixed(1)}km`
                            }
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-green-600 font-medium">
                      {pharmacy.medicinesCount} medicines available
                    </span>
                    {selectedPharmacy === pharmacy.id && (
                      <span className="text-xs text-green-600">Selected ✓</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pharmacy Details and Inventory */}
          <div className="lg:col-span-2">
            {!selectedPharmacy ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Select a pharmacy
                </h3>
                <p className="mt-2 text-gray-500">
                  Choose a pharmacy from the list to see their medicine inventory
                </p>
              </div>
            ) : detailsLoading ? (
              <div className="bg-white rounded-lg shadow p-12">
                <LoadingSpinner />
              </div>
            ) : pharmacyDetails ? (
              <div className="bg-white rounded-lg shadow">
                {/* Pharmacy Header */}
                <div className="bg-indigo-600 text-white p-6 rounded-t-lg">
                  <h2 className="text-2xl font-bold">{pharmacyDetails.name}</h2>
                  <p className="mt-1">{pharmacyDetails.address}</p>
                  <p className="mt-1">📞 {pharmacyDetails.phone}</p>
                  <div className="mt-4 flex space-x-6 text-sm">
                    <div>
                      <span className="font-semibold">Total Medicines:</span>{' '}
                      {pharmacyDetails.totalMedicines}
                    </div>
                    <div>
                      <span className="font-semibold">In Stock:</span>{' '}
                      {pharmacyDetails.inStockMedicines}
                    </div>
                  </div>
                </div>

                {/* Medicine Inventory */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Medicine Inventory
                  </h3>
                  
                  {pharmacyDetails.medicines.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No medicines available</p>
                  ) : (
                    <div className="space-y-4">
                      {pharmacyDetails.medicines.map((item) => (
                        <div
                          key={item.inventoryId}
                          className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {item.medicine.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.medicine.brand} - {item.medicine.strength}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.medicine.genericName}
                              </p>
                              <div className="mt-2 flex items-center space-x-4 text-sm">
                                <span className="text-indigo-600 font-medium">
                                  Category: {item.medicine.category}
                                </span>
                                <span
                                  className={`${
                                    item.inStock
                                      ? item.lowStock
                                        ? 'text-orange-600'
                                        : 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {item.inStock
                                    ? item.lowStock
                                      ? `Low Stock (${item.stock})`
                                      : `In Stock (${item.stock})`
                                    : 'Out of Stock'}
                                </span>
                                {item.medicine.requiresPrescription && (
                                  <span className="text-red-600">⚕️ Prescription Required</span>
                                )}
                              </div>
                              {item.medicine.description && (
                                <p className="text-sm text-gray-600 mt-2">
                                  {item.medicine.description}
                                </p>
                              )}
                            </div>

                            <div className="ml-4 text-right">
                              <p className="text-2xl font-bold text-gray-900">
                                ৳{item.price.toFixed(2)}
                              </p>
                              <button
                                onClick={() => handleAddToCart(item)}
                                disabled={!item.inStock}
                                className={`mt-2 px-4 py-2 rounded-md text-sm font-medium ${
                                  item.inStock
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {item.inStock ? '🛒 Add to Cart' : 'Out of Stock'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Reservation Form Modal */}
      {showReservationForm && selectedMedicine && (
        <ReservationForm
          medicine={selectedMedicine.medicine}
          pharmacy={selectedMedicine.pharmacy}
          onClose={() => {
            setShowReservationForm(false);
            setSelectedMedicine(null);
          }}
          onSuccess={handleReservationSuccess}
        />
      )}
    </CustomerLayout>
  );
};

export default PharmacyBrowsePage;
