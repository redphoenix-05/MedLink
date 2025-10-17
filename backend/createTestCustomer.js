require('dotenv').config({ path: '../.env' });
const User = require('./models/User');
const { sequelize } = require('./config/database');

const createTestCustomer = async () => {
  try {
    await sequelize.sync();
    
    const existingCustomer = await User.findOne({ 
      where: { 
        email: 'customer@test.com' 
      } 
    });

    if (existingCustomer) {
      console.log('Test customer user already exists');
      process.exit(0);
    }

    const customerUser = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'customer123',
      role: 'customer'
    });

    console.log('Test customer user created successfully:', {
      id: customerUser.id,
      name: customerUser.name,
      email: customerUser.email,
      role: customerUser.role
    });

    console.log('\nLogin credentials:');
    console.log('Email: customer@test.com');
    console.log('Password: customer123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test customer user:', error);
    process.exit(1);
  }
};

createTestCustomer();