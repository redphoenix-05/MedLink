const express = require('express');
const router = express.Router();
const {
  searchMedicines,
  getPharmacyLocations,
  getPharmacyDetails,
} = require('../controllers/searchController');

// @route   GET /api/search
// @desc    Search medicines across pharmacies
// @access  Public
router.get('/', searchMedicines);

// @route   GET /api/pharmacies/locations
// @desc    Get pharmacy locations for map
// @access  Public
router.get('/pharmacies/locations', getPharmacyLocations);

// @route   GET /api/pharmacies/:id/details
// @desc    Get detailed pharmacy information
// @access  Public
router.get('/pharmacies/:id/details', getPharmacyDetails);

module.exports = router;