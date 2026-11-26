const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { sequelize } = require('../config/database');
const { User, Pharmacy, Medicine, PharmacyInventory } = require('../models');

// 8 Major Divisional Cities of Bangladesh with authentic neighborhoods & coordinates
const CITIES = [
  {
    name: 'Dhaka',
    code: 'DHK',
    lat: 23.7808,
    lng: 90.4071,
    areas: [
      'Dhanmondi 27', 'Gulshan 1', 'Banani 11', 'Uttara Sector 7', 'Mirpur 10',
      'Mohammadpur Town Hall', 'Bashundhara R/A', 'Panthapath', 'Green Road', 'Motijheel',
      'Baily Road', 'Malibagh', 'Farmgate', 'Badda Link Road', 'Khilgaon Taltola',
      'Jatrabari', 'Lalmatia', 'Wari Rankin Street', 'Shahbagh', 'Rampura Banasree',
    ],
  },
  {
    name: 'Chattogram',
    code: 'CTG',
    lat: 22.3569,
    lng: 91.7832,
    areas: [
      'GEC Circle', 'Agrabad C/A', 'Nasirabad', 'Panchlaish', 'Chawkbazar',
      'Halishahar', 'Muradpur', 'Khulshi', '2 No. Gate', 'Anderkilla',
      'Jamalkhan', 'Mehedibag', 'Dampara', 'Lalkhan Bazar', 'Bahaddarhat',
      'Oxygen More', 'Patenga', 'Kotwali', 'Sholoshahar', 'AK Khan Gate',
    ],
  },
  {
    name: 'Khulna',
    code: 'KHL',
    lat: 22.8456,
    lng: 89.5403,
    areas: [
      'KDA Avenue', 'Sonadanga', 'Shibbari More', 'Boyra Bazar', 'Gallamari',
      'Hadis Park', 'Khalishpur', 'Daulatpur', 'Nirala Residential', 'Moylapota',
      'Rupsha Stand Road', 'Zero Point', 'Tutpara', 'Gollamari Bridge', 'Royal More',
      'Dakbangla More', 'Phultala Road', 'Gopalgonj Stand', 'New Market', 'Fultola Bazar',
    ],
  },
  {
    name: 'Rajshahi',
    code: 'RAJ',
    lat: 24.3745,
    lng: 88.6042,
    areas: [
      'Shaheb Bazar', 'Laxmipur More', 'Talaimari', 'Uposhohor', 'Kazla Gate',
      'Binodpur', 'Vodra More', 'New Market', 'Padma Residential', 'Alupotti',
      'Rani Bazar', 'Moni Chattar', 'Railgate', 'C&B More', 'Bornali More',
      'Sapura', 'Nowdapara', 'Kashiadanga', 'Court Station', 'Kadirganj',
    ],
  },
  {
    name: 'Sylhet',
    code: 'SYL',
    lat: 24.8949,
    lng: 91.8687,
    areas: [
      'Zindabazar', 'Amberkhana', 'Subidbazar', 'Bandarbazar', 'Mirabazar',
      'Shibganj', 'Uposhohor', 'Tilagor', 'Rikabibazar', 'Chouhatta',
      'Kumarpara', 'Naiorpul', 'Pathantula', 'Madina Market', 'South Surma',
      'Shahjalal Uposhohor', 'Lamabazar', 'Bagbari', 'Kazitula', 'Mendibag',
    ],
  },
  {
    name: 'Barishal',
    code: 'BAR',
    lat: 22.7010,
    lng: 90.3535,
    areas: [
      'Sadar Road', 'Natullabad', 'Rupatali', 'Banglabazar', 'Chawkbazar',
      'Bibir Pukur Par', 'Alekkanda', 'Nobogram Road', 'C&B Road', 'Kawnia',
      'Sagordi', 'Launch Ghat', 'Bogura Road', 'Hospital Road', 'Kalibari Road',
      'Brown Compound', 'Alekanda', 'Hatkhola', 'Amanatganj', 'Kashipur',
    ],
  },
  {
    name: 'Rangpur',
    code: 'RNG',
    lat: 25.7439,
    lng: 89.2752,
    areas: [
      'Jahaj Company More', 'Medical More', 'Lalbagh Bazar', 'Shapla Chattar', 'Dhap',
      'Station Road', 'Modern More', 'Khamar More', 'Checkpost', 'Paira Chattar',
      'Shatmatha', 'Keranipara', 'Guptapara', 'Alam Nagar', 'College Road',
      'Tajhat', 'Kachari Bazar', 'RK Road', 'CO Bazar', 'Mahiganj',
    ],
  },
  {
    name: 'Mymensingh',
    code: 'MYM',
    lat: 24.7471,
    lng: 90.4203,
    areas: [
      'Charpara More', 'Ganginar Par', 'Town Hall More', 'Maskanda', 'Kachijhuli',
      'Boundary Road', 'Choto Bazar', 'Boro Bazar', 'Patgudam Bridge', 'Shambhuganj',
      'Kewatkhali', 'Notun Bazar', 'Durgabari Road', 'Rambabu Road', 'Akua',
      'Bhatikashor', 'Muktijoddha Sarani', 'C.K. Ghosh Road', 'Kalinath Roy Road', 'Sankipara',
    ],
  },
];

// 5 National Multi-City Chains (each owns branches across ALL 8 cities + multiple in key cities)
const NATIONAL_CHAINS = [
  {
    chainName: 'Lazz Pharma',
    ownerName: 'Lazz Pharma HQ',
    email: 'lazz.hq@medlink.com',
    password: 'Lazz@2026',
    phonePrefix: '01711',
    cityCounts: { Dhaka: 3, Chattogram: 2, Khulna: 2, Rajshahi: 1, Sylhet: 1, Barishal: 1, Rangpur: 1, Mymensingh: 1 },
  },
  {
    chainName: 'Tamanna Pharmacy',
    ownerName: 'Tamanna Pharmacy HQ',
    email: 'tamanna.hq@medlink.com',
    password: 'Tamanna@2026',
    phonePrefix: '01712',
    cityCounts: { Dhaka: 2, Chattogram: 2, Khulna: 1, Rajshahi: 1, Sylhet: 1, Barishal: 1, Rangpur: 1, Mymensingh: 1 },
  },
  {
    chainName: 'Arogga Pharmacy',
    ownerName: 'Arogga Pharmacy HQ',
    email: 'arogga.hq@medlink.com',
    password: 'Arogga@2026',
    phonePrefix: '01811',
    cityCounts: { Dhaka: 2, Chattogram: 1, Khulna: 1, Rajshahi: 1, Sylhet: 2, Barishal: 1, Rangpur: 1, Mymensingh: 1 },
  },
  {
    chainName: 'Popular Pharmacy',
    ownerName: 'Popular Pharmacy HQ',
    email: 'popular.hq@medlink.com',
    password: 'Popular@2026',
    phonePrefix: '01911',
    cityCounts: { Dhaka: 2, Chattogram: 1, Khulna: 2, Rajshahi: 1, Sylhet: 1, Barishal: 1, Rangpur: 1, Mymensingh: 1 },
  },
  {
    chainName: 'Model Pharmacy',
    ownerName: 'Model Pharmacy HQ',
    email: 'model.hq@medlink.com',
    password: 'Model@2026',
    phonePrefix: '01611',
    cityCounts: { Dhaka: 1, Chattogram: 2, Khulna: 1, Rajshahi: 2, Sylhet: 1, Barishal: 1, Rangpur: 1, Mymensingh: 1 },
  },
];

// Independent pharmacy brand names used per city to reach 20 stores/city
const INDEPENDENT_NAMES = [
  'LifeSpring Meds',
  'CarePlus Dispensary',
  'Shifa Drug House',
  'Green Leaf Chemist',
  'Medilife Pharmacy',
  'Apollo Corner Pharma',
  'Wellbeing Drug Store',
  'City Care Chemist',
  'Crescent Medico',
  'HealthFirst Pharmacy',
  'Al-Madina Drug House',
  'Beacon Care Pharma',
];

// 32 Essential Bangladesh Medicines
const MEDICINES_CATALOG = [
  { name: 'Napa', genericName: 'Paracetamol', brand: 'Beximco Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '500mg', requiresPrescription: false, basePrice: 12 },
  { name: 'Napa Extra', genericName: 'Paracetamol + Caffeine', brand: 'Beximco Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '500mg+65mg', requiresPrescription: false, basePrice: 25 },
  { name: 'Ace Plus', genericName: 'Paracetamol + Caffeine', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '500mg+65mg', requiresPrescription: false, basePrice: 26 },
  { name: 'Seclo 20', genericName: 'Omeprazole', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'capsule', strength: '20mg', requiresPrescription: false, basePrice: 60 },
  { name: 'Sergel 20', genericName: 'Esomeprazole', brand: 'Healthcare Pharma', category: 'over-the-counter', dosageForm: 'capsule', strength: '20mg', requiresPrescription: false, basePrice: 70 },
  { name: 'Maxpro 20', genericName: 'Esomeprazole', brand: 'Renata Limited', category: 'over-the-counter', dosageForm: 'tablet', strength: '20mg', requiresPrescription: false, basePrice: 70 },
  { name: 'Losectil 20', genericName: 'Omeprazole', brand: 'Eskayef Pharma', category: 'over-the-counter', dosageForm: 'capsule', strength: '20mg', requiresPrescription: false, basePrice: 55 },
  { name: 'Finix 20', genericName: 'Rabeprazole', brand: 'Opsonin Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '20mg', requiresPrescription: false, basePrice: 65 },
  { name: 'Monas 10', genericName: 'Montelukast Sodium', brand: 'ACME Laboratories', category: 'prescription', dosageForm: 'tablet', strength: '10mg', requiresPrescription: true, basePrice: 175 },
  { name: 'Montair 10', genericName: 'Montelukast Sodium', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '10mg', requiresPrescription: true, basePrice: 170 },
  { name: 'Fexo 120', genericName: 'Fexofenadine HCl', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '120mg', requiresPrescription: false, basePrice: 80 },
  { name: 'Alatrol 10', genericName: 'Cetirizine Dihydrochloride', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '10mg', requiresPrescription: false, basePrice: 30 },
  { name: 'Azithro 500', genericName: 'Azithromycin', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg', requiresPrescription: true, basePrice: 140 },
  { name: 'Zimax 500', genericName: 'Azithromycin', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg', requiresPrescription: true, basePrice: 150 },
  { name: 'Cef-3 200', genericName: 'Cefixime', brand: 'Square Pharma', category: 'prescription', dosageForm: 'capsule', strength: '200mg', requiresPrescription: true, basePrice: 210 },
  { name: 'Ciprocin 500', genericName: 'Ciprofloxacin', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg', requiresPrescription: true, basePrice: 150 },
  { name: 'Moxacil 500', genericName: 'Amoxicillin', brand: 'Square Pharma', category: 'prescription', dosageForm: 'capsule', strength: '500mg', requiresPrescription: true, basePrice: 75 },
  { name: 'Amodis 400', genericName: 'Metronidazole', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '400mg', requiresPrescription: true, basePrice: 20 },
  { name: 'Atova 20', genericName: 'Atorvastatin', brand: 'Beximco Pharma', category: 'prescription', dosageForm: 'tablet', strength: '20mg', requiresPrescription: true, basePrice: 120 },
  { name: 'Rosuva 10', genericName: 'Rosuvastatin', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '10mg', requiresPrescription: true, basePrice: 145 },
  { name: 'Ecosprin 75', genericName: 'Aspirin', brand: 'ACME Laboratories', category: 'prescription', dosageForm: 'tablet', strength: '75mg', requiresPrescription: true, basePrice: 15 },
  { name: 'Clopid 75', genericName: 'Clopidogrel', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '75mg', requiresPrescription: true, basePrice: 140 },
  { name: 'Bizoran 5/20', genericName: 'Amlodipine + Olmesartan', brand: 'Beximco Pharma', category: 'prescription', dosageForm: 'tablet', strength: '5mg+20mg', requiresPrescription: true, basePrice: 160 },
  { name: 'Osartil 50', genericName: 'Losartan Potassium', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '50mg', requiresPrescription: true, basePrice: 90 },
  { name: 'Comet 500', genericName: 'Metformin HCl', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg', requiresPrescription: true, basePrice: 40 },
  { name: 'Lantus SoloStar', genericName: 'Insulin Glargine', brand: 'Sanofi', category: 'prescription', dosageForm: 'injection', strength: '100IU/mL', requiresPrescription: true, basePrice: 890 },
  { name: 'Sultolin Inhaler', genericName: 'Salbutamol', brand: 'Square Pharma', category: 'prescription', dosageForm: 'inhaler', strength: '100mcg', requiresPrescription: true, basePrice: 165 },
  { name: 'Ceevit', genericName: 'Vitamin C (Ascorbic Acid)', brand: 'Square Pharma', category: 'supplement', dosageForm: 'tablet', strength: '250mg', requiresPrescription: false, basePrice: 22 },
  { name: 'Calbo-D', genericName: 'Calcium + Vitamin D3', brand: 'Square Pharma', category: 'supplement', dosageForm: 'tablet', strength: '500mg+200IU', requiresPrescription: false, basePrice: 110 },
  { name: 'Neuro-B', genericName: 'Vitamin B1+B6+B12', brand: 'Square Pharma', category: 'supplement', dosageForm: 'tablet', strength: '100mg+200mg+200mcg', requiresPrescription: false, basePrice: 95 },
  { name: 'Orsaline-N', genericName: 'Oral Rehydration Salts', brand: 'SMC', category: 'over-the-counter', dosageForm: 'other', strength: '10.25g', requiresPrescription: false, basePrice: 60 },
  { name: 'Histacin', genericName: 'Chlorpheniramine Maleate', brand: 'Jayson Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '4mg', requiresPrescription: false, basePrice: 12 },
];

const CUSTOMERS = [
  { name: 'Ariyan Rahman', email: 'ariyan.customer@medlink.com', password: 'Customer@2026', phone: '01715000001', city: 'Dhaka' },
  { name: 'Nusrat Jahan', email: 'nusrat.dhaka@medlink.com', password: 'Customer@2026', phone: '01715000002', city: 'Dhaka' },
  { name: 'Tanvir Ahmed', email: 'tanvir.ctg@medlink.com', password: 'Customer@2026', phone: '01815000003', city: 'Chattogram' },
  { name: 'Farhana Yasmin', email: 'farhana.khulna@medlink.com', password: 'Customer@2026', phone: '01915000004', city: 'Khulna' },
  { name: 'Mahmudul Hasan', email: 'mahmud.rajshahi@medlink.com', password: 'Customer@2026', phone: '01715000005', city: 'Rajshahi' },
  { name: 'Tasnim Akter', email: 'tasnim.sylhet@medlink.com', password: 'Customer@2026', phone: '01715000006', city: 'Sylhet' },
  { name: 'Sajjad Hossain', email: 'sajjad.barishal@medlink.com', password: 'Customer@2026', phone: '01815000007', city: 'Barishal' },
  { name: 'Razia Sultana', email: 'razia.rangpur@medlink.com', password: 'Customer@2026', phone: '01915000008', city: 'Rangpur' },
  { name: 'Kamrul Islam', email: 'kamrul.mymensingh@medlink.com', password: 'Customer@2026', phone: '01615000009', city: 'Mymensingh' },
  { name: 'Demo Patient', email: 'customer@medlink.com', password: 'Customer@2026', phone: '01715000010', city: 'Dhaka' },
];

const formatPhone = (prefix, seq) => `${prefix}${String(seq).padStart(6, '0')}`;

const jitterCoord = (base, index) => {
  const offset = ((index % 7) - 3) * 0.0085 + (Math.floor(index / 7) - 1) * 0.0062;
  return Number((base + offset).toFixed(6));
};

async function ensureUser({ name, email, password, role, phone }) {
  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await User.create({ name, email, password, role, phone });
  }
  return user;
}

async function ensurePharmacy(data) {
  let pharmacy = await Pharmacy.findOne({ where: { licenseNumber: data.licenseNumber } });
  if (!pharmacy) {
    pharmacy = await Pharmacy.create(data);
  } else {
    await pharmacy.update({
      city: data.city,
      branchName: data.branchName,
      chainName: data.chainName,
      status: 'approved',
    });
  }
  return pharmacy;
}

async function seedNationwide() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✅ Database connected and schema synchronized.');

    const credentialRecords = {
      admin: { email: 'admin@medlink.com', password: 'Admin@2026', name: 'MedLink Super Admin' },
      nationalChains: [],
      cityMultiBranch: [],
      independentByCity: {},
      customers: CUSTOMERS,
    };

    // 1. Ensure Admin Account
    let admin = await User.findOne({ where: { email: credentialRecords.admin.email } });
    if (!admin) {
      await User.create({
        name: credentialRecords.admin.name,
        email: credentialRecords.admin.email,
        password: credentialRecords.admin.password,
        role: 'admin',
        phone: '01700000001',
      });
    } else {
      // Ensure known admin password works
      admin.password = credentialRecords.admin.password;
      await admin.save();
    }
    console.log('👑 Admin ready: admin@medlink.com');

    // 2. Ensure Customers
    for (const c of CUSTOMERS) {
      await ensureUser({ name: c.name, email: c.email, password: c.password, role: 'customer', phone: c.phone });
    }
    console.log(`👤 ${CUSTOMERS.length} customer accounts ready.`);

    // 3. Seed Medicines
    const medicineRecords = [];
    for (const m of MEDICINES_CATALOG) {
      let med = await Medicine.findOne({ where: { name: m.name, brand: m.brand } });
      if (!med) {
        med = await Medicine.create({
          name: m.name,
          genericName: m.genericName,
          brand: m.brand,
          category: m.category,
          dosageForm: m.dosageForm,
          strength: m.strength,
          requiresPrescription: m.requiresPrescription,
          description: `${m.name} (${m.genericName} ${m.strength}) by ${m.brand}.`,
        });
      }
      medicineRecords.push({ record: med, basePrice: m.basePrice });
    }
    console.log(`💊 ${medicineRecords.length} medicines ready.`);

    // Track per-city area index so every single branch in a city gets a distinct neighborhood
    const cityAreaCursor = {};
    CITIES.forEach((c) => {
      cityAreaCursor[c.name] = 0;
      credentialRecords.independentByCity[c.name] = [];
    });

    const createdBranches = [];
    let globalSeq = 100;

    // 4. Seed 5 National Multi-City Chains
    for (const chain of NATIONAL_CHAINS) {
      const ownerPhone = formatPhone(chain.phonePrefix, ++globalSeq);
      const owner = await ensureUser({
        name: chain.ownerName,
        email: chain.email,
        password: chain.password,
        role: 'pharmacy',
        phone: ownerPhone,
      });

      const chainBranches = [];
      for (const cityObj of CITIES) {
        const count = chain.cityCounts[cityObj.name] || 1;
        for (let i = 0; i < count; i++) {
          const areaIdx = cityAreaCursor[cityObj.name]++;
          const area = cityObj.areas[areaIdx % cityObj.areas.length];
          const licenseNumber = `DGDA-${cityObj.code}-${String(areaIdx + 1).padStart(3, '0')}`;
          const phone = formatPhone(chain.phonePrefix, ++globalSeq);

          const branch = await ensurePharmacy({
            userId: owner.id,
            name: `${chain.chainName} — ${area}`,
            chainName: chain.chainName,
            branchName: `${area} Branch`,
            city: cityObj.name,
            address: `${area}, ${cityObj.name}, Bangladesh`,
            phone,
            licenseNumber,
            latitude: jitterCoord(cityObj.lat, areaIdx),
            longitude: jitterCoord(cityObj.lng, areaIdx + 3),
            status: 'approved',
          });

          createdBranches.push(branch);
          chainBranches.push(`${cityObj.name} (${area})`);
        }
      }

      credentialRecords.nationalChains.push({
        chainName: chain.chainName,
        email: chain.email,
        password: chain.password,
        branchCount: chainBranches.length,
        branchesSummary: chainBranches,
      });
    }

    // 5. Seed 2 City-Local Multi-Branch Stores per City (each owns 2 branches in the same city)
    for (const cityObj of CITIES) {
      const citySlug = cityObj.name.toLowerCase();
      for (let localIdx = 1; localIdx <= 2; localIdx++) {
        const brandName =
          localIdx === 1
            ? `${cityObj.name} Central Pharma`
            : `${cityObj.name} Health Mart`;
        const email = `multibranch${localIdx}.${citySlug}@medlink.com`;
        const password = `${cityObj.code}Multi@2026`;
        const ownerPhone = formatPhone('01755', ++globalSeq);

        const owner = await ensureUser({
          name: `${brandName} Group`,
          email,
          password,
          role: 'pharmacy',
          phone: ownerPhone,
        });

        const localBranches = [];
        for (let b = 0; b < 2; b++) {
          const areaIdx = cityAreaCursor[cityObj.name]++;
          const area = cityObj.areas[areaIdx % cityObj.areas.length];
          const licenseNumber = `DGDA-${cityObj.code}-${String(areaIdx + 1).padStart(3, '0')}`;
          const phone = formatPhone('01755', ++globalSeq);

          const branch = await ensurePharmacy({
            userId: owner.id,
            name: `${brandName} — ${area}`,
            chainName: brandName,
            branchName: `${area} Branch`,
            city: cityObj.name,
            address: `${area}, ${cityObj.name}, Bangladesh`,
            phone,
            licenseNumber,
            latitude: jitterCoord(cityObj.lat, areaIdx),
            longitude: jitterCoord(cityObj.lng, areaIdx + 5),
            status: 'approved',
          });

          createdBranches.push(branch);
          localBranches.push(area);
        }

        credentialRecords.cityMultiBranch.push({
          city: cityObj.name,
          chainName: brandName,
          email,
          password,
          branches: localBranches,
        });
      }
    }

    // 6. Seed Remaining Independent Stores so EVERY city has EXACTLY 20 medicine stores
    for (const cityObj of CITIES) {
      const citySlug = cityObj.name.toLowerCase();
      let indCounter = 0;

      while (cityAreaCursor[cityObj.name] < 20) {
        const areaIdx = cityAreaCursor[cityObj.name]++;
        const area = cityObj.areas[areaIdx % cityObj.areas.length];
        const baseBrand = INDEPENDENT_NAMES[indCounter % INDEPENDENT_NAMES.length];
        indCounter++;

        const storeName = `${baseBrand} (${area})`;
        const email = `store${indCounter}.${citySlug}@medlink.com`;
        const password = `Store@${cityObj.code}2026`;
        const phone = formatPhone('01844', ++globalSeq);
        const licenseNumber = `DGDA-${cityObj.code}-${String(areaIdx + 1).padStart(3, '0')}`;

        const owner = await ensureUser({
          name: `${baseBrand} ${cityObj.name}`,
          email,
          password,
          role: 'pharmacy',
          phone,
        });

        const branch = await ensurePharmacy({
          userId: owner.id,
          name: storeName,
          chainName: baseBrand,
          branchName: `${area} Branch`,
          city: cityObj.name,
          address: `${area}, ${cityObj.name}, Bangladesh`,
          phone,
          licenseNumber,
          latitude: jitterCoord(cityObj.lat, areaIdx),
          longitude: jitterCoord(cityObj.lng, areaIdx + 2),
          status: 'approved',
        });

        createdBranches.push(branch);
        credentialRecords.independentByCity[cityObj.name].push({
          storeName,
          area,
          email,
          password,
          licenseNumber,
        });
      }
    }

    console.log(`🏥 Seeded ${createdBranches.length} total pharmacy branches (20 per city × ${CITIES.length} cities).`);

    // 7. Stock Inventory across all 160 branches (14 medicines per branch using bulkCreate ignoreDuplicates)
    const existingPairs = new Set(
      (await PharmacyInventory.findAll({ attributes: ['pharmacyId', 'medicineId'], raw: true })).map(
        (r) => `${r.pharmacyId}-${r.medicineId}`
      )
    );

    const inventoryRows = [];
    createdBranches.forEach((branch, bIdx) => {
      // Always include first 6 core medicines + 8 rotating medicines = 14 per branch
      const selectedIndices = new Set([0, 1, 3, 4, 8, 12]);
      for (let k = 0; k < 8; k++) {
        selectedIndices.add((bIdx * 3 + k * 2) % medicineRecords.length);
      }

      for (const mIdx of selectedIndices) {
        const medItem = medicineRecords[mIdx];
        const pairKey = `${branch.id}-${medItem.record.id}`;
        if (existingPairs.has(pairKey)) continue;
        existingPairs.add(pairKey);

        const priceVariance = ((bIdx + mIdx) % 5) - 2; // -2 to +2 BDT realistic variance
        const price = Math.max(5, medItem.basePrice + priceVariance);
        const stock = 12 + ((bIdx * 7 + mIdx * 11) % 85);

        inventoryRows.push({
          pharmacyId: branch.id,
          medicineId: medItem.record.id,
          price: Number(price.toFixed(2)),
          stock,
          availability: true,
          minStockLevel: 10,
        });
      }
    });

    if (inventoryRows.length > 0) {
      await PharmacyInventory.bulkCreate(inventoryRows, { ignoreDuplicates: true });
    }
    console.log(`📦 Added ${inventoryRows.length} inventory records across branches.`);

    // 8. Write CREDENTIALS.md at repository root
    const mdLines = [];
    mdLines.push('# MedLink — Complete Login Credentials Directory');
    mdLines.push('');
    mdLines.push('> **Dataset Summary**: 8 Divisional Cities · **20 Medicine Stores per City (160 Branches Total)** · 5 National Multi-City Chains · 16 City-Local Multi-Branch Groups · 76 Independent Stores · 32 Essential Medicines · 10 Customers · 1 Admin');
    mdLines.push('');
    mdLines.push('---');
    mdLines.push('');
    mdLines.push('## 1. Admin Account');
    mdLines.push('');
    mdLines.push('| Role | Name | Email | Password |');
    mdLines.push('| :--- | :--- | :--- | :--- |');
    mdLines.push(`| Admin | ${credentialRecords.admin.name} | \`${credentialRecords.admin.email}\` | \`${credentialRecords.admin.password}\` |`);
    mdLines.push('');
    mdLines.push('---');
    mdLines.push('');
    mdLines.push('## 2. National Multi-City Pharmacy Chains (1 Login → Multiple Cities & Multiple Branches)');
    mdLines.push('');
    mdLines.push('| Chain Name | Email | Password | Total Branches | Cities & Branches |');
    mdLines.push('| :--- | :--- | :--- | :---: | :--- |');
    for (const ch of credentialRecords.nationalChains) {
      mdLines.push(`| **${ch.chainName}** | \`${ch.email}\` | \`${ch.password}\` | ${ch.branchCount} | ${ch.branchesSummary.join(', ')} |`);
    }
    mdLines.push('');
    mdLines.push('---');
    mdLines.push('');
    mdLines.push('## 3. City-Local Multi-Branch Pharmacies (1 Login → 2 Branches in Same City)');
    mdLines.push('');
    mdLines.push('| City | Pharmacy Group | Email | Password | Branches |');
    mdLines.push('| :--- | :--- | :--- | :--- | :--- |');
    for (const grp of credentialRecords.cityMultiBranch) {
      mdLines.push(`| ${grp.city} | **${grp.chainName}** | \`${grp.email}\` | \`${grp.password}\` | ${grp.branches.join(' · ')} |`);
    }
    mdLines.push('');
    mdLines.push('---');
    mdLines.push('');
    mdLines.push('## 4. Independent Medicine Stores by City (Completing 20 Stores per City)');
    mdLines.push('');
    for (const cityObj of CITIES) {
      const stores = credentialRecords.independentByCity[cityObj.name];
      mdLines.push(`### ${cityObj.name} (${stores.length} Independent + National & Local Multi-Branch = 20 Stores Total)`);
      mdLines.push('');
      mdLines.push('| Store Name | Area | License | Email | Password |');
      mdLines.push('| :--- | :--- | :--- | :--- | :--- |');
      for (const s of stores) {
        mdLines.push(`| ${s.storeName} | ${s.area} | \`${s.licenseNumber}\` | \`${s.email}\` | \`${s.password}\` |`);
      }
      mdLines.push('');
    }
    mdLines.push('---');
    mdLines.push('');
    mdLines.push('## 5. Customer Accounts');
    mdLines.push('');
    mdLines.push('| Customer Name | City | Phone | Email | Password |');
    mdLines.push('| :--- | :--- | :--- | :--- | :--- |');
    for (const c of credentialRecords.customers) {
      mdLines.push(`| ${c.name} | ${c.city} | \`${c.phone}\` | \`${c.email}\` | \`${c.password}\` |`);
    }
    mdLines.push('');

    const outPath = path.resolve(__dirname, '../../CREDENTIALS.md');
    fs.writeFileSync(outPath, mdLines.join('\n'), 'utf8');
    console.log(`📄 Generated ${outPath}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Nationwide seed failed:', error);
    process.exit(1);
  }
}

seedNationwide();
