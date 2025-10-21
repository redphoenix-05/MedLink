const { Delivery, Reservation, Pharmacy, User, Medicine } = require('../models');

// Create delivery record
const createDelivery = async (req, res) => {
  try {
    const { reservationId, address, deliveryPerson } = req.body;

    if (!reservationId || !address) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Get reservation and verify it exists and is accepted
    const reservation = await Reservation.findByPk(reservationId, {
      include: [{ model: Pharmacy, as: 'pharmacy' }]
    });

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Verify pharmacy ownership
    const pharmacy = await Pharmacy.findOne({ where: { userId: req.user.id } });
    if (!pharmacy || pharmacy.id !== reservation.pharmacyId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    if (reservation.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Can only create delivery for accepted reservations' });
    }

    if (reservation.deliveryOption !== 'delivery') {
      return res.status(400).json({ success: false, message: 'Reservation is not for delivery' });
    }

    // Check if delivery already exists
    const existingDelivery = await Delivery.findOne({ where: { reservationId } });
    if (existingDelivery) {
      return res.status(400).json({ success: false, message: 'Delivery record already exists for this reservation' });
    }

    // Create delivery
    const delivery = await Delivery.create({
      reservationId,
      address,
      deliveryPerson,
      deliveryStatus: 'pending'
    });

    // Fetch full delivery details
    const fullDelivery = await Delivery.findByPk(delivery.id, {
      include: [{
        model: Reservation,
        as: 'reservation',
        include: [
          { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
          { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'brand'] },
          { model: Pharmacy, as: 'pharmacy', attributes: ['id', 'name', 'address', 'phone'] }
        ]
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Delivery record created successfully',
      data: { delivery: fullDelivery }
    });

  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({ success: false, message: 'Failed to create delivery', error: error.message });
  }
};

// Get pharmacy deliveries
const getPharmacyDeliveries = async (req, res) => {
  try {
    const pharmacyId = req.params.id;

    // Verify pharmacy ownership
    const pharmacy = await Pharmacy.findOne({ where: { userId: req.user.id } });
    if (!pharmacy || pharmacy.id !== parseInt(pharmacyId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    // Get all deliveries for this pharmacy
    const deliveries = await Delivery.findAll({
      include: [{
        model: Reservation,
        as: 'reservation',
        where: { pharmacyId },
        include: [
          { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
          { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'brand'] }
        ]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ 
      success: true,
      data: { deliveries }
    });

  } catch (error) {
    console.error('Get pharmacy deliveries error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch deliveries', error: error.message });
  }
};

// Update delivery status
const updateDeliveryStatus = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const { deliveryStatus, deliveryPerson } = req.body;

    if (!['pending', 'out_for_delivery', 'delivered'].includes(deliveryStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid delivery status' });
    }

    const delivery = await Delivery.findByPk(deliveryId, {
      include: [{
        model: Reservation,
        as: 'reservation',
        include: [{ model: Pharmacy, as: 'pharmacy' }]
      }]
    });

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    // Verify pharmacy ownership
    const pharmacy = await Pharmacy.findOne({ where: { userId: req.user.id } });
    if (!pharmacy || pharmacy.id !== delivery.reservation.pharmacyId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    // Update delivery
    delivery.deliveryStatus = deliveryStatus;
    if (deliveryPerson) {
      delivery.deliveryPerson = deliveryPerson;
    }
    await delivery.save();

    // If delivered, update reservation status
    if (deliveryStatus === 'delivered') {
      delivery.reservation.status = 'delivered';
      await delivery.reservation.save();
    }

    // Fetch updated delivery
    const updatedDelivery = await Delivery.findByPk(deliveryId, {
      include: [{
        model: Reservation,
        as: 'reservation',
        include: [
          { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
          { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'brand'] },
          { model: Pharmacy, as: 'pharmacy', attributes: ['id', 'name', 'address', 'phone'] }
        ]
      }]
    });

    res.json({
      success: true,
      message: 'Delivery status updated successfully',
      data: { delivery: updatedDelivery }
    });

  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update delivery status', error: error.message });
  }
};

// Get delivery details by ID
const getDeliveryDetails = async (req, res) => {
  try {
    const deliveryId = req.params.id;

    const delivery = await Delivery.findByPk(deliveryId, {
      include: [{
        model: Reservation,
        as: 'reservation',
        include: [
          { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
          { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'brand'] },
          { model: Pharmacy, as: 'pharmacy', attributes: ['id', 'name', 'address', 'phone', 'latitude', 'longitude'] }
        ]
      }]
    });

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    // Verify access (customer or pharmacy)
    const pharmacy = await Pharmacy.findOne({ where: { userId: req.user.id } });
    const isCustomer = delivery.reservation.customerId === req.user.id;
    const isPharmacy = pharmacy && pharmacy.id === delivery.reservation.pharmacyId;

    if (!isCustomer && !isPharmacy && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    res.json({ 
      success: true,
      data: { delivery }
    });

  } catch (error) {
    console.error('Get delivery details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch delivery details', error: error.message });
  }
};

module.exports = {
  createDelivery,
  getPharmacyDeliveries,
  updateDeliveryStatus,
  getDeliveryDetails
};
