const express = require('express');
const router = express.Router();
const {
  registerPharmacy,
  getPharmacy,
  updatePharmacy,
  getAllPharmacies,
  getMyPharmacy,
} = require('../controllers/pharmacyController');
const { authMiddleware: auth } = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

// @route   POST /api/pharmacies
// @desc    Register pharmacy information
// @access  Private (Pharmacy users only)
router.post('/', auth, roleMiddleware('pharmacy'), registerPharmacy);

// @route   GET /api/pharmacies/my-pharmacy
// @desc    Get current user's pharmacy
// @access  Private (Pharmacy users only)
router.get('/my-pharmacy', auth, roleMiddleware('pharmacy'), getMyPharmacy);

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