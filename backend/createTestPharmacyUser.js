require('dotenv').config({ path: '../.env' });
const User = require('./models/User');
const { sequelize } = require('./config/database');

const createTestPharmacy = async () => {
  try {
    // Sync database
    await sequelize.sync();
    
    // Check if pharmacy user already exists
    const existingPharmacy = await User.findOne({ 
      where: { 
        email: 'pharmacy@test.com' 
      } 
    });

    if (existingPharmacy) {
      console.log('Test pharmacy user already exists');
      process.exit(0);
    }

    // Create pharmacy user
    const pharmacyUser = await User.create({
      name: 'Test Pharmacy',
      email: 'pharmacy@test.com',
      password: 'pharmacy123',
      role: 'pharmacy'
    });

    console.log('Test pharmacy user created successfully:', {
      id: pharmacyUser.id,
      name: pharmacyUser.name,
      email: pharmacyUser.email,
      role: pharmacyUser.role
    });

    console.log('\nLogin credentials:');
    console.log('Email: pharmacy@test.com');
    console.log('Password: pharmacy123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test pharmacy user:', error);
    process.exit(1);
  }
};

createTestPharmacy();