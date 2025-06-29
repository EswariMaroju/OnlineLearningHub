// Test script for authentication debugging
// Run this with: node test-auth.js

const axios = require('axios');

const BASE_URL = 'http://localhost:8000'; // Adjust if your backend runs on different port

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test 1: Check if server is running
    console.log('\n1. Testing server connection...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/user/getallcourses`);
      console.log('Server is running, got response:', healthResponse.status);
    } catch (error) {
      console.error('Server connection failed:', error.message);
      console.log('Make sure your backend is running on port 8000');
      return;
    }
    
    // Test 2: Test admin login (hardcoded in backend)
    console.log('\n2. Testing admin login...');
    const adminLoginData = {
      email: 'admin@gmail.com',
      password: 'admin@123'
    };
    
    try {
      const adminLoginResponse = await axios.post(`${BASE_URL}/api/user/login`, adminLoginData);
      console.log('Admin login response:', adminLoginResponse.data);
      
      if (adminLoginResponse.data.success) {
        const adminToken = adminLoginResponse.data.token;
        console.log('Admin token received:', adminToken ? 'Token exists' : 'No token');
        
        // Test 3: Test admin authenticated endpoint
        console.log('\n3. Testing admin authenticated endpoint...');
        try {
          const authResponse = await axios.get(`${BASE_URL}/api/admin/getallusers`, {
            headers: {
              'Authorization': `Bearer ${adminToken}`
            }
          });
          console.log('Admin authenticated request successful:', authResponse.status);
        } catch (authError) {
          console.error('Admin authenticated request failed:', authError.response?.data || authError.message);
        }
      }
    } catch (adminLoginError) {
      console.error('Admin login failed:', adminLoginError.response?.data || adminLoginError.message);
    }
    
    // Test 4: Try to register a test user
    console.log('\n4. Testing user registration...');
    const registerData = {
      name: 'Test Teacher',
      email: 'testteacher@example.com',
      password: 'password123',
      type: 'Teacher'
    };
    
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/user/register`, registerData);
      console.log('Registration response:', registerResponse.data);
    } catch (registerError) {
      console.log('Registration result:', registerError.response?.data || registerError.message);
    }
    
    // Test 5: Test teacher login
    console.log('\n5. Testing teacher login...');
    const teacherLoginData = {
      email: 'testteacher@example.com',
      password: 'password123'
    };
    
    try {
      const teacherLoginResponse = await axios.post(`${BASE_URL}/api/user/login`, teacherLoginData);
      console.log('Teacher login response:', teacherLoginResponse.data);
      
      if (teacherLoginResponse.data.success) {
        const teacherToken = teacherLoginResponse.data.token;
        console.log('Teacher token received:', teacherToken ? 'Token exists' : 'No token');
        
        // Test 6: Test teacher authenticated endpoint
        console.log('\n6. Testing teacher authenticated endpoint...');
        try {
          const authResponse = await axios.get(`${BASE_URL}/api/user/getallcoursesteacher`, {
            headers: {
              'Authorization': `Bearer ${teacherToken}`
            }
          });
          console.log('Teacher authenticated request successful:', authResponse.status);
        } catch (authError) {
          console.error('Teacher authenticated request failed:', authError.response?.data || authError.message);
        }
      }
    } catch (teacherLoginError) {
      console.error('Teacher login failed:', teacherLoginError.response?.data || teacherLoginError.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testAuth(); 