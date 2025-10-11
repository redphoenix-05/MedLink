const { Medicine } = require('./models');

const sampleMedicines = [
  {
    name: 'Paracetamol',
    brand: 'Crocin',
    category: 'over-the-counter',
    description: 'Pain reliever and fever reducer',
    genericName: 'Acetaminophen',
    dosageForm: 'tablet',
    strength: '500mg',
    requiresPrescription: false,
  },
  {
    name: 'Amoxicillin',
    brand: 'Amoxil',
    category: 'prescription',
    description: 'Antibiotic used to treat bacterial infections',
    genericName: 'Amoxicillin',
    dosageForm: 'capsule',
    strength: '250mg',
    requiresPrescription: true,
  },
  {
    name: 'Ibuprofen',
    brand: 'Brufen',
    category: 'over-the-counter',
    description: 'Anti-inflammatory pain reliever',
    genericName: 'Ibuprofen',
    dosageForm: 'tablet',
    strength: '400mg',
    requiresPrescription: false,
  },
  {
    name: 'Cough Syrup',
    brand: 'Benadryl',
    category: 'over-the-counter',
    description: 'Cough suppressant and expectorant',
    genericName: 'Dextromethorphan',
    dosageForm: 'syrup',
    strength: '100ml',
    requiresPrescription: false,
  },
  {
    name: 'Insulin',
    brand: 'Humulin',
    category: 'prescription',
    description: 'Hormone for diabetes management',
    genericName: 'Human Insulin',
    dosageForm: 'injection',
    strength: '100 units/ml',
    requiresPrescription: true,
  },
];

const seedMedicines = async () => {
  try {
    console.log('🌱 Seeding medicines...');
    
    for (const medicineData of sampleMedicines) {
      const existingMedicine = await Medicine.findOne({
        where: { 
          name: medicineData.name,
          brand: medicineData.brand,
          strength: medicineData.strength 
        }
      });
      
      if (!existingMedicine) {
        await Medicine.create(medicineData);
        console.log(`✅ Created medicine: ${medicineData.name} (${medicineData.brand})`);
      } else {
        console.log(`⚠️  Medicine already exists: ${medicineData.name} (${medicineData.brand})`);
      }
    }
    
    console.log('🌱 Medicine seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding medicines:', error);
    process.exit(1);
  }
};

seedMedicines();