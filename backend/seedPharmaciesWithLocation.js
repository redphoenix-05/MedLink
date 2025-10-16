require('dotenv').config({ path: '../.env' });
const { User, Pharmacy } = require('./models');
const { sequelize } = require('./config/database');

const samplePharmacies = [
  {
    userId: null, // Will be set after creating user
    name: 'City Care Pharmacy',
    address: 'Dhanmondi 27, Dhaka 1209, Bangladesh',
    phone: '+880-1711-123456',
    licenseNumber: 'PHARM-DHK-001',
    latitude: 23.7465,
    longitude: 90.3826,
    status: 'approved'
  },
  {
    userId: null,
    name: 'Green Life Pharmacy',
    address: 'Gulshan 2, Dhaka 1212, Bangladesh', 
    phone: '+880-1722-234567',
    licenseNumber: 'PHARM-DHK-002',
    latitude: 23.7925,
    longitude: 90.4078,
    status: 'approved'
  },
  {
    userId: null,
    name: 'MediPlus Pharmacy',
    address: 'Uttara Sector 3, Dhaka 1230, Bangladesh',
    phone: '+880-1733-345678',
    licenseNumber: 'PHARM-DHK-003',
    latitude: 23.8759,
    longitude: 90.3795,
    status: 'approved'
  },
  {
    userId: null,
    name: 'Health First Pharmacy',
    address: 'Mirpur 10, Dhaka 1216, Bangladesh',
    phone: '+880-1744-456789',
    licenseNumber: 'PHARM-DHK-004',
    latitude: 23.8067,
    longitude: 90.3685,
    status: 'approved'
  },
  {
    userId: null,
    name: 'Wellness Pharmacy',
    address: 'Banani, Dhaka 1213, Bangladesh',
    phone: '+880-1755-567890',
    licenseNumber: 'PHARM-DHK-005',
    latitude: 23.7936,
    longitude: 90.4066,
    status: 'approved'
  }
];

const seedPharmaciesWithLocation = async () => {
  try {
    await sequelize.sync();
    
    console.log('Creating sample pharmacies with locations...');
    
    for (let i = 0; i < samplePharmacies.length; i++) {
      const pharmacyData = samplePharmacies[i];
      
      // Create a user for each pharmacy
      const pharmacyUser = await User.create({
        name: pharmacyData.name + ' Owner',
        email: `owner${i + 1}@${pharmacyData.name.toLowerCase().replace(/\s+/g, '')}.com`,
        password: 'pharmacy123',
        role: 'pharmacy'
      });
      
      // Set the userId for the pharmacy
      pharmacyData.userId = pharmacyUser.id;
      
      // Check if pharmacy already exists
      const existingPharmacy = await Pharmacy.findOne({
        where: { 
          name: pharmacyData.name 
        }
      });
      
      if (!existingPharmacy) {
        await Pharmacy.create(pharmacyData);
        console.log(`✅ Created: ${pharmacyData.name} at (${pharmacyData.latitude}, ${pharmacyData.longitude})`);
      } else {
        // Update existing pharmacy with location if missing
        if (!existingPharmacy.latitude || !existingPharmacy.longitude) {
          await existingPharmacy.update({
            latitude: pharmacyData.latitude,
            longitude: pharmacyData.longitude,
            status: 'approved'
          });
          console.log(`✅ Updated: ${pharmacyData.name} with location data`);
        } else {
          console.log(`⏭️  Skipped: ${pharmacyData.name} (already exists)`);
        }
      }
    }
    
    console.log('✅ Pharmacy seeding with locations completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pharmacies:', error);
    process.exit(1);
  }
};

seedPharmaciesWithLocation();