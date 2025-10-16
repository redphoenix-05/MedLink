require('dotenv').config({ path: '../.env' });
const { Medicine, Pharmacy, PharmacyInventory } = require('./models');
const { sequelize } = require('./config/database');

const seedInventoryData = async () => {
  try {
    await sequelize.sync();
    
    console.log('Creating sample inventory data...');
    
    // Get all pharmacies and medicines
    const pharmacies = await Pharmacy.findAll({ where: { status: 'approved' } });
    const medicines = await Medicine.findAll();
    
    if (pharmacies.length === 0 || medicines.length === 0) {
      console.log('❌ No pharmacies or medicines found. Please run pharmacy and medicine seeding first.');
      return;
    }
    
    console.log(`Found ${pharmacies.length} pharmacies and ${medicines.length} medicines`);
    
    // Create inventory for each pharmacy
    for (const pharmacy of pharmacies) {
      console.log(`\n➕ Adding inventory for ${pharmacy.name}:`);
      
      // Add random medicines to each pharmacy (3-7 medicines per pharmacy)
      const medicineCount = Math.floor(Math.random() * 5) + 3; // 3-7 medicines
      const shuffledMedicines = medicines.sort(() => 0.5 - Math.random());
      const selectedMedicines = shuffledMedicines.slice(0, medicineCount);
      
      for (const medicine of selectedMedicines) {
        // Check if inventory item already exists
        const existingInventory = await PharmacyInventory.findOne({
          where: {
            pharmacyId: pharmacy.id,
            medicineId: medicine.id
          }
        });
        
        if (!existingInventory) {
          // Generate random price and stock
          const basePrice = Math.floor(Math.random() * 200) + 20; // 20-220 taka
          const stock = Math.floor(Math.random() * 100) + 10; // 10-109 units
          const minStockLevel = Math.floor(Math.random() * 10) + 5; // 5-14 units
          
          await PharmacyInventory.create({
            pharmacyId: pharmacy.id,
            medicineId: medicine.id,
            price: basePrice,
            stock: stock,
            availability: stock > 0,
            minStockLevel: minStockLevel
          });
          
          console.log(`   ✅ ${medicine.name} - ৳${basePrice} (Stock: ${stock})`);
        } else {
          console.log(`   ⏭️  ${medicine.name} (already exists)`);
        }
      }
    }
    
    console.log('\n✅ Inventory seeding completed!');
    
    // Show summary
    const totalInventory = await PharmacyInventory.count();
    console.log(`📊 Total inventory items: ${totalInventory}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding inventory:', error);
    process.exit(1);
  }
};

seedInventoryData();