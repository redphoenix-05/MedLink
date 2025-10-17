const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reservation = sequelize.define('Reservation', {
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
    }
  },
  pharmacyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pharmacies',
      key: 'id'
    }
  },
  medicineId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'medicines',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  deliveryOption: {
    type: DataTypes.ENUM('pickup', 'delivery'),
    allowNull: false,
    defaultValue: 'pickup'
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'delivered'),
    allowNull: false,
    defaultValue: 'pending'
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
  tableName: 'reservations',
  timestamps: true
});

module.exports = Reservation;
