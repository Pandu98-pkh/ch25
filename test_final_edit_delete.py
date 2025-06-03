#!/usr/bin/env python3
"""
Create a test student for testing edit/delete functionality
"""
import requests
import json

BASE_URL = "http://localhost:5000"

def create_test_student():
    """Create a new test student for testing"""
    print("🧪 Creating a test student for edit/delete testing...")
    
    student_data = {
        "student_id": "TEST001",
        "name": "Edit Delete Test Student",
        "email": "test.editdelete@school.edu",
        "grade": "XII", 
        "tingkat": "XII",
        "class": "IPA-1",
        "kelas": "IPA-1",
        "academic_status": "good"
    }
    
    response = requests.post(f"{BASE_URL}/api/students", json=student_data)
    print(f"POST Response Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code in [200, 201]:
        result = response.json()
        print(f"✅ Test student created successfully!")
        print(f"Student ID: {result.get('student', {}).get('student_id', 'Unknown')}")
        return True
    else:
        print(f"❌ Failed to create test student")
        return False

def test_edit_functionality():
    """Test edit functionality"""
    print("\n🔧 Testing EDIT functionality...")
    
    update_data = {
        "name": "Updated Test Student Name",
        "email": "updated.test@school.edu",
        "academic_status": "excellent"
    }
    
    response = requests.put(f"{BASE_URL}/api/students/TEST001", json=update_data)
    print(f"PUT Response Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Edit functionality working!")
        return True
    else:
        print("❌ Edit functionality failed!")
        return False

def test_delete_functionality():
    """Test delete functionality"""
    print("\n🗑️ Testing DELETE functionality...")
    
    response = requests.delete(f"{BASE_URL}/api/students/TEST001")
    print(f"DELETE Response Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Delete functionality working!")
        return True
    else:
        print("❌ Delete functionality failed!")
        return False

def main():
    """Main test function"""
    print("🚀 COMPLETE EDIT/DELETE FUNCTIONALITY TEST")
    print("=" * 60)
    
    try:
        # Create test student
        if not create_test_student():
            return
            
        # Test edit
        if not test_edit_functionality():
            return
            
        # Test delete  
        if not test_delete_functionality():
            return
            
        print("\n" + "=" * 60)
        print("🎉 ALL EDIT/DELETE TESTS PASSED!")
        print("✅ Edit functionality: WORKING")
        print("✅ Delete functionality: WORKING")
        print("✅ Backend API: WORKING")
        print("🌐 Frontend available at: http://localhost:5173")
        print("🖥️ Backend API available at: http://localhost:5000")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

if __name__ == "__main__":
    main()
