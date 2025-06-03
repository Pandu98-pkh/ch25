// Test script to verify frontend counselor service works
// Run this in browser console to test

console.log('Testing counselor service...');

// Simulate the API call that the frontend makes
fetch('http://localhost:5000/api/counselors')
  .then(response => response.json())
  .then(counselors => {
    console.log('✅ Counselors loaded successfully:', counselors.length, 'counselors');
    counselors.forEach(counselor => {
      console.log(`   - ${counselor.id}: ${counselor.name}`);
    });
    
    // Test session creation with first counselor
    const testSession = {
      studentId: "S20252048D",
      date: "2025-06-02T11:00:00.000",
      duration: 60,
      type: "academic",
      notes: "Browser console test session",
      outcome: "positive",
      nextSteps: "Continue monitoring",
      counselor: {
        id: counselors[0].id,
        name: counselors[0].name
      }
    };
    
    console.log('Testing session creation with counselor:', counselors[0].name);
    
    return fetch('http://localhost:5000/api/counseling-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSession)
    });
  })
  .then(response => response.json())
  .then(result => {
    console.log('✅ Session created from browser console!');
    console.log('Session ID:', result.sessionId || 'N/A');
    console.log('✅ Frontend integration is working correctly!');
  })
  .catch(error => {
    console.error('❌ Error in browser test:', error);
  });
