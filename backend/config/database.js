const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  define: {
    timestamps: true,
    underscored: false,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };