const { Cart, Medicine, Pharmacy, PharmacyInventory, User, Reservation } = require('../models');
const Order = require('../models/Order');
const { sequelize } = require('../config/database');

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private (Customer only)
const addToCart = async (req, res) => {
  try {
    const { pharmacyId, medicineId, quantity } = req.body;
    const customerId = req.user.id;

    // Validate input
    if (!pharmacyId || !medicineId || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: pharmacyId, medicineId, quantity' 
      });
    }

    if (quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quantity must be at least 1' 
      });
    }

    // Get pharmacy inventory to check stock and price
    const inventory = await PharmacyInventory.findOne({
      where: { pharmacyId, medicineId }
    });

    if (!inventory) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medicine not available at this pharmacy' 
      });
    }

    if (inventory.stock < quantity) {
      return res.status(400).json({ 
        success: false,
        message: `Insufficient stock. Only ${inventory.stock} available` 
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await Cart.findOne({
      where: { customerId, pharmacyId, medicineId }
    });

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (inventory.stock < newQuantity) {
        return res.status(400).json({ 
          success: false,
          message: `Cannot add more. Only ${inventory.stock} available and you already have ${existingCartItem.quantity} in cart` 
        });
      }

      existingCartItem.quantity = newQuantity;
      await existingCartItem.save();

      // Fetch updated cart item with details
      const updatedCartItem = await Cart.findByPk(existingCartItem.id, {
        include: [
          { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'brand', 'category', 'genericName'] },
          { model: Pharmacy, as: 'pharmacy', attributes: ['id', 'name', 'address', 'phone'] }
        ]
      });

      return res.json({
        success: true,
        message: 'Cart updated successfully',
        data: { cartItem: updatedCartItem }
      });
    }

    // Create new cart item
    const cartItem = await Cart.create({
      customerId,
      pharmacyId,
      medicineId,
      quantity,
      price: inventory.price
    });

    // Fetch cart item with details
    const fullCartItem = await Cart.findByPk(cartItem.id, {
      include: [
        { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'brand', 'category', 'genericName'] },
        { model: Pharmacy, as: 'pharmacy', attributes: ['id', 'name', 'address', 'phone'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: { cartItem: fullCartItem }
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add item to cart', 
      error: error.message 
    });
  }
};

// @desc    Get customer's cart
// @route   GET /api/cart
// @access  Private (Customer only)
const getCart = async (req, res) => {
  try {
    const customerId = req.user.id;

    const cartItems = await Cart.findAll({
      where: { customerId },
      include: [
        { 
          model: Medicine, 
          as: 'medicine', 
          attributes: ['id', 'name', 'brand', 'category', 'genericName', 'dosageForm', 'strength'] 
        },
        { 
          model: Pharmacy, 
          as: 'pharmacy', 
          attributes: ['id', 'name', 'address', 'phone'] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate totals
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => 
      sum + (parseFloat(item.price) * item.quantity), 0
    ).toFixed(2);

    // Group by pharmacy
    const groupedByPharmacy = cartItems.reduce((acc, item) => {
      const pharmacyId = item.pharmacyId;
      if (!acc[pharmacyId]) {
        acc[pharmacyId] = {
          pharmacy: item.pharmacy,
          items: [],
          subtotal: 0
        };
      }
      acc[pharmacyId].items.push(item);
      acc[pharmacyId].subtotal += parseFloat(item.price) * item.quantity;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        cartItems,
        groupedByPharmacy: Object.values(groupedByPharmacy),
        summary: {
          totalItems,
          totalPrice
        }
      }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get cart', 
      error: error.message 
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private (Customer only)
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const customerId = req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quantity must be at least 1' 
      });
    }

    const cartItem = await Cart.findOne({
      where: { id, customerId }
    });

    if (!cartItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart item not found' 
      });
    }

    // Check stock availability
    const inventory = await PharmacyInventory.findOne({
      where: { 
        pharmacyId: cartItem.pharmacyId, 
        medicineId: cartItem.medicineId 
      }
    });

    if (!inventory || inventory.stock < quantity) {
      return res.status(400).json({ 
        success: false,
        message: `Insufficient stock. Only ${inventory ? inventory.stock : 0} available` 
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    // Fetch updated cart item with details
    const updatedCartItem = await Cart.findByPk(cartItem.id, {
      include: [
        { model: Medicine, as: 'medicine', attributes: ['id', 'name', 'brand', 'category', 'genericName'] },
        { model: Pharmacy, as: 'pharmacy', attributes: ['id', 'name', 'address', 'phone'] }
      ]
    });

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: { cartItem: updatedCartItem }
    });

  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update cart item', 
      error: error.message 
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private (Customer only)
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    const cartItem = await Cart.findOne({
      where: { id, customerId }
    });

    if (!cartItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart item not found' 
      });
    }

    await cartItem.destroy();

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove item from cart', 
      error: error.message 
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private (Customer only)
const clearCart = async (req, res) => {
  try {
    const customerId = req.user.id;

    await Cart.destroy({
      where: { customerId }
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear cart', 
      error: error.message 
    });
  }
};

// @desc    Checkout - Convert cart to orders with delivery and platform fees
// @route   POST /api/cart/checkout
// @access  Private (Customer only)
const checkout = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { deliveryType } = req.body; // 'pickup' or 'delivery'
    const customerId = req.user.id;

    // Validate input
    if (!deliveryType || !['pickup', 'delivery'].includes(deliveryType)) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Valid delivery type is required (pickup or delivery)' 
      });
    }

    // Get all cart items with medicine and pharmacy details
    const cartItems = await Cart.findAll({
      where: { customerId },
      include: [
        { 
          model: Medicine, 
          as: 'medicine', 
          attributes: ['id', 'name', 'genericName'] 
        }
      ],
      transaction
    });

    if (cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Cart is empty' 
      });
    }

    // Constants for fees
    const DELIVERY_CHARGE = deliveryType === 'delivery' ? 60.00 : 0.00;
    const PLATFORM_FEE_RATE = 0.003; // 0.3%

    // Create orders for each cart item
    const orders = [];
    for (const item of cartItems) {
      // Check stock availability
      const inventory = await PharmacyInventory.findOne({
        where: { 
          pharmacyId: item.pharmacyId, 
          medicineId: item.medicineId 
        },
        transaction
      });

      if (!inventory || inventory.stock < item.quantity) {
        await transaction.rollback();
        const medicineName = item.medicine ? item.medicine.name : 'Unknown medicine';
        return res.status(400).json({ 
          success: false,
          message: `Insufficient stock for ${medicineName}` 
        });
      }

      // Calculate costs
      const unitPrice = parseFloat(item.price);
      const quantity = item.quantity;
      const totalPrice = unitPrice * quantity;
      const platformFee = parseFloat((totalPrice * PLATFORM_FEE_RATE).toFixed(2));
      const grandTotal = parseFloat((totalPrice + DELIVERY_CHARGE + platformFee).toFixed(2));

      // Create order
      const order = await Order.create({
        userId: customerId,
        pharmacyId: item.pharmacyId,
        medicineName: item.medicine ? item.medicine.name : 'Unknown',
        genericName: item.medicine ? item.medicine.genericName : null,
        unitPrice,
        quantity,
        totalPrice,
        deliveryCharge: DELIVERY_CHARGE,
        platformFee,
        grandTotal,
        deliveryType,
        status: 'pending',
        orderDate: new Date()
      }, { transaction });

      orders.push(order);

      // Update inventory stock
      inventory.stock -= quantity;
      await inventory.save({ transaction });
    }

    // Clear cart after successful checkout
    await Cart.destroy({
      where: { customerId },
      transaction
    });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: `Checkout successful! ${orders.length} order(s) created.`,
      data: { 
        orders,
        summary: {
          totalOrders: orders.length,
          deliveryType,
          deliveryCharge: DELIVERY_CHARGE
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Checkout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to complete checkout', 
      error: error.message 
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout
};
