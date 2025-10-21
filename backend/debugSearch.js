require('dotenv').config({ path: '../.env' });
const { Medicine, PharmacyInventory, Pharmacy } = require('./models');
const { Op } = require('sequelize');

const debugSearch = async () => {
  try {
    console.log('🔍 Debug: Testing database queries directly...\n');
    
    // Test 1: Check medicines
    console.log('📊 Step 1: Getting all medicines...');
    const medicines = await Medicine.findAll();
    console.log(`✅ Found ${medicines.length} medicines`);
    if (medicines.length > 0) {
      console.log(`   First medicine: ${medicines[0].name}`);
    }
    
    // Test 2: Check pharmacies
    console.log('\n📊 Step 2: Getting approved pharmacies...');
    const pharmacies = await Pharmacy.findAll({ where: { status: 'approved' } });
    console.log(`✅ Found ${pharmacies.length} approved pharmacies`);
    if (pharmacies.length > 0) {
      console.log(`   First pharmacy: ${pharmacies[0].name}`);
    }
    
    // Test 3: Check inventory
    console.log('\n📊 Step 3: Getting inventory items...');
    const inventory = await PharmacyInventory.findAll();
    console.log(`✅ Found ${inventory.length} inventory items`);
    
    // Test 4: Check inventory with associations
    console.log('\n📊 Step 4: Getting inventory with medicine and pharmacy details...');
    const inventoryWithDetails = await PharmacyInventory.findAll({
      include: [
        {
          model: Medicine,
          as: 'medicine',
          attributes: ['id', 'name', 'genericName', 'brand']
        },
        {
          model: Pharmacy,
          as: 'pharmacy',
          where: { status: 'approved' },
          attributes: ['id', 'name', 'address', 'phone', 'latitude', 'longitude']
        }
      ]
    });
    
    console.log(`✅ Found ${inventoryWithDetails.length} inventory items with details`);
    if (inventoryWithDetails.length > 0) {
      const first = inventoryWithDetails[0];
      console.log(`   First item: ${first.medicine?.name} at ${first.pharmacy?.name} - ৳${first.price}`);
    }
    
    // Test 5: Search for specific medicine
    console.log('\n📊 Step 5: Searching for "Paracetamol"...');
    const paracetamolResults = await Medicine.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: '%Paracetamol%' } },
          { genericName: { [Op.iLike]: '%Paracetamol%' } },
          { brand: { [Op.iLike]: '%Paracetamol%' } },
        ],
      },
      include: [
        {
          model: PharmacyInventory,
          as: 'inventory',
          where: { 
            availability: true,
            stock: { [Op.gt]: 0 }
          },
          required: false,
          include: [
            {
              model: Pharmacy,
              as: 'pharmacy',
              where: { status: 'approved' },
              attributes: ['id', 'name', 'address', 'phone', 'latitude', 'longitude']
            }
          ]
        }
      ]
    });
    
    console.log(`✅ Found ${paracetamolResults.length} medicines matching "Paracetamol"`);
    paracetamolResults.forEach((med, index) => {
      console.log(`   Medicine ${index + 1}: ${med.name} (${med.genericName}) - ${med.inventory?.length || 0} pharmacies`);
      if (med.inventory && med.inventory.length > 0) {
        med.inventory.forEach((inv, invIndex) => {
          console.log(`     ${invIndex + 1}. ${inv.pharmacy?.name} - ৳${inv.price} (Stock: ${inv.stock})`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Debug Error:', error);
  }
};

debugSearch();