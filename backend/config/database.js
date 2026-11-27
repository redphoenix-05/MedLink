const { Sequelize } = require('sequelize');
const pg = require('pg');
const path = require('path');

if (!process.env.VERCEL) {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
}

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

const sequelize = new Sequelize(
  cleanedDatabaseUrl || 'postgresql://localhost:5432/medlink_db',
  {
    dialect: 'postgres',
    dialectModule: pg,
    logging: false,
    pool: {
      max: process.env.VERCEL ? 3 : 10,
      min: 0,
      acquire: 20000,
      idle: 10000,
    },
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
  }
);

const connectDB = async () => {
  try {
    if (!rawDatabaseUrl) {
      console.error('❌ DATABASE_URL environment variable is not set');
      return;
    }
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');

    // Only auto-alter schema in local dev; production schema is already synced in Supabase
    if (!process.env.VERCEL) {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

module.exports = { sequelize, connectDB };
