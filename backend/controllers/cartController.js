const { Cart, Medicine, Pharmacy, PharmacyInventory, User, Reservation } = require('../models');
const Order = require('../models/Order');
const { sequelize } = require('../config/database');
const SSLCommerzPayment = require('sslcommerz-lts');

// SSLCommerz Configuration
const store_id = process.env.SSLCOMMERZ_STORE_ID || 'ridee67573b7e3a7d3';
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD || 'ridee67573b7e3a7d3@ssl';
const is_live = false; // true for live, false for sandbox

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
    const { deliveryType, deliveryAddress } = req.body; // 'pickup' or 'delivery'
    const customerId = req.user.id;

    // Validate input
    if (!deliveryType || !['pickup', 'delivery'].includes(deliveryType)) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Valid delivery type is required (pickup or delivery)' 
      });
    }

    // Validate delivery address if delivery type is 'delivery'
    if (deliveryType === 'delivery' && (!deliveryAddress || deliveryAddress.trim() === '')) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Delivery address is required for delivery orders' 
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

    // Get unique pharmacy IDs
    const uniquePharmacyIds = [...new Set(cartItems.map(item => item.pharmacyId))];
    const numberOfPharmacies = uniquePharmacyIds.length;

    // Constants for fees
    const DELIVERY_CHARGE_PER_PHARMACY = 60.00;
    const TOTAL_DELIVERY_CHARGE = deliveryType === 'delivery' 
      ? DELIVERY_CHARGE_PER_PHARMACY * numberOfPharmacies 
      : 0.00;
    const PLATFORM_FEE_RATE = 0.003; // 0.3%

    // Group cart items by pharmacy to distribute delivery charge
    const itemsByPharmacy = cartItems.reduce((acc, item) => {
      if (!acc[item.pharmacyId]) {
        acc[item.pharmacyId] = [];
      }
      acc[item.pharmacyId].push(item);
      return acc;
    }, {});

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
      
      // Assign delivery charge only to the first item from each pharmacy
      const isFirstItemFromPharmacy = itemsByPharmacy[item.pharmacyId][0].id === item.id;
      const itemDeliveryCharge = (deliveryType === 'delivery' && isFirstItemFromPharmacy) 
        ? DELIVERY_CHARGE_PER_PHARMACY 
        : 0.00;
      
      const grandTotal = parseFloat((totalPrice + itemDeliveryCharge + platformFee).toFixed(2));

      // Create order
      const order = await Order.create({
        userId: customerId,
        pharmacyId: item.pharmacyId,
        medicineName: item.medicine ? item.medicine.name : 'Unknown',
        genericName: item.medicine ? item.medicine.genericName : null,
        unitPrice,
        quantity,
        totalPrice,
        deliveryCharge: itemDeliveryCharge,
        platformFee,
        grandTotal,
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : null,
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
      message: `Checkout successful! ${orders.length} order(s) created from ${numberOfPharmacies} pharmacy/pharmacies.`,
      data: { 
        orders,
        summary: {
          totalOrders: orders.length,
          numberOfPharmacies,
          deliveryType,
          deliveryChargePerPharmacy: DELIVERY_CHARGE_PER_PHARMACY,
          totalDeliveryCharge: TOTAL_DELIVERY_CHARGE
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

// @desc    Get customer's orders
// @route   GET /api/cart/orders
// @access  Private (Customer only)
const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.id;

    const orders = await Order.findAll({
      where: { userId: customerId },
      include: [
        {
          model: Pharmacy,
          as: 'pharmacy',
          attributes: ['id', 'name', 'address', 'phone']
        }
      ],
      order: [['orderDate', 'DESC']]
    });

    console.log(`📦 Fetched ${orders.length} orders for customer ${customerId}`);

    res.json({
      success: true,
      data: { orders }
    });

  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get orders', 
      error: error.message 
    });
  }
};

// @desc    Initialize payment with SSLCommerz
// @route   POST /api/cart/payment-init
// @access  Private (Customer only)
const initializePayment = async (req, res) => {
  try {
    const { deliveryType, deliveryAddress } = req.body;
    const customerId = req.user.id;

    // Validate delivery address if delivery is selected
    if (deliveryType === 'delivery' && !deliveryAddress?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required for delivery orders'
      });
    }

    // Get customer info
    const customer = await User.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get cart items
    const cartItems = await Cart.findAll({
      where: { customerId },
      include: [
        { model: Medicine, as: 'medicine' },
        { model: Pharmacy, as: 'pharmacy' }
      ]
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate totals
    const medicineTotal = cartItems.reduce((sum, item) => 
      sum + (parseFloat(item.price) * item.quantity), 0
    );

    // Count unique pharmacies for delivery charge
    const uniquePharmacyIds = [...new Set(cartItems.map(item => item.pharmacyId))];
    const numberOfPharmacies = uniquePharmacyIds.length;
    const DELIVERY_CHARGE_PER_PHARMACY = 60.00;
    const TOTAL_DELIVERY_CHARGE = deliveryType === 'delivery' 
      ? DELIVERY_CHARGE_PER_PHARMACY * numberOfPharmacies 
      : 0.00;

    // Platform fee: 0.3% of medicine total
    const PLATFORM_FEE_PERCENTAGE = 0.003;
    const platformFee = medicineTotal * PLATFORM_FEE_PERCENTAGE;

    // Calculate grand total
    const grandTotal = medicineTotal + TOTAL_DELIVERY_CHARGE + platformFee;

    // Generate unique transaction ID
    const tranId = `MEDLINK_${Date.now()}_${customerId}`;

    // SSLCommerz payment data
    const data = {
      total_amount: grandTotal.toFixed(2),
      currency: 'BDT',
      tran_id: tranId,
      success_url: `http://localhost:5000/api/cart/payment-success`,
      fail_url: `http://localhost:5000/api/cart/payment-fail`,
      cancel_url: `http://localhost:5000/api/cart/payment-cancel`,
      ipn_url: `http://localhost:5000/api/cart/payment-ipn`,
      shipping_method: deliveryType === 'delivery' ? 'Delivery' : 'Pickup',
      product_name: 'Medicine Order',
      product_category: 'Healthcare',
      product_profile: 'general',
      cus_name: customer.name,
      cus_email: customer.email,
      cus_add1: deliveryAddress || customer.address || 'N/A',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: customer.phone || '01XXXXXXXXX',
      cus_fax: '',
      ship_name: customer.name,
      ship_add1: deliveryAddress || 'N/A',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: '1000',
      ship_country: 'Bangladesh',
      value_a: customerId.toString(),
      value_b: deliveryType,
      value_c: deliveryAddress || '',
      value_d: JSON.stringify({
        numberOfPharmacies,
        deliveryCharge: TOTAL_DELIVERY_CHARGE,
        platformFee: platformFee.toFixed(2)
      })
    };

    console.log('🔑 SSLCommerz Init:', { store_id, is_live });
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    console.log('📝 SSLCommerz Response:', apiResponse);

    if (apiResponse.status === 'SUCCESS') {
      return res.json({
        success: true,
        message: 'Payment session initialized',
        data: {
          gatewayPageURL: apiResponse.GatewayPageURL,
          tranId: tranId
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to initialize payment',
        error: apiResponse.failedreason
      });
    }

  } catch (error) {
    console.error('❌ Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.message
    });
  }
};

// @desc    Handle successful payment callback from SSLCommerz
// @route   POST /api/cart/payment-success
// @access  Public (SSLCommerz callback)
const paymentSuccess = async (req, res) => {
  let transaction;
  
  try {
    // SSLCommerz can send data via POST body or query params
    const data = req.method === 'GET' ? req.query : req.body;
    const { tran_id, val_id, amount, card_type, value_a, value_b, value_c, value_d } = data;

    console.log('✅ Payment Success Callback:', { 
      method: req.method, 
      tran_id, 
      val_id, 
      amount,
      customerId: value_a 
    });

    if (!val_id || !tran_id) {
      console.error('❌ Missing required payment parameters');
      return res.redirect(`http://localhost:5173/payment/failed?reason=${encodeURIComponent('Invalid payment callback')}`);
    }

    // Validate payment with SSLCommerz
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validation = await sslcz.validate({ val_id });

    console.log('🔍 Payment Validation:', validation);

    if (validation.status !== 'VALID' && validation.status !== 'VALIDATED') {
      console.error('❌ Payment validation failed:', validation);
      return res.redirect(`http://localhost:5173/payment/failed?reason=${encodeURIComponent('Payment validation failed')}`);
    }

    const customerId = parseInt(value_a);
    const deliveryType = value_b;
    const deliveryAddress = value_c || '';
    
    let paymentMeta;
    try {
      paymentMeta = JSON.parse(value_d || '{}');
    } catch (parseError) {
      console.error('❌ Error parsing payment metadata:', parseError);
      paymentMeta = { numberOfPharmacies: 1, deliveryCharge: 0, platformFee: 0 };
    }

    console.log('📦 Payment Meta:', paymentMeta);
    console.log('👤 Customer ID:', customerId);

    // Start transaction
    transaction = await sequelize.transaction();

    // Get cart items
    const cartItems = await Cart.findAll({
      where: { customerId },
      include: [
        { model: Medicine, as: 'medicine' },
        { model: Pharmacy, as: 'pharmacy' }
      ],
      transaction
    });

    console.log('🛒 Cart Items Found:', cartItems.length);

    if (cartItems.length === 0) {
      await transaction.rollback();
      console.error('❌ Cart is empty for customer:', customerId);
      return res.redirect(`http://localhost:5173/payment/failed?reason=${encodeURIComponent('Cart is empty')}`);
    }

    // Create orders (same logic as checkout)
    const orders = [];
    const uniquePharmacyIds = [...new Set(cartItems.map(item => item.pharmacyId))];
    const DELIVERY_CHARGE_PER_PHARMACY = parseFloat(paymentMeta.deliveryCharge) / uniquePharmacyIds.length;

    for (const item of cartItems) {
      const inventory = await PharmacyInventory.findOne({
        where: {
          pharmacyId: item.pharmacyId,
          medicineId: item.medicineId
        },
        transaction
      });

      if (!inventory || inventory.stock < item.quantity) {
        await transaction.rollback();
        const errorMsg = `Insufficient stock for ${item.medicine?.name}`;
        console.error('❌', errorMsg);
        return res.redirect(`http://localhost:5173/payment/failed?reason=${encodeURIComponent(errorMsg)}`);
      }

      const unitPrice = parseFloat(item.price);
      const quantity = item.quantity;
      const totalPrice = unitPrice * quantity;
      
      const itemPlatformFee = (totalPrice / cartItems.reduce((sum, ci) => 
        sum + (parseFloat(ci.price) * ci.quantity), 0)) * parseFloat(paymentMeta.platformFee);
      
      const isFirstItemFromPharmacy = !orders.some(o => o.pharmacyId === item.pharmacyId);
      const itemDeliveryCharge = (isFirstItemFromPharmacy && deliveryType === 'delivery')
        ? DELIVERY_CHARGE_PER_PHARMACY 
        : 0.00;
      
      const grandTotal = parseFloat((totalPrice + itemDeliveryCharge + itemPlatformFee).toFixed(2));

      const order = await Order.create({
        userId: customerId,
        pharmacyId: item.pharmacyId,
        medicineName: item.medicine ? item.medicine.name : 'Unknown',
        genericName: item.medicine ? item.medicine.genericName : null,
        unitPrice,
        quantity,
        totalPrice,
        deliveryCharge: itemDeliveryCharge,
        platformFee: itemPlatformFee,
        grandTotal,
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : null,
        status: 'pending',
        orderDate: new Date()
      }, { transaction });

      orders.push(order);

      inventory.stock -= quantity;
      await inventory.save({ transaction });
    }

    // Clear cart
    await Cart.destroy({
      where: { customerId },
      transaction
    });

    await transaction.commit();

    console.log(`✅ ${orders.length} orders created after successful payment for customer ${customerId}`);
    res.redirect(`http://localhost:5173/payment/success?tran_id=${tran_id}&orders=${orders.length}`);

  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('❌ Payment success handling error:', error);
    res.redirect(`http://localhost:5173/payment/failed?reason=${encodeURIComponent(error.message)}`);
  }
};

// @desc    Handle failed payment
// @route   POST /api/cart/payment-fail
// @access  Public (SSLCommerz callback)
const paymentFail = async (req, res) => {
  const data = req.method === 'GET' ? req.query : req.body;
  const { tran_id, error } = data;
  console.log('❌ Payment Failed:', { tran_id, error });
  res.redirect(`http://localhost:5173/cart?error=${encodeURIComponent(error || 'Payment failed. Please try again.')}`);
};

// @desc    Handle cancelled payment
// @route   POST /api/cart/payment-cancel
// @access  Public (SSLCommerz callback)
const paymentCancel = async (req, res) => {
  const data = req.method === 'GET' ? req.query : req.body;
  const { tran_id } = data;
  console.log('⚠️ Payment Cancelled:', { tran_id });
  res.redirect(`http://localhost:5173/cart?message=${encodeURIComponent('Payment cancelled. Your items are still in the cart.')}`);
};

// @desc    IPN handler
// @route   POST /api/cart/payment-ipn
// @access  Public (SSLCommerz callback)
const paymentIPN = async (req, res) => {
  console.log('📡 IPN Received:', req.body);
  res.send('IPN received');
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout,
  getCustomerOrders,
  initializePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN
};
