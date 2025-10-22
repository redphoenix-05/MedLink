const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  pharmacyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pharmacies',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  medicineId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'medicines',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'carts',
  timestamps: true,
  indexes: [
    { fields: ['customerId'] },
    { fields: ['pharmacyId'] },
    { fields: ['medicineId'] }
  ]
});

module.exports = Cart;
