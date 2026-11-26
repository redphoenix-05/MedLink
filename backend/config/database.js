const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const rawDatabaseUrl = process.env.DATABASE_URL || '';
const useSSL =
  process.env.DB_SSL === 'true' ||
  rawDatabaseUrl.includes('sslmode=require') ||
  rawDatabaseUrl.includes('supabase.co') ||
  rawDatabaseUrl.includes('supabase.com') ||
  (Boolean(process.env.VERCEL) &&
    !rawDatabaseUrl.includes('localhost') &&
    !rawDatabaseUrl.includes('127.0.0.1'));

// Strip sslmode query param so pg-connection-string doesn't override dialectOptions.ssl.rejectUnauthorized
const cleanedDatabaseUrl = rawDatabaseUrl
  .replace(/([?&])sslmode=[^&]*&?/i, '$1')
  .replace(/[?&]$/, '');

const sequelize = new Sequelize(cleanedDatabaseUrl, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  dialectOptions: useSSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
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
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

module.exports = { sequelize, connectDB };