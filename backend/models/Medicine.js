const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Medicine = sequelize.define('Medicine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200],
    },
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100],
    },
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      isIn: [['prescription', 'over-the-counter', 'supplement', 'medical-device', 'other']],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  genericName: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 200],
    },
  },
  dosageForm: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'other']],
    },
  },
  strength: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g., 500mg, 10ml, etc.',
  },
  requiresPrescription: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'medicines',
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['category'] },
    { fields: ['requiresPrescription'] },
  ],
});

module.exports = Medicine;