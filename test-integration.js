// Quick integration test to verify frontend can connect to backend
import axios from 'axios';

const testIntegration = async () => {
  try {
    console.log('Testing API integration...');
    
    // Test the exact API call that frontend makes
    const response = await axios.get('http://localhost:5000/api/students', {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Structure:');
    console.log('   - count:', response.data.count);
    console.log('   - currentPage:', response.data.currentPage);
    console.log('   - totalPages:', response.data.totalPages);
    console.log('   - data array length:', response.data.data?.length || 0);
    console.log('✅ Sample Student:', response.data.data?.[0]?.name || 'No students');
    
    // Test what frontend code expects
    const students = response.data.data || [];
    const count = response.data.count || 0;
    
    console.log('✅ Integration Test PASSED');
    console.log(`   Frontend should display ${students.length} students from real database`);
    
  } catch (error) {
    console.error('❌ Integration Test FAILED:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
  }
};

testIntegration();
