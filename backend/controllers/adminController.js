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
    const pharmacy = await Pharmacy.findByPk(req.params.pharmacyId);
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
    const pharmacy = await Pharmacy.findByPk(req.params.pharmacyId);
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
  try {
    const pharmacy = await Pharmacy.findByPk(req.params.pharmacyId);
    if (!pharmacy) return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    await pharmacy.destroy();
    res.json({ success: true, message: 'Pharmacy deleted successfully' });
  } catch (error) {
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
  getAllMedicines
};
