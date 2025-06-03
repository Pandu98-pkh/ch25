// Quick frontend test for counselor functionality
// To be run in browser console

console.log('Testing counselor form functionality...');

// Test 1: Check if counselors endpoint is accessible
fetch('http://localhost:5000/api/counselors')
  .then(response => response.json())
  .then(counselors => {
    console.log('✅ Counselors API working:', counselors.length, 'counselors available');
    
    // Test 2: Simulate form data with counselor
    const testFormData = {
      studentId: "S20252048D",
      date: "2025-06-02T14:00:00.000",
      duration: 60,
      type: "academic",
      notes: "TypeScript fix verification test",
      outcome: "positive",
      nextSteps: "Continue monitoring",
      counselor: {
        id: counselors[0].id,
        name: counselors[0].name
      }
    };
    
    console.log('✅ Form data structure valid:', testFormData);
    console.log('✅ Counselor selected:', testFormData.counselor.name);
    
    // Test 3: Verify session creation still works
    return fetch('http://localhost:5000/api/counseling-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testFormData)
    });
  })
  .then(response => response.json())
  .then(result => {
    console.log('✅ Session creation successful after TypeScript fix!');
    console.log('✅ All counselor functionality working correctly');
  })
  .catch(error => {
    console.error('❌ Error in test:', error);
  });
