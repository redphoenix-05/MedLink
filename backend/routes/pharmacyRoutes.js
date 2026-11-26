const express = require('express');
const router = express.Router();
const {
  registerPharmacy,
  getPharmacy,
  updatePharmacy,
  getAllPharmacies,
  getMyPharmacy,
  getMyPharmacies,
  getPharmacyOrders,
  updateOrderStatus
} = require('../controllers/pharmacyController');
const { authMiddleware: auth } = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

// @route   POST /api/pharmacies
// @desc    Register pharmacy or add a new branch
// @access  Private (Pharmacy users only)
router.post('/', auth, roleMiddleware('pharmacy'), registerPharmacy);

// @route   GET /api/pharmacies/my-pharmacies
// @desc    Get all branches belonging to the current pharmacy owner
// @access  Private (Pharmacy users only)
router.get('/my-pharmacies', auth, roleMiddleware('pharmacy'), getMyPharmacies);

// @route   GET /api/pharmacies/my-pharmacy
// @desc    Get current user's pharmacy (supports ?pharmacyId=...)
// @access  Private (Pharmacy users only)
router.get('/my-pharmacy', auth, roleMiddleware('pharmacy'), getMyPharmacy);

// @route   GET /api/pharmacies/orders
// @desc    Get pharmacy orders
// @access  Private (Pharmacy users only)
router.get('/orders', auth, roleMiddleware('pharmacy'), getPharmacyOrders);

// @route   PUT /api/pharmacies/orders/:orderId
// @desc    Update order status
// @access  Private (Pharmacy users only)
router.put('/orders/:orderId', auth, roleMiddleware('pharmacy'), updateOrderStatus);

// @route   GET /api/pharmacies
// @desc    Get all pharmacies (Admin only)
// @access  Private (Admin only)
router.get('/', auth, roleMiddleware('admin'), getAllPharmacies);

// @route   GET /api/pharmacies/:id
// @desc    Get single pharmacy details
// @access  Public
router.get('/:id', getPharmacy);

// @route   PUT /api/pharmacies/:id
// @desc    Update pharmacy profile
// @access  Private (Pharmacy owner only)
router.put('/:id', auth, roleMiddleware('pharmacy'), updatePharmacy);

module.exports = router;