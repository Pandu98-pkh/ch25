#!/usr/bin/env node

const API_URL = 'http://localhost:5000/api';

async function testFallbackScenario() {
    console.log('🧪 Testing Enhanced Fallback Scenario');
    console.log('=====================================');
    console.log('Scenario: Primary endpoint returns 0 students, fallback to users table');
    console.log();

    try {
        // Step 1: Fetch from primary endpoint
        console.log('1️⃣ Fetching from primary endpoint (/api/admin/students/deleted)...');
        const primaryResponse = await fetch(`${API_URL}/admin/students/deleted`);
        const primaryData = await primaryResponse.json();
        console.log(`   📊 Primary endpoint returned: ${primaryData.length} students`);
        
        // Step 2: Fetch from fallback endpoint
        console.log('2️⃣ Fetching from fallback endpoint (/api/admin/users/deleted)...');
        const fallbackResponse = await fetch(`${API_URL}/admin/users/deleted`);
        const fallbackData = await fallbackResponse.json();
        const studentUsers = fallbackData.filter(user => user.role === 'student');
        console.log(`   📊 Fallback endpoint returned: ${studentUsers.length} student users`);
        
        // Step 3: Simulate the component logic
        console.log('3️⃣ Simulating component fallback logic...');
        let finalData = [];
        
        if (primaryData.length === 0) {
            console.log('   🔄 Primary endpoint empty, triggering fallback...');
            
            // Convert user data to student format (what the component would do)
            finalData = studentUsers.map(user => ({
                id: user.userId || user.id,
                studentId: user.userId || user.id,
                name: user.name || 'Unknown Student',
                email: user.email || '',
                username: user.username || '',
                grade: 'N/A',
                tingkat: 'N/A',
                kelas: 'N/A',
                academicStatus: 'warning',
                academic_status: 'warning',
                program: 'N/A',
                mentalHealthScore: 0,
                mental_health_score: 0,
                photo: user.photo || '',
                isActive: false,
                createdAt: user.createdAt,
                deletedAt: user.deletedAt,
                userId: user.userId || user.id,
                user_id: user.userId || user.id,
                userTableId: user.userId || user.id,
                userTableName: user.name,
                userTableEmail: user.email,
                userTablePhoto: user.photo
            }));
            
            console.log(`   ✅ Fallback successful! Converted ${finalData.length} users to student format`);
        } else {
            finalData = primaryData;
            console.log('   ✅ Primary endpoint has data, no fallback needed');
        }
        
        // Step 4: Display results
        console.log('4️⃣ Final results:');
        console.log(`   📊 Total students available: ${finalData.length}`);
        finalData.forEach((student, index) => {
            console.log(`   ${index + 1}. ${student.studentId} - ${student.name} (${student.email})`);
        });
        
        console.log();
        console.log('🎉 Fallback scenario test completed successfully!');
        console.log('💡 The component should display these students in the UI');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testFallbackScenario();
