const { User, Pharmacy, Reservation, Medicine, Order } = require('../models');

const getDashboardStats = async (req, res) => {
  try {
    // User statistics by role
    const totalUsers = await User.count();
    const customerCount = await User.count({ where: { role: 'customer' } });
    const pharmacyUserCount = await User.count({ where: { role: 'pharmacy' } });
    const adminCount = await User.count({ where: { role: 'admin' } });
    
    // Pharmacy statistics by status
    const totalPharmacies = await Pharmacy.count();
    const pendingPharmacies = await Pharmacy.count({ where: { status: 'pending' } });
    const approvedPharmacies = await Pharmacy.count({ where: { status: 'approved' } });
    const rejectedPharmacies = await Pharmacy.count({ where: { status: 'rejected' } });
    
    // Reservation statistics by status
    const totalReservations = await Reservation.count();
    const pendingReservations = await Reservation.count({ where: { status: 'pending' } });
    const acceptedReservations = await Reservation.count({ where: { status: 'accepted' } });
    const deliveredReservations = await Reservation.count({ where: { status: 'delivered' } });
    const rejectedReservations = await Reservation.count({ where: { status: 'rejected' } });
    
    // Delivery statistics
    const totalDeliveries = await Reservation.count({ where: { deliveryOption: 'delivery' } });
    const pendingDeliveries = await Reservation.count({ where: { deliveryOption: 'delivery', status: 'pending' } });
    const outForDelivery = await Reservation.count({ where: { deliveryOption: 'delivery', status: 'accepted' } });
    const completedDeliveries = await Reservation.count({ where: { deliveryOption: 'delivery', status: 'delivered' } });
    
    // Total medicines count
    const totalMedicines = await Medicine.count();
    
    // Calculate platform earnings from completed orders
    const completedOrders = await Order.findAll({
      where: { status: 'completed' }
    });
    
    // Platform earns from two sources:
    // 1. Customer platform fee (stored in order.platformFee)
    // 2. 3% commission on pharmacy's gross revenue (medicine + delivery)
    const PLATFORM_COMMISSION_RATE = 0.03;
    
    let totalCustomerPlatformFees = 0;
    let totalPharmacyCommission = 0;
    
    completedOrders.forEach(order => {
      // Customer platform fee (0.3% of medicine total)
      totalCustomerPlatformFees += parseFloat(order.platformFee || 0);
      
      // Pharmacy commission (3% of medicine + delivery)
      const medicineSales = parseFloat(order.totalPrice);
      const deliveryCharge = parseFloat(order.deliveryCharge || 0);
      const pharmacyGrossRevenue = medicineSales + deliveryCharge;
      const pharmacyCommission = pharmacyGrossRevenue * PLATFORM_COMMISSION_RATE;
      totalPharmacyCommission += pharmacyCommission;
    });
    
    const totalPlatformEarnings = totalCustomerPlatformFees + totalPharmacyCommission;
    
    // Total orders count
    const totalOrders = await Order.count();
    const completedOrdersCount = completedOrders.length;
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.count({ where: { createdAt: { [require('sequelize').Op.gte]: sevenDaysAgo } } });
    const recentPharmacies = await Pharmacy.count({ where: { createdAt: { [require('sequelize').Op.gte]: sevenDaysAgo } } });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          customer: customerCount,
          pharmacy: pharmacyUserCount,
          admin: adminCount
        },
        pharmacies: {
          total: totalPharmacies,
          pending: pendingPharmacies,
          approved: approvedPharmacies,
          rejected: rejectedPharmacies
        },
        reservations: {
          total: totalReservations,
          pending: pendingReservations,
          accepted: acceptedReservations,
          delivered: deliveredReservations,
          rejected: rejectedReservations
        },
        deliveries: {
          total: totalDeliveries,
          pending: pendingDeliveries,
          out_for_delivery: outForDelivery,
          delivered: completedDeliveries
        },
        totalMedicines,
        orders: {
          total: totalOrders,
          completed: completedOrdersCount
        },
        platformEarnings: {
          total: totalPlatformEarnings.toFixed(2),
          customerFees: totalCustomerPlatformFees.toFixed(2),
          pharmacyCommission: totalPharmacyCommission.toFixed(2),
          commissionRate: (PLATFORM_COMMISSION_RATE * 100).toFixed(0) // 3%
        },
        medicineTrends: [], // Placeholder for future implementation
        recentActivity: {
          users: recentUsers,
          pharmacies: recentPharmacies
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'phone', 'role', 'createdAt'], order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
};

const getPendingPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['createdAt', 'ASC']]
    });
    res.json({ success: true, data: pharmacies });
  } catch (error) {
    console.error('Get pending pharmacies error:', error);
    res.status(500).json({ success: false, message: 'Error fetching pending pharmacies', error: error.message });
  }
};

const getApprovedPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.findAll({
      where: { status: 'approved' },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: pharmacies });
  } catch (error) {
    console.error('Get approved pharmacies error:', error);
    res.status(500).json({ success: false, message: 'Error fetching approved pharmacies', error: error.message });
  }
};

const approvePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByPk(req.params.id);
    if (!pharmacy) return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    pharmacy.status = 'approved';
    await pharmacy.save();
    res.json({ success: true, message: 'Pharmacy approved successfully', data: pharmacy });
  } catch (error) {
    console.error('Approve pharmacy error:', error);
    res.status(500).json({ success: false, message: 'Error approving pharmacy', error: error.message });
  }
};

const rejectPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByPk(req.params.id);
    if (!pharmacy) return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    pharmacy.status = 'rejected';
    pharmacy.rejectionReason = req.body.reason || 'Not specified';
    await pharmacy.save();
    res.json({ success: true, message: 'Pharmacy rejected successfully', data: pharmacy });
  } catch (error) {
    console.error('Reject pharmacy error:', error);
    res.status(500).json({ success: false, message: 'Error rejecting pharmacy', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.userId === req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete own account' });
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
  }
};

const deletePharmacy = async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const pharmacy = await Pharmacy.findByPk(req.params.id);
    if (!pharmacy) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }
    
    // Import additional models
    const { PharmacyInventory, Cart, Delivery } = require('../models');
    
    // Get all reservation IDs for this pharmacy to delete related deliveries
    const pharmacyReservations = await Reservation.findAll({
      where: { pharmacyId: req.params.id },
      attributes: ['id'],
      transaction
    });
    const reservationIds = pharmacyReservations.map(r => r.id);
    
    // Delete related records manually in the correct order
    // 1. Delete deliveries associated with this pharmacy's reservations
    if (reservationIds.length > 0) {
      await Delivery.destroy({ 
        where: { reservationId: reservationIds },
        transaction 
      });
    }
    
    // 2. Delete cart items
    await Cart.destroy({ 
      where: { pharmacyId: req.params.id },
      transaction 
    });
    
    // 3. Delete reservations
    await Reservation.destroy({ 
      where: { pharmacyId: req.params.id },
      transaction 
    });
    
    // 4. Delete orders
    await Order.destroy({ 
      where: { pharmacyId: req.params.id },
      transaction 
    });
    
    // 5. Delete pharmacy inventory
    await PharmacyInventory.destroy({ 
      where: { pharmacyId: req.params.id },
      transaction 
    });
    
    // 6. Finally delete the pharmacy itself
    await pharmacy.destroy({ transaction });
    
    await transaction.commit();
    res.json({ success: true, message: 'Pharmacy deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete pharmacy error:', error);
    res.status(500).json({ success: false, message: 'Error deleting pharmacy', error: error.message });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    // For now, return empty array - can be implemented later with a logging system
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching activity logs', error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = req.body.isActive;
    await user.save();
    res.json({ success: true, message: 'User status updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user status', error: error.message });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'category'] },
        { model: Pharmacy, as: 'pharmacy', attributes: ['id', 'name', 'address'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: reservations });
  } catch (error) {
    console.error('Get all reservations error:', error);
    res.status(500).json({ success: false, message: 'Error fetching reservations', error: error.message });
  }
};

const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Reservation.findAll({
      where: { deliveryOption: 'delivery' },
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'category'] },
        { model: Pharmacy, as: 'pharmacy', attributes: ['id', 'name', 'address'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: deliveries });
  } catch (error) {
    console.error('Get all deliveries error:', error);
    res.status(500).json({ success: false, message: 'Error fetching deliveries', error: error.message });
  }
};

const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.findAll({
      include: [{ 
        model: Pharmacy, 
        as: 'pharmacies',
        attributes: ['id', 'name', 'address'],
        through: { attributes: ['price', 'stock'] }
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: medicines });
  } catch (error) {
    console.error('Get all medicines error:', error);
    res.status(500).json({ success: false, message: 'Error fetching medicines', error: error.message });
  }
};

const getIncompleteUsers = async (req, res) => {
  try {
    // Find users who are registered but have incomplete profiles
    // Criteria: users without phone numbers or pharmacy users without pharmacy records
    const incompleteUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'role', 'createdAt'],
      where: {
        [require('sequelize').Op.or]: [
          { phone: null },
          { phone: '' }
        ]
      },
      order: [['createdAt', 'ASC']]
    });

    // Check for pharmacy users without pharmacy records
    const pharmacyUsers = await User.findAll({
      where: { role: 'pharmacy' },
      attributes: ['id', 'name', 'email', 'phone', 'role', 'createdAt'],
      include: [{
        model: Pharmacy,
        as: 'pharmacy',
        required: false
      }],
      order: [['createdAt', 'ASC']]
    });

    // Filter pharmacy users without pharmacy records
    const pharmacyUsersWithoutPharmacy = pharmacyUsers
      .filter(user => !user.pharmacy)
      .map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        issue: 'Pharmacy user without pharmacy record'
      }));

    // Combine incomplete users
    const allIncompleteUsers = [
      ...incompleteUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        issue: 'Missing phone number'
      })),
      ...pharmacyUsersWithoutPharmacy
    ];

    // Remove duplicates based on user ID
    const uniqueIncompleteUsers = Array.from(
      new Map(allIncompleteUsers.map(user => [user.id, user])).values()
    );

    res.json({ 
      success: true, 
      data: uniqueIncompleteUsers,
      count: uniqueIncompleteUsers.length
    });
  } catch (error) {
    console.error('Get incomplete users error:', error);
    res.status(500).json({ success: false, message: 'Error fetching incomplete users', error: error.message });
  }
};

const cleanupIncompleteUsers = async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of user IDs to delete'
      });
    }

    // Prevent admin from deleting their own account
    if (userIds.includes(req.user.id)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const { Cart, Reservation, Order, PharmacyInventory, Delivery } = require('../models');
    
    let deletedCount = 0;

    for (const userId of userIds) {
      const user = await User.findByPk(userId, { transaction });
      
      if (!user) continue;

      // If user is a pharmacy owner, handle pharmacy deletion
      if (user.role === 'pharmacy') {
        const pharmacy = await Pharmacy.findOne({ where: { userId }, transaction });
        
        if (pharmacy) {
          // Get all reservation IDs for this pharmacy
          const pharmacyReservations = await Reservation.findAll({
            where: { pharmacyId: pharmacy.id },
            attributes: ['id'],
            transaction
          });
          const reservationIds = pharmacyReservations.map(r => r.id);
          
          // Delete related records
          if (reservationIds.length > 0) {
            await Delivery.destroy({ 
              where: { reservationId: reservationIds },
              transaction 
            });
          }
          
          await Cart.destroy({ 
            where: { pharmacyId: pharmacy.id },
            transaction 
          });
          
          await Reservation.destroy({ 
            where: { pharmacyId: pharmacy.id },
            transaction 
          });
          
          await Order.destroy({ 
            where: { pharmacyId: pharmacy.id },
            transaction 
          });
          
          await PharmacyInventory.destroy({ 
            where: { pharmacyId: pharmacy.id },
            transaction 
          });
          
          await pharmacy.destroy({ transaction });
        }
      }

      // Delete user's customer records
      const userReservations = await Reservation.findAll({
        where: { customerId: userId },
        attributes: ['id'],
        transaction
      });
      const userReservationIds = userReservations.map(r => r.id);
      
      if (userReservationIds.length > 0) {
        await Delivery.destroy({ 
          where: { reservationId: userReservationIds },
          transaction 
        });
      }
      
      await Cart.destroy({ 
        where: { customerId: userId },
        transaction 
      });
      
      await Reservation.destroy({ 
        where: { customerId: userId },
        transaction 
      });
      
      await Order.destroy({ 
        where: { userId },
        transaction 
      });

      // Delete the user
      await user.destroy({ transaction });
      deletedCount++;
    }

    await transaction.commit();

    res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} incomplete user account(s)`,
      deletedCount
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Cleanup incomplete users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up incomplete users',
      error: error.message
    });
  }
};

module.exports = { 
  getDashboardStats, 
  getAllUsers, 
  getPendingPharmacies, 
  getApprovedPharmacies, 
  approvePharmacy, 
  rejectPharmacy, 
  deleteUser, 
  deletePharmacy,
  getActivityLogs,
  updateUserStatus,
  getAllReservations,
  getAllDeliveries,
  getAllMedicines,
  getIncompleteUsers,
  cleanupIncompleteUsers
};
