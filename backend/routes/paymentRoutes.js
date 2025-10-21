const express = require('express');
const router = express.Router();
const {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  getPaymentStatus,
} = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');

// Protected routes (require authentication)
router.post('/initiate', authMiddleware, initiatePayment);
router.get('/:reservationId/status', authMiddleware, getPaymentStatus);

// Public callback routes (called by SSLCommerz)
router.post('/success', paymentSuccess);
router.get('/success', paymentSuccess); // SSLCommerz uses GET for callbacks
router.post('/fail', paymentFail);
router.get('/fail', paymentFail);
router.post('/cancel', paymentCancel);
router.get('/cancel', paymentCancel);

module.exports = router;
