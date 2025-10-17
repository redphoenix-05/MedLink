const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reservationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'reservations',
      key: 'id'
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  deliveryStatus: {
    type: DataTypes.ENUM('pending', 'out_for_delivery', 'delivered'),
    allowNull: false,
    defaultValue: 'pending'
  },
  deliveryPerson: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'deliveries',
  timestamps: true
});

module.exports = Delivery;
