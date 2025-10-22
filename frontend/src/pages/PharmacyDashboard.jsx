import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PharmacyLayout from '../components/PharmacyLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import ComboBox from '../components/ComboBox';
import PharmacyOrders from '../components/PharmacyOrders';
import API from '../services/api';
import { Store, User, Pill, Package, ClipboardList } from 'lucide-react';

const PharmacyDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [pharmacy, setPharmacy] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]); // All medicines in system
  const [medicineNames, setMedicineNames] = useState([]); // Unique medicine names for combo box
  const [genericNames, setGenericNames] = useState([]); // Unique generic names for combo box
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pharmacy profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    address: '',
    phone: '',
    licenseNumber: '',
    latitude: '',
    longitude: '',
  });

  // Inventory form state
  const [inventoryForm, setInventoryForm] = useState({
    medicineId: '',
    price: '',
    stock: '',
    availability: true,
    minStockLevel: 10,
  });

  const [showAddInventory, setShowAddInventory] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);

  // Medicine management state
  const [medicineForm, setMedicineForm] = useState({
    name: '',
    genericName: '',
    brand: '',
    category: 'prescription',
    description: '',
    dosageForm: '',
    strength: '',
    requiresPrescription: false,
  });
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  useEffect(() => {
    fetchPharmacyData();
    fetchMedicines();
    fetchAllMedicines();
  }, []);

  const fetchPharmacyData = async () => {
    try {
      setLoading(true);
      
      // Fetch pharmacy profile
      const pharmacyResponse = await API.get('/pharmacies/my-pharmacy');
      if (pharmacyResponse.data.success) {
        const pharmacyData = pharmacyResponse.data.data.pharmacy;
        setPharmacy(pharmacyData);
        setProfileForm({
          name: pharmacyData.name || '',
          address: pharmacyData.address || '',
          phone: pharmacyData.phone || '',
          licenseNumber: pharmacyData.licenseNumber || '',
          latitude: pharmacyData.latitude || '',
          longitude: pharmacyData.longitude || '',
        });
      }

      // Fetch inventory
      const inventoryResponse = await API.get('/inventory/my-inventory');
      if (inventoryResponse.data.success) {
        setInventory(inventoryResponse.data.data.inventory);
      }
    } catch (err) {
      console.error('Error fetching pharmacy data:', err);
      if (err.response?.status === 404) {
        // No pharmacy profile yet
        setPharmacy(null);
      } else {
        setError('Failed to load pharmacy data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await API.get('/medicines?limit=100');
      if (response.data.success) {
        setMedicines(response.data.data.medicines);
      }
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  };

  const fetchAllMedicines = async () => {
    try {
      const response = await API.get('/medicines?limit=1000'); // Get more medicines for combo box
      if (response.data.success) {
        const medicines = response.data.data.medicines;
        setAllMedicines(medicines);
        
        // Extract unique medicine names and generic names for combo boxes
        const uniqueNames = [...new Set(medicines.map(m => m.name).filter(Boolean))];
        const uniqueGenericNames = [...new Set(medicines.map(m => m.genericName).filter(Boolean))];
        
        setMedicineNames(uniqueNames);
        setGenericNames(uniqueGenericNames);
      }
    } catch (err) {
      console.error('Error fetching all medicines:', err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (pharmacy) {
        // Update existing pharmacy
        await API.put(`/pharmacies/${pharmacy.id}`, profileForm);
        setSuccess('Pharmacy profile updated successfully');
      } else {
        // Create new pharmacy
        await API.post('/pharmacies', profileForm);
        setSuccess('Pharmacy profile created successfully. Awaiting admin approval.');
      }
      
      fetchPharmacyData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save pharmacy profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingInventory) {
        // Update existing inventory
        await API.put(`/inventory/${editingInventory.id}`, inventoryForm);
        setSuccess('Inventory updated successfully');
      } else {
        // Add new inventory
        await API.post('/inventory', inventoryForm);
        setSuccess('Medicine added to inventory successfully');
      }
      
      // Reset form and refresh data
      setInventoryForm({
        medicineId: '',
        price: '',
        stock: '',
        availability: true,
        minStockLevel: 10,
      });
      setShowAddInventory(false);
      setEditingInventory(null);
      fetchPharmacyData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInventory = async (id) => {
    if (!window.confirm('Are you sure you want to remove this medicine from inventory?')) {
      return;
    }

    try {
      setLoading(true);
      await API.delete(`/inventory/${id}`);
      setSuccess('Medicine removed from inventory');
      fetchPharmacyData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove medicine');
    } finally {
      setLoading(false);
    }
  };

  const startEditInventory = (item) => {
    setEditingInventory(item);
    setInventoryForm({
      medicineId: item.medicineId,
      price: item.price,
      stock: item.stock,
      availability: item.availability,
      minStockLevel: item.minStockLevel,
    });
    setShowAddInventory(true);
  };

  // Medicine management functions
  const handleMedicineSubmit = async (e) => {
    e.preventDefault();
    
    // Debug: Add alert to see if function is called
    alert('Form submitted! Check console for details.');
    
    try {
      setLoading(true);
      
      // Debug: Log the form data
      console.log('Submitting medicine form:', medicineForm);
      
      if (editingMedicine) {
        // Update existing medicine
        console.log('Updating medicine with ID:', editingMedicine.id);
        await API.put(`/medicines/${editingMedicine.id}`, medicineForm);
        setSuccess('Medicine updated successfully');
      } else {
        // Add new medicine
        console.log('Adding new medicine');
        const response = await API.post('/medicines', medicineForm);
        console.log('Medicine added response:', response.data);
        setSuccess('Medicine added successfully');
      }
      
      // Reset form and refresh data
      setMedicineForm({
        name: '',
        genericName: '',
        brand: '',
        category: 'prescription',
        description: '',
        dosageForm: '',
        strength: '',
        requiresPrescription: false,
      });
      setShowAddMedicine(false);
      setEditingMedicine(null);
      fetchMedicines();
      fetchAllMedicines(); // Refresh combo box data
    } catch (err) {
      console.error('Medicine submit error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || `Failed to save medicine: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) {
      return;
    }

    try {
      setLoading(true);
      await API.delete(`/medicines/${id}`);
      setSuccess('Medicine deleted successfully');
      fetchMedicines();
      fetchAllMedicines(); // Refresh combo box data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete medicine');
    } finally {
      setLoading(false);
    }
  };

  const startEditMedicine = (medicine) => {
    setEditingMedicine(medicine);
    setMedicineForm({
      name: medicine.name || '',
      genericName: medicine.genericName || '',
      brand: medicine.brand || '',
      category: medicine.category || 'prescription',
      description: medicine.description || '',
      dosageForm: medicine.dosageForm || '',
      strength: medicine.strength || '',
      requiresPrescription: medicine.requiresPrescription || false,
    });
    setShowAddMedicine(true);
  };

  if (loading && !pharmacy && !inventory.length) {
    return (
      <PharmacyLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" text="Loading pharmacy dashboard..." />
        </div>
      </PharmacyLayout>
    );
  }

  return (
    <PharmacyLayout>
      <div className="space-y-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Manage your pharmacy inventory and orders
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Store className="w-12 h-12 text-white" />
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
        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess('')}
          />
        )}

        {/* Status Banner */}
        {pharmacy && (
          <div className={`p-4 rounded-lg mb-6 ${
            pharmacy.status === 'approved' 
              ? 'bg-green-100 text-green-800 border border-green-200'
              : pharmacy.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center">
              <span className="text-xl mr-2">
                {pharmacy.status === 'approved' ? '✅' : 
                 pharmacy.status === 'pending' ? '⏳' : '❌'}
              </span>
              <div>
                <p className="font-semibold">
                  Pharmacy Status: {pharmacy.status.toUpperCase()}
                </p>
                <p className="text-sm">
                  {pharmacy.status === 'approved' 
                    ? 'Your pharmacy is approved and can manage inventory'
                    : pharmacy.status === 'pending'
                    ? 'Your pharmacy registration is pending admin approval'
                    : 'Your pharmacy registration was rejected. Please contact support.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs - Modern Card Style */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1.5">
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile Info</span>
              <span className="sm:hidden">Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('medicines')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === 'medicines'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span className="hidden sm:inline">Medicine Management</span>
              <span className="sm:hidden">Medicines</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === 'inventory'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory Management</span>
              <span className="sm:hidden">Inventory</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Orders & Delivery</span>
              <span className="sm:hidden">Orders</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pharmacy Profile
            </h2>
            
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Pharmacy Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter pharmacy name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <textarea
                  required
                  rows={3}
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter complete address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  License Number *
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.licenseNumber}
                  onChange={(e) => setProfileForm({...profileForm, licenseNumber: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter pharmacy license number"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Latitude
                    <span className="text-xs text-gray-500 ml-1">(for map location)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={profileForm.latitude}
                    onChange={(e) => setProfileForm({...profileForm, latitude: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 23.8759"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Longitude
                    <span className="text-xs text-gray-500 ml-1">(for map location)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={profileForm.longitude}
                    onChange={(e) => setProfileForm({...profileForm, longitude: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 90.3795"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                <p className="font-medium text-blue-800 mb-1">📍 Location Help:</p>
                <p>You can find your coordinates using Google Maps:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Go to Google Maps and search for your pharmacy</li>
                  <li>Right-click on your location</li>
                  <li>Click the coordinates that appear at the top</li>
                  <li>Copy and paste the latitude and longitude here</li>
                </ol>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner size="small" /> : pharmacy ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'medicines' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Medicine Management
                </h2>
                <button
                  onClick={() => {
                    setShowAddMedicine(true);
                    setEditingMedicine(null);
                    setMedicineForm({
                      name: '',
                      genericName: '',
                      brand: '',
                      category: 'prescription',
                      description: '',
                      dosageForm: '',
                      strength: '',
                      requiresPrescription: false,
                    });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add New Medicine
                </button>
              </div>

              {/* Add/Edit Medicine Form */}
              {showAddMedicine && (
                <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                  </h3>
                  
                  <form onSubmit={handleMedicineSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Medicine Name - ComboBox */}
                      <ComboBox
                        label="Medicine Name (Company Given)"
                        value={medicineForm.name}
                        onChange={(value) => setMedicineForm({...medicineForm, name: value})}
                        options={medicineNames}
                        placeholder="Type or select medicine name..."
                        required={true}
                      />

                      {/* Generic Name - ComboBox */}
                      <ComboBox
                        label="Generic Name"
                        value={medicineForm.genericName}
                        onChange={(value) => setMedicineForm({...medicineForm, genericName: value})}
                        options={genericNames}
                        placeholder="Type or select generic name..."
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Brand/Manufacturer
                        </label>
                        <input
                          type="text"
                          value={medicineForm.brand}
                          onChange={(e) => setMedicineForm({...medicineForm, brand: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter brand/manufacturer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Category *
                        </label>
                        <select
                          required
                          value={medicineForm.category}
                          onChange={(e) => setMedicineForm({...medicineForm, category: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="prescription">Prescription</option>
                          <option value="over-the-counter">Over-the-Counter</option>
                          <option value="supplement">Supplement</option>
                          <option value="medical-device">Medical Device</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Dosage Form
                        </label>
                        <select
                          value={medicineForm.dosageForm}
                          onChange={(e) => setMedicineForm({...medicineForm, dosageForm: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select dosage form</option>
                          <option value="tablet">Tablet</option>
                          <option value="capsule">Capsule</option>
                          <option value="syrup">Syrup</option>
                          <option value="injection">Injection</option>
                          <option value="cream">Cream</option>
                          <option value="drops">Drops</option>
                          <option value="inhaler">Inhaler</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Strength
                        </label>
                        <input
                          type="text"
                          value={medicineForm.strength}
                          onChange={(e) => setMedicineForm({...medicineForm, strength: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 500mg, 10ml"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={medicineForm.description}
                        onChange={(e) => setMedicineForm({...medicineForm, description: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter medicine description"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requiresPrescription"
                        checked={medicineForm.requiresPrescription}
                        onChange={(e) => setMedicineForm({...medicineForm, requiresPrescription: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="requiresPrescription" className="ml-2 block text-sm text-gray-900">
                        Requires prescription
                      </label>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {loading ? <LoadingSpinner size="small" /> : editingMedicine ? 'Update Medicine' : 'Add Medicine'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddMedicine(false);
                          setEditingMedicine(null);
                        }}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Medicine List */}
              <div className="overflow-x-auto">
                {medicines.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💊</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines</h3>
                    <p className="text-gray-500">Start by adding medicines to the system</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medicine Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category & Form
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prescription
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {medicines.map((medicine) => (
                        <tr key={medicine.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {medicine.name}
                              </div>
                              {medicine.genericName && (
                                <div className="text-sm text-blue-600">
                                  Generic: {medicine.genericName}
                                </div>
                              )}
                              {medicine.brand && (
                                <div className="text-sm text-gray-500">
                                  Brand: {medicine.brand}
                                </div>
                              )}
                              {medicine.strength && (
                                <div className="text-sm text-gray-500">
                                  Strength: {medicine.strength}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">
                                {medicine.category.replace('-', ' ').toUpperCase()}
                              </div>
                              {medicine.dosageForm && (
                                <div className="text-sm text-gray-500">
                                  {medicine.dosageForm.charAt(0).toUpperCase() + medicine.dosageForm.slice(1)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              medicine.requiresPrescription 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {medicine.requiresPrescription ? 'Required' : 'Not Required'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => startEditMedicine(medicine)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMedicine(medicine.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {pharmacy?.status !== 'approved' ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-4">⏳</div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Waiting for Admin Approval
                </h3>
                <p className="text-yellow-700">
                  Your pharmacy needs to be approved by an admin before you can manage inventory.
                </p>
              </div>
            ) : (
              <>
                {/* Inventory Actions */}
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Medicine Inventory
                    </h2>
                    <button
                      onClick={() => {
                        setShowAddInventory(true);
                        setEditingInventory(null);
                        setInventoryForm({
                          medicineId: '',
                          price: '',
                          stock: '',
                          availability: true,
                        });
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Add Medicine
                    </button>
                  </div>

                  {/* Add/Edit Medicine Form */}
                  {showAddInventory && (
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {editingInventory ? 'Edit Medicine' : 'Add Medicine to Inventory'}
                      </h3>
                      
                      <form onSubmit={handleInventorySubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Medicine *
                            </label>
                            <select
                              required
                              value={inventoryForm.medicineId}
                              onChange={(e) => setInventoryForm({...inventoryForm, medicineId: e.target.value})}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              disabled={editingInventory} // Can't change medicine when editing
                            >
                              <option value="">Select a medicine</option>
                              {medicines.map((medicine) => (
                                <option key={medicine.id} value={medicine.id}>
                                  {medicine.name}
                                  {medicine.genericName && ` (Generic: ${medicine.genericName})`}
                                  {medicine.brand && ` - ${medicine.brand}`}
                                  {medicine.strength && ` - ${medicine.strength}`}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Price *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              value={inventoryForm.price}
                              onChange={(e) => setInventoryForm({...inventoryForm, price: e.target.value})}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0.00"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Stock Quantity *
                            </label>
                            <input
                              type="number"
                              min="0"
                              required
                              value={inventoryForm.stock}
                              onChange={(e) => setInventoryForm({...inventoryForm, stock: e.target.value})}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Min Stock Level
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={inventoryForm.minStockLevel}
                              onChange={(e) => setInventoryForm({...inventoryForm, minStockLevel: e.target.value})}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="10"
                            />
                          </div>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="availability"
                            checked={inventoryForm.availability}
                            onChange={(e) => setInventoryForm({...inventoryForm, availability: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="availability" className="ml-2 block text-sm text-gray-900">
                            Available for customers
                          </label>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {loading ? <LoadingSpinner size="small" /> : editingInventory ? 'Update Medicine' : 'Add Medicine'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddInventory(false);
                              setEditingInventory(null);
                            }}
                            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Inventory List */}
                  <div className="overflow-x-auto">
                    {inventory.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">📦</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items</h3>
                        <p className="text-gray-500">Start by adding medicines to your inventory</p>
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Medicine
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {inventory.map((item) => (
                            <tr key={item.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.medicine.name}
                                  </div>
                                  {item.medicine.genericName && (
                                    <div className="text-sm text-blue-600">
                                      Generic: {item.medicine.genericName}
                                    </div>
                                  )}
                                  <div className="text-sm text-gray-500">
                                    {item.medicine.brand && `${item.medicine.brand} - `}
                                    {item.medicine.strength}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ৳{parseFloat(item.price).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{item.stock} units</div>
                                {item.stock <= item.minStockLevel && (
                                  <div className="text-xs text-red-600">Low stock!</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  item.availability 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {item.availability ? 'Available' : 'Unavailable'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                                  onClick={() => startEditInventory(item)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteInventory(item.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Orders & Delivery Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white shadow rounded-lg p-6">
            <PharmacyOrders pharmacyId={pharmacy?.id} />
          </div>
        )}
      </div>
    </PharmacyLayout>
  );
};

export default PharmacyDashboard;