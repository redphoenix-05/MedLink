const { Pharmacy, User, PharmacyInventory, Medicine } = require('../models');
const Order = require('../models/Order');
const { Op } = require('sequelize');

// @desc    Register pharmacy information
// @route   POST /api/pharmacies
// @access  Private (Pharmacy users only)
const registerPharmacy = async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      licenseNumber,
      latitude,
      longitude,
      operatingHours,
    } = req.body;

    // Validation
    if (!name || !address || !phone || !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, address, phone, and license number',
      });
    }

    // Check if user already has a pharmacy registered
    const existingPharmacy = await Pharmacy.findOne({
      where: { userId: req.user.id },
    });

    if (existingPharmacy) {
      return res.status(400).json({
        success: false,
        message: 'User already has a pharmacy registered',
      });
    }

    // Check if license number is already in use
    const existingLicense = await Pharmacy.findOne({
      where: { licenseNumber },
    });

    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: 'License number already registered',
      });
    }

    // Create pharmacy
    const pharmacy = await Pharmacy.create({
      userId: req.user.id,
      name,
      address,
      phone,
      licenseNumber,
      latitude: latitude || null,
      longitude: longitude || null,
      operatingHours: operatingHours || undefined, // Use default if not provided
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Pharmacy registered successfully. Awaiting admin approval.',
      data: { pharmacy },
    });
  } catch (error) {
    console.error('Register pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during pharmacy registration',
      error: error.message,
    });
  }
};

// @desc    Get single pharmacy details
// @route   GET /api/pharmacies/:id
// @access  Public
const getPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: PharmacyInventory,
          as: 'inventory',
          include: [
            {
              model: Medicine,
              as: 'medicine',
              attributes: ['id', 'name', 'brand', 'category', 'genericName', 'dosageForm', 'strength'],
            },
          ],
          where: { availability: true },
          required: false,
        },
      ],
    });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found',
      });
    }

    res.json({
      success: true,
      data: { pharmacy },
    });
  } catch (error) {
    console.error('Get pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update pharmacy profile
// @route   PUT /api/pharmacies/:id
// @access  Private (Pharmacy owner only)
const updatePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByPk(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found',
      });
    }

    // Check if user owns this pharmacy
    if (pharmacy.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this pharmacy',
      });
    }

    const {
      name,
      address,
      phone,
      licenseNumber,
      latitude,
      longitude,
      operatingHours,
    } = req.body;

    // Check if license number is already in use by another pharmacy
    if (licenseNumber && licenseNumber !== pharmacy.licenseNumber) {
      const existingLicense = await Pharmacy.findOne({
        where: {
          licenseNumber,
          id: { [Op.ne]: pharmacy.id },
        },
      });

      if (existingLicense) {
        return res.status(400).json({
          success: false,
          message: 'License number already in use',
        });
      }
    }

    // Update pharmacy
    await pharmacy.update({
      name: name || pharmacy.name,
      address: address || pharmacy.address,
      phone: phone || pharmacy.phone,
      licenseNumber: licenseNumber || pharmacy.licenseNumber,
      latitude: latitude !== undefined ? latitude : pharmacy.latitude,
      longitude: longitude !== undefined ? longitude : pharmacy.longitude,
      operatingHours: operatingHours || pharmacy.operatingHours,
    });

    res.json({
      success: true,
      message: 'Pharmacy updated successfully',
      data: { pharmacy },
    });
  } catch (error) {
    console.error('Update pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all pharmacies (Admin only)
// @route   GET /api/pharmacies
// @access  Private (Admin only)
const getAllPharmacies = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
        { licenseNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: pharmacies } = await Pharmacy.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
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
    console.error('Get all pharmacies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get current user's pharmacy
// @route   GET /api/pharmacies/my-pharmacy
// @access  Private (Pharmacy users only)
const getMyPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'No pharmacy found for this user',
      });
    }

    res.json({
      success: true,
      data: { pharmacy },
    });
  } catch (error) {
    console.error('Get my pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get pharmacy orders
// @route   GET /api/pharmacies/orders
// @access  Private (Pharmacy users only)
const getPharmacyOrders = async (req, res) => {
  try {
    // First get the pharmacy for this user
    const pharmacy = await Pharmacy.findOne({
      where: { userId: req.user.id }
    });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'No pharmacy found for this user'
      });
    }

    // Get all orders for this pharmacy
    const orders = await Order.findAll({
      where: { pharmacyId: pharmacy.id },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['orderDate', 'DESC']]
    });

    // Calculate stats
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      completed: orders.filter(o => o.status === 'completed').length,
      totalRevenue: orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + parseFloat(o.grandTotal), 0)
    };

    res.json({
      success: true,
      data: { 
        orders,
        stats 
      }
    });

  } catch (error) {
    console.error('Get pharmacy orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pharmacy orders',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/pharmacies/orders/:orderId
// @access  Private (Pharmacy users only)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryDate } = req.body;

    // First get the pharmacy for this user
    const pharmacy = await Pharmacy.findOne({
      where: { userId: req.user.id }
    });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'No pharmacy found for this user'
      });
    }

    // Get the order
    const order = await Order.findOne({
      where: { 
        id: orderId,
        pharmacyId: pharmacy.id 
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order
    order.status = status;
    if (deliveryDate) {
      order.deliveryDate = deliveryDate;
    }
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

module.exports = {
  registerPharmacy,
  getPharmacy,
  updatePharmacy,
  getAllPharmacies,
  getMyPharmacy,
  getPharmacyOrders,
  updateOrderStatus
};