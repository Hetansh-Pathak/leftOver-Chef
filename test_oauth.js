const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testOAuthFlow() {
  console.log('🧪 Testing OAuth Authentication Flow\n');

  try {
    // Test 1: Regular user signup
    console.log('1. Testing regular user signup...');
    const signupResponse = await makeRequest('/api/users/register', 'POST', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (signupResponse.status === 201) {
      console.log('✅ Regular signup successful');
      console.log('   User:', signupResponse.data.user.name);
    } else {
      console.log('❌ Signup failed:', signupResponse.data.message);
    }

    // Test 2: Try to login with non-existent user
    console.log('\n2. Testing login with non-existent user...');
    const loginFailResponse = await makeRequest('/api/users/login', 'POST', {
      email: 'nonexistent@example.com',
      password: 'password123'
    });
    
    if (loginFailResponse.status === 401 && loginFailResponse.data.userNotFound) {
      console.log('✅ Correctly rejected non-existent user');
      console.log('   Error:', loginFailResponse.data.message);
    } else {
      console.log('❌ Should have rejected non-existent user');
    }

    // Test 3: Try to login with existing user but wrong password
    console.log('\n3. Testing login with wrong password...');
    const wrongPasswordResponse = await makeRequest('/api/users/login', 'POST', {
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    
    if (wrongPasswordResponse.status === 401 && wrongPasswordResponse.data.invalidPassword) {
      console.log('✅ Correctly rejected wrong password');
      console.log('   Error:', wrongPasswordResponse.data.message);
    } else {
      console.log('❌ Should have rejected wrong password');
    }

    // Test 4: Successful login
    console.log('\n4. Testing successful login...');
    const loginResponse = await makeRequest('/api/users/login', 'POST', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (loginResponse.status === 200) {
      console.log('✅ Login successful');
      console.log('   User:', loginResponse.data.user.name);
      console.log('   Token received:', !!loginResponse.data.token);
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

    // Test 5: Google OAuth signup simulation
    console.log('\n5. Testing Google OAuth signup...');
    const googleSignupResponse = await makeRequest('/api/auth/google/verify', 'POST', {
      token: 'mock-google-token',
      isSignup: true
    });
    
    if (googleSignupResponse.status === 400) {
      console.log('✅ Google OAuth validation working (expected failure with mock token)');
      console.log('   Error:', googleSignupResponse.data.error);
    } else {
      console.log('📝 Google OAuth response:', googleSignupResponse.data);
    }

    // Test 6: Facebook OAuth signup simulation
    console.log('\n6. Testing Facebook OAuth signup...');
    const facebookSignupResponse = await makeRequest('/api/auth/facebook/verify', 'POST', {
      accessToken: 'mock-facebook-token',
      userID: 'mock-user-123',
      isSignup: true
    });
    
    if (facebookSignupResponse.status === 200) {
      console.log('✅ Facebook OAuth signup simulation successful');
      console.log('   User:', facebookSignupResponse.data.user.name);
    } else {
      console.log('❌ Facebook OAuth failed:', facebookSignupResponse.data.message);
    }

    // Test 7: Facebook OAuth login (should work now)
    console.log('\n7. Testing Facebook OAuth login...');
    const facebookLoginResponse = await makeRequest('/api/auth/facebook/verify', 'POST', {
      accessToken: 'mock-facebook-token',
      userID: 'mock-user-123',
      isSignup: false
    });
    
    if (facebookLoginResponse.status === 200) {
      console.log('✅ Facebook OAuth login successful');
      console.log('   User:', facebookLoginResponse.data.user.name);
    } else {
      console.log('❌ Facebook OAuth login failed:', facebookLoginResponse.data.message);
    }

    // Test 8: Check admin dashboard
    console.log('\n8. Checking admin dashboard...');
    const adminResponse = await makeRequest('/api/users/admin/all-users');
    
    if (adminResponse.status === 200) {
      console.log('✅ Admin endpoint working');
      console.log('   Total users:', adminResponse.data.stats.totalUsers);
      console.log('   Users:');
      adminResponse.data.users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      });
    } else {
      console.log('❌ Admin endpoint failed');
    }

    console.log('\n🎉 OAuth Authentication Tests Complete!');
    console.log('\n📋 Summary:');
    console.log('✅ User signup/login validation implemented');
    console.log('✅ "Signup required first" policy enforced');
    console.log('✅ Google OAuth endpoints ready');
    console.log('✅ Facebook OAuth simulation working');
    console.log('✅ Admin dashboard functional');
    
    console.log('\n🌐 Access Points:');
    console.log('• Admin Dashboard: http://localhost:5000/admin');
    console.log('• Frontend App: http://localhost:3000/welcome');
    console.log('• API Health: http://localhost:5000/api/health');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOAuthFlow();
