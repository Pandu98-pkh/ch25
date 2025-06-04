// Debug script to test user context and assessment creation
console.log('🔍 Debugging User Context and Assessment Creation');

// Function to test login and user context
async function testUserContext() {
    try {
        console.log('\n1. Testing login...');
        
        // Login as a student
        const loginResponse = await fetch('http://localhost:5000/api/users/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'pandukh',
                password: 'pandu123'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('✅ Login response:', loginData);
        
        if (loginData.user) {
            console.log('✅ User object received:', {
                userId: loginData.user.userId,
                name: loginData.user.name,
                role: loginData.user.role,
                email: loginData.user.email
            });
            
            // Test assessment creation with this user
            console.log('\n2. Testing assessment creation...');
            
            const assessmentData = {
                studentId: loginData.user.userId, // Use the actual userId from login
                type: 'PHQ-9',
                score: 12,
                risk: 'moderate',
                notes: 'Debug test assessment',
                date: new Date().toISOString(),
                category: 'self-assessment',
                assessor_id: 'self-assessment',
                responses: JSON.stringify({
                    "1": 2,
                    "2": 1,
                    "3": 2,
                    "4": 1,
                    "5": 2,
                    "6": 1,
                    "7": 2,
                    "8": 1,
                    "9": 1
                })
            };
            
            console.log('📝 Assessment data to send:', assessmentData);
            
            const assessmentResponse = await fetch('http://localhost:5000/api/mental-health/assessments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(assessmentData)
            });
            
            if (assessmentResponse.ok) {
                const assessmentResult = await assessmentResponse.json();
                console.log('✅ Assessment created successfully:', assessmentResult);
            } else {
                const error = await assessmentResponse.text();
                console.error('❌ Assessment creation failed:', error);
            }
        } else {
            console.error('❌ No user object in login response');
        }
        
    } catch (error) {
        console.error('❌ Error in test:', error);
    }
}

// Run the test
testUserContext();
