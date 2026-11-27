import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import PharmacyMap from '../components/PharmacyMap';
import API, { cartAPI } from '../services/api';
import { Search, MapPin, ShoppingBag, Phone, FileText, Navigation, Package, Store, CheckCircle, XCircle, Clock, Truck } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allPharmacies, setAllPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Fetch all pharmacies for map view
  useEffect(() => {
    fetchAllPharmacies();
    fetchCartCount();
  }, []);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchCartCount = async () => {
    try {
      const response = await API.get('/cart');
      if (response.data.success) {
        const cartItems = response.data.data.cartItems || [];
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemCount(totalItems);
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await cartAPI.getOrders();
      if (response.data.success) {
        setOrders(response.data.data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

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



  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Editorial Welcome Header */}
        <div className="bg-[#0B251D] bg-clinical-grid-dark rounded-2xl border border-[#193B2F] p-7 sm:p-8 text-[#F7F6F2]">
          <div className="flex items-center justify-between gap-6">
            <div>
              <span className="font-mono-data text-[11px] uppercase tracking-[0.16em] text-[#3DD598]">
                Neighborhood Medicine Locator
              </span>
              <h1 className="font-editorial text-3xl sm:text-4xl text-white mt-1.5 mb-2">
                Welcome back, {user?.name}
              </h1>
              <p className="text-[#B7CEC5] text-sm sm:text-base max-w-xl">
                Search live stock across verified pharmacies, compare prices, and track your active orders.
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-3 px-4 py-3 rounded-xl bg-[#113328] border border-[#1E4A3B]">
              <ShoppingBag className="w-5 h-5 text-[#3DD598]" />
              <div>
                <div className="font-mono-data text-lg font-semibold text-white leading-none">
                  {cartItemCount}
                </div>
                <div className="text-[11px] text-[#8FB3A5] mt-1">Items in cart</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {/* Segmented Tab Switcher */}
        <div className="bg-white rounded-xl border border-[#E4E1D8] p-1.5">
          <nav className="flex gap-1.5">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-[#0F4C3A] text-[#F7F6F2]'
                  : 'text-[#4E5B55] hover:bg-[#F7F6F2] hover:text-[#121816]'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Medicine Search</span>
              <span className="sm:hidden">Search</span>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-[#0F4C3A] text-[#F7F6F2]'
                  : 'text-[#4E5B55] hover:bg-[#F7F6F2] hover:text-[#121816]'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Pharmacy Map</span>
              <span className="sm:hidden">Map</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#0F4C3A] text-[#F7F6F2]'
                  : 'text-[#4E5B55] hover:bg-[#F7F6F2] hover:text-[#121816]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">My Orders</span>
              <span className="sm:hidden">Orders</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Section */}
            <div className="bg-white border border-[#E4E1D8] rounded-xl p-6">
              <h2 className="text-lg font-bold text-[#121816] mb-4">
                Search Live Inventory
              </h2>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#78857F]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter medicine name or brand (e.g., Paracetamol, Napa)"
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#D4D0C5] rounded-lg text-sm text-[#121816] placeholder-[#78857F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]/15 focus:border-[#0F4C3A] transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-[#0F4C3A] text-[#F7F6F2] rounded-lg hover:bg-[#16634C] transition-all disabled:opacity-50 font-semibold text-sm cursor-pointer"
                  >
                    {loading ? <LoadingSpinner size="small" /> : 'Search'}
                  </button>
                  {(searchResults.length > 0 || searchQuery) && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="px-4 py-3 bg-[#F2F0E9] text-[#4E5B55] rounded-lg hover:bg-[#E4E1D8] transition font-semibold text-sm cursor-pointer"
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
                        className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          selectedPharmacy?.id === result.id
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handlePharmacyClick(result)}
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[#121816] text-base sm:text-lg mb-2">
                              {result.name}
                            </h4>
                            <div className="space-y-1.5">
                              <p className="text-xs sm:text-sm text-[#4E5B55] flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-[#0F4C3A] shrink-0 mt-0.5" />
                                <span>{result.address}</span>
                              </p>
                              <p className="text-xs sm:text-sm text-[#4E5B55] flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#0F4C3A] shrink-0" />
                                <span className="font-mono-data">{result.phone}</span>
                              </p>
                            </div>
                            {result.medicine && (
                              <div className="mt-3 text-sm">
                                <span className="text-[#0F4C3A] font-semibold">
                                  {result.medicine}
                                </span>
                                {result.genericName && (
                                  <span className="text-[#78857F] ml-1.5 text-xs">
                                    ({result.genericName})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EFECE5] shrink-0">
                            <div className="font-mono-data text-lg sm:text-xl font-bold text-[#0F4C3A]">
                              ৳{parseFloat(result.price || 0).toFixed(2)}
                            </div>
                            <div className="font-mono-data text-xs text-[#4E5B55] sm:my-1">
                              Stock: {result.stock || 'N/A'}
                            </div>
                            <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              result.availability 
                                ? 'bg-[#E6F2EC] text-[#0F4C3A]' 
                                : 'bg-[#FDF2F0] text-[#9A2E1B]'
                            }`}>
                              {result.availability ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Available
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3" />
                                  Out of Stock
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${result.latitude},${result.longitude}`, '_blank');
                            }}
                            className="inline-flex items-center gap-2 text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                          >
                            <Navigation className="w-4 h-4" />
                            Get Directions
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
                    selectedPharmacy={selectedPharmacy}
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
                selectedPharmacy={selectedPharmacy}
                height="600px"
              />
            </div>

            {/* Pharmacy Details */}
            {selectedPharmacy && (
              <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Pharmacy Details
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-900 text-xl mb-4">
                      {selectedPharmacy.name}
                    </h4>
                    <div className="space-y-3">
                      <p className="text-gray-700 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        {selectedPharmacy.address}
                      </p>
                      <p className="text-gray-700 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-600" />
                        {selectedPharmacy.phone}
                      </p>
                      <p className="text-gray-700 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        License: {selectedPharmacy.licenseNumber}
                      </p>
                    </div>
                    
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.latitude},${selectedPharmacy.longitude}`, '_blank')}
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        <Navigation className="w-4 h-4" />
                        Get Directions
                      </button>
                      <button
                        onClick={() => alert('Pharmacy inventory view coming soon!')}
                        className="inline-flex items-center gap-2 bg-gray-500 text-white px-5 py-2.5 rounded-lg hover:bg-gray-600 transition font-medium"
                      >
                        <Package className="w-4 h-4" />
                        View Inventory
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Store className="w-5 h-5 text-green-600" />
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

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Orders</h2>
              
              {ordersLoading ? (
                <LoadingSpinner />
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders yet</p>
                  <button
                    onClick={() => navigate('/customer/browse')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                  >
                    Browse Pharmacies
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medicine
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Delivery
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.medicineName}</div>
                            {order.genericName && (
                              <div className="text-sm text-gray-500">{order.genericName}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            ৳{parseFloat(order.grandTotal).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1.5 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full ${
                              order.deliveryType === 'delivery'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {order.deliveryType === 'delivery' ? (
                                <>
                                  <Truck className="w-3.5 h-3.5" />
                                  Delivery
                                </>
                              ) : (
                                <>
                                  <Store className="w-3.5 h-3.5" />
                                  Pickup
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                            {order.deliveryType === 'delivery' ? (
                              <div className="flex items-start gap-1.5">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="truncate" title={order.deliveryAddress}>
                                  {order.deliveryAddress || 'N/A'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1.5 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                              {order.status === 'confirmed' && <CheckCircle className="w-3.5 h-3.5" />}
                              {order.status === 'delivered' && <Package className="w-3.5 h-3.5" />}
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </CustomerLayout>
  );
};

export default CustomerDashboard;
