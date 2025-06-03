// Comprehensive API test to verify all CRUD operations work
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const testCRUDOperations = async () => {
  console.log('🔧 Testing complete CRUD operations...\n');
  
  try {
    // 1. Test GET all students
    console.log('1️⃣ Testing GET /api/students...');
    const getResponse = await axios.get(`${API_BASE}/students`);
    console.log(`✅ GET: Retrieved ${getResponse.data.count} students`);
    console.log(`   Sample: ${getResponse.data.data[0]?.name} (${getResponse.data.data[0]?.email})\n`);
    
    // 2. Test POST - Create new student
    console.log('2️⃣ Testing POST /api/students...');
    const newStudent = {
      name: 'Test Student Integration',
      email: 'test.integration@example.com',
      studentId: 'TEST001',
      tingkat: '10',
      kelas: '10C',
      academicStatus: 'good',
      program: 'Integration Test'
    };
    
    const postResponse = await axios.post(`${API_BASE}/students`, newStudent);
    const createdStudentId = postResponse.data.id;
    console.log(`✅ POST: Created student with ID ${createdStudentId}`);
    console.log(`   Name: ${postResponse.data.name}\n`);
    
    // 3. Test GET single student
    console.log('3️⃣ Testing GET /api/students/{id}...');
    const getSingleResponse = await axios.get(`${API_BASE}/students/${createdStudentId}`);
    console.log(`✅ GET by ID: Retrieved ${getSingleResponse.data.name}`);
    console.log(`   Email: ${getSingleResponse.data.email}\n`);
    
    // 4. Test PUT - Update student
    console.log('4️⃣ Testing PUT /api/students/{id}...');
    const updateData = {
      name: 'Updated Test Student',
      email: 'updated.test@example.com',
      academicStatus: 'warning'
    };
    
    const putResponse = await axios.put(`${API_BASE}/students/${createdStudentId}`, updateData);
    console.log(`✅ PUT: Updated student - ${putResponse.data.name}`);
    console.log(`   New status: ${putResponse.data.academicStatus}\n`);
    
    // 5. Test filtering
    console.log('5️⃣ Testing filtering by tingkat...');
    const filterResponse = await axios.get(`${API_BASE}/students`, {
      params: { tingkat: '10' }
    });
    console.log(`✅ FILTER: Found ${filterResponse.data.count} students in tingkat 10\n`);
    
    // 6. Test DELETE - Clean up
    console.log('6️⃣ Testing DELETE /api/students/{id}...');
    const deleteResponse = await axios.delete(`${API_BASE}/students/${createdStudentId}`);
    console.log(`✅ DELETE: Removed test student\n`);
    
    console.log('🎉 ALL CRUD OPERATIONS SUCCESSFUL!');
    console.log('✅ Frontend integration should be fully functional');
    
  } catch (error) {
    console.error('❌ CRUD Test FAILED:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

testCRUDOperations();
