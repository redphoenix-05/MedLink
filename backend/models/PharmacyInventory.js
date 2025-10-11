const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PharmacyInventory = sequelize.define('PharmacyInventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  pharmacyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pharmacies',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  medicineId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'medicines',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true,
    },
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      isInt: true,
    },
  },
  availability: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  batchNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 50],
    },
  },
  minStockLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    validate: {
      min: 0,
      isInt: true,
    },
  },
}, {
  tableName: 'pharmacy_inventory',
  timestamps: true,
  indexes: [
    { fields: ['pharmacyId'] },
    { fields: ['medicineId'] },
    { fields: ['availability'] },
    { fields: ['stock'] },
    { fields: ['pharmacyId', 'medicineId'], unique: true }, // One entry per pharmacy-medicine combination
  ],
});

module.exports = PharmacyInventory;