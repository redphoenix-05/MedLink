const { Pharmacy } = require('../models');
const Order = require('../models/Order');
const { Op } = require('sequelize');

const getOwnedBranchIds = async (userId, requestedPharmacyId) => {
  const branches = await Pharmacy.findAll({
    where: { userId },
    attributes: ['id'],
  });
  const ownedIds = branches.map((b) => b.id);
  if (requestedPharmacyId) {
    const parsed = parseInt(requestedPharmacyId, 10);
    if (ownedIds.includes(parsed)) return [parsed];
  }
  return ownedIds;
};

// @desc    Get all orders for a pharmacy (all branches or filtered by ?pharmacyId=)
// @route   GET /api/pharmacy/orders
// @access  Private (Pharmacy only)
const getPharmacyOrders = async (req, res) => {
  try {
    const branchIds = await getOwnedBranchIds(req.user.id, req.query.pharmacyId);
    if (branchIds.length === 0) {
      return res.json({ success: true, data: { orders: [] } });
    }

    const orders = await Order.findAll({
      where: { pharmacyId: { [Op.in]: branchIds } },
      include: [
        { model: Pharmacy, as: 'pharmacy', attributes: ['id', 'name', 'branchName', 'city'] },
      ],
      order: [['orderDate', 'DESC']],
    });

    res.json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    console.error('Get pharmacy orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message,
    });
  }
};

// @desc    Get pharmacy statistics
// @route   GET /api/pharmacy/stats
// @access  Private (Pharmacy only)
const getPharmacyStats = async (req, res) => {
  try {
    const branchIds = await getOwnedBranchIds(req.user.id, req.query.pharmacyId);
    if (branchIds.length === 0) {
      return res.json({
        success: true,
        data: {
          stats: {
            totalEarnings: '0.00',
            totalOrders: 0,
            pickupOrders: 0,
            deliveryOrders: 0,
            totalMedicinesSold: '0.00',
            totalQuantity: 0,
          },
          orders: [],
        },
      });
    }

    const orders = await Order.findAll({
      where: {
        pharmacyId: { [Op.in]: branchIds },
        status: {
          [Op.in]: ['confirmed', 'delivered', 'completed'],
        },
      },
      include: [
        { model: Pharmacy, as: 'pharmacy', attributes: ['id', 'name', 'branchName', 'city'] },
      ],
    });

    // Calculate statistics
    const totalOrders = orders.length;
    const pickupOrders = orders.filter(o => o.deliveryType === 'pickup').length;
    const deliveryOrders = orders.filter(o => o.deliveryType === 'delivery').length;
    
    console.log('📊 Calculating pharmacy earnings for', orders.length, 'orders');
    
    // Total earnings = medicine cost + delivery charge (platform fee goes to platform)
    const totalEarnings = orders.reduce((sum, order) => {
      const medicineTotal = parseFloat(order.totalPrice) || 0;
      const deliveryCharge = parseFloat(order.deliveryCharge) || 0;
      
      console.log(`Order ${order.id}: Medicine=৳${medicineTotal}, Delivery=৳${deliveryCharge}, Total=৳${medicineTotal + deliveryCharge}`);
      
      return sum + medicineTotal + deliveryCharge;
    }, 0);
    
    console.log('✅ Total Earnings:', totalEarnings.toFixed(2));

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
    const branchIds = await getOwnedBranchIds(req.user.id);
    const { status, deliveryDate } = req.body;

    const order = await Order.findOne({
      where: { id, pharmacyId: { [Op.in]: branchIds } }
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
