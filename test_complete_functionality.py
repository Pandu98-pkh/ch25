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
    
    # Generate unique timestamp-based identifiers
    import time
    timestamp = str(int(time.time()))[-6:]
    
    student_data = {
        "student_id": f"TEST{timestamp}",
        "name": f"Edit Delete Test Student {timestamp}",
        "email": f"test.editdelete.{timestamp}@school.edu",
        "grade": "XII", 
        "tingkat": "XII",
        "class": "IPA-1",
        "kelas": "IPA-1",
        "academic_status": "good"
    }
    
    response = requests.post(f"{BASE_URL}/api/students", json=student_data)
    print(f"POST Response Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code in [200, 201]:
        result = response.json()
        print(f"✅ Test student created successfully!")
        # Extract the student ID from response
        student_id = result.get('studentId') or result.get('student_id') or result.get('id')
        print(f"Student ID: {student_id}")
        return student_id
    else:
        print(f"❌ Failed to create test student")
        return None

def test_edit_functionality(student_id):
    """Test edit functionality"""
    print("\n🔧 Testing EDIT functionality...")
    
    # Generate unique timestamp for update
    import time
    timestamp = str(int(time.time()))[-6:]
    
    update_data = {
        "name": f"Updated Test Student Name {timestamp}",
        "email": f"updated.test.{timestamp}@school.edu",
        "academic_status": "excellent"
    }
    
    response = requests.put(f"{BASE_URL}/api/students/{student_id}", json=update_data)
    print(f"PUT Response Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Edit functionality working!")
        return True
    else:
        print("❌ Edit functionality failed!")
        return False

def test_delete_functionality(student_id):
    """Test delete functionality"""
    print("\n🗑️ Testing DELETE functionality...")
    
    response = requests.delete(f"{BASE_URL}/api/students/{student_id}")
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
        student_id = create_test_student()
        if not student_id:
            return
            
        # Test edit
        if not test_edit_functionality(student_id):
            return
            
        # Test delete  
        if not test_delete_functionality(student_id):
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
