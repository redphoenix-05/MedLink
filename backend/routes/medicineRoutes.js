const express = require('express');
const router = express.Router();
const {
  addMedicine,
  getAllMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
} = require('../controllers/medicineController');
const { authMiddleware: auth } = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

// @route   POST /api/medicines
// @desc    Add new medicine to system
// @access  Private (Admin and Pharmacy)
router.post('/', auth, roleMiddleware('admin', 'pharmacy'), addMedicine);

// @route   GET /api/medicines
// @desc    Get all medicines
// @access  Public
router.get('/', getAllMedicines);

// @route   GET /api/medicines/:id
// @desc    Get single medicine details
// @access  Public
router.get('/:id', getMedicine);

// @route   PUT /api/medicines/:id
// @desc    Update medicine details
// @access  Private (Admin and Pharmacy)
router.put('/:id', auth, roleMiddleware('admin', 'pharmacy'), updateMedicine);

// @route   DELETE /api/medicines/:id
// @desc    Delete medicine
// @access  Private (Admin and Pharmacy)
router.delete('/:id', auth, roleMiddleware('admin', 'pharmacy'), deleteMedicine);

module.exports = router;