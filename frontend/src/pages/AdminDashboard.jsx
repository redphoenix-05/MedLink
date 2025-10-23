import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import API, { adminAPI } from '../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Store, CheckCircle, Users } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  //State for different sections
  const [stats, setStats] = useState({
    users: { total: 0, customer: 0, pharmacy: 0, admin: 0 },
    pharmacies: { total: 0, pending: 0, approved: 0, rejected: 0 },
    reservations: { total: 0, pending: 0, accepted: 0, delivered: 0, rejected: 0 },
    deliveries: { total: 0, pending: 0, out_for_delivery: 0, delivered: 0 },
    totalMedicines: 0,
    revenue: 0,
    medicineTrends: [],
    recentActivity: { users: 0, pharmacies: 0 }
  });
  
  const [pendingPharmacies, setPendingPharmacies] = useState([]);
  const [approvedPharmacies, setApprovedPharmacies] = useState([]);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  
  // Modal states
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [showPharmacyDetails, setShowPharmacyDetails] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'pending') {
      fetchPendingPharmacies();
    } else if (activeTab === 'approved') {
      fetchApprovedPharmacies();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'reservations') {
      fetchReservations();
    } else if (activeTab === 'deliveries') {
      fetchDeliveries();
    }
  }, [activeTab]);

  const fetchInitialData = async () => {
    await fetchStats();
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching admin stats...');
      const response = await adminAPI.getStats();
      console.log('📊 Admin stats response:', response.data);
      if (response.data.success) {
        setStats(response.data.data);
        console.log('✅ Stats updated:', response.data.data);
      } else {
        console.error('❌ Stats fetch failed:', response.data);
        setError('Failed to load dashboard statistics');
      }
    } catch (err) {
      console.error('❌ Stats fetch error:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPharmacies = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingPharmacies();
      if (response.data.success) {
        // Backend returns data directly, not nested in .pharmacies
        setPendingPharmacies(response.data.data || []);
      }
    } catch (err) {
      setError('Failed to load pending pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedPharmacies = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching approved pharmacies...');
      const response = await adminAPI.getApprovedPharmacies();
      console.log('✅ Approved pharmacies response:', response.data);
      if (response.data.success) {
        // Backend returns data directly, not nested in .pharmacies
        setApprovedPharmacies(response.data.data || []);
      }
    } catch (err) {
      console.error('❌ Failed to load approved pharmacies:', err);
      setError(err.response?.data?.message || 'Failed to load approved pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      if (response.data.success) {
        // Backend returns data directly, not nested in .users
        setUsers(response.data.data || []);
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllReservations();
      if (response.data.success) {
        // Backend returns data directly, not nested in .reservations
        setReservations(response.data.data || []);
      }
    } catch (err) {
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllDeliveries();
      if (response.data.success) {
        // Backend returns data directly, not nested in .deliveries
        setDeliveries(response.data.data || []);
      }
    } catch (err) {
      setError('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePharmacy = async (pharmacyId) => {
    try {
      const response = await adminAPI.approvePharmacy(pharmacyId);
      if (response.data.success) {
        setSuccess('Pharmacy approved successfully!');
        fetchPendingPharmacies();
        fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve pharmacy');
    }
  };

  const handleRejectPharmacy = async (pharmacyId) => {
    if (window.confirm('Are you sure you want to reject this pharmacy?')) {
      try {
        const response = await adminAPI.rejectPharmacy(pharmacyId);
        if (response.data.success) {
          setSuccess('Pharmacy rejected successfully!');
          fetchPendingPharmacies();
          fetchStats();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to reject pharmacy');
      }
    }
  };

  const handleDeletePharmacy = async (pharmacyId) => {
    if (window.confirm('Are you sure you want to delete this pharmacy? This action cannot be undone.')) {
      try {
        const response = await API.delete(`/pharmacies/${pharmacyId}`);
        if (response.data.success) {
          setSuccess('Pharmacy deleted successfully!');
          if (activeTab === 'pending') {
            fetchPendingPharmacies();
          } else if (activeTab === 'approved') {
            fetchApprovedPharmacies();
          }
          fetchStats();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete pharmacy');
      }
    }
  };

  const handleViewPharmacyDetails = async (pharmacy) => {
    try {
      const response = await API.get(`/pharmacies/${pharmacy.id}`);
      if (response.data.success) {
        setSelectedPharmacy(response.data.data.pharmacy);
        setShowPharmacyDetails(true);
      }
    } catch (err) {
      setError('Failed to fetch pharmacy details');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.users.customer}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">🏪</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Pharmacies</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pharmacies.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">�</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Reservations Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.reservations.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm font-bold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-100">Platform Earnings</p>
              <p className="text-2xl font-bold text-white">৳{stats.platformEarnings?.total || '0.00'}</p>
              <p className="text-xs text-yellow-100 mt-1">Customer fees + Pharmacy commission</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Revenue Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Platform Revenue Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Completed Orders</p>
            <p className="text-2xl font-bold text-blue-600">{stats.orders?.completed || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total orders processed</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Customer Fees</p>
            <p className="text-2xl font-bold text-purple-600">৳{stats.platformEarnings?.customerFees || '0.00'}</p>
            <p className="text-xs text-gray-500 mt-1">0.3% from customers</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">Pharmacy Commission</p>
            <p className="text-2xl font-bold text-yellow-600">৳{stats.platformEarnings?.pharmacyCommission || '0.00'}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.platformEarnings?.commissionRate || 3}% from pharmacies</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
            <p className="text-sm text-gray-600">Total Earnings</p>
            <p className="text-2xl font-bold text-green-600">৳{stats.platformEarnings?.total || '0.00'}</p>
            <p className="text-xs text-gray-500 mt-1">Combined revenue</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>ℹ️ Revenue Sources:</strong>
          </p>
          <ul className="text-sm text-gray-700 mt-2 space-y-1 ml-4">
            <li>• Customer Fee: 0.3% of medicine total (paid by customer)</li>
            <li>• Pharmacy Commission: {stats.platformEarnings?.commissionRate || 3}% of gross revenue (medicine + delivery)</li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('pending')}
            className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <h4 className="font-semibold text-orange-900">Review Pending Pharmacies</h4>
            <p className="text-sm text-orange-700">{stats.pharmacies.pending} pharmacies awaiting approval</p>
          </button>
          
          <button
            onClick={() => setActiveTab('approved')}
            className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <h4 className="font-semibold text-green-900">Approved Pharmacies</h4>
            <p className="text-sm text-green-700">{stats.pharmacies.approved} pharmacies approved</p>
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <h4 className="font-semibold text-blue-900">View Users</h4>
            <p className="text-sm text-blue-700">{stats.users.total} total users in system</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPendingPharmacies = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pending Pharmacies</h2>
        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
          {pendingPharmacies.length} Pending
        </span>
      </div>

      {pendingPharmacies.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <p className="text-gray-500">No pending pharmacies to review</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingPharmacies.map((pharmacy) => (
                <tr key={pharmacy.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pharmacy.name}</div>
                      <div className="text-sm text-gray-500">{pharmacy.address}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pharmacy.user?.name}</div>
                    <div className="text-sm text-gray-500">{pharmacy.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pharmacy.licenseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pharmacy.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewPharmacyDetails(pharmacy)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleApprovePharmacy(pharmacy.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectPharmacy(pharmacy.id)}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleDeletePharmacy(pharmacy.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderApprovedPharmacies = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Approved Pharmacies</h2>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {approvedPharmacies.length} Approved
        </span>
      </div>

      {approvedPharmacies.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <p className="text-gray-500">No approved pharmacies yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {approvedPharmacies.map((pharmacy) => (
                <tr key={pharmacy.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pharmacy.name}</div>
                      <div className="text-sm text-gray-500">{pharmacy.address}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pharmacy.user?.name}</div>
                    <div className="text-sm text-gray-500">{pharmacy.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pharmacy.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Approved
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewPharmacyDetails(pharmacy)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleDeletePharmacy(pharmacy.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Users List</h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {users.length} Users
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'pharmacy'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.pharmacy ? user.pharmacy.name : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Pharmacy Details Modal
  const PharmacyDetailsModal = () => (
    showPharmacyDetails && selectedPharmacy && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Pharmacy Details</h2>
              <button
                onClick={() => setShowPharmacyDetails(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedPharmacy.name}</p>
                    <p><span className="font-medium">Owner:</span> {selectedPharmacy.user?.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedPharmacy.user?.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedPharmacy.phone}</p>
                    <p><span className="font-medium">License:</span> {selectedPharmacy.licenseNumber}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-sm ${
                        selectedPharmacy.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : selectedPharmacy.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedPharmacy.status}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Address</h3>
                  <p className="text-gray-700">{selectedPharmacy.address}</p>
                </div>
              </div>

              {/* Inventory */}
              {selectedPharmacy.inventory && selectedPharmacy.inventory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Medicines</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedPharmacy.inventory.map((item) => (
                        <div key={item.id} className="bg-white p-3 rounded border">
                          <h4 className="font-medium text-gray-900">{item.medicine.name}</h4>
                          <p className="text-sm text-gray-600">{item.medicine.brand}</p>
                          <p className="text-sm text-gray-600">Stock: {item.stock}</p>
                          <p className="text-sm text-gray-600">Price: ${item.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage pharmacies, users, and system settings</p>
        </div>

        {/* Alert Messages */}
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

        {/* Navigation Tabs - Modern Card Style */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 mb-8">
          <nav className="flex gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'pending', label: 'Pending Pharmacies', icon: Store },
              { id: 'approved', label: 'Approved Pharmacies', icon: CheckCircle },
              { id: 'users', label: 'Users List', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-gray-900 to-black text-white shadow-lg shadow-gray-300'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.id === 'overview' ? 'Overview' : 
                     tab.id === 'pending' ? 'Pending' : 
                     tab.id === 'approved' ? 'Approved' : 'Users'}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" text="Loading..." />
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'pending' && renderPendingPharmacies()}
            {activeTab === 'approved' && renderApprovedPharmacies()}
            {activeTab === 'users' && renderUsers()}
          </div>
        )}

        {/* Pharmacy Details Modal */}
        <PharmacyDetailsModal />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;