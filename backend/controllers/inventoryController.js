const { PharmacyInventory, Medicine, Pharmacy } = require('../models');
const { Op } = require('sequelize');

// @desc    Add medicine to pharmacy inventory
// @route   POST /api/inventory
// @access  Private (Pharmacy only)
const addToInventory = async (req, res) => {
  try {
    const {
      medicineId,
      price,
      stock,
      availability,
      expiryDate,
      batchNumber,
      minStockLevel,
    } = req.body;

    // Validation
    if (!medicineId || price == null || stock == null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide medicine ID, price, and stock quantity',
      });
    }

    // Get user's pharmacy
    const pharmacy = await Pharmacy.findOne({
      where: { userId: req.user.id },
    });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'No pharmacy found for this user',
      });
    }

    if (pharmacy.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Pharmacy must be approved to manage inventory',
      });
    }

    // Check if medicine exists
    const medicine = await Medicine.findByPk(medicineId);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    // Check if medicine already exists in this pharmacy's inventory
    const existingInventory = await PharmacyInventory.findOne({
      where: {
        pharmacyId: pharmacy.id,
        medicineId,
      },
    });

    if (existingInventory) {
      return res.status(400).json({
        success: false,
        message: 'Medicine already exists in inventory. Use update endpoint to modify.',
      });
    }

    // Create inventory entry
    const inventoryItem = await PharmacyInventory.create({
      pharmacyId: pharmacy.id,
      medicineId,
      price,
      stock,
      availability: availability !== undefined ? availability : true,
      expiryDate: expiryDate || null,
      batchNumber: batchNumber || null,
      minStockLevel: minStockLevel || 10,
    });

    // Fetch the created item with associated medicine data
    const createdItem = await PharmacyInventory.findByPk(inventoryItem.id, {
      include: [
        {
          model: Medicine,
          as: 'medicine',
          attributes: ['id', 'name', 'brand', 'category', 'genericName', 'dosageForm', 'strength'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Medicine added to inventory successfully',
      data: { inventoryItem: createdItem },
    });
  } catch (error) {
    console.error('Add to inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during inventory addition',
      error: error.message,
    });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Pharmacy owner only)
const updateInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await PharmacyInventory.findByPk(req.params.id, {
      include: [
        {
          model: Pharmacy,
          as: 'pharmacy',
          attributes: ['id', 'userId'],
        },
      ],
    });

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    // Check if user owns this pharmacy
    if (inventoryItem.pharmacy.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this inventory item',
      });
    }

    const {
      price,
      stock,
      availability,
      expiryDate,
      batchNumber,
      minStockLevel,
    } = req.body;

    // Update inventory item
    await inventoryItem.update({
      price: price !== undefined ? price : inventoryItem.price,
      stock: stock !== undefined ? stock : inventoryItem.stock,
      availability: availability !== undefined ? availability : inventoryItem.availability,
      expiryDate: expiryDate !== undefined ? expiryDate : inventoryItem.expiryDate,
      batchNumber: batchNumber !== undefined ? batchNumber : inventoryItem.batchNumber,
      minStockLevel: minStockLevel !== undefined ? minStockLevel : inventoryItem.minStockLevel,
    });

    // Fetch updated item with medicine data
    const updatedItem = await PharmacyInventory.findByPk(inventoryItem.id, {
      include: [
        {
          model: Medicine,
          as: 'medicine',
          attributes: ['id', 'name', 'brand', 'category', 'genericName', 'dosageForm', 'strength'],
        },
      ],
    });

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: { inventoryItem: updatedItem },
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Remove medicine from inventory
// @route   DELETE /api/inventory/:id
// @access  Private (Pharmacy owner only)
const removeFromInventory = async (req, res) => {
  try {
    const inventoryItem = await PharmacyInventory.findByPk(req.params.id, {
      include: [
        {
          model: Pharmacy,
          as: 'pharmacy',
          attributes: ['id', 'userId'],
        },
      ],
    });

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    // Check if user owns this pharmacy
    if (inventoryItem.pharmacy.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this inventory item',
      });
    }

    await inventoryItem.destroy();

    res.json({
      success: true,
      message: 'Medicine removed from inventory successfully',
    });
  } catch (error) {
    console.error('Remove from inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all inventory items for a pharmacy
// @route   GET /api/inventory/pharmacy/:pharmacyId
// @access  Public
const getPharmacyInventory = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { page = 1, limit = 20, search, category, availability } = req.query;
    const offset = (page - 1) * limit;

    // Check if pharmacy exists and is approved
    const pharmacy = await Pharmacy.findByPk(pharmacyId);
    if (!pharmacy || pharmacy.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found or not approved',
      });
    }

    // Build where clause for medicine search
    const medicineWhere = {};
    if (search) {
      medicineWhere[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { genericName: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (category) {
      medicineWhere.category = category;
    }

    // Build where clause for inventory
    const inventoryWhere = { pharmacyId };
    if (availability !== undefined) {
      inventoryWhere.availability = availability === 'true';
    }

    const { count, rows: inventory } = await PharmacyInventory.findAndCountAll({
      where: inventoryWhere,
      include: [
        {
          model: Medicine,
          as: 'medicine',
          where: medicineWhere,
          attributes: ['id', 'name', 'brand', 'category', 'genericName', 'dosageForm', 'strength', 'requiresPrescription'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['updatedAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        inventory,
        pharmacy: {
          id: pharmacy.id,
          name: pharmacy.name,
          address: pharmacy.address,
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get pharmacy inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get current user's pharmacy inventory
// @route   GET /api/inventory/my-inventory
// @access  Private (Pharmacy only)
const getMyInventory = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, availability } = req.query;
    const offset = (page - 1) * limit;

    // Get user's pharmacy
    const pharmacy = await Pharmacy.findOne({
      where: { userId: req.user.id },
    });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'No pharmacy found for this user',
      });
    }

    // Build where clause for medicine search
    const medicineWhere = {};
    if (search) {
      medicineWhere[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { genericName: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (category) {
      medicineWhere.category = category;
    }

    // Build where clause for inventory
    const inventoryWhere = { pharmacyId: pharmacy.id };
    if (availability !== undefined) {
      inventoryWhere.availability = availability === 'true';
    }

    const { count, rows: inventory } = await PharmacyInventory.findAndCountAll({
      where: inventoryWhere,
      include: [
        {
          model: Medicine,
          as: 'medicine',
          where: medicineWhere,
          attributes: ['id', 'name', 'brand', 'category', 'genericName', 'dosageForm', 'strength', 'requiresPrescription'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['updatedAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        inventory,
        pharmacy: {
          id: pharmacy.id,
          name: pharmacy.name,
          status: pharmacy.status,
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get my inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  addToInventory,
  updateInventoryItem,
  removeFromInventory,
  getPharmacyInventory,
  getMyInventory,
};