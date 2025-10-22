const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
    allowNull: false,
  },
  pharmacyId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
    allowNull: false,
  },
  medicineName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  genericName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  deliveryCharge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  platformFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  grandTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  deliveryType: {
    type: DataTypes.ENUM('pickup', 'delivery'),
    allowNull: false,
    defaultValue: 'pickup',
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'delivered', 'completed'),
    defaultValue: 'pending',
    allowNull: false,
  },
  orderDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'orders',
  timestamps: true,
});

module.exports = Order;