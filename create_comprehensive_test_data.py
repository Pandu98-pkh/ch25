#!/usr/bin/env python3
"""
Create comprehensive test data to verify the enhanced DeletedStudentsManagement component
fallback functionality using the correct API endpoints from the backend.
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:5000"

def create_test_data():
    """Create comprehensive test data for different fallback scenarios"""
    
    print("🧪 Creating comprehensive test data for DeletedStudentsManagement fallback testing...")
    print("📋 Using the correct API endpoints from the backend...")
    
    # Scenario 1: Complete data - Student with matching user data
    print("\n📝 Scenario 1: Creating complete student + user data...")
    
    # Create student (this automatically creates user too)
    student1_data = {
        "name": "Complete Test Student",
        "email": "complete.test@university.edu",
        "tingkat": "12",
        "kelas": "A",
        "academicStatus": "good",
        "program": "Computer Science"
    }
    
    response = requests.post(f"{BASE_URL}/api/students", json=student1_data)
    if response.status_code == 201:
        created_student = response.json()
        student_id = created_student.get('studentId', created_student.get('id'))
        print(f"✅ Created student with ID: {student_id}")
        
        # Delete the student (this also deletes the associated user)
        delete_response = requests.delete(f"{BASE_URL}/api/students/{student_id}")
        if delete_response.status_code == 200:
            print("✅ Deleted student and user (complete data scenario)")
        else:
            print(f"❌ Failed to delete student: {delete_response.text}")
    else:
        print(f"❌ Failed to create student: {response.text}")
    
    # Scenario 2: Another complete scenario with different data
    print("\n📝 Scenario 2: Creating another complete student + user data...")
    
    student2_data = {
        "name": "Missing Data Test Student",
        "email": "missing.test@university.edu",
        "tingkat": "11",
        "kelas": "B",
        "academicStatus": "warning",
        "program": "Mathematics"
    }
    
    response = requests.post(f"{BASE_URL}/api/students", json=student2_data)
    if response.status_code == 201:
        created_student = response.json()
        student_id = created_student.get('studentId', created_student.get('id'))
        print(f"✅ Created student with ID: {student_id}")
        
        # Delete the student
        delete_response = requests.delete(f"{BASE_URL}/api/students/{student_id}")
        if delete_response.status_code == 200:
            print("✅ Deleted student and user (second complete scenario)")
        else:
            print(f"❌ Failed to delete student: {delete_response.text}")
    else:
        print(f"❌ Failed to create student: {response.text}")
    
    # Scenario 3: Create standalone user (fallback scenario)
    print("\n📝 Scenario 3: Creating standalone user for fallback testing...")
    
    user3_data = {
        "name": "Fallback User Only",
        "email": "fallback.only@university.edu", 
        "role": "student",
        "username": "fallbackuser",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/api/users", json=user3_data)
    if response.status_code == 201:
        created_user = response.json()
        user_id = created_user.get('userId', created_user.get('id'))
        print(f"✅ Created standalone user with ID: {user_id}")
        
        # Delete the user immediately to create deleted user scenario
        delete_response = requests.delete(f"{BASE_URL}/api/users/{user_id}")
        if delete_response.status_code == 200:
            print("✅ Deleted user (fallback scenario - user-only data)")
        else:
            print(f"❌ Failed to delete user: {delete_response.text}")
    else:
        print(f"❌ Failed to create user: {response.text}")
    
    # Scenario 4: Another standalone user for enrichment testing
    print("\n📝 Scenario 4: Creating another standalone user...")
    
    user4_data = {
        "name": "Rich User Data Test",
        "email": "rich.userdata@university.edu",
        "role": "student", 
        "username": "richuserdata",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/api/users", json=user4_data)
    if response.status_code == 201:
        created_user = response.json()
        user_id = created_user.get('userId', created_user.get('id'))
        print(f"✅ Created standalone user with ID: {user_id}")
        
        # Delete the user
        delete_response = requests.delete(f"{BASE_URL}/api/users/{user_id}")
        if delete_response.status_code == 200:
            print("✅ Deleted user (second fallback scenario)")
        else:
            print(f"❌ Failed to delete user: {delete_response.text}")
    else:
        print(f"❌ Failed to create user: {response.text}")

def verify_test_data():
    """Verify the test data was created successfully using correct endpoints"""
    print("\n🔍 Verifying test data creation...")
    
    # Check deleted students using correct admin endpoint
    response = requests.get(f"{BASE_URL}/api/admin/students/deleted")
    if response.status_code == 200:
        deleted_students = response.json()
        print(f"✅ Found {len(deleted_students)} deleted students")
        for student in deleted_students:
            print(f"   - Student ID: {student.get('studentId', 'N/A')}, Name: {student.get('name', 'N/A')}")
    else:
        print(f"❌ Failed to get deleted students: {response.status_code} - {response.text}")
    
    # Check deleted users with student role using correct admin endpoint
    response = requests.get(f"{BASE_URL}/api/admin/users/deleted")
    if response.status_code == 200:
        all_deleted_users = response.json()
        student_users = [user for user in all_deleted_users if user.get('role') == 'student']
        print(f"✅ Found {len(student_users)} deleted student users")
        for user in student_users:
            print(f"   - Username: {user.get('username', 'N/A')}, Email: {user.get('email', 'N/A')}")
    else:
        print(f"❌ Failed to get deleted users: {response.status_code} - {response.text}")

def show_test_summary():
    """Show summary of test scenarios created"""
    print("\n📊 Test Scenarios Summary:")
    print("=" * 50)
    print("1. ✅ Complete Data Scenarios:")
    print("   - Students with matching user data (both deleted)")
    print("   - Tests normal deletion/restoration workflow")
    print("")
    print("2. ✅ Fallback Scenarios:")
    print("   - Standalone deleted users (no student records)")
    print("   - Tests complete fallback to users table")
    print("")
    print("3. 🎯 Enhanced Component Tests:")
    print("   - Data enrichment from users table")
    print("   - Fallback when student data is missing")
    print("   - Cross-table data correlation")
    print("")
    print("🌐 Ready to test at: http://localhost:5174/#/students/deleted")

if __name__ == "__main__":
    try:
        create_test_data()
        verify_test_data()
        show_test_summary()
        print("\n🎉 Test data creation completed! Ready to test enhanced fallback functionality.")
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to backend server. Make sure it's running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Error creating test data: {e}")
