// Test behavior service connection
const testBehaviorAPI = async () => {
  try {
    console.log('Testing behavior API connection...');
    
    // Test GET all behavior records
    const response = await fetch('http://localhost:5000/api/behavior-records');
    const data = await response.json();
    
    console.log('✅ GET /api/behavior-records successful:');
    console.log('Total records:', data.count);
    console.log('Records:', data.results);
    
    // Test GET with student filter
    if (data.results.length > 0) {
      const studentId = data.results[0].studentId;
      const filteredResponse = await fetch(`http://localhost:5000/api/behavior-records?student=${studentId}`);
      const filteredData = await filteredResponse.json();
      
      console.log('✅ GET with student filter successful:');
      console.log('Filtered records:', filteredData.results.length);
    }
    
    console.log('🎉 Behavior API connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing behavior API:', error);
  }
};

testBehaviorAPI();
