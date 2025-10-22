const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout,
  getCustomerOrders,
  initializePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN
} = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');

// SSLCommerz callback routes (MUST be before auth middleware - no auth required for callbacks)
// Support both GET and POST methods as SSLCommerz can use either
router.get('/payment-success', paymentSuccess);
router.post('/payment-success', paymentSuccess);
router.get('/payment-fail', paymentFail);
router.post('/payment-fail', paymentFail);
router.get('/payment-cancel', paymentCancel);
router.post('/payment-cancel', paymentCancel);
router.post('/payment-ipn', paymentIPN);

// All other routes require authentication
router.use(authMiddleware);

// @route   GET /api/cart/orders
// @desc    Get customer's orders
// @access  Private (Customer only)
router.get('/orders', getCustomerOrders);

// @route   POST /api/cart/payment-init
// @desc    Initialize payment with SSLCommerz
// @access  Private (Customer only)
router.post('/payment-init', initializePayment);

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private (Customer only)
router.post('/', addToCart);

// @route   GET /api/cart
// @desc    Get customer's cart
// @access  Private (Customer only)
router.get('/', getCart);

// @route   PUT /api/cart/:id
// @desc    Update cart item quantity
// @access  Private (Customer only)
router.put('/:id', updateCartItem);

// @route   DELETE /api/cart/:id
// @desc    Remove item from cart
// @access  Private (Customer only)
router.delete('/:id', removeFromCart);

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private (Customer only)
router.delete('/', clearCart);

// @route   POST /api/cart/checkout
// @desc    Checkout - Convert cart to reservations
// @access  Private (Customer only)
router.post('/checkout', checkout);

module.exports = router;
