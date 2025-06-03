// Test script to check if frontend can connect to backend API
// Paste this in browser console at http://localhost:5173/classes

console.log('🧪 Testing API Connection...');

async function testClassesAPI() {
  try {
    console.log('📡 Fetching from: http://localhost:5000/api/classes');
    
    const response = await fetch('http://localhost:5000/api/classes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Classes data received:');
      console.log('📚 Total classes:', data.data.length);
      console.log('📄 Data:', data);
    } else {
      console.error('❌ API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('📝 Error details:', errorText);
    }
  } catch (error) {
    console.error('🚨 Network Error:', error);
    console.error('💡 This could be a CORS issue or backend not running');
  }
}

// Run the test
testClassesAPI();
