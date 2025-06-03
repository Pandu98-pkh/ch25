// Debug script untuk mengecek status classService
console.log('=== DEBUGGING CLASS SERVICE ===');

// Test API directly
fetch('http://localhost:5000/api/classes')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Direct API call successful:', data);
    console.log('Number of classes from API:', data.data?.length || 0);
  })
  .catch(error => {
    console.error('❌ Direct API call failed:', error);
  });

// Test through service layer (if available)
if (window.classService) {
  console.log('Testing through classService...');
  window.classService.getClasses()
    .then(result => {
      console.log('✅ ClassService call successful:', result);
      console.log('Number of classes from service:', result.data?.length || 0);
      console.log('Is using mock data?', result.data?.[0]?.name?.includes('IPA-') ? 'YES (MOCK)' : 'NO (REAL DB)');
    })
    .catch(error => {
      console.error('❌ ClassService call failed:', error);
    });
} else {
  console.log('⚠️ ClassService not available in window object');
}

// Check if we can access the service through React DevTools
console.log('Checking React component state...');
setTimeout(() => {
  const classCards = document.querySelectorAll('[class*="rounded-xl"][class*="shadow"]');
  console.log('Found class cards:', classCards.length);
  
  classCards.forEach((card, index) => {
    const titleElement = card.querySelector('h3');
    const title = titleElement?.textContent || 'Unknown';
    console.log(`Card ${index + 1}: ${title}`);
  });
}, 2000);
