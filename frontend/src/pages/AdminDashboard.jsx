import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import API, { adminAPI } from '../services/api';
import {
  LayoutDashboard,
  Store,
  CheckCircle,
  Users,
  Clock,
  Wallet,
  X,
  MapPin,
  ShieldCheck,
  Trash2,
  Eye,
  Check,
  Ban,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [stats, setStats] = useState({
    users: { total: 0, customer: 0, pharmacy: 0, admin: 0 },
    pharmacies: { total: 0, pending: 0, approved: 0, rejected: 0 },
    reservations: { total: 0, pending: 0, accepted: 0, delivered: 0, rejected: 0 },
    deliveries: { total: 0, pending: 0, out_for_delivery: 0, delivered: 0 },
    totalMedicines: 0,
    revenue: 0,
    medicineTrends: [],
    recentActivity: { users: 0, pharmacies: 0 },
  });

  const [pendingPharmacies, setPendingPharmacies] = useState([]);
  const [approvedPharmacies, setApprovedPharmacies] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [showPharmacyDetails, setShowPharmacyDetails] = useState(false);

  useEffect(() => {
    fetchStats();
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
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError('Failed to load dashboard statistics');
      }
    } catch (err) {
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
        setPendingPharmacies(response.data.data || []);
      }
    } catch {
      setError('Failed to load pending pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedPharmacies = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getApprovedPharmacies();
      if (response.data.success) {
        setApprovedPharmacies(response.data.data || []);
      }
    } catch (err) {
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
        setUsers(response.data.data || []);
      }
    } catch {
      setError('Failed to load users');
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
        const response = await API.delete(`/admin/pharmacies/${pharmacyId}`);
        if (response.data.success) {
          setSuccess('Pharmacy deleted successfully!');
          if (activeTab === 'pending') fetchPendingPharmacies();
          else if (activeTab === 'approved') fetchApprovedPharmacies();
          fetchStats();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete pharmacy');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        'Are you sure you want to delete this user? This will also delete all their associated data. This action cannot be undone.'
      )
    ) {
      try {
        const response = await adminAPI.deleteUser(userId);
        if (response.data.success) {
          setSuccess('User deleted successfully!');
          fetchUsers();
          fetchStats();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
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
    } catch {
      setError('Failed to fetch pharmacy details');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white border border-[#E4E1D8] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">
              Customers
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#E6F2EC] text-[#0F4C3A] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono-data text-3xl font-semibold text-[#121816]">
            {stats.users.customer}
          </p>
          <p className="text-xs text-[#78857F] mt-1">
            {stats.users.total} total registered accounts
          </p>
        </div>

        <div className="bg-white border border-[#E4E1D8] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">
              Pharmacies
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#E6F2EC] text-[#0F4C3A] flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono-data text-3xl font-semibold text-[#121816]">
            {stats.pharmacies.total}
          </p>
          <p className="text-xs text-[#0F4C3A] mt-1 font-medium">
            {stats.pharmacies.approved} approved branches
          </p>
        </div>

        <div className="bg-white border border-[#E4E1D8] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">
              Pending Review
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#FBECE6] text-[#C85A32] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono-data text-3xl font-semibold text-[#121816]">
            {stats.pharmacies.pending}
          </p>
          <p className="text-xs text-[#78857F] mt-1">
            {stats.reservations.pending} pending reservations
          </p>
        </div>

        <div className="bg-[#0B251D] text-[#F7F6F2] border border-[#193B2F] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#8FB3A5]">
              Platform Earnings
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#163D30] text-[#3DD598] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono-data text-3xl font-semibold text-white">
            ৳{stats.platformEarnings?.total || '0.00'}
          </p>
          <p className="text-xs text-[#8FB3A5] mt-1">
            Customer fees + pharmacy commission
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#E4E1D8] rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-base font-bold text-[#121816]">Platform Revenue Breakdown</h3>
            <p className="text-xs text-[#4E5B55] mt-0.5">
              0.3% customer fee + {stats.platformEarnings?.commissionRate || 3}% pharmacy commission on completed orders
            </p>
          </div>
          <span className="font-mono-data text-xs px-2.5 py-1 rounded-md bg-[#E6F2EC] text-[#0F4C3A] w-fit">
            BDT (৳)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E4E1D8]">
            <p className="text-xs text-[#4E5B55]">Completed Orders</p>
            <p className="font-mono-data text-2xl font-semibold text-[#121816] mt-1">
              {stats.orders?.completed || 0}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E4E1D8]">
            <p className="text-xs text-[#4E5B55]">Customer Fees (0.3%)</p>
            <p className="font-mono-data text-2xl font-semibold text-[#121816] mt-1">
              ৳{stats.platformEarnings?.customerFees || '0.00'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E4E1D8]">
            <p className="text-xs text-[#4E5B55]">
              Pharmacy Commission ({stats.platformEarnings?.commissionRate || 3}%)
            </p>
            <p className="font-mono-data text-2xl font-semibold text-[#121816] mt-1">
              ৳{stats.platformEarnings?.pharmacyCommission || '0.00'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#E6F2EC] border border-[#CBE5DA]">
            <p className="text-xs text-[#0F4C3A] font-semibold">Combined Revenue</p>
            <p className="font-mono-data text-2xl font-semibold text-[#0F4C3A] mt-1">
              ৳{stats.platformEarnings?.total || '0.00'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className="text-left p-5 bg-white border border-[#E4E1D8] rounded-xl hover:border-[#C85A32]/50 transition cursor-pointer"
        >
          <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#C85A32]">
            Action Queue
          </span>
          <h4 className="font-bold text-[#121816] mt-1">Review Pending Pharmacies</h4>
          <p className="text-xs text-[#4E5B55] mt-1">
            {stats.pharmacies.pending} branch(es) awaiting license verification
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className="text-left p-5 bg-white border border-[#E4E1D8] rounded-xl hover:border-[#0F4C3A]/50 transition cursor-pointer"
        >
          <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#0F4C3A]">
            Live Directory
          </span>
          <h4 className="font-bold text-[#121816] mt-1">Approved Pharmacies</h4>
          <p className="text-xs text-[#4E5B55] mt-1">
            {stats.pharmacies.approved} active branches serving customers
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className="text-left p-5 bg-white border border-[#E4E1D8] rounded-xl hover:border-[#0F4C3A]/50 transition cursor-pointer"
        >
          <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">
            Accounts
          </span>
          <h4 className="font-bold text-[#121816] mt-1">Manage Users</h4>
          <p className="text-xs text-[#4E5B55] mt-1">
            {stats.users.total} total accounts across all roles
          </p>
        </button>
      </div>
    </div>
  );

  const renderPendingPharmacies = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-[#121816]">Pending Pharmacies</h2>
        <span className="font-mono-data text-xs px-3 py-1 rounded-full bg-[#FBECE6] text-[#C85A32] font-semibold">
          {pendingPharmacies.length} Pending
        </span>
      </div>

      {pendingPharmacies.length === 0 ? (
        <div className="bg-white border border-[#E4E1D8] rounded-xl p-10 text-center text-sm text-[#4E5B55]">
          No pending pharmacy applications to review.
        </div>
      ) : (
        <div className="bg-white border border-[#E4E1D8] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#EFECE5]">
              <thead className="bg-[#FAF9F6]">
                <tr>
                  <th className="px-5 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Pharmacy</th>
                  <th className="px-5 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Owner</th>
                  <th className="px-5 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">License</th>
                  <th className="px-5 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Registered</th>
                  <th className="px-5 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE5]">
                {pendingPharmacies.map((pharmacy) => (
                  <tr key={pharmacy.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-[#121816]">{pharmacy.name}</div>
                      <div className="text-xs text-[#4E5B55] mt-0.5">
                        {pharmacy.city ? `${pharmacy.city} · ` : ''}{pharmacy.address}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#121816]">{pharmacy.user?.name || pharmacy.owner?.name}</div>
                      <div className="text-xs text-[#78857F]">{pharmacy.user?.email || pharmacy.owner?.email}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-mono-data text-xs text-[#121816]">
                      {pharmacy.licenseNumber}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-mono-data text-xs text-[#4E5B55]">
                      {new Date(pharmacy.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewPharmacyDetails(pharmacy)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#D4D0C5] bg-white text-[#121816] hover:bg-[#FAF9F6] text-xs font-semibold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprovePharmacy(pharmacy.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#0F4C3A] text-white hover:bg-[#16634C] text-xs font-semibold cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectPharmacy(pharmacy.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#FDF8EC] text-[#8A5311] border border-[#F1DCB0] hover:bg-[#F9EED2] text-xs font-semibold cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePharmacy(pharmacy.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#FDF2F0] text-[#9A2E1B] border border-[#F3C8BF] hover:bg-[#FADFD9] text-xs font-semibold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderApprovedPharmacies = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-[#121816]">Approved Pharmacies</h2>
        <span className="font-mono-data text-xs px-3 py-1 rounded-full bg-[#E6F2EC] text-[#0F4C3A] font-semibold">
          {approvedPharmacies.length} Approved
        </span>
      </div>

      {approvedPharmacies.length === 0 ? (
        <div className="bg-white border border-[#E4E1D8] rounded-xl p-10 text-center text-sm text-[#4E5B55]">
          No approved pharmacies yet.
        </div>
      ) : (
        <div className="bg-white border border-[#E4E1D8] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#EFECE5]">
              <thead className="bg-[#FAF9F6]">
                <tr>
                  <th className="px-5 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Pharmacy &amp; Branch</th>
                  <th className="px-5 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">City</th>
                  <th className="px-5 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Owner</th>
                  <th className="px-5 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Phone</th>
                  <th className="px-5 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE5]">
                {approvedPharmacies.map((pharmacy) => (
                  <tr key={pharmacy.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-[#121816]">{pharmacy.name}</div>
                      <div className="text-xs text-[#78857F] mt-0.5">{pharmacy.address}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono-data text-xs px-2.5 py-1 rounded-md bg-[#F2F0E9] text-[#121816]">
                        {pharmacy.city || 'Dhaka'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#121816]">{pharmacy.user?.name || pharmacy.owner?.name}</div>
                      <div className="text-xs text-[#78857F]">{pharmacy.user?.email || pharmacy.owner?.email}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-mono-data text-xs text-[#121816]">
                      {pharmacy.phone}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewPharmacyDetails(pharmacy)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#D4D0C5] bg-white text-[#121816] hover:bg-[#FAF9F6] text-xs font-semibold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePharmacy(pharmacy.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#FDF2F0] text-[#9A2E1B] border border-[#F3C8BF] hover:bg-[#FADFD9] text-xs font-semibold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-[#121816]">Users Directory</h2>
        <span className="font-mono-data text-xs px-3 py-1 rounded-full bg-[#E6F2EC] text-[#0F4C3A] font-semibold">
          {users.length} Accounts
        </span>
      </div>

      <div className="bg-white border border-[#E4E1D8] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#EFECE5]">
            <thead className="bg-[#FAF9F6]">
              <tr>
                <th className="px-5 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">User</th>
                <th className="px-5 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Phone</th>
                <th className="px-5 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Role</th>
                <th className="px-5 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Joined</th>
                <th className="px-5 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE5]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF9F6] transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-[#121816]">{u.name}</div>
                    <div className="text-xs text-[#78857F]">{u.email}</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap font-mono-data text-xs text-[#121816]">
                    {u.phone || '—'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`font-mono-data uppercase text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                        u.role === 'admin'
                          ? 'bg-[#081C16] text-[#3DD598]'
                          : u.role === 'pharmacy'
                          ? 'bg-[#E6F2EC] text-[#0F4C3A]'
                          : 'bg-[#F2F0E9] text-[#4E5B55]'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap font-mono-data text-xs text-[#4E5B55]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {u.role !== 'admin' ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#FDF2F0] text-[#9A2E1B] border border-[#F3C8BF] hover:bg-[#FADFD9] text-xs font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    ) : (
                      <span className="font-mono-data text-[11px] text-[#78857F]">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const PharmacyDetailsModal = () =>
    showPharmacyDetails &&
    selectedPharmacy && (
      <div className="fixed inset-0 bg-[#081C16]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div className="bg-white border border-[#E4E1D8] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-5 sm:p-6">
            <div className="flex justify-between items-center pb-4 border-b border-[#EFECE5] mb-5">
              <div>
                <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#0F4C3A]">
                  {selectedPharmacy.city || 'Pharmacy'} · {selectedPharmacy.branchName || 'Branch'}
                </span>
                <h2 className="font-editorial text-3xl text-[#121816] mt-0.5">
                  {selectedPharmacy.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPharmacyDetails(false)}
                className="p-2 rounded-lg text-[#4E5B55] hover:bg-[#F7F6F2] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#FAF9F6] border border-[#E4E1D8] rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-[#121816] mb-2">
                    <ShieldCheck className="w-4 h-4 text-[#0F4C3A]" />
                    Dispensary Credentials
                  </div>
                  <p><span className="text-[#4E5B55]">Owner:</span> <span className="font-medium text-[#121816]">{selectedPharmacy.owner?.name || selectedPharmacy.user?.name}</span></p>
                  <p><span className="text-[#4E5B55]">Email:</span> <span className="font-mono-data text-xs">{selectedPharmacy.owner?.email || selectedPharmacy.user?.email}</span></p>
                  <p><span className="text-[#4E5B55]">Phone:</span> <span className="font-mono-data text-xs">{selectedPharmacy.phone}</span></p>
                  <p><span className="text-[#4E5B55]">License:</span> <span className="font-mono-data text-xs font-semibold">{selectedPharmacy.licenseNumber}</span></p>
                </div>

                <div className="bg-[#FAF9F6] border border-[#E4E1D8] rounded-xl p-4 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-[#121816] mb-2">
                    <MapPin className="w-4 h-4 text-[#0F4C3A]" />
                    Location &amp; Status
                  </div>
                  <p className="text-[#4E5B55] mb-3">{selectedPharmacy.address}</p>
                  <span
                    className={`font-mono-data uppercase text-xs px-2.5 py-1 rounded-full font-semibold ${
                      selectedPharmacy.status === 'approved'
                        ? 'bg-[#E6F2EC] text-[#0F4C3A]'
                        : selectedPharmacy.status === 'pending'
                        ? 'bg-[#FDF8EC] text-[#8A5311]'
                        : 'bg-[#FDF2F0] text-[#9A2E1B]'
                    }`}
                  >
                    {selectedPharmacy.status}
                  </span>
                </div>
              </div>

              {selectedPharmacy.inventory && selectedPharmacy.inventory.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#4E5B55] mb-3">
                    Stocked Medicines ({selectedPharmacy.inventory.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedPharmacy.inventory.map((item) => (
                      <div key={item.id} className="bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E4E1D8]">
                        <h4 className="font-semibold text-sm text-[#121816]">{item.medicine?.name}</h4>
                        <p className="text-xs text-[#4E5B55]">{item.medicine?.brand}</p>
                        <div className="flex justify-between mt-2 pt-2 border-t border-[#E4E1D8] font-mono-data text-xs">
                          <span className="text-[#0F4C3A]">{item.stock} in stock</span>
                          <span className="font-semibold text-[#121816]">৳{parseFloat(item.price).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-[#081C16] bg-clinical-grid-dark rounded-2xl border border-[#16362B] p-6 sm:p-8 text-[#F7F6F2]">
          <span className="font-mono-data text-[11px] uppercase tracking-[0.16em] text-[#3DD598]">
            System Oversight · {user?.name || 'Administrator'}
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-white mt-1.5">
            Administrator Console
          </h1>
          <p className="text-sm text-[#B7CEC5] mt-1">
            Verify dispensary licenses, monitor nationwide branches, and track platform revenue.
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="bg-white rounded-xl border border-[#E4E1D8] p-1.5">
          <nav className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'overview', label: 'Overview', short: 'Overview', icon: LayoutDashboard },
              { id: 'pending', label: 'Pending Pharmacies', short: 'Pending', icon: Store },
              { id: 'approved', label: 'Approved Pharmacies', short: 'Approved', icon: CheckCircle },
              { id: 'users', label: 'Users List', short: 'Users', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2.5 px-3 rounded-lg font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    active
                      ? 'bg-[#081C16] text-white'
                      : 'text-[#4E5B55] hover:bg-[#F7F6F2] hover:text-[#121816]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline truncate">{tab.label}</span>
                  <span className="md:hidden truncate">{tab.short}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" text="Loading console data..." />
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'pending' && renderPendingPharmacies()}
            {activeTab === 'approved' && renderApprovedPharmacies()}
            {activeTab === 'users' && renderUsers()}
          </div>
        )}

        <PharmacyDetailsModal />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
