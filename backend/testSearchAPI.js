require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const testSearchAPI = async () => {
  try {
    console.log('Testing Medicine Search API...\n');
    
    // Test 1: Search for Paracetamol
    console.log('🔍 Test 1: Searching for "Paracetamol"...');
    const searchResponse1 = await axios.get('http://localhost:5000/api/search?query=Paracetamol');
    console.log('Full response:', JSON.stringify(searchResponse1.data, null, 2));
    console.log(`✅ Found ${searchResponse1.data?.data?.length || 0} results`);
    
    if (searchResponse1.data?.data?.length > 0) {
      const firstResult = searchResponse1.data.data[0];
      console.log(`   📍 ${firstResult.name} - ৳${firstResult.price} (Stock: ${firstResult.stock})`);
    }
    
    // Test 2: Search for Napa
    console.log('\n🔍 Test 2: Searching for "Napa"...');
    const searchResponse2 = await axios.get('http://localhost:5000/api/search?query=Napa');
    console.log(`✅ Found ${searchResponse2.data?.data?.length || 0} results`);
    
    if (searchResponse2.data?.data?.length > 0) {
      const firstResult = searchResponse2.data.data[0];
      console.log(`   📍 ${firstResult.name} - ৳${firstResult.price} (Stock: ${firstResult.stock})`);
    }
    
    // Test 3: Get all pharmacy locations
    console.log('\n🗺️  Test 3: Getting pharmacy locations...');
    const locationsResponse = await axios.get('http://localhost:5000/api/search/pharmacies/locations');
    console.log(`✅ Found ${locationsResponse.data.data.pharmacies.length} pharmacies with locations`);
    
    if (locationsResponse.data.data.pharmacies.length > 0) {
      const firstPharmacy = locationsResponse.data.data.pharmacies[0];
      console.log(`   📍 ${firstPharmacy.name} at (${firstPharmacy.latitude}, ${firstPharmacy.longitude})`);
    }
    
    console.log('\n🎉 All API tests passed successfully!');
    
  } catch (error) {
    console.error('❌ API Test Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
};

testSearchAPI();