const { Medicine, PharmacyInventory, Pharmacy } = require('../models');
const { Op } = require('sequelize');

// @desc    Add new medicine to system
// @route   POST /api/medicines
// @access  Private (Admin only)
const addMedicine = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      description,
      genericName,
      dosageForm,
      strength,
      requiresPrescription,
    } = req.body;

    // Validation
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide medicine name and category',
      });
    }

    // Check if medicine already exists (same name, brand, and strength)
    const existingMedicine = await Medicine.findOne({
      where: {
        name: { [Op.iLike]: name },
        brand: brand || null,
        strength: strength || null,
      },
    });

    if (existingMedicine) {
      return res.status(400).json({
        success: false,
        message: 'Medicine with same name, brand, and strength already exists',
      });
    }

    // Create medicine
    const medicine = await Medicine.create({
      name,
      brand: brand || null,
      category,
      description: description || null,
      genericName: genericName || null,
      dosageForm: dosageForm || null,
      strength: strength || null,
      requiresPrescription: requiresPrescription || false,
    });

    res.status(201).json({
      success: true,
      message: 'Medicine added successfully',
      data: { medicine },
    });
  } catch (error) {
    console.error('Add medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during medicine creation',
      error: error.message,
    });
  }
};

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
const getAllMedicines = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      requiresPrescription,
    } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { genericName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (requiresPrescription !== undefined) {
      whereClause.requiresPrescription = requiresPrescription === 'true';
    }

    const { count, rows: medicines } = await Medicine.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        medicines,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get all medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get single medicine details
// @route   GET /api/medicines/:id
// @access  Public
const getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByPk(req.params.id, {
      include: [
        {
          model: PharmacyInventory,
          as: 'inventory',
          where: { availability: true },
          required: false,
          include: [
            {
              model: Pharmacy,
              as: 'pharmacy',
              where: { status: 'approved' },
              attributes: ['id', 'name', 'address', 'phone'],
            },
          ],
        },
      ],
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    res.json({
      success: true,
      data: { medicine },
    });
  } catch (error) {
    console.error('Get medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update medicine details
// @route   PUT /api/medicines/:id
// @access  Private (Admin only)
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    const {
      name,
      brand,
      category,
      description,
      genericName,
      dosageForm,
      strength,
      requiresPrescription,
    } = req.body;

    // Update medicine
    await medicine.update({
      name: name || medicine.name,
      brand: brand !== undefined ? brand : medicine.brand,
      category: category || medicine.category,
      description: description !== undefined ? description : medicine.description,
      genericName: genericName !== undefined ? genericName : medicine.genericName,
      dosageForm: dosageForm !== undefined ? dosageForm : medicine.dosageForm,
      strength: strength !== undefined ? strength : medicine.strength,
      requiresPrescription: requiresPrescription !== undefined ? requiresPrescription : medicine.requiresPrescription,
    });

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: { medicine },
    });
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private (Admin only)
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    // Check if medicine is in any pharmacy inventory
    const inventoryCount = await PharmacyInventory.count({
      where: { medicineId: medicine.id },
    });

    if (inventoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete medicine that exists in pharmacy inventories',
      });
    }

    await medicine.destroy();

    res.json({
      success: true,
      message: 'Medicine deleted successfully',
    });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  addMedicine,
  getAllMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
};