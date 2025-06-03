#!/usr/bin/env python3
"""
Test script to verify delete functionality is working
"""
import requests
import json

# Test configuration
BASE_URL = "http://localhost:5000"
STUDENT_ID = "TST999"  # Test student ID from previous tests

def test_delete_student():
    """Test the delete student functionality"""
    print(f"🧪 Testing DELETE functionality for student {STUDENT_ID}")
    
    # First, check if student exists
    print(f"\n1. Checking if student {STUDENT_ID} exists...")
    response = requests.get(f"{BASE_URL}/api/students/{STUDENT_ID}")
    print(f"GET Response Status: {response.status_code}")
    
    if response.status_code == 200:
        student_data = response.json()
        print(f"✅ Student found: {student_data.get('name', 'Unknown')}")
        print(f"Student data: {json.dumps(student_data, indent=2)}")
    elif response.status_code == 404:
        print(f"❌ Student {STUDENT_ID} not found - cannot test delete")
        return False
    else:
        print(f"❌ Unexpected response: {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    # Now test the delete functionality
    print(f"\n2. Testing DELETE /api/students/{STUDENT_ID}")
    delete_response = requests.delete(f"{BASE_URL}/api/students/{STUDENT_ID}")
    print(f"DELETE Response Status: {delete_response.status_code}")
    print(f"DELETE Response Headers: {dict(delete_response.headers)}")
    print(f"DELETE Response Body: {delete_response.text}")
    
    if delete_response.status_code == 200:
        result = delete_response.json()
        print(f"✅ Delete successful: {result.get('message')}")
        
        # Verify student is now soft deleted
        print(f"\n3. Verifying student is soft deleted...")
        verify_response = requests.get(f"{BASE_URL}/api/students/{STUDENT_ID}")
        print(f"Verification GET Status: {verify_response.status_code}")
        
        if verify_response.status_code == 404:
            print(f"✅ Confirmed: Student {STUDENT_ID} is no longer accessible (soft deleted)")
            return True
        else:
            print(f"⚠️  Warning: Student still accessible after delete")
            print(f"Response: {verify_response.text}")
            return False
            
    else:
        print(f"❌ Delete failed with status {delete_response.status_code}")
        try:
            error_data = delete_response.json()
            print(f"Error details: {json.dumps(error_data, indent=2)}")
        except:
            print(f"Raw error response: {delete_response.text}")
        return False

def main():
    """Main test function"""
    print("🚀 Starting Delete Functionality Test")
    print("=" * 50)
    
    try:
        success = test_delete_student()
        print("\n" + "=" * 50)
        if success:
            print("🎉 DELETE FUNCTIONALITY TEST PASSED!")
        else:
            print("💥 DELETE FUNCTIONALITY TEST FAILED!")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server. Make sure it's running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
