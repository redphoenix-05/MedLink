const express = require('express');
const router = express.Router();
const { 
  getPharmacyOrders, 
  getPharmacyStats, 
  updateOrderStatus 
} = require('../controllers/pharmacyOrdersController');
const { authMiddleware } = require('../middleware/auth');

// All routes are protected and pharmacy-only
router.use(authMiddleware);

router.get('/orders', getPharmacyOrders);
router.get('/stats', getPharmacyStats);
router.put('/orders/:id', updateOrderStatus);

module.exports = router;
