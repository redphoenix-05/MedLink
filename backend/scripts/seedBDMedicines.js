const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { sequelize } = require('../config/database');
const { Pharmacy, Medicine, PharmacyInventory } = require('../models');

// Comprehensive authentic Bangladesh medicine catalog (150+ widely used medicines)
const BD_MEDICINES = [
  // 1. Pain, Fever & Anti-inflammatory
  { name: 'Napa', genericName: 'Paracetamol', brand: 'Beximco Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '500mg', requiresPrescription: false, basePrice: 12 },
  { name: 'Napa Extra', genericName: 'Paracetamol + Caffeine', brand: 'Beximco Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '500mg+65mg', requiresPrescription: false, basePrice: 25 },
  { name: 'Napa Extend', genericName: 'Paracetamol', brand: 'Beximco Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '665mg', requiresPrescription: false, basePrice: 20 },
  { name: 'Napa Syrup', genericName: 'Paracetamol', brand: 'Beximco Pharma', category: 'over-the-counter', dosageForm: 'syrup', strength: '120mg/5ml', requiresPrescription: false, basePrice: 35 },
  { name: 'Napa Drops', genericName: 'Paracetamol', brand: 'Beximco Pharma', category: 'over-the-counter', dosageForm: 'drops', strength: '80mg/ml', requiresPrescription: false, basePrice: 28 },
  { name: 'Ace', genericName: 'Paracetamol', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '500mg', requiresPrescription: false, basePrice: 12 },
  { name: 'Ace Plus', genericName: 'Paracetamol + Caffeine', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '500mg+65mg', requiresPrescription: false, basePrice: 26 },
  { name: 'Ace XR', genericName: 'Paracetamol', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '665mg', requiresPrescription: false, basePrice: 20 },
  { name: 'Renova', genericName: 'Paracetamol', brand: 'Opsonin Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '500mg', requiresPrescription: false, basePrice: 12 },
  { name: 'Fast', genericName: 'Paracetamol', brand: 'ACME Laboratories', category: 'over-the-counter', dosageForm: 'tablet', strength: '500mg', requiresPrescription: false, basePrice: 12 },
  { name: 'Tamen', genericName: 'Paracetamol', brand: 'Eskayef Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '500mg', requiresPrescription: false, basePrice: 12 },
  { name: 'Reset', genericName: 'Paracetamol', brand: 'Incepta Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '500mg', requiresPrescription: false, basePrice: 12 },
  { name: 'Rolac 10', genericName: 'Ketorolac Tromethamine', brand: 'Renata Limited', category: 'prescription', dosageForm: 'tablet', strength: '10mg', requiresPrescription: true, basePrice: 100 },
  { name: 'Torax 10', genericName: 'Ketorolac Tromethamine', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '10mg', requiresPrescription: true, basePrice: 100 },
  { name: 'Clofenac 50', genericName: 'Diclofenac Sodium', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '50mg', requiresPrescription: true, basePrice: 15 },
  { name: 'Clofenac SR 100', genericName: 'Diclofenac Sodium', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '100mg', requiresPrescription: true, basePrice: 40 },
  { name: 'Naprox 500', genericName: 'Naproxen Sodium', brand: 'Eskayef Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg', requiresPrescription: true, basePrice: 100 },
  { name: 'Naprox Plus', genericName: 'Naproxen + Esomeprazole', brand: 'Eskayef Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg+20mg', requiresPrescription: true, basePrice: 120 },
  { name: 'Naspro 500', genericName: 'Naproxen + Esomeprazole', brand: 'Radiant Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg+20mg', requiresPrescription: true, basePrice: 125 },
  { name: 'Flexi 100', genericName: 'Aceclofenac', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '100mg', requiresPrescription: true, basePrice: 45 },
  { name: 'Etorix 90', genericName: 'Etoricoxib', brand: 'Eskayef Pharma', category: 'prescription', dosageForm: 'tablet', strength: '90mg', requiresPrescription: true, basePrice: 120 },
  { name: 'Etorix 120', genericName: 'Etoricoxib', brand: 'Eskayef Pharma', category: 'prescription', dosageForm: 'tablet', strength: '120mg', requiresPrescription: true, basePrice: 150 },
  { name: 'Tufnil 200', genericName: 'Tolfenamic Acid', brand: 'Eskayef Pharma', category: 'prescription', dosageForm: 'tablet', strength: '200mg', requiresPrescription: true, basePrice: 100 },
  { name: 'Algin 50', genericName: 'Tiemonium Methylsulphate', brand: 'Renata Limited', category: 'prescription', dosageForm: 'tablet', strength: '50mg', requiresPrescription: true, basePrice: 80 },
  { name: 'Visceralgin 50', genericName: 'Tiemonium Methylsulphate', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '50mg', requiresPrescription: true, basePrice: 80 },
  { name: 'Myolax 50', genericName: 'Tolperisone HCl', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '50mg', requiresPrescription: true, basePrice: 70 },
  { name: 'Baclofen 10', genericName: 'Baclofen', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '10mg', requiresPrescription: true, basePrice: 80 },

  // 2. Gastric, Ulcer & Digestion
  { name: 'Seclo 20', genericName: 'Omeprazole', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'capsule', strength: '20mg', requiresPrescription: false, basePrice: 60 },
  { name: 'Seclo 40', genericName: 'Omeprazole', brand: 'Square Pharma', category: 'prescription', dosageForm: 'capsule', strength: '40mg', requiresPrescription: true, basePrice: 90 },
  { name: 'Sergel 20', genericName: 'Esomeprazole', brand: 'Healthcare Pharma', category: 'over-the-counter', dosageForm: 'capsule', strength: '20mg', requiresPrescription: false, basePrice: 70 },
  { name: 'Sergel 40', genericName: 'Esomeprazole', brand: 'Healthcare Pharma', category: 'prescription', dosageForm: 'capsule', strength: '40mg', requiresPrescription: true, basePrice: 100 },
  { name: 'Maxpro 20', genericName: 'Esomeprazole', brand: 'Renata Limited', category: 'over-the-counter', dosageForm: 'tablet', strength: '20mg', requiresPrescription: false, basePrice: 70 },
  { name: 'Maxpro 40', genericName: 'Esomeprazole', brand: 'Renata Limited', category: 'prescription', dosageForm: 'tablet', strength: '40mg', requiresPrescription: true, basePrice: 100 },
  { name: 'Nexum 20', genericName: 'Esomeprazole', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'capsule', strength: '20mg', requiresPrescription: false, basePrice: 70 },
  { name: 'Exium 20', genericName: 'Esomeprazole', brand: 'Radiant Pharma', category: 'over-the-counter', dosageForm: 'capsule', strength: '20mg', requiresPrescription: false, basePrice: 75 },
  { name: 'Losectil 20', genericName: 'Omeprazole', brand: 'Eskayef Pharma', category: 'over-the-counter', dosageForm: 'capsule', strength: '20mg', requiresPrescription: false, basePrice: 55 },
  { name: 'Pantonix 20', genericName: 'Pantoprazole', brand: 'Incepta Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '20mg', requiresPrescription: false, basePrice: 70 },
  { name: 'Pantonix 40', genericName: 'Pantoprazole', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '40mg', requiresPrescription: true, basePrice: 100 },
  { name: 'Finix 20', genericName: 'Rabeprazole', brand: 'Opsonin Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '20mg', requiresPrescription: false, basePrice: 65 },
  { name: 'Rabifast 20', genericName: 'Rabeprazole', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '20mg', requiresPrescription: false, basePrice: 70 },
  { name: 'Dexlan 30', genericName: 'Dexlansoprazole', brand: 'Healthcare Pharma', category: 'prescription', dosageForm: 'capsule', strength: '30mg', requiresPrescription: true, basePrice: 140 },
  { name: 'Entacyd Plus', genericName: 'Aluminium + Magnesium + Simethicone', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '400mg+400mg+30mg', requiresPrescription: false, basePrice: 20 },
  { name: 'Gavisol Syrup', genericName: 'Sodium Alginate + Sodium Bicarbonate', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'syrup', strength: '200ml', requiresPrescription: false, basePrice: 250 },
  { name: 'Motigut 10', genericName: 'Domperidone', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '10mg', requiresPrescription: false, basePrice: 35 },
  { name: 'Omidon 10', genericName: 'Domperidone', brand: 'Incepta Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '10mg', requiresPrescription: false, basePrice: 35 },
  { name: 'Deflux 10', genericName: 'Domperidone', brand: 'Beximco Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '10mg', requiresPrescription: false, basePrice: 35 },
  { name: 'Famotack 20', genericName: 'Famotidine', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '20mg', requiresPrescription: false, basePrice: 25 },
  { name: 'Avolac Syrup', genericName: 'Lactulose', brand: 'Aristopharma', category: 'over-the-counter', dosageForm: 'syrup', strength: '100ml', requiresPrescription: false, basePrice: 140 },
  { name: 'Esoral 20', genericName: 'Esomeprazole', brand: 'Eskayef Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '20mg', requiresPrescription: false, basePrice: 70 },
  { name: 'Onaseron 8', genericName: 'Ondansetron', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '8mg', requiresPrescription: true, basePrice: 90 },
  { name: 'Emistat 8', genericName: 'Ondansetron', brand: 'Healthcare Pharma', category: 'prescription', dosageForm: 'tablet', strength: '8mg', requiresPrescription: true, basePrice: 90 },

  // 3. Antibiotics & Anti-infectives
  { name: 'Azithro 500', genericName: 'Azithromycin', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg', requiresPrescription: true, basePrice: 140 },
  { name: 'Zimax 500', genericName: 'Azithromycin', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg', requiresPrescription: true, basePrice: 150 },
  { name: 'Azyth 500', genericName: 'Azithromycin', brand: 'Beximco Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg', requiresPrescription: true, basePrice: 145 },
  { name: 'Cef-3 200', genericName: 'Cefixime', brand: 'Square Pharma', category: 'prescription', dosageForm: 'capsule', strength: '200mg', requiresPrescription: true, basePrice: 210 },
  { name: 'Cef-3 DS 400', genericName: 'Cefixime', brand: 'Square Pharma', category: 'prescription', dosageForm: 'capsule', strength: '400mg', requiresPrescription: true, basePrice: 300 },
  { name: 'Denvar 200', genericName: 'Cefixime', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'capsule', strength: '200mg', requiresPrescription: true, basePrice: 200 },
  { name: 'Cefotil 500', genericName: 'Cefuroxime', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg', requiresPrescription: true, basePrice: 260 },
  { name: 'Kilbac 500', genericName: 'Cefuroxime + Clavulanic Acid', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg', requiresPrescription: true, basePrice: 310 },
  { name: 'Ciprocin 500', genericName: 'Ciprofloxacin', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg', requiresPrescription: true, basePrice: 150 },
  { name: 'Neofloxin 500', genericName: 'Ciprofloxacin', brand: 'Beximco Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg', requiresPrescription: true, basePrice: 150 },
  { name: 'Levoxin 500', genericName: 'Levofloxacin', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg', requiresPrescription: true, basePrice: 150 },
  { name: 'Optimox 400', genericName: 'Moxifloxacin', brand: 'Aristopharma', category: 'prescription', dosageForm: 'tablet', strength: '400mg', requiresPrescription: true, basePrice: 280 },
  { name: 'Moxacil 500', genericName: 'Amoxicillin', brand: 'Square Pharma', category: 'prescription', dosageForm: 'capsule', strength: '500mg', requiresPrescription: true, basePrice: 75 },
  { name: 'Tyclav 625', genericName: 'Amoxicillin + Clavulanic Acid', brand: 'Beximco Pharma', category: 'prescription', dosageForm: 'tablet', strength: '625mg', requiresPrescription: true, basePrice: 190 },
  { name: 'Moxiclav 625', genericName: 'Amoxicillin + Clavulanic Acid', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '625mg', requiresPrescription: true, basePrice: 195 },
  { name: 'Fluclox 500', genericName: 'Flucloxacillin', brand: 'ACME Laboratories', category: 'prescription', dosageForm: 'capsule', strength: '500mg', requiresPrescription: true, basePrice: 110 },
  { name: 'Amodis 400', genericName: 'Metronidazole', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '400mg', requiresPrescription: true, basePrice: 20 },
  { name: 'Filmet 400', genericName: 'Metronidazole', brand: 'Sanofi', category: 'prescription', dosageForm: 'tablet', strength: '400mg', requiresPrescription: true, basePrice: 22 },
  { name: 'Doxycap 100', genericName: 'Doxycycline', brand: 'Renata Limited', category: 'prescription', dosageForm: 'capsule', strength: '100mg', requiresPrescription: true, basePrice: 30 },
  { name: 'Niftin 100', genericName: 'Nitrofurantoin', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'capsule', strength: '100mg', requiresPrescription: true, basePrice: 120 },
  { name: 'Almex 400', genericName: 'Albendazole', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '400mg', requiresPrescription: false, basePrice: 15 },
  { name: 'Scabo 6', genericName: 'Ivermectin', brand: 'Delta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '6mg', requiresPrescription: true, basePrice: 40 },
  { name: 'Flugal 50', genericName: 'Fluconazole', brand: 'Square Pharma', category: 'prescription', dosageForm: 'capsule', strength: '50mg', requiresPrescription: true, basePrice: 80 },
  { name: 'Flugal 150', genericName: 'Fluconazole', brand: 'Square Pharma', category: 'prescription', dosageForm: 'capsule', strength: '150mg', requiresPrescription: true, basePrice: 45 },

  // 4. Allergy, Cold, Cough & Asthma
  { name: 'Monas 10', genericName: 'Montelukast Sodium', brand: 'ACME Laboratories', category: 'prescription', dosageForm: 'tablet', strength: '10mg', requiresPrescription: true, basePrice: 175 },
  { name: 'Monas 4', genericName: 'Montelukast Sodium', brand: 'ACME Laboratories', category: 'prescription', dosageForm: 'tablet', strength: '4mg', requiresPrescription: true, basePrice: 90 },
  { name: 'Montair 10', genericName: 'Montelukast Sodium', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '10mg', requiresPrescription: true, basePrice: 170 },
  { name: 'Montene 10', genericName: 'Montelukast Sodium', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '10mg', requiresPrescription: true, basePrice: 175 },
  { name: 'Fexo 120', genericName: 'Fexofenadine HCl', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '120mg', requiresPrescription: false, basePrice: 80 },
  { name: 'Fexo 180', genericName: 'Fexofenadine HCl', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '180mg', requiresPrescription: false, basePrice: 100 },
  { name: 'Fenadin 120', genericName: 'Fexofenadine HCl', brand: 'Renata Limited', category: 'over-the-counter', dosageForm: 'tablet', strength: '120mg', requiresPrescription: false, basePrice: 80 },
  { name: 'Alatrol 10', genericName: 'Cetirizine Dihydrochloride', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '10mg', requiresPrescription: false, basePrice: 30 },
  { name: 'Rupa 10', genericName: 'Rupatadine', brand: 'Aristopharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '10mg', requiresPrescription: false, basePrice: 120 },
  { name: 'Bilasta 20', genericName: 'Bilastine', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '20mg', requiresPrescription: false, basePrice: 150 },
  { name: 'Deslor 5', genericName: 'Desloratadine', brand: 'Opsonin Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '5mg', requiresPrescription: false, basePrice: 40 },
  { name: 'Histacin', genericName: 'Chlorpheniramine Maleate', brand: 'Jayson Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '4mg', requiresPrescription: false, basePrice: 12 },
  { name: 'Tofen 1', genericName: 'Ketotifen', brand: 'Beximco Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '1mg', requiresPrescription: false, basePrice: 25 },
  { name: 'Basok Syrup', genericName: 'Herbal Adhatoda Vasica', brand: 'ACME Laboratories', category: 'over-the-counter', dosageForm: 'syrup', strength: '100ml', requiresPrescription: false, basePrice: 75 },
  { name: 'Adryl Syrup', genericName: 'Diphenhydramine', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'syrup', strength: '100ml', requiresPrescription: false, basePrice: 55 },
  { name: 'Tushka Syrup', genericName: 'Butamirate Citrate', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'syrup', strength: '100ml', requiresPrescription: false, basePrice: 95 },
  { name: 'Ambrox Syrup', genericName: 'Ambroxol HCl', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'syrup', strength: '100ml', requiresPrescription: false, basePrice: 50 },
  { name: 'Doxiva 200', genericName: 'Doxofylline', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '200mg', requiresPrescription: true, basePrice: 80 },
  { name: 'Sultolin Inhaler', genericName: 'Salbutamol', brand: 'Square Pharma', category: 'prescription', dosageForm: 'inhaler', strength: '100mcg', requiresPrescription: true, basePrice: 165 },
  { name: 'Azmasol Inhaler', genericName: 'Salbutamol', brand: 'Beximco Pharma', category: 'prescription', dosageForm: 'inhaler', strength: '100mcg', requiresPrescription: true, basePrice: 160 },
  { name: 'Bexitrol-F Inhaler', genericName: 'Salmeterol + Fluticasone', brand: 'Beximco Pharma', category: 'prescription', dosageForm: 'inhaler', strength: '25/250mcg', requiresPrescription: true, basePrice: 680 },
  { name: 'Antazol Nasal Drops', genericName: 'Xylometazoline HCl', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'drops', strength: '0.1%', requiresPrescription: false, basePrice: 25 },

  // 5. Cardiac, Blood Pressure & Cholesterol
  { name: 'Atova 10', genericName: 'Atorvastatin', brand: 'Beximco Pharma', category: 'prescription', dosageForm: 'tablet', strength: '10mg', requiresPrescription: true, basePrice: 90 },
  { name: 'Atova 20', genericName: 'Atorvastatin', brand: 'Beximco Pharma', category: 'prescription', dosageForm: 'tablet', strength: '20mg', requiresPrescription: true, basePrice: 120 },
  { name: 'Rosuva 5', genericName: 'Rosuvastatin', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '5mg', requiresPrescription: true, basePrice: 100 },
  { name: 'Rosuva 10', genericName: 'Rosuvastatin', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '10mg', requiresPrescription: true, basePrice: 145 },
  { name: 'Ecosprin 75', genericName: 'Aspirin', brand: 'ACME Laboratories', category: 'prescription', dosageForm: 'tablet', strength: '75mg', requiresPrescription: true, basePrice: 15 },
  { name: 'Clopid 75', genericName: 'Clopidogrel', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '75mg', requiresPrescription: true, basePrice: 140 },
  { name: 'Clont 75', genericName: 'Clopidogrel', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '75mg', requiresPrescription: true, basePrice: 140 },
  { name: 'Bizoran 5/20', genericName: 'Amlodipine + Olmesartan', brand: 'Beximco Pharma', category: 'prescription', dosageForm: 'tablet', strength: '5mg+20mg', requiresPrescription: true, basePrice: 160 },
  { name: 'Camlodin 5', genericName: 'Amlodipine', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '5mg', requiresPrescription: true, basePrice: 50 },
  { name: 'Amdocal 5', genericName: 'Amlodipine', brand: 'Beximco Pharma', category: 'prescription', dosageForm: 'tablet', strength: '5mg', requiresPrescription: true, basePrice: 50 },
  { name: 'Osartil 50', genericName: 'Losartan Potassium', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '50mg', requiresPrescription: true, basePrice: 90 },
  { name: 'Angilock 50', genericName: 'Losartan Potassium', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '50mg', requiresPrescription: true, basePrice: 90 },
  { name: 'Olmesan 20', genericName: 'Olmesartan Medoxomil', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '20mg', requiresPrescription: true, basePrice: 110 },
  { name: 'Telma 40', genericName: 'Telmisartan', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '40mg', requiresPrescription: true, basePrice: 120 },
  { name: 'Bisocor 2.5', genericName: 'Bisoprolol Fumarate', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '2.5mg', requiresPrescription: true, basePrice: 60 },
  { name: 'Bisocor 5', genericName: 'Bisoprolol Fumarate', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '5mg', requiresPrescription: true, basePrice: 90 },
  { name: 'Indever 10', genericName: 'Propranolol HCl', brand: 'ICI / Healthcare', category: 'prescription', dosageForm: 'tablet', strength: '10mg', requiresPrescription: true, basePrice: 15 },
  { name: 'Ramiril 5', genericName: 'Ramipril', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '5mg', requiresPrescription: true, basePrice: 90 },
  { name: 'Lasix 40', genericName: 'Furosemide', brand: 'Sanofi', category: 'prescription', dosageForm: 'tablet', strength: '40mg', requiresPrescription: true, basePrice: 20 },
  { name: 'Fusid Plus', genericName: 'Furosemide + Spironolactone', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '20mg+50mg', requiresPrescription: true, basePrice: 80 },
  { name: 'Nidocard Retard', genericName: 'Nitroglycerin', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '2.6mg', requiresPrescription: true, basePrice: 60 },

  // 6. Diabetes & Endocrine
  { name: 'Comet 500', genericName: 'Metformin HCl', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg', requiresPrescription: true, basePrice: 40 },
  { name: 'Comet 850', genericName: 'Metformin HCl', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '850mg', requiresPrescription: true, basePrice: 60 },
  { name: 'Metfo 500', genericName: 'Metformin HCl', brand: 'Beximco Pharma', category: 'prescription', dosageForm: 'tablet', strength: '500mg', requiresPrescription: true, basePrice: 40 },
  { name: 'Diamicron MR 30', genericName: 'Gliclazide', brand: 'Servier', category: 'prescription', dosageForm: 'tablet', strength: '30mg', requiresPrescription: true, basePrice: 220 },
  { name: 'Secrin 2', genericName: 'Glimepiride', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '2mg', requiresPrescription: true, basePrice: 70 },
  { name: 'Linaglip 5', genericName: 'Linagliptin', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '5mg', requiresPrescription: true, basePrice: 220 },
  { name: 'Linatab 5', genericName: 'Linagliptin', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '5mg', requiresPrescription: true, basePrice: 210 },
  { name: 'Empa 10', genericName: 'Empagliflozin', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '10mg', requiresPrescription: true, basePrice: 250 },
  { name: 'Siglita 50', genericName: 'Sitagliptin', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '50mg', requiresPrescription: true, basePrice: 200 },
  { name: 'Vildaglipt 50', genericName: 'Vildagliptin', brand: 'Renata Limited', category: 'prescription', dosageForm: 'tablet', strength: '50mg', requiresPrescription: true, basePrice: 160 },
  { name: 'Lantus SoloStar', genericName: 'Insulin Glargine', brand: 'Sanofi', category: 'prescription', dosageForm: 'injection', strength: '100IU/mL', requiresPrescription: true, basePrice: 890 },
  { name: 'Mixtard 30', genericName: 'Human Insulin', brand: 'Novo Nordisk', category: 'prescription', dosageForm: 'injection', strength: '100IU/mL', requiresPrescription: true, basePrice: 480 },
  { name: 'NovoMix 30 FlexPen', genericName: 'Insulin Aspart', brand: 'Novo Nordisk', category: 'prescription', dosageForm: 'injection', strength: '100IU/mL', requiresPrescription: true, basePrice: 760 },
  { name: 'Thyrox 50', genericName: 'Levothyroxine Sodium', brand: 'Renata Limited', category: 'prescription', dosageForm: 'tablet', strength: '50mcg', requiresPrescription: true, basePrice: 55 },

  // 7. Vitamins, Minerals & Supplements
  { name: 'Ceevit', genericName: 'Vitamin C (Ascorbic Acid)', brand: 'Square Pharma', category: 'supplement', dosageForm: 'tablet', strength: '250mg', requiresPrescription: false, basePrice: 22 },
  { name: 'Calbo-D', genericName: 'Calcium + Vitamin D3', brand: 'Square Pharma', category: 'supplement', dosageForm: 'tablet', strength: '500mg+200IU', requiresPrescription: false, basePrice: 110 },
  { name: 'Coralcal-D', genericName: 'Coral Calcium + Vitamin D3', brand: 'Radiant Pharma', category: 'supplement', dosageForm: 'tablet', strength: '500mg+200IU', requiresPrescription: false, basePrice: 160 },
  { name: 'Coralcal-DX', genericName: 'Coral Calcium + Vitamin D3', brand: 'Radiant Pharma', category: 'supplement', dosageForm: 'tablet', strength: '600mg+400IU', requiresPrescription: false, basePrice: 210 },
  { name: 'Neuro-B', genericName: 'Vitamin B1+B6+B12', brand: 'Square Pharma', category: 'supplement', dosageForm: 'tablet', strength: '100mg+200mg+200mcg', requiresPrescription: false, basePrice: 95 },
  { name: 'Bextrum Gold', genericName: 'Multivitamin + Multimineral', brand: 'Beximco Pharma', category: 'supplement', dosageForm: 'tablet', strength: 'A-Z Gold', requiresPrescription: false, basePrice: 360 },
  { name: 'Filwel Gold', genericName: 'Multivitamin + Multimineral', brand: 'Square Pharma', category: 'supplement', dosageForm: 'tablet', strength: 'A-Z Gold', requiresPrescription: false, basePrice: 360 },
  { name: 'Zif-CI', genericName: 'Iron + Folic Acid + Zinc', brand: 'Square Pharma', category: 'supplement', dosageForm: 'capsule', strength: 'Standard', requiresPrescription: false, basePrice: 45 },
  { name: 'Xinc 20', genericName: 'Zinc Sulfate', brand: 'Eskayef Pharma', category: 'supplement', dosageForm: 'tablet', strength: '20mg', requiresPrescription: false, basePrice: 35 },
  { name: 'D-Rise 20000', genericName: 'Cholecalciferol (Vitamin D3)', brand: 'Incepta Pharma', category: 'supplement', dosageForm: 'capsule', strength: '20000IU', requiresPrescription: false, basePrice: 160 },
  { name: 'D-Rise 40000', genericName: 'Cholecalciferol (Vitamin D3)', brand: 'Incepta Pharma', category: 'supplement', dosageForm: 'capsule', strength: '40000IU', requiresPrescription: false, basePrice: 280 },
  { name: 'E-Cap 400', genericName: 'Vitamin E (Alpha Tocopherol)', brand: 'Drug International', category: 'supplement', dosageForm: 'capsule', strength: '400IU', requiresPrescription: false, basePrice: 70 },
  { name: 'Folison 5', genericName: 'Folic Acid', brand: 'Jayson Pharma', category: 'supplement', dosageForm: 'tablet', strength: '5mg', requiresPrescription: false, basePrice: 15 },
  { name: 'Orsaline-N', genericName: 'Oral Rehydration Salts', brand: 'SMC', category: 'over-the-counter', dosageForm: 'other', strength: '10.25g', requiresPrescription: false, basePrice: 60 },
  { name: 'Tasty Saline', genericName: 'Oral Rehydration Salts', brand: 'SMC', category: 'over-the-counter', dosageForm: 'other', strength: 'Orange/Lemon', requiresPrescription: false, basePrice: 70 },

  // 8. Dermatology, Eye/Ear & Neurology
  { name: 'Pevisone Cream', genericName: 'Econazole + Triamcinolone', brand: 'Janssen / Radiant', category: 'prescription', dosageForm: 'cream', strength: '10g', requiresPrescription: true, basePrice: 145 },
  { name: 'Fungidal HC Cream', genericName: 'Miconazole + Hydrocortisone', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'cream', strength: '10g', requiresPrescription: false, basePrice: 65 },
  { name: 'Bactroban Ointment', genericName: 'Mupirocin', brand: 'GSK', category: 'prescription', dosageForm: 'cream', strength: '2% 10g', requiresPrescription: true, basePrice: 185 },
  { name: 'Burna Cream', genericName: 'Silver Sulfadiazine', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'cream', strength: '1% 25g', requiresPrescription: false, basePrice: 75 },
  { name: 'Lorix Plus Cream', genericName: 'Permethrin', brand: 'Opsonin Pharma', category: 'prescription', dosageForm: 'cream', strength: '5% 30g', requiresPrescription: true, basePrice: 65 },
  { name: 'Tearon Eye Drops', genericName: 'Carboxymethylcellulose', brand: 'Aristopharma', category: 'over-the-counter', dosageForm: 'drops', strength: '0.5% 10ml', requiresPrescription: false, basePrice: 110 },
  { name: 'Moxibac Eye Drops', genericName: 'Moxifloxacin', brand: 'Popular Pharma', category: 'prescription', dosageForm: 'drops', strength: '0.5% 5ml', requiresPrescription: true, basePrice: 120 },
  { name: 'Ciprocin Eye Drops', genericName: 'Ciprofloxacin', brand: 'Square Pharma', category: 'prescription', dosageForm: 'drops', strength: '0.3% 5ml', requiresPrescription: true, basePrice: 45 },
  { name: 'Epitra 0.5', genericName: 'Clonazepam', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '0.5mg', requiresPrescription: true, basePrice: 70 },
  { name: 'Nexito 10', genericName: 'Escitalopram', brand: 'Sun / Incepta', category: 'prescription', dosageForm: 'tablet', strength: '10mg', requiresPrescription: true, basePrice: 130 },
  { name: 'Serlin 50', genericName: 'Sertraline', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '50mg', requiresPrescription: true, basePrice: 90 },
  { name: 'Triptin 10', genericName: 'Amitriptyline HCl', brand: 'Square Pharma', category: 'prescription', dosageForm: 'tablet', strength: '10mg', requiresPrescription: true, basePrice: 20 },
  { name: 'Prelica 75', genericName: 'Pregabalin', brand: 'Square Pharma', category: 'prescription', dosageForm: 'capsule', strength: '75mg', requiresPrescription: true, basePrice: 180 },
  { name: 'Vertin 16', genericName: 'Betahistine Dihydrochloride', brand: 'Incepta Pharma', category: 'prescription', dosageForm: 'tablet', strength: '16mg', requiresPrescription: true, basePrice: 95 },
  { name: 'Cinaron 15', genericName: 'Cinnarizine', brand: 'Square Pharma', category: 'over-the-counter', dosageForm: 'tablet', strength: '15mg', requiresPrescription: false, basePrice: 20 },
];

// Core famous / high-demand medicines in Bangladesh stocked by EVERY store (normal + famous)
const FAMOUS_MEDICINE_NAMES = new Set([
  'napa', 'napa extra', 'napa extend', 'napa syrup', 'napa drops',
  'ace', 'ace plus', 'renova', 'fast', 'rolac 10', 'clofenac 50', 'naprox 500', 'naprox plus', 'etorix 90', 'algin 50',
  'seclo 20', 'seclo 40', 'sergel 20', 'sergel 40', 'maxpro 20', 'nexum 20', 'losectil 20', 'pantonix 20', 'finix 20',
  'entacyd plus', 'gavisol syrup', 'motigut 10', 'omidon 10', 'famotack 20',
  'azithro 500', 'zimax 500', 'cef-3 200', 'cefotil 500', 'ciprocin 500', 'levoxin 500', 'moxacil 500', 'tyclav 625',
  'amodis 400', 'filmet 400', 'almex 400', 'flugal 50', 'flugal 150',
  'monas 10', 'montair 10', 'fexo 120', 'fenadin 120', 'alatrol 10', 'histacin', 'basok syrup', 'adryl syrup',
  'ambrox syrup', 'sultolin inhaler', 'antazol nasal drops',
  'atova 10', 'atova 20', 'rosuva 10', 'ecosprin 75', 'clopid 75', 'bizoran 5/20', 'camlodin 5', 'osartil 50', 'bisocor 5', 'lasix 40',
  'comet 500', 'metfo 500', 'secrin 2', 'linaglip 5',
  'ceevit', 'calbo-d', 'coralcal-d', 'neuro-b', 'bextrum gold', 'filwel gold', 'zif-ci', 'xinc 20', 'd-rise 20000',
  'e-cap 400', 'orsaline-n', 'tasty saline',
  'fungidal hc cream', 'burna cream', 'tearon eye drops', 'ciprocin eye drops',
]);

// National flagship / famous chains that carry ALL medicine types
const FAMOUS_CHAINS = new Set([
  'lazz pharma',
  'tamanna pharmacy',
  'arogga pharmacy',
  'popular pharmacy',
  'model pharmacy',
]);

async function seedBDMedicines() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected.');

    // 1. Upsert all BD medicines
    const existingMeds = await Medicine.findAll({ raw: true });
    const existingByKey = new Map(
      existingMeds.map((m) => [`${m.name.toLowerCase()}|${(m.brand || '').toLowerCase()}`, m])
    );

    const toCreate = [];
    for (const m of BD_MEDICINES) {
      const key = `${m.name.toLowerCase()}|${m.brand.toLowerCase()}`;
      if (!existingByKey.has(key)) {
        toCreate.push({
          name: m.name,
          genericName: m.genericName,
          brand: m.brand,
          category: m.category,
          dosageForm: m.dosageForm,
          strength: m.strength,
          requiresPrescription: m.requiresPrescription,
          description: `${m.name} (${m.genericName} ${m.strength}) manufactured by ${m.brand}.`,
        });
      }
    }

    if (toCreate.length > 0) {
      await Medicine.bulkCreate(toCreate);
      console.log(`💊 Inserted ${toCreate.length} new Bangladesh medicines.`);
    } else {
      console.log('💊 All catalog medicines already exist.');
    }

    // Reload full medicines list with price map
    const allMeds = await Medicine.findAll({ raw: true });
    const priceByName = new Map(BD_MEDICINES.map((m) => [m.name.toLowerCase(), m.basePrice]));

    const famousMeds = allMeds.filter((m) => FAMOUS_MEDICINE_NAMES.has(m.name.toLowerCase()));
    const specialtyMeds = allMeds.filter((m) => !FAMOUS_MEDICINE_NAMES.has(m.name.toLowerCase()));

    // 2. Tiered Stocking:
    //    - Famous national chains (Lazz, Tamanna, Arogga, Popular, Model): ALL medicines (100% catalog)
    //    - City-local multi-branch stores (Central Pharma, Health Mart): ALL famous medicines + 40 specialty medicines
    //    - Normal independent stores: ALL famous medicines + 18 rotating local medicines
    const pharmacies = await Pharmacy.findAll({
      where: { status: 'approved' },
      attributes: ['id', 'name', 'chainName', 'city'],
      raw: true,
    });

    const existingInv = await PharmacyInventory.findAll({
      attributes: ['pharmacyId', 'medicineId'],
      raw: true,
    });
    const existingPairs = new Set(existingInv.map((r) => `${r.pharmacyId}-${r.medicineId}`));

    const newInventoryRows = [];
    let famousStoreCount = 0;
    let regionalStoreCount = 0;
    let normalStoreCount = 0;

    pharmacies.forEach((branch, bIdx) => {
      const chainLower = (branch.chainName || '').toLowerCase();
      const nameLower = (branch.name || '').toLowerCase();
      const isFamousStore =
        FAMOUS_CHAINS.has(chainLower) ||
        Array.from(FAMOUS_CHAINS).some((fc) => nameLower.includes(fc));
      const isRegionalChain =
        !isFamousStore &&
        (nameLower.includes('central pharma') || nameLower.includes('health mart'));

      let targetMeds = [];
      let baseStockMin = 20;
      let stockSpread = 60;

      if (isFamousStore) {
        famousStoreCount++;
        targetMeds = allMeds; // Famous stores stock ALL medicine types
        baseStockMin = 45;
        stockSpread = 120;
      } else if (isRegionalChain) {
        regionalStoreCount++;
        const extra = [];
        for (let k = 0; k < Math.min(40, specialtyMeds.length); k++) {
          extra.push(specialtyMeds[(bIdx * 5 + k * 2) % specialtyMeds.length]);
        }
        targetMeds = [...famousMeds, ...extra];
        baseStockMin = 30;
        stockSpread = 80;
      } else {
        normalStoreCount++;
        const extra = [];
        for (let k = 0; k < Math.min(18, specialtyMeds.length); k++) {
          extra.push(specialtyMeds[(bIdx * 7 + k * 3) % specialtyMeds.length]);
        }
        targetMeds = [...famousMeds, ...extra];
        baseStockMin = 15;
        stockSpread = 55;
      }

      for (const med of targetMeds) {
        const key = `${branch.id}-${med.id}`;
        if (existingPairs.has(key)) continue;
        existingPairs.add(key);

        const basePrice = priceByName.get(med.name.toLowerCase()) || 80;
        const variance = ((bIdx + med.id) % 5) - 2;
        const price = Math.max(8, basePrice + variance);
        const stock = baseStockMin + ((bIdx * 13 + med.id * 7) % stockSpread);

        newInventoryRows.push({
          pharmacyId: branch.id,
          medicineId: med.id,
          price: Number(price.toFixed(2)),
          stock,
          availability: true,
          minStockLevel: 10,
        });
      }
    });

    // Bulk insert in chunks of 1000 for speed & stability over remote Pooler
    const CHUNK_SIZE = 1000;
    for (let i = 0; i < newInventoryRows.length; i += CHUNK_SIZE) {
      const chunk = newInventoryRows.slice(i, i + CHUNK_SIZE);
      await PharmacyInventory.bulkCreate(chunk, { ignoreDuplicates: true });
    }

    const finalMedCount = await Medicine.count();
    const finalInvCount = await PharmacyInventory.count();

    console.log(
      `🏥 Tiered stocking complete: ${famousStoreCount} Famous stores (ALL ${allMeds.length} medicines) | ${regionalStoreCount} Regional chains | ${normalStoreCount} Normal stores (all ${famousMeds.length} famous medicines + local stock).`
    );
    console.log(`📦 Added ${newInventoryRows.length} new inventory rows.`);
    console.log(`✅ TOTAL IN DATABASE: ${finalMedCount} medicines | ${finalInvCount} live pharmacy inventory listings.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ BD Medicines seed failed:', error);
    process.exit(1);
  }
}

seedBDMedicines();
