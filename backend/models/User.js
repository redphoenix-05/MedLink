const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validates: {
      notEmpty: true,
      len: [2, 100],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validates: {
      isEmail: true,
      notEmpty: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isValidPhoneNumber(value) {
        if (value && value.trim() !== '') {
          // Bangladesh phone number: must be exactly 11 digits starting with 01[3-9]
          const phoneRegex = /^01[3-9]\d{8}$/;
          if (!phoneRegex.test(value)) {
            throw new Error('The provided number is wrong. Phone number must be 11 digits starting with 01[3-9]');
          }
        }
      }
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validates: {
      notEmpty: true,
      len: [6, 100],
    },
  },
  role: {
    type: DataTypes.ENUM('customer', 'pharmacy', 'admin'),
    allowNull: false,
    defaultValue: 'customer',
  },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

// Instance method to check password
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;