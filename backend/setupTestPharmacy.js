require('dotenv').config({ path: '../.env' });
const { User, Pharmacy } = require('./models');
const { sequelize } = require('./config/database');

const setupTestPharmacy = async () => {
  try {
    // Sync database
    await sequelize.sync();
    
    // Find the test pharmacy user
    const pharmacyUser = await User.findOne({ 
      where: { 
        email: 'pharmacy@test.com' 
      } 
    });

    if (!pharmacyUser) {
      console.log('❌ Test pharmacy user not found');
      return;
    }

    console.log('✅ Found pharmacy user:', pharmacyUser.name);
    
    // Check if pharmacy profile exists
    let pharmacy = await Pharmacy.findOne({
      where: { userId: pharmacyUser.id }
    });

    if (pharmacy) {
      console.log('✅ Pharmacy profile exists:', pharmacy.name);
      
      // Make sure it's approved
      if (pharmacy.status !== 'approved') {
        await pharmacy.update({ status: 'approved' });
        console.log('✅ Pharmacy status updated to approved');
      } else {
        console.log('✅ Pharmacy is already approved');
      }
    } else {
      // Create pharmacy profile
      pharmacy = await Pharmacy.create({
        userId: pharmacyUser.id,
        name: 'Test Pharmacy Store',
        address: '123 Test Street, Test City, TC 12345',
        phone: '+1-555-0123',
        licenseNumber: 'TEST-PHARMACY-2025',
        status: 'approved' // Directly approve for testing
      });
      
      console.log('✅ Pharmacy profile created and approved:', pharmacy.name);
    }

    console.log('\n🎉 Test pharmacy setup complete!');
    console.log('Login with: pharmacy@test.com / pharmacy123');

  } catch (error) {
    console.error('❌ Error setting up test pharmacy:', error);
  }
};

setupTestPharmacy();