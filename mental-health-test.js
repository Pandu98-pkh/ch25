// Mental Health Data Filtering Test Script
// Run this in the browser console to test the filtering functionality

console.log('🧠 Mental Health Data Filtering Test Script');
console.log('==========================================');

// Helper function to test role switching
function testRoleFiltering() {
  console.log('\n📋 Testing Role-Based Data Filtering...');
  
  // Check if RoleTestPanel is available
  const rolePanel = document.querySelector('[class*="fixed bottom-4 right-4"]');
  if (rolePanel) {
    console.log('✅ Role Test Panel found - use buttons to switch roles');
  } else {
    console.log('❌ Role Test Panel not found - make sure you\'re in development mode');
  }
  
  // Check current page
  const currentPath = window.location.pathname;
  console.log(`📍 Current path: ${currentPath}`);
  
  if (currentPath === '/mental-health') {
    console.log('✅ On Mental Health page');
    
    // Check for different view elements
    const adminView = document.querySelector('[class*="from-purple-600"]');
    const counselorView = document.querySelector('[class*="from-blue-600"]');
    const studentView = document.querySelector('[class*="from-indigo-600"]');
    
    if (adminView) {
      console.log('👑 Admin view detected');
      // Count assessment cards in admin view
      const assessmentCards = document.querySelectorAll('[class*="hover:bg-gray-50"]');
      console.log(`📊 Admin assessments visible: ${assessmentCards.length}`);
    } else if (counselorView) {
      console.log('👩‍⚕️ Counselor view detected');
      // Count table rows
      const tableRows = document.querySelectorAll('tbody tr');
      console.log(`📊 Counselor table rows: ${tableRows.length}`);
    } else if (studentView) {
      console.log('🎓 Student view detected');
      // Count assessment cards
      const assessmentCards = document.querySelectorAll('[class*="bg-white p-6 rounded-xl"]');
      console.log(`📊 Student assessment cards: ${assessmentCards.length}`);
    } else {
      console.log('❓ Unknown view type');
    }
  } else {
    console.log('⚠️  Navigate to /mental-health to test');
  }
}

// Helper function to simulate role switching
function switchToRole(role) {
  console.log(`\n🔄 Switching to ${role} role...`);
  
  const buttons = document.querySelectorAll('button');
  const roleButton = Array.from(buttons).find(btn => 
    btn.textContent.toLowerCase().includes(role.toLowerCase())
  );
  
  if (roleButton) {
    roleButton.click();
    console.log(`✅ Clicked ${role} button`);
    
    // Wait a moment for the change to take effect
    setTimeout(() => {
      console.log('📊 Checking data after role switch...');
      testRoleFiltering();
    }, 1000);
  } else {
    console.log(`❌ ${role} button not found`);
  }
}

// Main test function
function runFullTest() {
  console.log('\n🚀 Running Full Mental Health Data Filtering Test...');
  
  testRoleFiltering();
  
  console.log('\n📝 Manual Test Instructions:');
  console.log('1. Use the Role Test Panel (bottom right) to switch between roles');
  console.log('2. Student roles should show only their own data');
  console.log('3. Counselor role should show all data in table format');
  console.log('4. Admin role should show all data with statistics');
  console.log('\n🔧 Available test functions:');
  console.log('- testRoleFiltering() - Check current view and data');
  console.log('- switchToRole("student") - Switch to student role');
  console.log('- switchToRole("counselor") - Switch to counselor role');
  console.log('- switchToRole("admin") - Switch to admin role');
}

// Expose functions globally for manual testing
window.testRoleFiltering = testRoleFiltering;
window.switchToRole = switchToRole;
window.runFullTest = runFullTest;

// Auto-run the test
runFullTest();
