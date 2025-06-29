// Test script for course update functionality
// Run this with: node test-course-update.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000'; // Adjust if your backend runs on different port

async function testCourseUpdate() {
  try {
    console.log('Testing course update functionality...');
    
    // First, let's test the debug endpoint
    console.log('\n1. Testing debug endpoint...');
    const formData = new FormData();
    formData.append('courseId', 'test-course-id');
    formData.append('C_title', 'Test Course Title');
    formData.append('C_categories', 'IT & Software');
    formData.append('S_title', 'Test Section');
    formData.append('S_description', 'Test Section Description');
    
    const debugResponse = await axios.post(`${BASE_URL}/api/user/debug-course-update`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      }
    });
    
    console.log('Debug endpoint response:', debugResponse.data);
    
    // Now test the actual edit endpoint
    console.log('\n2. Testing actual edit endpoint...');
    const editResponse = await axios.post(`${BASE_URL}/api/user/editcourse`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      }
    });
    
    console.log('Edit endpoint response:', editResponse.data);
    
  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Run the test
testCourseUpdate(); 