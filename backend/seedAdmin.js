require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcrypt');
const User = require('./models/User');
const { sequelize } = require('./config/database');

const createAdmin = async () => {
  try {
    // Sync database
    await sequelize.sync();
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      where: { 
        name: 'medlinkadmin' 
      } 
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'medlinkadmin',
      email: 'admin@medlink.com',
      password: 'medlinkadmin2025',
      role: 'admin'
    });

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();