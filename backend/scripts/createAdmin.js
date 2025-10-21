const bcrypt = require('bcryptjs');
require('dotenv').config();
const { connectDB } = require('../config/database');
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🔍 Checking for existing admin user...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Name:', existingAdmin.name);
      console.log('\nYou can log in with this account.');
      process.exit(0);
    }

    console.log('📝 Creating new admin user...');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@medlink.com',
      password: hashedPassword,
      phone: '+8801234567890',
      role: 'admin',
      isApproved: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('   Email: admin@medlink.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdminUser();
