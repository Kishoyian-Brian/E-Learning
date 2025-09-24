const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Test data
const testData = {
  admin: {
    email: 'admin@example.com',
    password: 'password123'
  },
  instructor: {
    email: 'instructor@example.com', 
    password: 'password123'
  },
  student: {
    email: 'maxmillianmuiruri@gmail.com',
    password: 'password123'
  }
};

let tokens = {};

async function login() {
  console.log('🔐 Logging in users...');
  
  for (const [role, credentials] of Object.entries(testData)) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
      tokens[role] = response.data.access_token;
      console.log(`✅ ${role} logged in successfully`);
    } catch (error) {
      console.error(`❌ Failed to login ${role}:`, error.response?.data || error.message);
    }
  }
}

async function testCertificateEndpoints() {
  console.log('\n🎓 Testing Certificate Endpoints...');
  
  // Test 1: Get all certificates (admin only)
  try {
    const response = await axios.get(`${BASE_URL}/certificates`, {
      headers: { Authorization: `Bearer ${tokens.admin}` }
    });
    console.log('✅ Get all certificates (admin):', response.data.length, 'certificates found');
  } catch (error) {
    console.error('❌ Get all certificates failed:', error.response?.data || error.message);
  }

  // Test 2: Get my certificates (student)
  try {
    const response = await axios.get(`${BASE_URL}/certificates/my-certificates`, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    console.log('✅ Get my certificates (student):', response.data.length, 'certificates found');
  } catch (error) {
    console.error('❌ Get my certificates failed:', error.response?.data || error.message);
  }

  // Test 3: Create a test certificate (instructor)
  try {
    const certificateData = {
      userId: 'student-user-id', // This would be a real student ID
      courseId: 'course-id',     // This would be a real course ID
      enrollmentId: 'enrollment-id', // This would be a real enrollment ID
      type: 'COMPLETION',
      metadata: {
        achievement: 'Test Certificate',
        grade: 'A+'
      }
    };
    
    const response = await axios.post(`${BASE_URL}/certificates`, certificateData, {
      headers: { 
        Authorization: `Bearer ${tokens.instructor}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Create certificate (instructor): Certificate created with ID:', response.data.id);
  } catch (error) {
    console.error('❌ Create certificate failed:', error.response?.data || error.message);
  }

  // Test 4: Verify certificate (public endpoint)
  try {
    const response = await axios.get(`${BASE_URL}/certificates/verify/test-verification-code`);
    console.log('✅ Verify certificate (public):', response.data.isValid ? 'Valid' : 'Invalid');
  } catch (error) {
    console.error('❌ Verify certificate failed:', error.response?.data || error.message);
  }
}

async function testProgressWithCertificateGeneration() {
  console.log('\n📊 Testing Progress with Certificate Generation...');
  
  // Test course progress (this should trigger certificate generation if course is completed)
  try {
    const response = await axios.get(`${BASE_URL}/progress/course/test-enrollment-id`, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    console.log('✅ Get course progress:', {
      courseTitle: response.data.courseTitle,
      moduleProgress: `${response.data.completedModules}/${response.data.totalModules}`,
      quizProgress: `${response.data.passedQuizzes}/${response.data.totalQuizzes}`,
      overallProgress: `${response.data.overallProgressPercentage.toFixed(1)}%`,
      isCourseCompleted: response.data.isCourseCompleted
    });
  } catch (error) {
    console.error('❌ Get course progress failed:', error.response?.data || error.message);
  }
}

async function testErrorHandling() {
  console.log('\n🚫 Testing Error Handling...');
  
  // Test 1: Try to create certificate without permission (student)
  try {
    await axios.post(`${BASE_URL}/certificates`, {
      userId: 'test',
      courseId: 'test',
      enrollmentId: 'test',
      type: 'COMPLETION'
    }, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    console.log('❌ Student was able to create certificate (should be forbidden)');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Student correctly forbidden from creating certificates');
    } else {
      console.error('❌ Unexpected error for student certificate creation:', error.response?.data);
    }
  }

  // Test 2: Try to access certificate with invalid ID
  try {
    await axios.get(`${BASE_URL}/certificates/invalid-id`, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    console.log('❌ Was able to access invalid certificate (should be not found)');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Invalid certificate correctly returns not found');
    } else {
      console.error('❌ Unexpected error for invalid certificate:', error.response?.data);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Certificate System Tests...\n');
  
  await login();
  await testCertificateEndpoints();
  await testProgressWithCertificateGeneration();
  await testErrorHandling();
  
  console.log('\n✨ Certificate system tests completed!');
}

// Run the tests
runTests().catch(console.error); 