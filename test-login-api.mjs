import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testLogin() {
  try {
    console.log('🔐 Testing login API...\n');
    
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    console.log('📤 Sending login request to', `${API_URL}/api/auth/login`);
    console.log('📝 Payload:', loginData, '\n');

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers));

    const text = await response.text();
    console.log('\n📋 Response body (raw):', text);

    try {
      const data = JSON.parse(text);
      console.log('\n✅ Response (parsed):', JSON.stringify(data, null, 2));
      
      if (response.ok && data.token) {
        console.log('\n✅ LOGIN SUCCESS!');
        console.log(`   Token: ${data.token.substring(0, 50)}...`);
        console.log(`   User: ${data.name} (${data.email})`);
      } else {
        console.log('\n❌ LOGIN FAILED');
        console.log(`   Message: ${data.message}`);
      }
    } catch (e) {
      console.log('\n❌ Failed to parse JSON response');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
