import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';
import api from '../services/api';

const PharmacyOrders = ({ pharmacyId }) => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pharmacies/orders');
      
      // Backend returns { orders, stats } with detailed financial breakdown
      const backendStats = response.data.data.stats || {};
      const ordersData = response.data.data.orders || [];
      
      // Use backend stats directly (already formatted)
      setStats({
        // Order counts
        total: backendStats.total || 0,
        pending: backendStats.pending || 0,
        confirmed: backendStats.confirmed || 0,
        delivered: backendStats.delivered || 0,
        totalOrders: backendStats.completed || 0,
        
        // Financial breakdown
        totalMedicineSales: backendStats.totalMedicineSales || '0.00',
        totalDeliveryEarnings: backendStats.totalDeliveryEarnings || '0.00',
        grossRevenue: backendStats.grossRevenue || '0.00',
        platformFeeRate: backendStats.platformFeeRate || '3',
        totalPlatformFee: backendStats.totalPlatformFee || '0.00',
        netRevenue: backendStats.netRevenue || '0.00',
        totalEarnings: backendStats.grossRevenue || '0.00'
      });
      
      setOrders(ordersData);
      setError('');
    } catch (err) {
      console.error('Error fetching pharmacy orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pharmacyId]);

  const updateOrderStatus = async (orderId, status, deliveryDate) => {
    try {
      await api.put(`/pharmacies/orders/${orderId}`, { 
        status, 
        deliveryDate 
      });
      setSuccess('Order updated successfully');
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order');
    }
  };

  const handleConfirmOrder = (orderId) => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 1); // Next day
    updateOrderStatus(orderId, 'confirmed', deliveryDate);
  };

  const handleMarkDelivered = (orderId) => {
    updateOrderStatus(orderId, 'delivered', new Date());
  };

  const handleCompleteOrder = (orderId) => {
    updateOrderStatus(orderId, 'completed', null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert type="error" message={error} />
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Orders & Statistics</h1>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Net Revenue</p>
                <p className="text-3xl font-bold mt-2">৳{stats?.netRevenue || '0.00'}</p>
                <p className="text-green-100 text-xs mt-1">After platform fee</p>
              </div>
              <svg className="w-12 h-12 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{stats?.totalOrders || 0}</p>
                <p className="text-blue-100 text-xs mt-1">Completed orders</p>
              </div>
              <svg className="w-12 h-12 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Pending Orders</p>
                <p className="text-3xl font-bold mt-2">{stats?.pending || 0}</p>
                <p className="text-purple-100 text-xs mt-1">Awaiting confirmation</p>
              </div>
              <svg className="w-12 h-12 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active Orders</p>
                <p className="text-3xl font-bold mt-2">{(stats?.confirmed || 0) + (stats?.delivered || 0)}</p>
                <p className="text-orange-100 text-xs mt-1">In progress</p>
              </div>
              <svg className="w-12 h-12 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

      {/* Financial Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 Financial Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700 font-medium">Medicine Sales</span>
              <span className="text-lg font-bold text-blue-600">৳{stats?.totalMedicineSales || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-gray-700 font-medium">Delivery Charges</span>
              <span className="text-lg font-bold text-orange-600">৳{stats?.totalDeliveryEarnings || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border-t-2 border-gray-300">
              <span className="text-gray-900 font-semibold">Gross Revenue</span>
              <span className="text-xl font-bold text-gray-900">৳{stats?.grossRevenue || '0.00'}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700 font-medium">Platform Fee ({stats?.platformFeeRate || 3}%)</span>
              <span className="text-lg font-bold text-red-600">- ৳{stats?.totalPlatformFee || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-2 border-green-300">
              <span className="text-gray-900 font-semibold text-lg">💵 Net Revenue</span>
              <span className="text-2xl font-bold text-green-600">৳{stats?.netRevenue || '0.00'}</span>
            </div>
            <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
              <p className="font-medium mb-1">ℹ️ About Platform Fee:</p>
              <p>A {stats?.platformFeeRate || 3}% fee is charged on your total gross revenue (medicine sales + delivery charges) to maintain and improve the platform services.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Management Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Order Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {stats?.total || 0} orders | 
            Pending: {stats?.pending || 0} | 
            Confirmed: {stats?.confirmed || 0} | 
            Delivered: {stats?.delivered || 0}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-lg font-medium">No orders yet</p>
            <p className="text-sm">Orders will appear here when customers place them</p>
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
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
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
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{order.customer?.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.medicineName}</div>
                      {order.genericName && (
                        <div className="text-sm text-gray-500">Generic: {order.genericName}</div>
                      )}
                      <div className="text-xs text-gray-500">Qty: {order.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">৳{parseFloat(order.unitPrice).toFixed(2)} × {order.quantity}</div>
                      <div className="text-sm font-semibold text-indigo-600">Total: ৳{parseFloat(order.totalPrice).toFixed(2)}</div>
                      {order.deliveryCharge > 0 && (
                        <div className="text-xs text-gray-500">Delivery: ৳{parseFloat(order.deliveryCharge).toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.deliveryType === 'delivery'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {order.deliveryType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                      </span>
                      {order.deliveryType === 'delivery' && order.deliveryAddress && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs">{order.deliveryAddress}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                      {order.deliveryDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleConfirmOrder(order.id)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === 'confirmed' && order.deliveryType === 'delivery' && (
                        <button
                          onClick={() => handleMarkDelivered(order.id)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {order.status === 'confirmed' && order.deliveryType === 'pickup' && (
                        <button
                          onClick={() => handleCompleteOrder(order.id)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Complete
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => handleCompleteOrder(order.id)}
                          className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyOrders;
