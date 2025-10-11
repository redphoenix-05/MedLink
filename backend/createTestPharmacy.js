const { User, Pharmacy } = require('./models');
const bcrypt = require('bcrypt');

const createTestPharmacy = async () => {
  try {
    console.log('🧪 Creating test pharmacy user...');
    
    // Check if test pharmacy user already exists
    const existingUser = await User.findOne({ where: { email: 'pharmacy@test.com' } });
    if (existingUser) {
      console.log('⚠️  Test pharmacy user already exists');
      return;
    }
    
    // Create pharmacy user
    const pharmacyUser = await User.create({
      name: 'Test Pharmacy',
      email: 'pharmacy@test.com',
      password: 'test123', // Will be hashed by the hook
      role: 'pharmacy'
    });
    
    // Create pharmacy profile
    const pharmacy = await Pharmacy.create({
      userId: pharmacyUser.id,
      name: 'MediCare Pharmacy',
      licenseNumber: 'LIC123456',
      address: '123 Health Street, Medical District',
      phone: '+1-555-0123',
      description: 'Full-service community pharmacy providing quality healthcare products and services.',
      status: 'pending'
    });
    
    console.log('✅ Test pharmacy user created successfully!');
    console.log(`📧 Email: pharmacy@test.com`);
    console.log(`🔐 Password: test123`);
    console.log(`🏪 Pharmacy ID: ${pharmacy.id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test pharmacy:', error);
    process.exit(1);
  }
};

createTestPharmacy();