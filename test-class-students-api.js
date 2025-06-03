import fetch from 'node-fetch';

async function testClassStudentsAPI() {
    try {
        console.log('🔍 Testing Class Students API...');
        
        const response = await fetch('http://localhost:5000/api/classes/16/students'); // Testing with class that has real student names
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ API Response successful');
            console.log(`📊 Student count: ${data.count}`);
            console.log('\n👥 Student details:');
            
            data.students.forEach((student, index) => {
                console.log(`${index + 1}. Name: ${student.name}`);
                console.log(`   Email: ${student.email}`);
                console.log(`   Grade: ${student.tingkat}${student.kelas}`);
                console.log(`   Photo: ${student.photo || 'No photo'}`);
                console.log(`   Avatar: ${student.avatar || 'No avatar'}`);
                console.log(`   User ID: ${student.userId}`);
                console.log(`   Academic Status: ${student.academicStatus}`);
                console.log('   ---');
            });
            
            // Check if names and photos are from users table
            const studentsWithUserData = data.students.filter(s => s.name && s.email && s.userId);
            console.log(`\n✅ Students with complete user data: ${studentsWithUserData.length}/${data.count}`);
            
            if (studentsWithUserData.length === data.count) {
                console.log('🎉 SUCCESS: All students have names and photos from users table!');
            } else {
                console.log('⚠️  WARNING: Some students missing user data');
            }
            
        } else {
            console.error('❌ API Error:', data);
        }
        
    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

testClassStudentsAPI();
