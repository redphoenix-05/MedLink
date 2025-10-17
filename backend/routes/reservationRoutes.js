const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  createReservation,
  getCustomerReservations,
  getPharmacyReservations,
  updateReservationStatus,
  cancelReservation
} = require('../controllers/reservationController');

// Reservation routes
router.post('/', authMiddleware, createReservation);
router.get('/customer/:id', authMiddleware, getCustomerReservations);
router.get('/pharmacy/:id', authMiddleware, getPharmacyReservations);
router.put('/:id/status', authMiddleware, updateReservationStatus);
router.delete('/:id', authMiddleware, cancelReservation);

module.exports = router;
