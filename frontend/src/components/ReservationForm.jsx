import { useState } from 'react';
import { reservationAPI } from '../services/api';
import Alert from './Alert';
import LoadingSpinner from './LoadingSpinner';

const ReservationForm = ({ medicine, pharmacy, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    deliveryOption: 'pickup',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      // Validate delivery address
      if (formData.deliveryOption === 'delivery' && !formData.address.trim()) {
        setAlert({ type: 'error', message: 'Please provide a delivery address' });
        setLoading(false);
        return;
      }

      // Check quantity
      if (formData.quantity < 1 || formData.quantity > pharmacy.stock) {
        setAlert({ 
          type: 'error', 
          message: `Please enter a quantity between 1 and ${pharmacy.stock}` 
        });
        setLoading(false);
        return;
      }

      const reservationData = {
        customerId: user.id,
        pharmacyId: pharmacy.pharmacyId,
        medicineId: medicine.id,
        quantity: parseInt(formData.quantity),
        deliveryOption: formData.deliveryOption,
        address: formData.deliveryOption === 'delivery' ? formData.address : undefined
      };

      const response = await reservationAPI.create(reservationData);

      setAlert({ 
        type: 'success', 
        message: 'Reservation created successfully!' 
      });

      setTimeout(() => {
        if (onSuccess) onSuccess(response.data.reservation);
        if (onClose) onClose();
      }, 1500);

    } catch (error) {
      console.error('Reservation error:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to create reservation'
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = (pharmacy.price * formData.quantity).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Reserve Medicine</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {alert && <Alert type={alert.type} message={alert.message} />}

          {/* Medicine Details */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-lg text-gray-800">{medicine.name}</h3>
            <p className="text-gray-600 text-sm">{medicine.brand}</p>
            <p className="text-gray-500 text-sm mt-1">Type: {medicine.type}</p>
          </div>

          {/* Pharmacy Details */}
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-gray-800">{pharmacy.pharmacyName}</h4>
            <p className="text-gray-600 text-sm">{pharmacy.pharmacyAddress}</p>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600">Price: ₱{pharmacy.price}</span>
              <span className="text-sm text-gray-600">Stock: {pharmacy.stock}</span>
            </div>
          </div>

          {/* Reservation Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                max={pharmacy.stock}
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Delivery Option */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Option
              </label>
              <select
                name="deliveryOption"
                value={formData.deliveryOption}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            {/* Delivery Address */}
            {formData.deliveryOption === 'delivery' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your complete delivery address"
                  required={formData.deliveryOption === 'delivery'}
                />
              </div>
            )}

            {/* Total Price */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Total Price:</span>
                <span className="text-2xl font-bold text-blue-600">₱{totalPrice}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="small" /> : 'Reserve'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;
