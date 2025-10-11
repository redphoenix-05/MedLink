require('dotenv').config({ path: '../.env' });
const Medicine = require('./models/Medicine');
const { sequelize } = require('./config/database');

const sampleMedicines = [
  {
    name: 'Paracip 500',
    genericName: 'Paracetamol',
    brand: 'Cipla',
    category: 'over-the-counter',
    description: 'Pain relief and fever reducer',
    dosageForm: 'tablet',
    strength: '500mg',
    requiresPrescription: false,
  },
  {
    name: 'Panadol',
    genericName: 'Paracetamol',
    brand: 'GSK',
    category: 'over-the-counter',
    description: 'Pain relief and fever reducer',
    dosageForm: 'tablet',
    strength: '500mg',
    requiresPrescription: false,
  },
  {
    name: 'Amoxil 250',
    genericName: 'Amoxicillin',
    brand: 'GSK',
    category: 'prescription',
    description: 'Antibiotic for bacterial infections',
    dosageForm: 'capsule',
    strength: '250mg',
    requiresPrescription: true,
  },
  {
    name: 'Augmentin',
    genericName: 'Amoxicillin + Clavulanic Acid',
    brand: 'GSK',
    category: 'prescription',
    description: 'Broad-spectrum antibiotic',
    dosageForm: 'tablet',
    strength: '625mg',
    requiresPrescription: true,
  },
  {
    name: 'Aspirin Cardio',
    genericName: 'Acetylsalicylic Acid',
    brand: 'Bayer',
    category: 'prescription',
    description: 'Blood thinner for heart protection',
    dosageForm: 'tablet',
    strength: '75mg',
    requiresPrescription: true,
  },
  {
    name: 'Disprin',
    genericName: 'Acetylsalicylic Acid',
    brand: 'Reckitt Benckiser',
    category: 'over-the-counter',
    description: 'Pain relief and anti-inflammatory',
    dosageForm: 'tablet',
    strength: '325mg',
    requiresPrescription: false,
  },
  {
    name: 'Zyrtec',
    genericName: 'Cetirizine',
    brand: 'Johnson & Johnson',
    category: 'over-the-counter',
    description: 'Antihistamine for allergies',
    dosageForm: 'tablet',
    strength: '10mg',
    requiresPrescription: false,
  },
  {
    name: 'Allegra',
    genericName: 'Fexofenadine',
    brand: 'Sanofi',
    category: 'over-the-counter',
    description: 'Non-drowsy antihistamine',
    dosageForm: 'tablet',
    strength: '120mg',
    requiresPrescription: false,
  },
  {
    name: 'Ventolin Inhaler',
    genericName: 'Salbutamol',
    brand: 'GSK',
    category: 'prescription',
    description: 'Bronchodilator for asthma',
    dosageForm: 'inhaler',
    strength: '100mcg/dose',
    requiresPrescription: true,
  },
  {
    name: 'Asthalin Inhaler',
    genericName: 'Salbutamol',
    brand: 'Cipla',
    category: 'prescription',
    description: 'Bronchodilator for asthma and COPD',
    dosageForm: 'inhaler',
    strength: '100mcg/dose',
    requiresPrescription: true,
  },
];

const seedMedicines = async () => {
  try {
    // Sync database
    await sequelize.sync();
    
    console.log('Seeding medicines...');
    
    for (const medicineData of sampleMedicines) {
      // Check if medicine already exists
      const existingMedicine = await Medicine.findOne({
        where: { 
          name: medicineData.name,
          brand: medicineData.brand 
        }
      });

      if (!existingMedicine) {
        await Medicine.create(medicineData);
        console.log(`✅ Created: ${medicineData.name} (${medicineData.genericName})`);
      } else {
        console.log(`⏭️  Skipped: ${medicineData.name} (already exists)`);
      }
    }

    console.log('✅ Medicine seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding medicines:', error);
    process.exit(1);
  }
};

seedMedicines();