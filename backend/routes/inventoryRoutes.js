const express = require('express');
const router = express.Router();
const {
  addToInventory,
  updateInventoryItem,
  removeFromInventory,
  getPharmacyInventory,
  getMyInventory,
} = require('../controllers/inventoryController');
const { authMiddleware: auth } = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

// @route   POST /api/inventory
// @desc    Add medicine to pharmacy inventory
// @access  Private (Pharmacy only)
router.post('/', auth, roleMiddleware('pharmacy'), addToInventory);

// @route   GET /api/inventory/my-inventory
// @desc    Get current user's pharmacy inventory
// @access  Private (Pharmacy only)
router.get('/my-inventory', auth, roleMiddleware('pharmacy'), getMyInventory);

// @route   GET /api/inventory/pharmacy/:pharmacyId
// @desc    Get all inventory items for a pharmacy
// @access  Public
router.get('/pharmacy/:pharmacyId', getPharmacyInventory);

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private (Pharmacy owner only)
router.put('/:id', auth, roleMiddleware('pharmacy'), updateInventoryItem);

// @route   DELETE /api/inventory/:id
// @desc    Remove medicine from inventory
// @access  Private (Pharmacy owner only)
router.delete('/:id', auth, roleMiddleware('pharmacy'), removeFromInventory);

module.exports = router;