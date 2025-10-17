const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  createDelivery,
  getPharmacyDeliveries,
  updateDeliveryStatus,
  getDeliveryDetails
} = require('../controllers/deliveryController');

// Delivery routes
router.post('/', authMiddleware, createDelivery);
router.get('/pharmacy/:id', authMiddleware, getPharmacyDeliveries);
router.get('/:id', authMiddleware, getDeliveryDetails);
router.put('/:id/status', authMiddleware, updateDeliveryStatus);

module.exports = router;
