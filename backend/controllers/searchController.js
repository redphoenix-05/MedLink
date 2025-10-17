const { Medicine, PharmacyInventory, Pharmacy, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Search medicines across pharmacies
// @route   GET /api/search?query=<medicine_name>
// @access  Public
const searchMedicines = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long',
      });
    }

    // Search for medicines with case-insensitive LIKE query
    const searchResults = await Medicine.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query.trim()}%` } },
          { brand: { [Op.iLike]: `%${query.trim()}%` } },
          { genericName: { [Op.iLike]: `%${query.trim()}%` } },
        ],
      },
      include: [
        {
          model: PharmacyInventory,
          as: 'inventory',
          where: { 
            availability: true,
            stock: { [Op.gt]: 0 } // Only include items with stock > 0
          },
          required: false,
          include: [
            {
              model: Pharmacy,
              as: 'pharmacy',
              where: { status: 'approved' }, // Only approved pharmacies
              attributes: [
                'id', 'name', 'address', 'phone', 
                'latitude', 'longitude', 'operatingHours'
              ],
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['name', 'email']
                }
              ]
            },
          ],
        },
      ],
    });

    // Format the response to group by medicine
    const formattedResults = searchResults.map(medicine => {
      const pharmaciesWithStock = medicine.inventory
        .filter(inv => inv.pharmacy) // Ensure pharmacy exists
        .map(inventory => ({
          id: inventory.pharmacy.id,
          name: inventory.pharmacy.name,
          address: inventory.pharmacy.address,
          phone: inventory.pharmacy.phone,
          latitude: inventory.pharmacy.latitude,
          longitude: inventory.pharmacy.longitude,
          operatingHours: inventory.pharmacy.operatingHours,
          price: parseFloat(inventory.price),
          stock: inventory.stock,
          availability: inventory.availability,
          inventoryId: inventory.id,
        }));

      return {
        medicineId: medicine.id,
        medicineName: medicine.name,
        genericName: medicine.genericName,
        brand: medicine.brand,
        category: medicine.category,
        dosageForm: medicine.dosageForm,
        strength: medicine.strength,
        requiresPrescription: medicine.requiresPrescription,
        pharmaciesCount: pharmaciesWithStock.length,
        pharmacies: pharmaciesWithStock,
      };
    }).filter(result => result.pharmacies.length > 0); // Only return medicines with available pharmacies

    // Flatten results for easier frontend consumption
    const flatResults = [];
    formattedResults.forEach(medicine => {
      medicine.pharmacies.forEach(pharmacy => {
        flatResults.push({
          id: pharmacy.id,
          name: pharmacy.name,
          address: pharmacy.address,
          phone: pharmacy.phone,
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
          operatingHours: pharmacy.operatingHours,
          price: pharmacy.price,
          stock: pharmacy.stock,
          availability: pharmacy.availability,
          medicine: medicine.medicineName,
          genericName: medicine.genericName,
          brand: medicine.brand,
          medicineId: medicine.medicineId,
          inventoryId: pharmacy.inventoryId,
        });
      });
    });

    res.json({
      success: true,
      query: query.trim(),
      resultsCount: flatResults.length,
      data: flatResults,
    });
  } catch (error) {
    console.error('Search medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during medicine search',
      error: error.message,
    });
  }
};

// @desc    Get pharmacy locations for map
// @route   GET /api/pharmacies/locations
// @access  Public
const getPharmacyLocations = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.findAll({
      where: { 
        status: 'approved',
        latitude: { [Op.not]: null },
        longitude: { [Op.not]: null },
      },
      attributes: [
        'id', 'name', 'address', 'phone', 
        'latitude', 'longitude', 'operatingHours'
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        },
        {
          model: PharmacyInventory,
          as: 'inventory',
          where: { 
            availability: true,
            stock: { [Op.gt]: 0 }
          },
          required: false,
          attributes: ['id', 'price', 'stock'],
          include: [
            {
              model: Medicine,
              as: 'medicine',
              attributes: ['id', 'name', 'genericName', 'brand', 'strength']
            }
          ]
        }
      ],
    });

    // Format response for map markers
    const formattedPharmacies = pharmacies.map(pharmacy => ({
      id: pharmacy.id,
      name: pharmacy.name,
      address: pharmacy.address,
      phone: pharmacy.phone,
      latitude: parseFloat(pharmacy.latitude),
      longitude: parseFloat(pharmacy.longitude),
      operatingHours: pharmacy.operatingHours,
      medicinesCount: pharmacy.inventory ? pharmacy.inventory.length : 0,
      medicines: pharmacy.inventory ? pharmacy.inventory.slice(0, 5).map(inv => ({
        id: inv.medicine.id,
        name: inv.medicine.name,
        genericName: inv.medicine.genericName,
        brand: inv.medicine.brand,
        strength: inv.medicine.strength,
        price: parseFloat(inv.price),
        stock: inv.stock,
      })) : [],
    }));

    res.json({
      success: true,
      count: formattedPharmacies.length,
      data: {
        pharmacies: formattedPharmacies,
      },
    });
  } catch (error) {
    console.error('Get pharmacy locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pharmacy locations',
      error: error.message,
    });
  }
};

// @desc    Get detailed pharmacy information
// @route   GET /api/pharmacies/:id/details
// @access  Public
const getPharmacyDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const pharmacy = await Pharmacy.findOne({
      where: { 
        id,
        status: 'approved'
      },
      attributes: [
        'id', 'name', 'address', 'phone', 
        'latitude', 'longitude', 'operatingHours', 'licenseNumber'
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        },
        {
          model: PharmacyInventory,
          as: 'inventory',
          where: { availability: true },
          required: false,
          attributes: ['id', 'price', 'stock', 'minStockLevel'],
          include: [
            {
              model: Medicine,
              as: 'medicine',
              attributes: [
                'id', 'name', 'genericName', 'brand', 'category',
                'dosageForm', 'strength', 'requiresPrescription', 'description'
              ]
            }
          ]
        }
      ],
    });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found or not approved',
      });
    }

    // Format the response
    const formattedPharmacy = {
      id: pharmacy.id,
      name: pharmacy.name,
      address: pharmacy.address,
      phone: pharmacy.phone,
      latitude: pharmacy.latitude ? parseFloat(pharmacy.latitude) : null,
      longitude: pharmacy.longitude ? parseFloat(pharmacy.longitude) : null,
      operatingHours: pharmacy.operatingHours,
      licenseNumber: pharmacy.licenseNumber,
      owner: {
        name: pharmacy.user.name,
        email: pharmacy.user.email,
      },
      medicines: pharmacy.inventory.map(inv => ({
        inventoryId: inv.id,
        medicine: {
          id: inv.medicine.id,
          name: inv.medicine.name,
          genericName: inv.medicine.genericName,
          brand: inv.medicine.brand,
          category: inv.medicine.category,
          dosageForm: inv.medicine.dosageForm,
          strength: inv.medicine.strength,
          requiresPrescription: inv.medicine.requiresPrescription,
          description: inv.medicine.description,
        },
        price: parseFloat(inv.price),
        stock: inv.stock,
        minStockLevel: inv.minStockLevel,
        inStock: inv.stock > 0,
        lowStock: inv.stock <= inv.minStockLevel,
      })),
      totalMedicines: pharmacy.inventory.length,
      inStockMedicines: pharmacy.inventory.filter(inv => inv.stock > 0).length,
    };

    res.json({
      success: true,
      data: {
        pharmacy: formattedPharmacy,
      },
    });
  } catch (error) {
    console.error('Get pharmacy details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pharmacy details',
      error: error.message,
    });
  }
};

module.exports = {
  searchMedicines,
  getPharmacyLocations,
  getPharmacyDetails,
};