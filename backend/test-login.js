const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testLogin() {
  try {
    console.log('🔐 Testing login functionality...\n');
    
    // Test instructor login
    console.log('👨‍🏫 Testing instructor login...');
    const instructorResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'instructor@edusoma.com',
      password: 'password123'
    });
    
    console.log('✅ Instructor login successful!');
    console.log('Token:', instructorResponse.data.access_token);
    console.log('User:', instructorResponse.data.user);
    
    // Test admin login
    console.log('\n👨‍💼 Testing admin login...');
    const adminResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@edusoma.com',
      password: 'password123'
    });
    
    console.log('✅ Admin login successful!');
    console.log('Token:', adminResponse.data.access_token);
    console.log('User:', adminResponse.data.user);
    
    // Test accessing protected route with instructor token
    console.log('\n🔒 Testing protected route access...');
    const instructorToken = instructorResponse.data.access_token;
    const coursesResponse = await axios.get(`${BASE_URL}/courses/my-courses`, {
      headers: {
        'Authorization': `Bearer ${instructorToken}`
      }
    });
    
    console.log('✅ Protected route access successful!');
    console.log('My courses:', coursesResponse.data);
    
  } catch (error) {
    console.error('❌ Login test failed:', error.response?.data || error.message);
  }
}

testLogin(); 