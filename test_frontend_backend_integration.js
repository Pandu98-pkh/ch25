// Test frontend-backend integration for mental health assessments
// Run this in browser console on http://localhost:5176

async function testMentalHealthIntegration() {
    console.log('🧪 TESTING FRONTEND-BACKEND INTEGRATION');
    console.log('=' * 50);
    
    // Test data that mimics what frontend would send
    const testAssessmentData = {
        studentId: '1103220016',
        type: 'PHQ-9',
        score: 12,
        risk: 'moderate',
        notes: 'Test assessment from frontend integration',
        date: new Date().toISOString(),
        category: 'self-assessment',
        assessor: 'system',
        responses: {
            "1": 2,
            "2": 1,
            "3": 2,
            "4": 3,
            "5": 1,
            "6": 0,
            "7": 2,
            "8": 1,
            "9": 0
        },
        recommendations: ['Monitor symptoms', 'Consider counseling']
    };
    
    console.log('📤 Sending assessment data:', testAssessmentData);
    
    try {
        // Call the backend API directly
        const response = await fetch('http://localhost:5000/api/mental-health/assessments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testAssessmentData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ SUCCESS: Assessment created via frontend-backend integration');
            console.log('📋 Response:', result);
            
            // Now test retrieval
            const getResponse = await fetch(`http://localhost:5000/api/mental-health/assessments?studentId=${testAssessmentData.studentId}`);
            const assessments = await getResponse.json();
            
            if (getResponse.ok) {
                console.log('✅ SUCCESS: Retrieved assessments');
                console.log('📋 Found assessments:', assessments.data?.length || 0);
                console.log('📋 Latest assessment:', assessments.data?.[0]);
            } else {
                console.log('❌ FAILED: Could not retrieve assessments');
                console.log('📋 Error:', assessments);
            }
            
        } else {
            console.log('❌ FAILED: Assessment creation failed');
            console.log('📋 Error:', result);
        }
        
    } catch (error) {
        console.log('❌ ERROR: Network or processing error');
        console.log('📋 Details:', error);
    }
}

// Also test the frontend service directly if available
async function testFrontendService() {
    console.log('\n🧪 TESTING FRONTEND SERVICE INTEGRATION');
    console.log('=' * 50);
    
    // Check if we can access React context and services
    if (window.React && window.createMentalHealthAssessment) {
        console.log('✅ Frontend service available');
        
        const testData = {
            studentId: '1103220016',
            type: 'GAD-7',
            score: 8,
            risk: 'low',
            notes: 'Frontend service test',
            date: new Date().toISOString(),
            category: 'routine',
            assessor: 'frontend-test',
            responses: {"1": 1, "2": 0, "3": 1, "4": 2}
        };
        
        try {
            const result = await window.createMentalHealthAssessment(testData);
            console.log('✅ Frontend service test successful:', result);
        } catch (error) {
            console.log('❌ Frontend service test failed:', error);
        }
    } else {
        console.log('⚠️ Frontend service not directly accessible from console');
        console.log('💡 This is normal - services are typically scoped within React components');
    }
}

// Run the tests
console.log('🚀 Starting integration tests...');
testMentalHealthIntegration();
setTimeout(() => testFrontendService(), 2000);
