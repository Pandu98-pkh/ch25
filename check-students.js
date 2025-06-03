import fetch from 'node-fetch';

async function checkStudents() {
  try {
    const response = await fetch('http://localhost:5000/api/students');
    const data = await response.json();
    
    console.log('=== STUDENTS API RESPONSE ===');
    console.log('Total records:', data.totalRecords || data.count || 'Not specified');
    console.log('Data array length:', data.data?.length || 'No data array');
    console.log('Current page:', data.currentPage || 'Not specified');
    console.log('Total pages:', data.totalPages || 'Not specified');
    
    if (data.data && data.data.length > 0) {
      console.log('\nFirst student example:');
      console.log(JSON.stringify(data.data[0], null, 2));
    }
    
    // Check if pagination should be visible
    const studentsCount = data.totalRecords || data.count || data.data?.length || 0;
    const itemsPerPage = 50; // Default from useStudentTable
    const shouldShowPagination = studentsCount > itemsPerPage;
    
    console.log('\n=== PAGINATION ANALYSIS ===');
    console.log(`Students count: ${studentsCount}`);
    console.log(`Items per page: ${itemsPerPage}`);
    console.log(`Should show pagination: ${shouldShowPagination}`);
    console.log(`Total pages would be: ${Math.ceil(studentsCount / itemsPerPage)}`);
    
  } catch (error) {
    console.error('Error checking students:', error.message);
  }
}

checkStudents();
