const { Reservation, Medicine, Pharmacy, User, PharmacyInventory, Delivery } = require('../models');
const { sequelize } = require('../config/database');

// Create a new reservation
const createReservation = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { pharmacyId, medicineId, quantity, deliveryOption, address } = req.body;
    const customerId = req.user.id;

    // Validate input
    if (!pharmacyId || !medicineId || !quantity || !deliveryOption) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if delivery address is provided when delivery option is selected
    if (deliveryOption === 'delivery' && !address) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Delivery address is required for delivery option' });
    }

    // Get pharmacy inventory to check stock and price
    const inventory = await PharmacyInventory.findOne({
      where: { pharmacyId, medicineId },
      transaction
    });

    if (!inventory) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Medicine not available at this pharmacy' });
    }

    if (inventory.stock < quantity) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        message: `Insufficient stock. Only ${inventory.stock} available` 
      });
    }

    // Calculate total price
    const totalPrice = (parseFloat(inventory.price) * quantity).toFixed(2);

    // Create reservation
    const reservation = await Reservation.create({
      customerId,
      pharmacyId,
      medicineId,
      quantity,
      totalPrice,
      deliveryOption,
      status: 'pending'
    }, { transaction });

    await transaction.commit();

    // Fetch full reservation details
    const fullReservation = await Reservation.findByPk(reservation.id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Pharmacy, as: 'pharmacy', attributes: ['id', 'name', 'address', 'phone', 'latitude', 'longitude'] },
        { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'brand', 'type', 'description'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: { reservation: fullReservation }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create reservation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create reservation', error: error.message });
  }
};

// Get customer reservations
const getCustomerReservations = async (req, res) => {
  try {
    const customerId = req.params.id;

    // Verify user can only access their own reservations
    if (req.user.id !== parseInt(customerId) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const reservations = await Reservation.findAll({
      where: { customerId },
      include: [
        { model: Pharmacy, as: 'pharmacy', attributes: ['id', 'name', 'address', 'phone', 'latitude', 'longitude'] },
        { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'brand', 'type', 'description'] },
        { model: Delivery, as: 'delivery' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ 
      success: true,
      data: { reservations }
    });

  } catch (error) {
    console.error('Get customer reservations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reservations', error: error.message });
  }
};

// Get pharmacy reservations
const getPharmacyReservations = async (req, res) => {
  try {
    const pharmacyId = req.params.id;

    // Get pharmacy associated with the user
    const pharmacy = await Pharmacy.findOne({ where: { userId: req.user.id } });

    if (!pharmacy || pharmacy.id !== parseInt(pharmacyId)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const reservations = await Reservation.findAll({
      where: { pharmacyId },
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'brand', 'type', 'description'] },
        { model: Delivery, as: 'delivery' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ 
      success: true,
      data: { reservations }
    });

  } catch (error) {
    console.error('Get pharmacy reservations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pharmacy reservations', error: error.message });
  }
};

// Update reservation status (accept/reject/delivered)
const updateReservationStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const reservationId = req.params.id;
    const { status } = req.body;

    if (!['accepted', 'rejected', 'delivered'].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const reservation = await Reservation.findByPk(reservationId, {
      include: [
        { model: Pharmacy, as: 'pharmacy' },
        { model: Delivery, as: 'delivery' }
      ],
      transaction
    });

    if (!reservation) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Verify pharmacy ownership
    const pharmacy = await Pharmacy.findOne({ where: { userId: req.user.id }, transaction });
    if (!pharmacy || pharmacy.id !== reservation.pharmacyId) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    // Update reservation status
    reservation.status = status;
    await reservation.save({ transaction });

    // If accepted, reduce stock
    if (status === 'accepted') {
      const inventory = await PharmacyInventory.findOne({
        where: { 
          pharmacyId: reservation.pharmacyId,
          medicineId: reservation.medicineId
        },
        transaction
      });

      if (inventory) {
        inventory.stock = Math.max(0, inventory.stock - reservation.quantity);
        await inventory.save({ transaction });
      }
    }

    // If delivered, update delivery status
    if (status === 'delivered' && reservation.delivery) {
      reservation.delivery.deliveryStatus = 'delivered';
      await reservation.delivery.save({ transaction });
    }

    await transaction.commit();

    // Fetch updated reservation
    const updatedReservation = await Reservation.findByPk(reservationId, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Pharmacy, as: 'pharmacy', attributes: ['id', 'name', 'address', 'phone'] },
        { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'brand', 'type'] },
        { model: Delivery, as: 'delivery' }
      ]
    });

    res.json({
      success: true,
      message: 'Reservation status updated successfully',
      data: { reservation: updatedReservation }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Update reservation status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update reservation status', error: error.message });
  }
};

// Cancel reservation (customer only, before accepted)
const cancelReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;

    const reservation = await Reservation.findByPk(reservationId);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Verify customer ownership
    if (reservation.customerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    // Can only cancel if pending
    if (reservation.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only cancel pending reservations' });
    }

    await reservation.destroy();

    res.json({ 
      success: true,
      message: 'Reservation cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel reservation', error: error.message });
  }
};

module.exports = {
  createReservation,
  getCustomerReservations,
  getPharmacyReservations,
  updateReservationStatus,
  cancelReservation
};
