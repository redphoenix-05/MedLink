import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import api from '../services/api';

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [deliveryType, setDeliveryType] = useState('pickup');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data.data.cart || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await api.put(`/cart/${itemId}`, { quantity: newQuantity });
      setSuccess('Cart updated successfully');
      fetchCart();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update cart');
    }
  };

  const removeItem = async (itemId) => {
    if (!confirm('Remove this item from cart?')) return;

    try {
      await api.delete(`/cart/${itemId}`);
      setSuccess('Item removed from cart');
      fetchCart();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!confirm('Clear entire cart?')) return;

    try {
      await api.delete('/cart');
      setSuccess('Cart cleared successfully');
      fetchCart();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear cart');
    }
  };

  const handleCheckout = async () => {
    try {
      setProcessingCheckout(true);
      setError('');
      
      const response = await api.post('/cart/checkout', { deliveryType });
      
      setSuccess(`Successfully created ${response.data.data.orders.length} order(s)!`);
      
      // Wait 2 seconds then refresh cart
      setTimeout(() => {
        setSuccess('Your order has been placed successfully!');
        fetchCart();
        setProcessingCheckout(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to checkout');
      setProcessingCheckout(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  const totalItems = cart.reduce((sum, pharmacy) => 
    sum + pharmacy.items.reduce((s, item) => s + item.quantity, 0), 0
  );

  const medicineTotal = cart.reduce((sum, pharmacy) => sum + parseFloat(pharmacy.totalPrice), 0);
  const deliveryCharge = deliveryType === 'delivery' ? 60.00 : 0.00;
  const platformFee = medicineTotal * 0.003; // 0.3%
  const grandTotal = medicineTotal + deliveryCharge + platformFee;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
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
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-2 text-gray-500">Start adding medicines to your cart!</p>
            <button
              onClick={() => navigate('/customer/browse')}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Browse Pharmacies
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Delivery Option Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Option</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-4 border-2 rounded-lg text-left transition ${
                    deliveryType === 'pickup'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">🏪 Pickup</p>
                      <p className="text-sm text-gray-600">Free - Pick up from pharmacy</p>
                    </div>
                    {deliveryType === 'pickup' && (
                      <span className="text-indigo-600">✓</span>
                    )}
                  </div>
                </button>
                
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-4 border-2 rounded-lg text-left transition ${
                    deliveryType === 'delivery'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">🚚 Delivery</p>
                      <p className="text-sm text-gray-600">+৳60 - Delivered to you</p>
                    </div>
                    {deliveryType === 'delivery' && (
                      <span className="text-indigo-600">✓</span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Cart Summary with Fees */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Total Items:</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Medicine Total:</span>
                  <span className="font-medium">৳{medicineTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge:</span>
                  <span className="font-medium">৳{deliveryCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee (0.3%):</span>
                  <span className="font-medium">৳{platformFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Grand Total:</span>
                    <span className="text-2xl font-bold text-indigo-600">৳{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Items grouped by Pharmacy */}
            {cart.map((pharmacy) => (
              <div key={pharmacy.pharmacyId} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {pharmacy.pharmacyName}
                      </h2>
                      <p className="text-sm text-gray-600">{pharmacy.pharmacyAddress}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-xl font-bold text-gray-900">
                        ৳{parseFloat(pharmacy.totalPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {pharmacy.items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {item.medicine.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.medicine.brand} - {item.medicine.strength}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Category: {item.medicine.category}
                          </p>
                          <p className="text-lg font-semibold text-indigo-600 mt-2">
                            ৳{parseFloat(item.price).toFixed(2)} × {item.quantity} = ৳
                            {(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              −
                            </button>
                            <span className="px-4 py-1 border-x border-gray-300">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                            title="Remove from cart"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    Pharmacy earnings: ৳{(parseFloat(pharmacy.totalPrice) + (deliveryType === 'delivery' ? 60 : 0)).toFixed(2)}
                    <span className="text-xs"> (medicine + delivery charge)</span>
                  </p>
                </div>
              </div>
            ))}

            {/* Checkout Button */}
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={handleCheckout}
                disabled={processingCheckout}
                className="w-full bg-indigo-600 text-white px-6 py-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-semibold text-lg transition"
              >
                {processingCheckout ? 'Processing...' : `Place Order - ৳${grandTotal.toFixed(2)}`}
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Pharmacy can deliver today or next day
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
