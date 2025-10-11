const { Pharmacy, User, Medicine, PharmacyInventory } = require('../models');
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

    // Get order statistics (mock data for now)
    const orderCounts = {
      pending: 5,
      confirmed: 3,
      preparing: 2,
      ready: 1,
      delivered: 15,
      cancelled: 1,
      total: 27,
    };

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

    res.json({
      success: true,
      data: {
        pharmacies: pharmacyCounts,
        users: userCounts,
        orders: orderCounts,
        recentPharmacies,
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

module.exports = {
  approvePharmacy,
  rejectPharmacy,
  getDashboardStats,
  getPendingPharmacies,
  getAllUsers,
  getActivityLogs,
};