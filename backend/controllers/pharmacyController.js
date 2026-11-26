const { Pharmacy, User, PharmacyInventory, Medicine } = require('../models');
const Order = require('../models/Order');
const { Op } = require('sequelize');
const {
  isPharmacyOwner,
  isPharmacyManager,
  getAccessiblePharmacies,
} = require('../utils/pharmacyAccess');

// @desc    Register pharmacy or add a new branch (Owner / Pharmacy Admin only)
// @route   POST /api/pharmacies
// @access  Private (Pharmacy owner only)
const registerPharmacy = async (req, res) => {
  try {
    if (!isPharmacyOwner(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Only the main pharmacy admin (owner) can register new branches',
      });
    }
    const {
      name,
      chainName,
      branchName,
      city,
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

    // Validate phone number format
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'The provided number is wrong. Phone number must be 11 digits starting with 01[3-9]',
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

    // Create pharmacy branch (owners can register multiple branches in one or more cities)
    const pharmacy = await Pharmacy.create({
      userId: req.user.id,
      name,
      chainName: chainName || name,
      branchName: branchName || 'Main Branch',
      city: city || 'Dhaka',
      address,
      phone,
      licenseNumber,
      latitude: latitude || null,
      longitude: longitude || null,
      operatingHours: operatingHours || undefined,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Pharmacy branch registered successfully. Awaiting admin approval.',
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
      chainName,
      branchName,
      city,
      address,
      phone,
      licenseNumber,
      latitude,
      longitude,
      operatingHours,
    } = req.body;

    // Validate phone number format if provided
    if (phone && phone !== pharmacy.phone) {
      const phoneRegex = /^01[3-9]\d{8}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'The provided number is wrong. Phone number must be 11 digits starting with 01[3-9]',
        });
      }
    }

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
      chainName: chainName !== undefined ? chainName : pharmacy.chainName,
      branchName: branchName !== undefined ? branchName : pharmacy.branchName,
      city: city || pharmacy.city,
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

// @desc    Get all branches accessible to current pharmacy user (owner, manager, or staff)
// @route   GET /api/pharmacies/my-pharmacies
// @access  Private (Pharmacy users only)
const getMyPharmacies = async (req, res) => {
  try {
    const branches = await getAccessiblePharmacies(req.user, [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email'],
      },
    ]);

    res.json({
      success: true,
      data: {
        branches,
        count: branches.length,
      },
    });
  } catch (error) {
    console.error('Get my pharmacies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get current user's pharmacy (supports ?pharmacyId=... for multi-branch owners)
// @route   GET /api/pharmacies/my-pharmacy
// @access  Private (Pharmacy users only)
const getMyPharmacy = async (req, res) => {
  try {
    const branches = await getAccessiblePharmacies(req.user, [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email'],
      },
    ]);

    if (!branches || branches.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pharmacy found for this user',
      });
    }

    const requestedId = req.query.pharmacyId ? parseInt(req.query.pharmacyId, 10) : null;
    const pharmacy = requestedId
      ? branches.find((b) => b.id === requestedId) || branches[0]
      : branches[0];

    res.json({
      success: true,
      data: { pharmacy, branches },
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

// @desc    Get pharmacy orders (accessible by owner, manager, and staff for their branch(es))
// @route   GET /api/pharmacies/orders
// @access  Private (Pharmacy users only)
const getPharmacyOrders = async (req, res) => {
  try {
    const branches = await getAccessiblePharmacies(req.user);

    if (!branches || branches.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pharmacy found for this user'
      });
    }

    const requestedId = req.query.pharmacyId ? parseInt(req.query.pharmacyId, 10) : null;
    const ownedIds = branches.map((b) => b.id);
    const targetIds = requestedId && ownedIds.includes(requestedId) ? [requestedId] : ownedIds;

    // Get all orders across target branch(es)
    const orders = await Order.findAll({
      where: { pharmacyId: { [Op.in]: targetIds } },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Pharmacy,
          as: 'pharmacy',
          attributes: ['id', 'name', 'branchName', 'city']
        }
      ],
      order: [['orderDate', 'DESC']]
    });

    // Calculate detailed stats for completed orders
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    // Total medicine sales (excluding delivery and platform fee)
    const totalMedicineSales = completedOrders.reduce((sum, o) => sum + parseFloat(o.totalPrice), 0);
    
    // Total delivery charges earned
    const totalDeliveryEarnings = completedOrders.reduce((sum, o) => sum + parseFloat(o.deliveryCharge || 0), 0);
    
    // Gross revenue (medicine + delivery)
    const grossRevenue = totalMedicineSales + totalDeliveryEarnings;
    
    // Platform fee (3% of gross revenue)
    const PLATFORM_FEE_RATE = 0.03;
    const totalPlatformFee = grossRevenue * PLATFORM_FEE_RATE;
    
    // Net revenue (after platform fee)
    const netRevenue = grossRevenue - totalPlatformFee;
    
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      completed: completedOrders.length,
      
      // Financial breakdown
      totalMedicineSales: totalMedicineSales.toFixed(2),
      totalDeliveryEarnings: totalDeliveryEarnings.toFixed(2),
      grossRevenue: grossRevenue.toFixed(2),
      platformFeeRate: (PLATFORM_FEE_RATE * 100).toFixed(0), // 3%
      totalPlatformFee: totalPlatformFee.toFixed(2),
      netRevenue: netRevenue.toFixed(2)
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

    // Get all branches accessible to this user (owner, manager, or staff)
    const branches = await getAccessiblePharmacies(req.user);

    if (!branches || branches.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pharmacy found for this user'
      });
    }

    const branchIds = branches.map((b) => b.id);

    // Get the order belonging to any accessible branch
    const order = await Order.findOne({
      where: { 
        id: orderId,
        pharmacyId: { [Op.in]: branchIds }
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

// @desc    Get managers and staff for accessible branches
// @route   GET /api/pharmacies/staff
// @access  Private (Pharmacy owner or manager)
const getPharmacyStaff = async (req, res) => {
  try {
    if (!isPharmacyOwner(req.user) && !isPharmacyManager(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Only pharmacy admins and store managers can view team members',
      });
    }

    const branches = await getAccessiblePharmacies(req.user);
    const branchIds = branches.map((b) => b.id);
    if (branchIds.length === 0) {
      return res.json({ success: true, data: { staff: [] } });
    }

    const requestedBranchId = req.query.pharmacyId ? parseInt(req.query.pharmacyId, 10) : null;
    const targetIds =
      requestedBranchId && branchIds.includes(requestedBranchId) ? [requestedBranchId] : branchIds;

    const whereClause = {
      role: 'pharmacy',
      assignedPharmacyId: { [Op.in]: targetIds },
      pharmacyRole: isPharmacyOwner(req.user) ? { [Op.in]: ['manager', 'staff'] } : 'staff',
    };

    const staffUsers = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'phone', 'pharmacyRole', 'assignedPharmacyId', 'createdAt'],
      order: [['pharmacyRole', 'ASC'], ['createdAt', 'DESC']],
    });

    const branchMap = new Map(branches.map((b) => [b.id, b]));
    const formattedStaff = staffUsers.map((s) => {
      const b = branchMap.get(s.assignedPharmacyId);
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        pharmacyRole: s.pharmacyRole,
        assignedPharmacyId: s.assignedPharmacyId,
        branchName: b ? `${b.city} · ${b.branchName || b.name}` : 'Unassigned',
        createdAt: s.createdAt,
      };
    });

    res.json({
      success: true,
      data: { staff: formattedStaff },
    });
  } catch (error) {
    console.error('Get pharmacy staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load team members',
      error: error.message,
    });
  }
};

// @desc    Create a store manager (owner only) or normal staff (owner or manager)
// @route   POST /api/pharmacies/staff
// @access  Private (Pharmacy owner or manager)
const createPharmacyStaff = async (req, res) => {
  try {
    const owner = isPharmacyOwner(req.user);
    const manager = isPharmacyManager(req.user);

    if (!owner && !manager) {
      return res.status(403).json({
        success: false,
        message: 'Only pharmacy admins and store managers can add team members',
      });
    }

    const { name, email, password, phone, pharmacyRole = 'staff', pharmacyId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    if (!['manager', 'staff'].includes(pharmacyRole)) {
      return res.status(400).json({
        success: false,
        message: 'pharmacyRole must be either "manager" or "staff"',
      });
    }

    // Store managers can only create normal staff, not other managers
    if (manager && pharmacyRole === 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Store managers can only create normal staff accounts',
      });
    }

    const branches = await getAccessiblePharmacies(req.user);
    const branchIds = branches.map((b) => b.id);
    const targetBranchId = pharmacyId ? parseInt(pharmacyId, 10) : branchIds[0];

    if (!targetBranchId || !branchIds.includes(targetBranchId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to assign staff to that branch',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const newMember = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone ? phone.trim() : null,
      role: 'pharmacy',
      pharmacyRole,
      assignedPharmacyId: targetBranchId,
      parentUserId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: `${pharmacyRole === 'manager' ? 'Store Manager' : 'Staff'} account created successfully`,
      data: {
        staff: {
          id: newMember.id,
          name: newMember.name,
          email: newMember.email,
          phone: newMember.phone,
          pharmacyRole: newMember.pharmacyRole,
          assignedPharmacyId: newMember.assignedPharmacyId,
        },
      },
    });
  } catch (error) {
    console.error('Create pharmacy staff error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create team member',
    });
  }
};

// @desc    Delete a pharmacy manager or staff member
// @route   DELETE /api/pharmacies/staff/:staffId
// @access  Private (Pharmacy owner or manager)
const deletePharmacyStaff = async (req, res) => {
  try {
    const owner = isPharmacyOwner(req.user);
    const manager = isPharmacyManager(req.user);

    if (!owner && !manager) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove team members',
      });
    }

    const branches = await getAccessiblePharmacies(req.user);
    const branchIds = branches.map((b) => b.id);

    const target = await User.findByPk(req.params.staffId);
    if (!target || target.role !== 'pharmacy' || !branchIds.includes(target.assignedPharmacyId)) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found in your branch(es)',
      });
    }

    if (manager && target.pharmacyRole !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Store managers can only remove normal staff members',
      });
    }

    await target.destroy();
    res.json({
      success: true,
      message: 'Team member removed successfully',
    });
  } catch (error) {
    console.error('Delete pharmacy staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove team member',
    });
  }
};

module.exports = {
  registerPharmacy,
  getPharmacy,
  updatePharmacy,
  getAllPharmacies,
  getMyPharmacy,
  getMyPharmacies,
  getPharmacyOrders,
  updateOrderStatus,
  getPharmacyStaff,
  createPharmacyStaff,
  deletePharmacyStaff
};