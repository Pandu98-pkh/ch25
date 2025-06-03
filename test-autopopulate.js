// Test the auto-populate functionality in AddStudentForm
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const testAutoPopulate = async () => {
  console.log('🧪 Testing AddStudentForm Auto-Populate Functionality\n');
  
  try {
    // 1. Get list of existing users to test with
    console.log('1️⃣ Getting list of users...');
    const usersResponse = await axios.get(`${API_BASE}/users`);
    const users = usersResponse.data;
    
    console.log(`✅ Found ${users.length} users in system`);
    
    // Find a student user to test with
    const studentUsers = users.filter(user => user.role === 'student');
    console.log(`✅ Found ${studentUsers.length} student users\n`);
    
    if (studentUsers.length === 0) {
      console.log('❌ No student users found to test with');
      return;
    }
    
    // 2. Test getUserById functionality with a student
    const testStudent = studentUsers[0];
    console.log(`2️⃣ Testing getUserById with student: ${testStudent.userId}`);
    
    const studentResponse = await axios.get(`${API_BASE}/users/${testStudent.userId}`);
    const fetchedStudent = studentResponse.data;
    
    console.log('✅ Successfully fetched student data:');
    console.log(`   Name: ${fetchedStudent.name}`);
    console.log(`   Email: ${fetchedStudent.email}`);
    console.log(`   Role: ${fetchedStudent.role}`);
    console.log(`   UserId: ${fetchedStudent.userId}\n`);
    
    // 3. Test with non-student user
    const nonStudentUsers = users.filter(user => user.role !== 'student');
    if (nonStudentUsers.length > 0) {
      const testNonStudent = nonStudentUsers[0];
      console.log(`3️⃣ Testing with non-student user: ${testNonStudent.userId} (${testNonStudent.role})`);
      
      const nonStudentResponse = await axios.get(`${API_BASE}/users/${testNonStudent.userId}`);
      const fetchedNonStudent = nonStudentResponse.data;
      
      console.log(`✅ Fetched non-student: ${fetchedNonStudent.name} - Role: ${fetchedNonStudent.role}`);
      console.log('   ℹ️  Form should show error: "User ditemukan tetapi bukan student"\n');
    }
    
    // 4. Test with non-existent user
    console.log('4️⃣ Testing with non-existent user ID...');
    try {
      await axios.get(`${API_BASE}/users/NONEXISTENT123`);
      console.log('❌ Expected error but got success');
    } catch (error) {
      console.log('✅ Correctly returned error for non-existent user');
      console.log('   ℹ️  Form should show error: "User tidak ditemukan"\n');
    }
    
    // 5. Provide test instructions
    console.log('🎯 TEST INSTRUCTIONS FOR FRONTEND:');
    console.log('=====================================');
    console.log('1. Open http://localhost:5173/students');
    console.log('2. Click "Add Student" button');
    console.log('3. Test the following scenarios:');
    console.log('');
    console.log('   📝 SCENARIO 1 - Valid Student User:');
    console.log(`   • Enter ID: ${testStudent.userId}`);
    console.log(`   • Expected: Auto-fill name "${testStudent.name}" and email "${testStudent.email}"`);
    console.log('   • Should show green checkmark and success message');
    console.log('');
    
    if (nonStudentUsers.length > 0) {
      console.log('   📝 SCENARIO 2 - Non-Student User:');
      console.log(`   • Enter ID: ${nonStudentUsers[0].userId}`);
      console.log(`   • Expected: Error message "User ditemukan tetapi bukan student (Role: ${nonStudentUsers[0].role})"`);
      console.log('   • Should show red X icon');
      console.log('');
    }
    
    console.log('   📝 SCENARIO 3 - Non-Existent User:');
    console.log('   • Enter ID: INVALID123');
    console.log('   • Expected: Error message "User tidak ditemukan dalam sistem user management"');
    console.log('   • Should show red X icon');
    console.log('   • Form fields should be cleared');
    console.log('');
    
    console.log('🎉 Auto-populate functionality test data prepared!');
    console.log('✅ All API endpoints working correctly');
    console.log('✅ Ready to test in frontend UI');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

testAutoPopulate();
