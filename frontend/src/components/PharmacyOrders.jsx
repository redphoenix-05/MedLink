import { useState, useEffect } from 'react';
import { reservationAPI, deliveryAPI } from '../services/api';
import Alert from './Alert';
import LoadingSpinner from './LoadingSpinner';

const PharmacyOrders = ({ pharmacyId }) => {
  const [reservations, setReservations] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [activeView, setActiveView] = useState('reservations');
  const [processingId, setProcessingId] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [deliveryForm, setDeliveryForm] = useState({
    address: '',
    deliveryPerson: ''
  });

  useEffect(() => {
    if (pharmacyId) {
      fetchData();
    }
  }, [pharmacyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resResponse, delResponse] = await Promise.all([
        reservationAPI.getPharmacyReservations(pharmacyId),
        deliveryAPI.getPharmacyDeliveries(pharmacyId)
      ]);
      setReservations(resResponse.data.data.reservations);
      setDeliveries(delResponse.data.data.deliveries);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load orders'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reservationId, status) => {
    const confirmMessage = status === 'accepted' 
      ? 'Accept this reservation?' 
      : status === 'rejected'
      ? 'Reject this reservation?'
      : 'Mark as delivered?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setProcessingId(reservationId);
      await reservationAPI.updateStatus(reservationId, status);
      setAlert({
        type: 'success',
        message: `Reservation ${status} successfully`
      });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update status'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateDelivery = async (reservation) => {
    setSelectedReservation(reservation);
    setDeliveryForm({
      address: '',
      deliveryPerson: ''
    });
    setShowDeliveryModal(true);
  };

  const submitDelivery = async (e) => {
    e.preventDefault();
    
    try {
      setProcessingId(selectedReservation.id);
      await deliveryAPI.create({
        reservationId: selectedReservation.id,
        address: deliveryForm.address,
        deliveryPerson: deliveryForm.deliveryPerson
      });
      
      setAlert({
        type: 'success',
        message: 'Delivery created successfully'
      });
      
      setShowDeliveryModal(false);
      fetchData();
    } catch (error) {
      console.error('Error creating delivery:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to create delivery'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateDeliveryStatus = async (deliveryId, deliveryStatus, deliveryPerson = null) => {
    try {
      setProcessingId(deliveryId);
      await deliveryAPI.updateStatus(deliveryId, { deliveryStatus, deliveryPerson });
      setAlert({
        type: 'success',
        message: 'Delivery status updated successfully'
      });
      fetchData();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update delivery status'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Orders & Delivery</h2>
        <button
          onClick={fetchData}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} />}

      {/* View Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveView('reservations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'reservations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reservations ({reservations.length})
          </button>
          <button
            onClick={() => setActiveView('deliveries')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'deliveries'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Deliveries ({deliveries.length})
          </button>
        </nav>
      </div>

      {/* Reservations View */}
      {activeView === 'reservations' && (
        <div className="space-y-4">
          {reservations.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No reservations yet</p>
            </div>
          ) : (
            reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      {reservation.medicine.name}
                    </h3>
                    <p className="text-sm text-gray-600">{reservation.medicine.brand}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(reservation.status)}`}>
                    {reservation.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Customer</p>
                    <p className="text-sm font-medium text-gray-800">{reservation.customer.name}</p>
                    <p className="text-xs text-gray-600">{reservation.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Order Details</p>
                    <p className="text-sm text-gray-800">Qty: {reservation.quantity}</p>
                    <p className="text-sm font-semibold text-gray-800">₱{parseFloat(reservation.totalPrice).toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-2 rounded mb-3">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Delivery:</span> {reservation.deliveryOption.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(reservation.createdAt).toLocaleString()}
                  </p>
                </div>

                {reservation.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(reservation.id, 'accepted')}
                      disabled={processingId === reservation.id}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:bg-green-300"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(reservation.id, 'rejected')}
                      disabled={processingId === reservation.id}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm disabled:bg-red-300"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {reservation.status === 'accepted' && reservation.deliveryOption === 'delivery' && !reservation.delivery && (
                  <button
                    onClick={() => handleCreateDelivery(reservation)}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Create Delivery
                  </button>
                )}

                {reservation.status === 'accepted' && reservation.deliveryOption === 'pickup' && (
                  <button
                    onClick={() => handleStatusUpdate(reservation.id, 'delivered')}
                    disabled={processingId === reservation.id}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:bg-blue-300"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Deliveries View */}
      {activeView === 'deliveries' && (
        <div className="space-y-4">
          {deliveries.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No deliveries yet</p>
            </div>
          ) : (
            deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      {delivery.reservation.medicine.name}
                    </h3>
                    <p className="text-sm text-gray-600">{delivery.reservation.customer.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(delivery.deliveryStatus)}`}>
                    {delivery.deliveryStatus.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Address:</span> {delivery.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Customer Phone:</span> {delivery.reservation.customer.phone}
                  </p>
                  {delivery.deliveryPerson && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Delivery Person:</span> {delivery.deliveryPerson}
                    </p>
                  )}
                </div>

                {delivery.deliveryStatus === 'pending' && (
                  <button
                    onClick={() => handleUpdateDeliveryStatus(delivery.id, 'out_for_delivery')}
                    disabled={processingId === delivery.id}
                    className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm disabled:bg-purple-300"
                  >
                    Mark as Out for Delivery
                  </button>
                )}

                {delivery.deliveryStatus === 'out_for_delivery' && (
                  <button
                    onClick={() => handleUpdateDeliveryStatus(delivery.id, 'delivered')}
                    disabled={processingId === delivery.id}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:bg-green-300"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Delivery Creation Modal */}
      {showDeliveryModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Create Delivery</h3>
            
            <form onSubmit={submitDelivery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <textarea
                  value={deliveryForm.address}
                  onChange={(e) => setDeliveryForm(prev => ({ ...prev, address: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Person (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryForm.deliveryPerson}
                  onChange={(e) => setDeliveryForm(prev => ({ ...prev, deliveryPerson: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeliveryModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === selectedReservation.id}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyOrders;
