const User = require('./User');
const Pharmacy = require('./Pharmacy');
const Medicine = require('./Medicine');
const PharmacyInventory = require('./PharmacyInventory');
// const Order = require('./Order');
// const OrderItem = require('./OrderItem');

// Define associations
// User -> Pharmacy (One to One)
User.hasOne(Pharmacy, {
  foreignKey: 'userId',
  as: 'pharmacy',
  onDelete: 'CASCADE',
});
Pharmacy.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Pharmacy -> PharmacyInventory (One to Many)
Pharmacy.hasMany(PharmacyInventory, {
  foreignKey: 'pharmacyId',
  as: 'inventory',
  onDelete: 'CASCADE',
});
PharmacyInventory.belongsTo(Pharmacy, {
  foreignKey: 'pharmacyId',
  as: 'pharmacy',
});

// Medicine -> PharmacyInventory (One to Many)
Medicine.hasMany(PharmacyInventory, {
  foreignKey: 'medicineId',
  as: 'inventory',
  onDelete: 'CASCADE',
});
PharmacyInventory.belongsTo(Medicine, {
  foreignKey: 'medicineId',
  as: 'medicine',
});

// Many-to-Many relationship through PharmacyInventory
Pharmacy.belongsToMany(Medicine, {
  through: PharmacyInventory,
  foreignKey: 'pharmacyId',
  otherKey: 'medicineId',
  as: 'medicines',
});
Medicine.belongsToMany(Pharmacy, {
  through: PharmacyInventory,
  foreignKey: 'medicineId',
  otherKey: 'pharmacyId',
  as: 'pharmacies',
});

// Order relationships will be added later
// Commented out for now to fix database sync issues

module.exports = {
  User,
  Pharmacy,
  Medicine,
  PharmacyInventory,
  // Order,
  // OrderItem,
};