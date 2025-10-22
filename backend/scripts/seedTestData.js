const bcrypt = require('bcryptjs');
require('dotenv').config();
const { connectDB } = require('../config/database');
const { User, Pharmacy, Medicine, PharmacyInventory, Reservation } = require('../models');

const seedTestData = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seeding...\n');

    // 1. Create Customer User
    console.log('👤 Creating customer user...');
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = await User.findOrCreate({
      where: { email: 'customer@test.com' },
      defaults: {
        name: 'Test Customer',
        email: 'customer@test.com',
        password: customerPassword,
        phone: '01712345678',
        role: 'customer'
      }
    });
    console.log('✅ Customer created:', customer[0].email);

    // 2. Create Pharmacy User
    console.log('\n👤 Creating pharmacy user...');
    const pharmacyUserPassword = await bcrypt.hash('pharmacy123', 10);
    const pharmacyUser = await User.findOrCreate({
      where: { email: 'pharmacy@test.com' },
      defaults: {
        name: 'Test Pharmacy Owner',
        email: 'pharmacy@test.com',
        password: pharmacyUserPassword,
        phone: '01798765432',
        role: 'pharmacy'
      }
    });
    console.log('✅ Pharmacy user created:', pharmacyUser[0].email);

    // 3. Create Pharmacy
    console.log('\n🏥 Creating pharmacy...');
    const pharmacy = await Pharmacy.findOrCreate({
      where: { userId: pharmacyUser[0].id },
      defaults: {
        userId: pharmacyUser[0].id,
        name: 'HealthCare Pharmacy',
        address: '123 Main Street, Dhaka 1205',
        phone: '01798765432',
        licenseNumber: 'LIC-2024-001',
        status: 'approved'
      }
    });
    console.log('✅ Pharmacy created:', pharmacy[0].name);

    // 4. Create Medicines
    console.log('\n💊 Creating medicines...');
    const medicines = [
      {
        name: 'Paracetamol',
        brand: 'Napa',
        category: 'over-the-counter',
        description: 'Pain reliever and fever reducer',
        genericName: 'Paracetamol',
        dosageForm: 'tablet',
        strength: '500mg',
        requiresPrescription: false
      },
      {
        name: 'Amoxicillin',
        brand: 'Moxacil',
        category: 'prescription',
        description: 'Antibiotic for bacterial infections',
        genericName: 'Amoxicillin',
        dosageForm: 'capsule',
        strength: '500mg',
        requiresPrescription: true
      },
      {
        name: 'Vitamin C',
        brand: 'C-Vit',
        category: 'supplement',
        description: 'Immune system booster',
        genericName: 'Ascorbic Acid',
        dosageForm: 'tablet',
        strength: '1000mg',
        requiresPrescription: false
      },
      {
        name: 'Omeprazole',
        brand: 'Seclo',
        category: 'prescription',
        description: 'Treats stomach acid and ulcers',
        genericName: 'Omeprazole',
        dosageForm: 'capsule',
        strength: '20mg',
        requiresPrescription: true
      },
      {
        name: 'Cetirizine',
        brand: 'Allergin',
        category: 'over-the-counter',
        description: 'Antihistamine for allergies',
        genericName: 'Cetirizine HCl',
        dosageForm: 'tablet',
        strength: '10mg',
        requiresPrescription: false
      }
    ];

    const createdMedicines = [];
    for (const med of medicines) {
      const [medicine] = await Medicine.findOrCreate({
        where: { name: med.name, genericName: med.genericName },
        defaults: med
      });
      createdMedicines.push(medicine);
      console.log(`  ✅ ${medicine.name} (${medicine.brand})`);
    }

    // 5. Add medicines to pharmacy inventory
    console.log('\n📦 Adding medicines to pharmacy inventory...');
    const inventoryData = [
      { medicineId: createdMedicines[0].id, price: 2.50, stock: 500 },
      { medicineId: createdMedicines[1].id, price: 8.00, stock: 200 },
      { medicineId: createdMedicines[2].id, price: 5.50, stock: 300 },
      { medicineId: createdMedicines[3].id, price: 6.00, stock: 150 },
      { medicineId: createdMedicines[4].id, price: 3.00, stock: 400 }
    ];

    for (const inv of inventoryData) {
      await PharmacyInventory.findOrCreate({
        where: {
          pharmacyId: pharmacy[0].id,
          medicineId: inv.medicineId
        },
        defaults: {
          pharmacyId: pharmacy[0].id,
          medicineId: inv.medicineId,
          price: inv.price,
          stock: inv.stock,
          availability: true,
          minStockLevel: 10
        }
      });
    }
    console.log('✅ Inventory added for all medicines');

    // 6. Create sample reservation
    console.log('\n🛒 Creating sample reservation...');
    const reservation = await Reservation.findOrCreate({
      where: {
        customerId: customer[0].id,
        medicineId: createdMedicines[0].id,
        pharmacyId: pharmacy[0].id
      },
      defaults: {
        customerId: customer[0].id,
        pharmacyId: pharmacy[0].id,
        medicineId: createdMedicines[0].id,
        quantity: 2,
        totalPrice: 5.00,
        deliveryOption: 'delivery',
        status: 'pending',
        paymentStatus: 'pending'
      }
    });
    console.log('✅ Sample reservation created');

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✨ TEST DATA SEEDING COMPLETE!');
    console.log('='.repeat(50));
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('\n👤 CUSTOMER:');
    console.log('   Email: customer@test.com');
    console.log('   Password: customer123');
    console.log('\n🏥 PHARMACY:');
    console.log('   Email: pharmacy@test.com');
    console.log('   Password: pharmacy123');
    console.log('\n👑 ADMIN:');
    console.log('   Username: medlinkadmin');
    console.log('   Password: medlinkadmin2025');
    console.log('\n📊 DATABASE STATS:');
    console.log(`   - Users: ${await User.count()}`);
    console.log(`   - Pharmacies: ${await Pharmacy.count()}`);
    console.log(`   - Medicines: ${await Medicine.count()}`);
    console.log(`   - Inventory Items: ${await PharmacyInventory.count()}`);
    console.log(`   - Reservations: ${await Reservation.count()}`);
    console.log('\n🎉 You can now test the application!');
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    console.error('Full error:', error.message);
    process.exit(1);
  }
};

seedTestData();
