const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const User = require('../models/User');

const khulnaPharmacies = [
  {
    email: 'lazz.pharma.khulna@gmail.com',
    password: 'pharmacy123',
    name: 'Lazz Pharma Ltd',
    role: 'pharmacy',
    pharmacyName: 'Lazz Pharma Ltd',
    address: 'KDA Avenue, Khulna 9100, Bangladesh',
    phone: '+880 1711-123456',
    licenseNumber: 'KHL-PHARM-001',
    latitude: 22.8156,
    longitude: 89.5403,
    isApproved: true,
  },
  {
    email: 'square.khulna@gmail.com',
    password: 'pharmacy123',
    name: 'Square Pharmaceuticals Ltd',
    role: 'pharmacy',
    pharmacyName: 'Square Pharmaceuticals Ltd',
    address: 'Sonadanga, Khulna 9100, Bangladesh',
    phone: '+880 1711-123457',
    licenseNumber: 'KHL-PHARM-002',
    latitude: 22.8093,
    longitude: 89.5511,
    isApproved: true,
  },
  {
    email: 'healthcare.pharmacy.khulna@gmail.com',
    password: 'pharmacy123',
    name: 'Healthcare Pharmacy',
    role: 'pharmacy',
    pharmacyName: 'Healthcare Pharmacy',
    address: 'Khan Jahan Ali Road, Khulna 9100, Bangladesh',
    phone: '+880 1711-123458',
    licenseNumber: 'KHL-PHARM-003',
    latitude: 22.8456,
    longitude: 89.5403,
    isApproved: true,
  },
  {
    email: 'medilife.khulna@gmail.com',
    password: 'pharmacy123',
    name: 'Medilife Pharmacy',
    role: 'pharmacy',
    pharmacyName: 'Medilife Pharmacy',
    address: 'Boyra Bazar Road, Khulna 9100, Bangladesh',
    phone: '+880 1711-123459',
    licenseNumber: 'KHL-PHARM-004',
    latitude: 22.8389,
    longitude: 89.5644,
    isApproved: true,
  },
  {
    email: 'popular.pharmacy.khulna@gmail.com',
    password: 'pharmacy123',
    name: 'Popular Pharmacy',
    role: 'pharmacy',
    pharmacyName: 'Popular Pharmacy',
    address: 'Gallamari, Khulna 9100, Bangladesh',
    phone: '+880 1711-123460',
    licenseNumber: 'KHL-PHARM-005',
    latitude: 22.8197,
    longitude: 89.5656,
    isApproved: true,
  },
  {
    email: 'city.pharmacy.khulna@gmail.com',
    password: 'pharmacy123',
    name: 'City Pharmacy',
    role: 'pharmacy',
    pharmacyName: 'City Pharmacy',
    address: 'Hadis Park, Khulna 9100, Bangladesh',
    phone: '+880 1711-123461',
    licenseNumber: 'KHL-PHARM-006',
    latitude: 22.8275,
    longitude: 89.5431,
    isApproved: true,
  },
  {
    email: 'modern.medicine.khulna@gmail.com',
    password: 'pharmacy123',
    name: 'Modern Medicine Corner',
    role: 'pharmacy',
    pharmacyName: 'Modern Medicine Corner',
    address: 'Nirala, Khulna 9100, Bangladesh',
    phone: '+880 1711-123462',
    licenseNumber: 'KHL-PHARM-007',
    latitude: 22.8046,
    longitude: 89.5581,
    isApproved: true,
  },
  {
    email: 'new.pharmacy.khulna@gmail.com',
    password: 'pharmacy123',
    name: 'New Pharmacy',
    role: 'pharmacy',
    pharmacyName: 'New Pharmacy',
    address: 'Daulatpur, Khulna 9203, Bangladesh',
    phone: '+880 1711-123463',
    licenseNumber: 'KHL-PHARM-008',
    latitude: 22.8486,
    longitude: 89.5264,
    isApproved: true,
  },
  {
    email: 'royal.pharmacy.khulna@gmail.com',
    password: 'pharmacy123',
    name: 'Royal Pharmacy',
    role: 'pharmacy',
    pharmacyName: 'Royal Pharmacy',
    address: 'Shibbari, Khulna 9100, Bangladesh',
    phone: '+880 1711-123464',
    licenseNumber: 'KHL-PHARM-009',
    latitude: 22.8364,
    longitude: 89.5489,
    isApproved: true,
  },
  {
    email: 'sunrise.pharmacy.khulna@gmail.com',
    password: 'pharmacy123',
    name: 'Sunrise Pharmacy',
    role: 'pharmacy',
    pharmacyName: 'Sunrise Pharmacy',
    address: 'Khalishpur, Khulna 9100, Bangladesh',
    phone: '+880 1711-123465',
    licenseNumber: 'KHL-PHARM-010',
    latitude: 22.8289,
    longitude: 89.5178,
    isApproved: true,
  },
  {
    email: 'trust.pharmacy.khulna@gmail.com',
    password: 'pharmacy123',
    name: 'Trust Pharmacy',
    role: 'pharmacy',
    pharmacyName: 'Trust Pharmacy',
    address: 'Tutpara, Khulna 9100, Bangladesh',
    phone: '+880 1711-123466',
    licenseNumber: 'KHL-PHARM-011',
    latitude: 22.8123,
    longitude: 89.5347,
    isApproved: true,
  },
  {
    email: 'wellcare.pharmacy.khulna@gmail.com',
    password: 'pharmacy123',
    name: 'Wellcare Pharmacy',
    role: 'pharmacy',
    pharmacyName: 'Wellcare Pharmacy',
    address: 'Rupsha, Khulna 9100, Bangladesh',
    phone: '+880 1711-123467',
    licenseNumber: 'KHL-PHARM-012',
    latitude: 22.8542,
    longitude: 89.5789,
    isApproved: true,
  },
  {
    email: 'apollo.pharmacy.khulna@gmail.com',
    password: 'pharmacy123',
    name: 'Apollo Pharmacy',
    role: 'pharmacy',
    pharmacyName: 'Apollo Pharmacy',
    address: 'Jashore Road, Khulna 9100, Bangladesh',
    phone: '+880 1711-123468',
    licenseNumber: 'KHL-PHARM-013',
    latitude: 22.8678,
    longitude: 89.5234,
    isApproved: true,
  },
  {
    email: 'central.pharmacy.khulna@gmail.com',
    password: 'pharmacy123',
    name: 'Central Pharmacy',
    role: 'pharmacy',
    pharmacyName: 'Central Pharmacy',
    address: 'Dakbangla Road, Khulna 9100, Bangladesh',
    phone: '+880 1711-123469',
    licenseNumber: 'KHL-PHARM-014',
    latitude: 22.8234,
    longitude: 89.5523,
    isApproved: true,
  },
  {
    email: 'goodhealth.pharmacy.khulna@gmail.com',
    password: 'pharmacy123',
    name: 'Good Health Pharmacy',
    role: 'pharmacy',
    pharmacyName: 'Good Health Pharmacy',
    address: 'Labanchara, Khulna 9100, Bangladesh',
    phone: '+880 1711-123470',
    licenseNumber: 'KHL-PHARM-015',
    latitude: 22.8456,
    longitude: 89.5612,
    isApproved: true,
  },
];

const customers = [
  {
    email: 'rahim.ahmed@gmail.com',
    password: 'customer123',
    name: 'Rahim Ahmed',
    role: 'customer',
  },
  {
    email: 'fatema.khatun@gmail.com',
    password: 'customer123',
    name: 'Fatema Khatun',
    role: 'customer',
  },
  {
    email: 'karim.islam@gmail.com',
    password: 'customer123',
    name: 'Karim Islam',
    role: 'customer',
  },
  {
    email: 'ayesha.begum@gmail.com',
    password: 'customer123',
    name: 'Ayesha Begum',
    role: 'customer',
  },
  {
    email: 'abdullah.hasan@gmail.com',
    password: 'customer123',
    name: 'Abdullah Hasan',
    role: 'customer',
  },
  {
    email: 'nusrat.jahan@gmail.com',
    password: 'customer123',
    name: 'Nusrat Jahan',
    role: 'customer',
  },
  {
    email: 'rafiq.uddin@gmail.com',
    password: 'customer123',
    name: 'Rafiq Uddin',
    role: 'customer',
  },
  {
    email: 'saima.akter@gmail.com',
    password: 'customer123',
    name: 'Saima Akter',
    role: 'customer',
  },
  {
    email: 'habib.rahman@gmail.com',
    password: 'customer123',
    name: 'Habib Rahman',
    role: 'customer',
  },
  {
    email: 'shahana.parvin@gmail.com',
    password: 'customer123',
    name: 'Shahana Parvin',
    role: 'customer',
  },
  {
    email: 'nasir.hossain@gmail.com',
    password: 'customer123',
    name: 'Nasir Hossain',
    role: 'customer',
  },
  {
    email: 'sultana.razia@gmail.com',
    password: 'customer123',
    name: 'Sultana Razia',
    role: 'customer',
  },
  {
    email: 'farhan.ali@gmail.com',
    password: 'customer123',
    name: 'Farhan Ali',
    role: 'customer',
  },
  {
    email: 'taslima.nasrin@gmail.com',
    password: 'customer123',
    name: 'Taslima Nasrin',
    role: 'customer',
  },
  {
    email: 'jahangir.alam@gmail.com',
    password: 'customer123',
    name: 'Jahangir Alam',
    role: 'customer',
  },
  {
    email: 'rabiya.basri@gmail.com',
    password: 'customer123',
    name: 'Rabiya Basri',
    role: 'customer',
  },
  {
    email: 'monir.hossain@gmail.com',
    password: 'customer123',
    name: 'Monir Hossain',
    role: 'customer',
  },
  {
    email: 'shamima.begum@gmail.com',
    password: 'customer123',
    name: 'Shamima Begum',
    role: 'customer',
  },
  {
    email: 'zahid.hasan@gmail.com',
    password: 'customer123',
    name: 'Zahid Hasan',
    role: 'customer',
  },
  {
    email: 'nasima.akter@gmail.com',
    password: 'customer123',
    name: 'Nasima Akter',
    role: 'customer',
  },
];

const seedData = async () => {
  try {
    console.log('🌱 Starting seed data generation...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('pharmacy123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    // Create pharmacies
    console.log('📍 Creating 15 pharmacies');
    let pharmacyCount = 0;
    
    for (const pharmacy of khulnaPharmacies) {
      const existingPharmacy = await User.findOne({ where: { email: pharmacy.email } });
      
      if (!existingPharmacy) {
        await User.create({
          ...pharmacy,
          password: hashedPassword,
        });
        pharmacyCount++;
        console.log(`   ✓ Created: ${pharmacy.pharmacyName} at ${pharmacy.address}`);
      } else {
        console.log(`   ⊘ Skipped: ${pharmacy.pharmacyName} (already exists)`);
      }
    }

    console.log(`\n✅ ${pharmacyCount} pharmacies created successfully!\n`);

    // Create customers
    console.log('👥 Creating 20 customer accounts...');
    let customerCount = 0;

    for (const customer of customers) {
      const existingCustomer = await User.findOne({ where: { email: customer.email } });
      
      if (!existingCustomer) {
        await User.create({
          ...customer,
          password: customerPassword,
        });
        customerCount++;
        console.log(`   ✓ Created: ${customer.name} (${customer.email})`);
      } else {
        console.log(`   ⊘ Skipped: ${customer.name} (already exists)`);
      }
    }

    console.log(`\n✅ ${customerCount} customers created successfully!\n`);

    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('🎉 SEED DATA GENERATION COMPLETE!');
    console.log('═══════════════════════════════════════════');
    console.log(`📍 Pharmacies in Khulna: ${pharmacyCount} new`);
    console.log(`👥 Customer Accounts: ${customerCount} new`);
    console.log('═══════════════════════════════════════════\n');

    console.log('📝 LOGIN CREDENTIALS:\n');
    console.log('🏪 PHARMACIES:');
    console.log('   Email: Any pharmacy email from above');
    console.log('   Password: pharmacy123\n');
    
    console.log('👤 CUSTOMERS:');
    console.log('   Email: Any customer email from above');
    console.log('   Password: customer123\n');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('👋 Database connection closed');
  }
};

seedData()
  .then(() => {
    console.log('✅ Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
