const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testLogin() {
  console.log('🧪 Testing Login Functionality...\n');

  // Test demo user login
  try {
    console.log('1. Testing demo user login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
      email: 'demo@example.com',
      password: 'password123'
    });

    if (loginResponse.status === 200) {
      console.log('✅ Demo user login successful!');
      console.log(`   User: ${loginResponse.data.user.name}`);
      console.log(`   Email: ${loginResponse.data.user.email}`);
      console.log(`   Token received: ${loginResponse.data.token ? 'Yes' : 'No'}`);
    }
  } catch (error) {
    console.log('❌ Demo user login failed!');
    console.log(`   Status: ${error.response?.status || 'No response'}`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
  }

  // Test chef user login
  try {
    console.log('\n2. Testing chef user login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
      email: 'chef@test.com',
      password: 'chef123'
    });

    if (loginResponse.status === 200) {
      console.log('✅ Chef user login successful!');
      console.log(`   User: ${loginResponse.data.user.name}`);
      console.log(`   Email: ${loginResponse.data.user.email}`);
      console.log(`   Token received: ${loginResponse.data.token ? 'Yes' : 'No'}`);
    }
  } catch (error) {
    console.log('❌ Chef user login failed!');
    console.log(`   Status: ${error.response?.status || 'No response'}`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
  }

  // Test invalid user login
  try {
    console.log('\n3. Testing invalid user login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });
  } catch (error) {
    console.log('✅ Invalid user login correctly rejected!');
    console.log(`   Status: ${error.response?.status || 'No response'}`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
  }

  // Test invalid password
  try {
    console.log('\n4. Testing invalid password...');
    const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
      email: 'demo@example.com',
      password: 'wrongpassword'
    });
  } catch (error) {
    console.log('✅ Invalid password correctly rejected!');
    console.log(`   Status: ${error.response?.status || 'No response'}`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
  }

  console.log('\n🎉 Login testing completed!');
}

// Run the test
testLogin().catch(console.error);
