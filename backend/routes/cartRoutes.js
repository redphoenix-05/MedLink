const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout
} = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

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
