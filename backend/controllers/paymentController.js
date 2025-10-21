const axios = require('axios');
const { Reservation, User, Medicine, Pharmacy } = require('../models');
const { sequelize } = require('../config/database');

// @desc    Initiate payment with SSLCommerz
// @route   POST /api/payments/initiate
// @access  Private (Customer only)
const initiatePayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { reservationId } = req.body;

    // Get reservation details with associations
    const reservation = await Reservation.findByPk(reservationId, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone'],
        },
        {
          model: Medicine,
          as: 'medicine',
          attributes: ['id', 'name', 'brand'],
        },
        {
          model: Pharmacy,
          as: 'pharmacy',
          attributes: ['id', 'name', 'phone'],
        },
      ],
    });

    if (!reservation) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    // Verify user owns this reservation
    if (reservation.customerId !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this reservation',
      });
    }

    // Check if reservation is in pending status
    if (reservation.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot process payment. Reservation status is ${reservation.status}`,
      });
    }

    // Check if already paid
    if (reservation.paymentStatus === 'paid') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'This reservation has already been paid',
      });
    }

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${reservationId}`;

    // Prepare SSLCommerz payment data
    const paymentData = {
      store_id: process.env.STORE_ID,
      store_passwd: process.env.STORE_PASSWORD,
      total_amount: parseFloat(reservation.totalPrice).toFixed(2),
      currency: process.env.CURRENCY || 'BDT',
      tran_id: transactionId,
      success_url: `${process.env.SUCCESS_URL}?tran_id=${transactionId}&reservation_id=${reservationId}`,
      fail_url: `${process.env.FAIL_URL}?tran_id=${transactionId}&reservation_id=${reservationId}`,
      cancel_url: `${process.env.CANCEL_URL}?tran_id=${transactionId}&reservation_id=${reservationId}`,
      ipn_url: `${process.env.IPN_URL || process.env.SUCCESS_URL}`,
      
      // Product information
      product_name: `Medicine: ${reservation.medicine.name} (${reservation.medicine.brand})`,
      product_category: 'Medicine',
      product_profile: 'general',
      
      // Customer information
      cus_name: reservation.customer.name,
      cus_email: reservation.customer.email,
      cus_add1: 'Dhaka, Bangladesh',
      cus_city: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: reservation.customer.phone || '01700000000',
      
      // Shipment information
      shipping_method: 'NO',
      num_of_item: reservation.quantity,
      
      // Additional information
      value_a: reservationId.toString(),
      value_b: req.user.id.toString(),
      value_c: reservation.pharmacyId.toString(),
    };

    // Call SSLCommerz Session API
    const response = await axios.post(
      process.env.SESSION_API || 'https://sandbox.sslcommerz.com/gwprocess/v3/api.php',
      new URLSearchParams(paymentData).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (response.data.status !== 'SUCCESS') {
      await transaction.rollback();
      console.error('SSLCommerz API Error:', response.data);
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate payment gateway',
        error: response.data.failedreason || 'Unknown error',
      });
    }

    // Update reservation with transaction ID
    await reservation.update(
      {
        transactionId,
        paymentStatus: 'pending',
      },
      { transaction }
    );

    await transaction.commit();

    // Return gateway URL for frontend redirect
    res.json({
      success: true,
      data: {
        gatewayUrl: response.data.GatewayPageURL,
        transactionId,
        amount: reservation.totalPrice,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payment initiation',
      error: error.message,
    });
  }
};

// @desc    Handle payment success callback
// @route   POST /api/payments/success
// @access  Public (SSLCommerz callback)
const paymentSuccess = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { tran_id, reservation_id, val_id } = req.query;

    if (!tran_id || !reservation_id || !val_id) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed?error=missing_params`);
    }

    // Validate payment with SSLCommerz
    const validationData = {
      val_id,
      store_id: process.env.STORE_ID,
      store_passwd: process.env.STORE_PASSWORD,
    };

    const validationResponse = await axios.get(
      process.env.VALIDATION_API || 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php',
      {
        params: validationData,
      }
    );

    // Check if payment is valid
    if (
      validationResponse.data.status !== 'VALID' &&
      validationResponse.data.status !== 'VALIDATED'
    ) {
      console.error('Payment validation failed:', validationResponse.data);
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed?error=invalid_payment`);
    }

    // Get reservation
    const reservation = await Reservation.findByPk(reservation_id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'brand'] },
        { model: Pharmacy, as: 'pharmacy', attributes: ['id', 'name'] },
      ],
    });

    if (!reservation) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed?error=reservation_not_found`);
    }

    // Verify transaction ID matches
    if (reservation.transactionId !== tran_id) {
      console.error('Transaction ID mismatch');
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed?error=transaction_mismatch`);
    }

    // Update reservation as paid
    await reservation.update(
      {
        paymentStatus: 'paid',
        status: 'confirmed',
        paidAt: new Date(),
        paymentMethod: validationResponse.data.card_type || 'SSLCommerz',
        validationId: val_id,
      },
      { transaction }
    );

    await transaction.commit();

    // TODO: Send email notification to customer
    console.log('Payment successful for reservation:', reservation_id);

    // Redirect to success page
    res.redirect(`${process.env.CLIENT_URL}/payment/success?reservation_id=${reservation_id}&amount=${reservation.totalPrice}`);
  } catch (error) {
    await transaction.rollback();
    console.error('Payment success handler error:', error);
    res.redirect(`${process.env.CLIENT_URL}/payment/failed?error=server_error`);
  }
};

// @desc    Handle payment failure callback
// @route   POST /api/payments/fail
// @access  Public (SSLCommerz callback)
const paymentFail = async (req, res) => {
  try {
    const { tran_id, reservation_id } = req.query;

    if (reservation_id) {
      const reservation = await Reservation.findByPk(reservation_id);
      if (reservation && reservation.transactionId === tran_id) {
        await reservation.update({
          paymentStatus: 'failed',
        });
      }
    }

    console.log('Payment failed for transaction:', tran_id);
    res.redirect(`${process.env.CLIENT_URL}/payment/failed?reservation_id=${reservation_id}`);
  } catch (error) {
    console.error('Payment fail handler error:', error);
    res.redirect(`${process.env.CLIENT_URL}/payment/failed?error=server_error`);
  }
};

// @desc    Handle payment cancellation callback
// @route   POST /api/payments/cancel
// @access  Public (SSLCommerz callback)
const paymentCancel = async (req, res) => {
  try {
    const { tran_id, reservation_id } = req.query;

    if (reservation_id) {
      const reservation = await Reservation.findByPk(reservation_id);
      if (reservation && reservation.transactionId === tran_id) {
        await reservation.update({
          paymentStatus: 'cancelled',
        });
      }
    }

    console.log('Payment cancelled for transaction:', tran_id);
    res.redirect(`${process.env.CLIENT_URL}/payment/cancelled?reservation_id=${reservation_id}`);
  } catch (error) {
    console.error('Payment cancel handler error:', error);
    res.redirect(`${process.env.CLIENT_URL}/payment/cancelled?error=server_error`);
  }
};

// @desc    Get payment status
// @route   GET /api/payments/:reservationId/status
// @access  Private
const getPaymentStatus = async (req, res) => {
  try {
    const { reservationId } = req.params;

    const reservation = await Reservation.findByPk(reservationId, {
      attributes: ['id', 'paymentStatus', 'transactionId', 'paidAt', 'totalPrice', 'paymentMethod'],
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    // Verify user has access to this reservation
    if (reservation.customerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment',
      });
    }

    res.json({
      success: true,
      data: {
        paymentStatus: reservation.paymentStatus,
        transactionId: reservation.transactionId,
        paidAt: reservation.paidAt,
        amount: reservation.totalPrice,
        paymentMethod: reservation.paymentMethod,
      },
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  getPaymentStatus,
};
