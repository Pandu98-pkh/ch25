// Test script to verify form styling fixes
// Run this in browser console to test the form

console.log('🧪 Testing Form Styling Fixes...');

// Test function to simulate opening the schedule session modal
function testFormStyling() {
  console.log('\n📝 Form Styling Test');
  
  // Look for the "Schedule Session" button
  const scheduleButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Schedule Session')
  );
  
  if (scheduleButton) {
    console.log('✅ Found Schedule Session button');
    
    // Simulate click to open modal
    console.log('📋 Click the button to test form styling:');
    console.log('   1. Check Student field has proper icon spacing');
    console.log('   2. Check Session Type field shows appropriate icons');
    console.log('   3. Check Counselor field has proper icon placement');
    console.log('   4. Verify no text/icon overlap in any dropdown');
    
    // Test if clicking works
    try {
      scheduleButton.click();
      console.log('✅ Modal should now be open - check form styling');
    } catch (e) {
      console.log('❌ Could not click button:', e.message);
    }
  } else {
    console.log('❌ Schedule Session button not found');
  }
}

// Test for form elements after modal opens
function testFormElements() {
  console.log('\n📝 Testing Form Elements');
  
  // Wait a bit for modal to open
  setTimeout(() => {
    // Check for student dropdown
    const studentSelect = document.querySelector('select[name="studentId"]');
    if (studentSelect) {
      console.log('✅ Student dropdown found');
      console.log('📋 Checking padding:', getComputedStyle(studentSelect).paddingLeft);
    }
    
    // Check for session type dropdown
    const typeSelect = document.querySelector('select[name="type"]');
    if (typeSelect) {
      console.log('✅ Session type dropdown found');
      console.log('📋 Checking padding:', getComputedStyle(typeSelect).paddingLeft);
    }
    
    // Check for counselor dropdown
    const counselorSelect = document.querySelector('select[name="counselorId"]');
    if (counselorSelect) {
      console.log('✅ Counselor dropdown found');
      console.log('📋 Checking padding:', getComputedStyle(counselorSelect).paddingLeft);
    }
    
    // Check for icons
    const icons = document.querySelectorAll('.lucide');
    console.log(`📋 Found ${icons.length} icons in the form`);
    
  }, 1000);
}

// Run tests
testFormStyling();
testFormElements();

// Export for manual use
window.formStyleTest = {
  testFormStyling,
  testFormElements
};

console.log('\n🎉 Form styling test setup complete!');
console.log('📋 Manual steps:');
console.log('   1. Open Schedule Session modal');
console.log('   2. Check each dropdown for proper spacing');
console.log('   3. Select different session types to see icon changes');
console.log('   4. Verify no overlap between icons and text');
