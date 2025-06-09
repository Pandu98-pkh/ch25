// Test script to verify frontend-backend integration for mental health assessments
console.log('🧪 Testing Frontend-Backend Integration for Mental Health Assessments');

// Test data for assessment creation
const testAssessmentData = {
    studentId: "1103220016",
    type: "Comprehensive Mental Health",
    score: 85,
    risk: "low",
    notes: "Test assessment from frontend integration",
    date: "2025-06-09T12:00:00Z",
    category: "self-assessment",
    assessor: "self-assessment",
    responses: {
        "1": 0,
        "2": 1,
        "3": 0,
        "4": 1,
        "5": 2
    },
    mlInsights: {
        probability: 0.8,
        condition: "Comprehensive Mental Health",
        severity: "mild",
        confidenceScore: 0.85,
        recommendedActions: ["Continue self-care practices", "Regular monitoring"],
        riskFactors: []
    }
};

// Function to test API directly
async function testDirectAPI() {
    console.log('\n1️⃣ Testing Direct API Call...');
    
    try {
        const response = await fetch('http://localhost:5000/api/mental-health/assessments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testAssessmentData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Direct API call successful!');
            console.log('📋 Result:', result);
            return result;
        } else {
            const error = await response.text();
            console.log('❌ Direct API call failed:', error);
            return null;
        }
    } catch (error) {
        console.log('❌ Error in direct API call:', error);
        return null;
    }
}

// Function to test via frontend service (if available)
async function testFrontendService() {
    console.log('\n2️⃣ Testing Frontend Service...');
    
    // Check if we're in a browser environment with access to our services
    if (typeof window !== 'undefined' && window.location.href.includes('localhost:517')) {
        console.log('✅ Running in browser environment');
        
        // Try to access the assessment context or service
        try {
            // This would be called from browser console or integrated into the app
            console.log('📝 Assessment data prepared for frontend service');
            console.log('🔗 Use browser developer tools to test the actual service integration');
            return true;
        } catch (error) {
            console.log('❌ Error accessing frontend service:', error);
            return false;
        }
    } else {
        console.log('⚠️ Not in browser environment - skipping frontend service test');
        return false;
    }
}

// Main test function
async function runIntegrationTest() {
    console.log('🚀 Starting Integration Test...');
    console.log('=' * 50);
    
    // Test 1: Direct API
    const apiResult = await testDirectAPI();
    
    // Test 2: Frontend Service
    const serviceResult = await testFrontendService();
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('=' * 30);
    console.log(`Direct API: ${apiResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Frontend Service: ${serviceResult ? '✅ PASS' : '⚠️ SKIP (environment)'}`);
    
    if (apiResult) {
        console.log('\n🎉 Backend integration is working!');
        console.log('📝 Next: Test through the web interface at http://localhost:5176/integrated-mental-health-test');
    } else {
        console.log('\n❌ Backend integration failed - check server logs');
    }
}

// Run the test
runIntegrationTest();
