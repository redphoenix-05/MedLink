import { useState, useEffect } from 'react';
import { reservationAPI } from '../services/api';
import Alert from './Alert';
import LoadingSpinner from './LoadingSpinner';

const MyReservationsList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationAPI.getCustomerReservations(user.id);
      setReservations(response.data.data.reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load reservations'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      setCancellingId(reservationId);
      await reservationAPI.cancel(reservationId);
      setAlert({
        type: 'success',
        message: 'Reservation cancelled successfully'
      });
      fetchReservations();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to cancel reservation'
      });
    } finally {
      setCancellingId(null);
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
        <h2 className="text-2xl font-bold text-gray-800">My Reservations</h2>
        <button
          onClick={fetchReservations}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} />}

      {reservations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-gray-600">No reservations yet</p>
          <p className="text-sm text-gray-500">Search for medicines and make your first reservation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
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

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-medium">{reservation.pharmacy.name}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{reservation.pharmacy.address}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="font-semibold text-gray-800">{reservation.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Price</p>
                    <p className="font-semibold text-gray-800">₱{parseFloat(reservation.totalPrice).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Delivery</p>
                    <p className="font-semibold text-gray-800 capitalize">{reservation.deliveryOption}</p>
                  </div>
                </div>

                {reservation.delivery && (
                  <div className="bg-blue-50 p-3 rounded-lg mt-2">
                    <p className="text-xs text-gray-600 font-medium mb-1">Delivery Status</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-blue-800 capitalize">
                        {reservation.delivery.deliveryStatus.replace('_', ' ')}
                      </span>
                      {reservation.delivery.deliveryPerson && (
                        <span className="text-xs text-gray-600">
                          Driver: {reservation.delivery.deliveryPerson}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Address: {reservation.delivery.address}
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 pt-2">
                  Created: {new Date(reservation.createdAt).toLocaleString()}
                </p>
              </div>

              {reservation.status === 'pending' && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleCancel(reservation.id)}
                    disabled={cancellingId === reservation.id}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-red-300"
                  >
                    {cancellingId === reservation.id ? 'Cancelling...' : 'Cancel Reservation'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReservationsList;
