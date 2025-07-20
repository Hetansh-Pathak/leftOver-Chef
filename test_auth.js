const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAuthenticationFlow() {
  console.log('🧪 Testing Leftover Chef Authentication Flow\n');
  
  try {
    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${BASE_URL}/users/register`, {
      name: 'John Chef',
      email: 'john@example.com',
      password: 'password123',
      cookingSkillLevel: 'Intermediate'
    });
    
    console.log('✅ Registration successful!');
    console.log('   User:', registerResponse.data.user.name);
    console.log('   Token received:', registerResponse.data.token ? 'Yes' : 'No');
    
    const userToken = registerResponse.data.token;
    
    // Test 2: Login with the same user
    console.log('\n2. Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: 'john@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('   User:', loginResponse.data.user.name);
    console.log('   Level:', loginResponse.data.user.level);
    console.log('   Points:', loginResponse.data.user.points);
    
    // Test 3: Register another user
    console.log('\n3. Registering second user...');
    await axios.post(`${BASE_URL}/users/register`, {
      name: 'Maria Foodie',
      email: 'maria@example.com',
      password: 'secure456',
      cookingSkillLevel: 'Beginner'
    });
    
    console.log('✅ Second user registered!');
    
    // Test 4: Check admin endpoint
    console.log('\n4. Checking admin dashboard...');
    const adminResponse = await axios.get(`${BASE_URL}/users/admin/all-users`);
    
    console.log('✅ Admin endpoint working!');
    console.log('   Total users:', adminResponse.data.stats.totalUsers);
    console.log('   Users list:');
    adminResponse.data.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Level ${user.level}`);
    });
    
    // Test 5: Test duplicate registration
    console.log('\n5. Testing duplicate email registration...');
    try {
      await axios.post(`${BASE_URL}/users/register`, {
        name: 'John Duplicate',
        email: 'john@example.com',
        password: 'different123'
      });
      console.log('❌ Should have failed!');
    } catch (error) {
      console.log('✅ Correctly rejected duplicate email');
      console.log('   Error:', error.response.data.message);
    }
    
    // Test 6: Test wrong password login
    console.log('\n6. Testing wrong password login...');
    try {
      await axios.post(`${BASE_URL}/users/login`, {
        email: 'john@example.com',
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed!');
    } catch (error) {
      console.log('✅ Correctly rejected wrong password');
      console.log('   Error:', error.response.data.message);
    }
    
    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📊 Final Statistics:');
    const finalStats = await axios.get(`${BASE_URL}/users/admin/all-users`);
    console.log('   Total Users:', finalStats.data.stats.totalUsers);
    console.log('   Active Users:', finalStats.data.stats.activeUsers);
    console.log('   Recent Registrations:', finalStats.data.stats.recentRegistrations);
    
    console.log('\n🌐 You can view the admin dashboard at: http://localhost:5000/admin');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
testAuthenticationFlow();
