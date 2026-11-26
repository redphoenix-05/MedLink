import { useState, useEffect } from 'react';
import { Wallet, Package, Clock, Truck, Store, CheckCircle2 } from 'lucide-react';
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
      const query = pharmacyId ? `?pharmacyId=${pharmacyId}` : '';
      const response = await api.get(`/pharmacies/orders${query}`);
      const backendStats = response.data.data.stats || {};
      const ordersData = response.data.data.orders || [];

      setStats({
        total: backendStats.total || 0,
        pending: backendStats.pending || 0,
        confirmed: backendStats.confirmed || 0,
        delivered: backendStats.delivered || 0,
        totalOrders: backendStats.completed || 0,
        totalMedicineSales: backendStats.totalMedicineSales || '0.00',
        totalDeliveryEarnings: backendStats.totalDeliveryEarnings || '0.00',
        grossRevenue: backendStats.grossRevenue || '0.00',
        platformFeeRate: backendStats.platformFeeRate || '3',
        totalPlatformFee: backendStats.totalPlatformFee || '0.00',
        netRevenue: backendStats.netRevenue || '0.00',
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
      await api.put(`/pharmacies/orders/${orderId}`, { status, deliveryDate });
      setSuccess('Order status updated');
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order');
    }
  };

  const handleConfirmOrder = (orderId) => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    updateOrderStatus(orderId, 'confirmed', deliveryDate);
  };

  const handleMarkDelivered = (orderId) => updateOrderStatus(orderId, 'delivered', new Date());
  const handleCompleteOrder = (orderId) => updateOrderStatus(orderId, 'completed', null);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" text="Loading branch orders..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[#0B251D] text-[#F7F6F2] border border-[#193B2F] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#8FB3A5]">
              Net Revenue
            </span>
            <Wallet className="w-4 h-4 text-[#3DD598]" />
          </div>
          <p className="font-mono-data text-3xl font-semibold text-white">
            ৳{stats?.netRevenue || '0.00'}
          </p>
          <p className="text-xs text-[#8FB3A5] mt-1">After {stats?.platformFeeRate || 3}% platform fee</p>
        </div>

        <div className="bg-white border border-[#E4E1D8] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">
              Completed Orders
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#0F4C3A]" />
          </div>
          <p className="font-mono-data text-3xl font-semibold text-[#121816]">
            {stats?.totalOrders || 0}
          </p>
          <p className="text-xs text-[#78857F] mt-1">Out of {stats?.total || 0} total</p>
        </div>

        <div className="bg-white border border-[#E4E1D8] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">
              Pending
            </span>
            <Clock className="w-4 h-4 text-[#C85A32]" />
          </div>
          <p className="font-mono-data text-3xl font-semibold text-[#121816]">
            {stats?.pending || 0}
          </p>
          <p className="text-xs text-[#78857F] mt-1">Awaiting confirmation</p>
        </div>

        <div className="bg-white border border-[#E4E1D8] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">
              In Progress
            </span>
            <Truck className="w-4 h-4 text-[#0F4C3A]" />
          </div>
          <p className="font-mono-data text-3xl font-semibold text-[#121816]">
            {(stats?.confirmed || 0) + (stats?.delivered || 0)}
          </p>
          <p className="text-xs text-[#78857F] mt-1">Confirmed or out for delivery</p>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="bg-white border border-[#E4E1D8] rounded-2xl p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#121816] mb-4">Financial Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between items-center p-3 rounded-lg bg-[#FAF9F6] border border-[#E4E1D8]">
              <span className="text-[#4E5B55]">Medicine Sales</span>
              <span className="font-mono-data font-semibold text-[#121816]">৳{stats?.totalMedicineSales || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-[#FAF9F6] border border-[#E4E1D8]">
              <span className="text-[#4E5B55]">Delivery Charges</span>
              <span className="font-mono-data font-semibold text-[#121816]">৳{stats?.totalDeliveryEarnings || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-[#F2F0E9] font-semibold">
              <span className="text-[#121816]">Gross Revenue</span>
              <span className="font-mono-data text-[#121816]">৳{stats?.grossRevenue || '0.00'}</span>
            </div>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between items-center p-3 rounded-lg bg-[#FDF2F0] border border-[#F3C8BF]">
              <span className="text-[#9A2E1B]">Platform Fee ({stats?.platformFeeRate || 3}%)</span>
              <span className="font-mono-data font-semibold text-[#9A2E1B]">- ৳{stats?.totalPlatformFee || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center p-3.5 rounded-lg bg-[#E6F2EC] border border-[#CBE5DA] font-semibold">
              <span className="text-[#0F4C3A]">Net Dispensary Revenue</span>
              <span className="font-mono-data text-lg text-[#0F4C3A]">৳{stats?.netRevenue || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Orders Table */}
      <div className="bg-white border border-[#E4E1D8] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EFECE5] flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#121816]">Order Fulfillment Queue</h2>
            <p className="text-xs text-[#78857F] mt-0.5">
              {stats?.total || 0} total · {stats?.pending || 0} pending · {stats?.confirmed || 0} confirmed · {stats?.delivered || 0} delivered
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 mx-auto text-[#9DA49F] mb-3" />
            <p className="text-sm font-semibold text-[#121816]">No orders yet</p>
            <p className="text-xs text-[#78857F] mt-1">Customer orders for this branch will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#EFECE5]">
              <thead className="bg-[#FAF9F6]">
                <tr>
                  <th className="px-4 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Date</th>
                  <th className="px-4 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Customer</th>
                  <th className="px-4 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Medicine</th>
                  <th className="px-4 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Total</th>
                  <th className="px-4 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Fulfillment</th>
                  <th className="px-4 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Status</th>
                  <th className="px-4 py-3 text-left font-mono-data text-[11px] uppercase tracking-wider text-[#4E5B55]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE5] text-sm">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF9F6]">
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono-data text-xs text-[#4E5B55]">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-[#121816]">{order.customer?.name || 'Customer'}</div>
                      <div className="text-xs text-[#78857F]">{order.customer?.phone || order.customer?.email || ''}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[#121816]">{order.medicineName}</div>
                      <div className="text-xs text-[#78857F]">
                        Qty: {order.quantity} × ৳{parseFloat(order.unitPrice).toFixed(2)}
                        {order.pharmacy?.city ? ` · ${order.pharmacy.city}` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono-data font-semibold text-[#0F4C3A]">
                      ৳{parseFloat(order.grandTotal || order.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-[#F2F0E9] text-[#121816]">
                        {order.deliveryType === 'delivery' ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                        {order.deliveryType}
                      </span>
                      {order.deliveryAddress && (
                        <div className="text-xs text-[#78857F] max-w-[180px] truncate mt-1" title={order.deliveryAddress}>
                          {order.deliveryAddress}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`font-mono-data uppercase text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                          order.status === 'completed'
                            ? 'bg-[#E6F2EC] text-[#0F4C3A]'
                            : order.status === 'pending'
                            ? 'bg-[#FDF8EC] text-[#8A5311]'
                            : 'bg-[#F0F5F9] text-[#1E4A6E]'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {order.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleConfirmOrder(order.id)}
                          className="px-3 py-1.5 rounded-md bg-[#0F4C3A] text-white text-xs font-semibold hover:bg-[#16634C] cursor-pointer"
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === 'confirmed' && order.deliveryType === 'delivery' && (
                        <button
                          type="button"
                          onClick={() => handleMarkDelivered(order.id)}
                          className="px-3 py-1.5 rounded-md bg-[#0F4C3A] text-white text-xs font-semibold hover:bg-[#16634C] cursor-pointer"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {((order.status === 'confirmed' && order.deliveryType === 'pickup') ||
                        order.status === 'delivered') && (
                        <button
                          type="button"
                          onClick={() => handleCompleteOrder(order.id)}
                          className="px-3 py-1.5 rounded-md bg-[#E6F2EC] text-[#0F4C3A] border border-[#CBE5DA] text-xs font-semibold hover:bg-[#0F4C3A] hover:text-white transition cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                      {order.status === 'completed' && (
                        <span className="font-mono-data text-xs text-[#78857F]">Done</span>
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
