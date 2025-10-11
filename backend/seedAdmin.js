require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcrypt');
const User = require('./models/User');
const { sequelize } = require('./config/database');

const createAdmin = async () => {
  try {
    // Sync database
    await sequelize.sync();
    
    // Find all admin users
    const adminUsers = await User.findAll({ 
      where: { 
        role: 'admin' 
      } 
    });

    console.log(`Found ${adminUsers.length} admin users`);

    // If there are multiple admins, delete all and create the single correct one
    if (adminUsers.length > 1) {
      console.log('Multiple admin users found. Removing all and creating single admin...');
      await User.destroy({ where: { role: 'admin' } });
    } else if (adminUsers.length === 1) {
      // Check if the existing admin has the correct credentials
      const existingAdmin = adminUsers[0];
      if (existingAdmin.name === 'medlinkadmin' && existingAdmin.email === 'admin@medlink.com') {
        console.log('Correct admin user already exists');
        process.exit(0);
      } else {
        console.log('Incorrect admin user found. Removing and creating correct one...');
        await User.destroy({ where: { role: 'admin' } });
      }
    }

    // Create the single correct admin user
    const adminUser = await User.create({
      name: 'medlinkadmin',
      email: 'admin@medlink.com',
      password: 'medlinkadmin2025',
      role: 'admin'
    });

    console.log('Single admin user created successfully:', {
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