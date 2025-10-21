const { Pharmacy, User, Medicine, PharmacyInventory, Reservation, Delivery } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// @desc    Approve pharmacy
// @route   PUT /api/admin/pharmacies/:id/approve
// @access  Private (Admin only)
const approvePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found',
      });
    }

    if (pharmacy.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Pharmacy is already approved',
      });
    }

    // Update pharmacy status to approved
    await pharmacy.update({ status: 'approved' });

    res.json({
      success: true,
      message: `Pharmacy "${pharmacy.name}" has been approved successfully`,
      data: { pharmacy },
    });
  } catch (error) {
    console.error('Approve pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during pharmacy approval',
      error: error.message,
    });
  }
};

// @desc    Reject pharmacy
// @route   PUT /api/admin/pharmacies/:id/reject
// @access  Private (Admin only)
const rejectPharmacy = async (req, res) => {
  try {
    const { reason } = req.body;

    const pharmacy = await Pharmacy.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found',
      });
    }

    if (pharmacy.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Pharmacy is already rejected',
      });
    }

    // Update pharmacy status to rejected
    await pharmacy.update({ 
      status: 'rejected',
      // You can add a rejectionReason field to the model if needed
    });

    res.json({
      success: true,
      message: `Pharmacy "${pharmacy.name}" has been rejected`,
      data: { pharmacy, reason },
    });
  } catch (error) {
    console.error('Reject pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during pharmacy rejection',
      error: error.message,
    });
  }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Get pharmacy statistics
    const pharmacyStatsResult = await Pharmacy.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true,
    });

    const pharmacyCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
    };

    if (pharmacyStatsResult && pharmacyStatsResult.length > 0) {
      pharmacyStatsResult.forEach(stat => {
        if (stat.status && stat.count) {
          pharmacyCounts[stat.status] = parseInt(stat.count);
          pharmacyCounts.total += parseInt(stat.count);
        }
      });
    }

    // Get user statistics
    const userStatsResult = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role'],
      raw: true,
    });

    const userCounts = {
      customer: 0,
      pharmacy: 0,
      admin: 0,
      total: 0,
    };

    if (userStatsResult && userStatsResult.length > 0) {
      userStatsResult.forEach(stat => {
        if (stat.role && stat.count) {
          userCounts[stat.role] = parseInt(stat.count);
          userCounts.total += parseInt(stat.count);
        }
      });
    }

    // Get total medicines
    const totalMedicines = await Medicine.count();

    // Get reservation statistics
    const totalReservations = await Reservation.count();
    const reservationsByStatus = await Reservation.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const reservationCounts = {
      pending: 0,
      accepted: 0,
      delivered: 0,
      rejected: 0,
      total: totalReservations
    };

    reservationsByStatus.forEach(stat => {
      if (stat.status && stat.count) {
        reservationCounts[stat.status] = parseInt(stat.count);
      }
    });

    // Get delivery statistics
    const totalDeliveries = await Delivery.count();
    const deliveriesByStatus = await Delivery.findAll({
      attributes: [
        'deliveryStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['deliveryStatus'],
      raw: true
    });

    const deliveryCounts = {
      pending: 0,
      out_for_delivery: 0,
      delivered: 0,
      total: totalDeliveries
    };

    deliveriesByStatus.forEach(stat => {
      if (stat.deliveryStatus && stat.count) {
        deliveryCounts[stat.deliveryStatus] = parseInt(stat.count);
      }
    });

    // Calculate revenue
    const revenueResult = await Reservation.sum('totalPrice', {
      where: { status: 'delivered' }
    });
    const revenue = revenueResult || 0;

    // Get medicine popularity (top 10)
    let formattedTrends = [];
    try {
      const medicineTrends = await Reservation.findAll({
        attributes: [
          'medicineId',
          [sequelize.fn('COUNT', sequelize.col('Reservation.id')), 'orderCount']
        ],
        include: [{
          model: Medicine,
          as: 'medicine',
          attributes: ['id', 'name', 'brand'],
          required: true // Only include reservations with valid medicine
        }],
        group: ['medicineId', 'medicine.id', 'medicine.name', 'medicine.brand'],
        order: [[sequelize.literal('orderCount'), 'DESC']],
        limit: 10,
        raw: false
      });

      formattedTrends = medicineTrends.map(item => ({
        name: item.medicine?.name || 'Unknown',
        brand: item.medicine?.brand || 'Unknown',
        orders: parseInt(item.dataValues.orderCount) || 0
      }));
    } catch (trendError) {
      console.warn('Failed to fetch medicine trends:', trendError.message);
      formattedTrends = [];
    }

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPharmacies = await Pharmacy.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
    });

    const recentUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo,
        },
        role: 'customer'
      },
    });

    res.json({
      success: true,
      data: {
        pharmacies: pharmacyCounts,
        users: userCounts,
        reservations: reservationCounts,
        deliveries: deliveryCounts,
        totalMedicines,
        revenue: parseFloat(revenue).toFixed(2),
        medicineTrends: formattedTrends,
        recentActivity: {
          pharmacies: recentPharmacies,
          users: recentUsers
        }
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get pending pharmacies for approval
// @route   GET /api/admin/pharmacies/pending
// @access  Private (Admin only)
const getPendingPharmacies = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: pharmacies } = await Pharmacy.findAndCountAll({
      where: { status: 'pending' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'createdAt'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'ASC']], // Oldest first for approval queue
    });

    res.json({
      success: true,
      data: {
        pharmacies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get pending pharmacies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get approved pharmacies
// @route   GET /api/admin/pharmacies/approved
// @access  Private (Admin only)
const getApprovedPharmacies = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: pharmacies } = await Pharmacy.findAndCountAll({
      where: { status: 'approved' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'createdAt'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        pharmacies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get approved pharmacies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all users (Admin view)
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (role && role !== 'all') {
      whereClause.role = role;
    }
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Pharmacy,
          as: 'pharmacy',
          required: false,
          attributes: ['id', 'name', 'status', 'licenseNumber'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get system activity logs (placeholder for future implementation)
// @route   GET /api/admin/activity-logs
// @access  Private (Admin only)
const getActivityLogs = async (req, res) => {
  try {
    // This is a placeholder - you would implement actual logging system
    res.json({
      success: true,
      message: 'Activity logs endpoint - to be implemented',
      data: {
        logs: [],
        message: 'Activity logging system not yet implemented',
      },
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update user status (active/inactive)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "inactive"'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own status'
      });
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: user
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// @desc    Get all reservations
// @route   GET /api/admin/reservations
// @access  Private (Admin only)
const getAllReservations = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows: reservations } = await Reservation.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Pharmacy,
          as: 'pharmacy',
          attributes: ['id', 'name', 'address', 'phone']
        },
        {
          model: Medicine,
          as: 'medicine',
          attributes: ['id', 'name', 'brand', 'type']
        },
        {
          model: Delivery,
          as: 'delivery',
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        reservations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservations',
      error: error.message
    });
  }
};

// @desc    Get all deliveries
// @route   GET /api/admin/deliveries
// @access  Private (Admin only)
const getAllDeliveries = async (req, res) => {
  try {
    const { deliveryStatus, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (deliveryStatus) where.deliveryStatus = deliveryStatus;

    const { count, rows: deliveries } = await Delivery.findAndCountAll({
      where,
      include: [{
        model: Reservation,
        as: 'reservation',
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: Pharmacy,
            as: 'pharmacy',
            attributes: ['id', 'name', 'address', 'phone']
          },
          {
            model: Medicine,
            as: 'medicine',
            attributes: ['id', 'name', 'brand']
          }
        ]
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        deliveries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deliveries',
      error: error.message
    });
  }
};

// @desc    Get all medicines
// @route   GET /api/admin/medicines
// @access  Private (Admin only)
const getAllMedicines = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { genericName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: medicines } = await Medicine.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        medicines,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medicines',
      error: error.message
    });
  }
};

module.exports = {
  approvePharmacy,
  rejectPharmacy,
  getDashboardStats,
  getPendingPharmacies,
  getApprovedPharmacies,
  getAllUsers,
  getActivityLogs,
  updateUserStatus,
  getAllReservations,
  getAllDeliveries,
  getAllMedicines
};