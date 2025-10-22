const User = require('./User');
const Pharmacy = require('./Pharmacy');
const Medicine = require('./Medicine');
const PharmacyInventory = require('./PharmacyInventory');
const Reservation = require('./Reservation');
const Delivery = require('./Delivery');
const Cart = require('./Cart');
const Order = require('./Order');

// Define associations
// User -> Pharmacy (One to One)
User.hasOne(Pharmacy, {
  foreignKey: 'userId',
  as: 'pharmacy',
  onDelete: 'CASCADE',
});
Pharmacy.belongsTo(User, {
  foreignKey: 'userId',
  as: 'owner',
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

// ==========================================
// RESERVATION ASSOCIATIONS
// ==========================================
Reservation.belongsTo(User, { 
  foreignKey: 'customerId', 
  as: 'customer' 
});

Reservation.belongsTo(Pharmacy, { 
  foreignKey: 'pharmacyId', 
  as: 'pharmacy' 
});

Reservation.belongsTo(Medicine, { 
  foreignKey: 'medicineId', 
  as: 'medicine' 
});

User.hasMany(Reservation, {
  foreignKey: 'customerId',
  as: 'reservations'
});

Pharmacy.hasMany(Reservation, {
  foreignKey: 'pharmacyId',
  as: 'reservations'
});

Medicine.hasMany(Reservation, {
  foreignKey: 'medicineId',
  as: 'reservations'
});

// ==========================================
// DELIVERY ASSOCIATIONS
// ==========================================
Delivery.belongsTo(Reservation, {
  foreignKey: 'reservationId',
  as: 'reservation'
});

Reservation.hasOne(Delivery, {
  foreignKey: 'reservationId',
  as: 'delivery'
});

// Order relationships will be added later
// Commented out for now to fix database sync issues

// ==========================================
// CART ASSOCIATIONS
// ==========================================
Cart.belongsTo(User, {
  foreignKey: 'customerId',
  as: 'customer'
});

Cart.belongsTo(Pharmacy, {
  foreignKey: 'pharmacyId',
  as: 'pharmacy'
});

Cart.belongsTo(Medicine, {
  foreignKey: 'medicineId',
  as: 'medicine'
});

User.hasMany(Cart, {
  foreignKey: 'customerId',
  as: 'cartItems'
});

// ==========================================
// ORDER ASSOCIATIONS
// ==========================================
Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'customer'
});

Order.belongsTo(User, {
  foreignKey: 'pharmacyId',
  as: 'pharmacy'
});

User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders'
});

User.hasMany(Order, {
  foreignKey: 'pharmacyId',
  as: 'pharmacyOrders'
});

module.exports = {
  User,
  Pharmacy,
  Medicine,
  PharmacyInventory,
  Reservation,
  Delivery,
  Cart,
  Order,
};