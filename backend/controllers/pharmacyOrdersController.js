const Order = require('../models/Order');
const { sequelize } = require('../config/database');

// @desc    Get all orders for a pharmacy
// @route   GET /api/pharmacy/orders
// @access  Private (Pharmacy only)
const getPharmacyOrders = async (req, res) => {
  try {
    const pharmacyId = req.user.id;

    const orders = await Order.findAll({
      where: { pharmacyId },
      order: [['orderDate', 'DESC']]
    });

    res.json({
      success: true,
      data: { orders }
    });

  } catch (error) {
    console.error('Get pharmacy orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get orders', 
      error: error.message 
    });
  }
};

// @desc    Get pharmacy statistics
// @route   GET /api/pharmacy/stats
// @access  Private (Pharmacy only)
const getPharmacyStats = async (req, res) => {
  try {
    const pharmacyId = req.user.id;

    // Get all completed orders
    const orders = await Order.findAll({
      where: { 
        pharmacyId,
        status: ['confirmed', 'delivered', 'completed']
      }
    });

    // Calculate statistics
    const totalOrders = orders.length;
    const pickupOrders = orders.filter(o => o.deliveryType === 'pickup').length;
    const deliveryOrders = orders.filter(o => o.deliveryType === 'delivery').length;
    
    // Total earnings = medicine cost + delivery charge (platform fee goes to platform)
    const totalEarnings = orders.reduce((sum, order) => {
      const medicineTotal = parseFloat(order.totalPrice);
      const deliveryCharge = parseFloat(order.deliveryCharge);
      return sum + medicineTotal + deliveryCharge;
    }, 0);

    // Total medicines sold value
    const totalMedicinesSold = orders.reduce((sum, order) => 
      sum + parseFloat(order.totalPrice), 0
    );

    // Total quantity of medicines sold
    const totalQuantity = orders.reduce((sum, order) => 
      sum + order.quantity, 0
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalEarnings: totalEarnings.toFixed(2),
          totalOrders,
          pickupOrders,
          deliveryOrders,
          totalMedicinesSold: totalMedicinesSold.toFixed(2),
          totalQuantity
        },
        orders // Include all orders for the medicines sold list
      }
    });

  } catch (error) {
    console.error('Get pharmacy stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get statistics', 
      error: error.message 
    });
  }
};

// @desc    Update order status
// @route   PUT /api/pharmacy/orders/:id
// @access  Private (Pharmacy only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user.id;
    const { status, deliveryDate } = req.body;

    const order = await Order.findOne({
      where: { id, pharmacyId }
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (status) {
      order.status = status;
    }

    if (deliveryDate) {
      order.deliveryDate = new Date(deliveryDate);
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order', 
      error: error.message 
    });
  }
};

module.exports = {
  getPharmacyOrders,
  getPharmacyStats,
  updateOrderStatus
};
