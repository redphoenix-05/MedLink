require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const testMedicineAPI = async () => {
  try {
    console.log('Testing Medicine API...');
    
    // Test server connectivity
    console.log('1. Testing server connectivity...');
    const healthCheck = await axios.get('http://localhost:5000/api/medicines').catch(err => {
      console.log('Server connection test result:', err.code);
      throw err;
    });
    console.log('✅ Server is responding');
    
    // First, let's test login to get a token
    console.log('2. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'pharmacy@test.com',
      password: 'pharmacy123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, got token');
    
    // Now test adding a medicine
    console.log('3. Testing medicine creation...');
    const medicineData = {
      name: 'Test Medicine API',
      genericName: 'Test Generic',
      brand: 'Test Brand',
      category: 'prescription',
      description: 'Test description',
      dosageForm: 'tablet',
      strength: '100mg',
      requiresPrescription: true
    };
    
    const medicineResponse = await axios.post('http://localhost:5000/api/medicines', medicineData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Medicine added successfully:', medicineResponse.data);
    
  } catch (error) {
    console.error('❌ Error testing API:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('No response received');
    }
  }
};

testMedicineAPI();