// Test script to verify the student import fix
// This tests that user IDs are used as student IDs instead of generating new ones

import { getNonStudentUsers } from './src/services/userService.js';
import { addStudentsBatch, createStudent } from './src/services/studentService.js';

async function testStudentImportFix() {
  console.log('🧪 Testing Student Import Fix');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Get some non-student users
    console.log('📋 Step 1: Fetching non-student users...');
    const users = await getNonStudentUsers();
    
    if (!users || users.length === 0) {
      console.log('❌ No non-student users found to test with');
      return;
    }
    
    console.log(`✅ Found ${users.length} non-student users`);
    
    // Step 2: Select first 2 users for testing
    const testUsers = users.slice(0, 2);
    console.log(`🎯 Selected ${testUsers.length} users for testing:`);
    testUsers.forEach(user => {
      console.log(`   - ${user.name} (ID: ${user.id}, Email: ${user.email})`);
    });
    
    // Step 3: Prepare student data using user IDs
    console.log('\n📝 Step 2: Preparing student data...');
    const studentsData = testUsers.map(user => ({
      userId: user.id,
      name: user.name,
      email: user.email,
      tingkat: 'XI',
      kelas: 'IPA-1',
      academicStatus: 'good',
      classId: 'test-class-id'
    }));
    
    console.log('✅ Student data prepared:');
    studentsData.forEach(student => {
      console.log(`   - ${student.name} (User ID: ${student.userId})`);
    });
    
    // Step 4: Test batch import
    console.log('\n🚀 Step 3: Testing batch import...');
    const createdStudents = await addStudentsBatch(studentsData);
    
    console.log(`✅ Successfully created ${createdStudents.length} students`);
    
    // Step 5: Verify that user IDs were used as student IDs
    console.log('\n🔍 Step 4: Verifying student ID mapping...');
    let allMappingCorrect = true;
    
    for (let i = 0; i < createdStudents.length; i++) {
      const originalUserId = studentsData[i].userId;
      const createdStudent = createdStudents[i];
      
      console.log(`   Checking ${createdStudent.name}:`);
      console.log(`     Original User ID: ${originalUserId}`);
      console.log(`     Created Student ID: ${createdStudent.studentId}`);
      
      if (createdStudent.studentId === originalUserId) {
        console.log(`     ✅ CORRECT: Student ID matches User ID`);
      } else {
        console.log(`     ❌ ERROR: Student ID does NOT match User ID`);
        allMappingCorrect = false;
      }
    }
    
    // Step 6: Summary
    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(50));
    
    if (allMappingCorrect) {
      console.log('✅ SUCCESS: All student IDs correctly use existing user IDs');
      console.log('✅ The student import fix is working correctly!');
      console.log('✅ No unnecessary student ID generation occurred');
    } else {
      console.log('❌ FAILURE: Some student IDs do not match user IDs');
      console.log('❌ The fix may not be working as expected');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Additional test for individual student creation
async function testIndividualStudentCreation() {
  console.log('\n🧪 Testing Individual Student Creation');
  console.log('='.repeat(50));
  
  try {
    // Test with a specific student ID (simulating user ID from user management)
    const testStudentId = 'USER_123456';
    const studentData = {
      studentId: testStudentId, // This should be preserved
      name: 'Test Student',
      email: 'test@example.com',
      tingkat: 'XII',
      kelas: 'IPS-2',
      academicStatus: 'good',
      avatar: '',
      grade: 'XII',
      class: 'IPS-2',
      photo: ''
    };
    
    console.log(`📝 Testing individual student creation with provided ID: ${testStudentId}`);
    
    const createdStudent = await createStudent(studentData);
    
    console.log(`✅ Student created successfully`);
    console.log(`   Provided Student ID: ${testStudentId}`);
    console.log(`   Created Student ID: ${createdStudent.studentId}`);
    
    if (createdStudent.studentId === testStudentId) {
      console.log('✅ SUCCESS: Individual student creation preserves provided student ID');
    } else {
      console.log('❌ FAILURE: Individual student creation did not preserve provided student ID');
    }
    
  } catch (error) {
    console.error('❌ Individual student creation test failed:', error);
  }
}

// Run the tests
async function runAllTests() {
  await testStudentImportFix();
  await testIndividualStudentCreation();
  
  console.log('\n🏁 All tests completed!');
}

// Execute if run directly
runAllTests().catch(console.error);
