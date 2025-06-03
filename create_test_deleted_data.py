#!/usr/bin/env python3

import requests
import json

def create_test_deleted_data():
    print("🔧 Creating test deleted data for demonstration...")
    print("=" * 50)
    
    try:
        # First, let's create some users and students, then delete them
        
        # Create test users with student role
        test_users = [
            {
                "userId": "STU_TEST_001",
                "name": "Test Student Alpha",
                "email": "alpha.test@school.edu",
                "username": "alpha_test",
                "role": "student",
                "password": "testpass123"
            },
            {
                "userId": "STU_TEST_002", 
                "name": "Test Student Beta",
                "email": "beta.test@school.edu",
                "username": "beta_test",
                "role": "student",
                "password": "testpass123"
            },
            {
                "userId": "STU_TEST_003",
                "name": "Test Student Gamma", 
                "email": "gamma.test@school.edu",
                "username": "gamma_test",
                "role": "student",
                "password": "testpass123"
            }
        ]
        
        created_users = []
        
        # Create the users
        for user in test_users:
            print(f"📝 Creating user: {user['userId']}")
            response = requests.post('http://localhost:5000/api/admin/users', json=user)
            if response.status_code == 201:
                created_users.append(user['userId'])
                print(f"   ✅ User {user['userId']} created successfully")
            else:
                print(f"   ⚠️ Failed to create user {user['userId']}: {response.status_code}")
        
        # Create corresponding student records (some with missing data to test enrichment)
        test_students = [
            {
                "studentId": "STU_TEST_001",
                "name": "Test Student Alpha",
                "email": "alpha.test@school.edu",
                "tingkat": "10",
                "kelas": "A",
                "program": "IPA",
                "userId": "STU_TEST_001"
            },
            # STU_TEST_002 will be missing from students table to test enrichment
            {
                "studentId": "STU_TEST_003",
                "name": "Unknown Student",  # Missing name to test enrichment
                "email": "",  # Missing email to test enrichment
                "tingkat": "11",
                "kelas": "B", 
                "program": "IPS",
                "userId": "STU_TEST_003"
            }
        ]
        
        created_students = []
        
        # Create the students
        for student in test_students:
            print(f"📝 Creating student: {student['studentId']}")
            response = requests.post('http://localhost:5000/api/admin/students', json=student)
            if response.status_code == 201:
                created_students.append(student['studentId'])
                print(f"   ✅ Student {student['studentId']} created successfully")
            else:
                print(f"   ⚠️ Failed to create student {student['studentId']}: {response.status_code}")
        
        print()
        print("🗑️ Now deleting the created data to test fallback...")
        
        # Delete the students
        for student_id in created_students:
            print(f"🗑️ Deleting student: {student_id}")
            response = requests.delete(f'http://localhost:5000/api/admin/students/{student_id}')
            if response.status_code == 200:
                print(f"   ✅ Student {student_id} deleted successfully")
            else:
                print(f"   ⚠️ Failed to delete student {student_id}: {response.status_code}")
        
        # Delete some users (to create the fallback scenario)
        users_to_delete = ["STU_TEST_002", "STU_TEST_003"]  # STU_TEST_002 has no student record, STU_TEST_003 has incomplete data
        for user_id in users_to_delete:
            print(f"🗑️ Deleting user: {user_id}")
            response = requests.delete(f'http://localhost:5000/api/admin/users/{user_id}')
            if response.status_code == 200:
                print(f"   ✅ User {user_id} deleted successfully")
            else:
                print(f"   ⚠️ Failed to delete user {user_id}: {response.status_code}")
        
        print()
        print("🎯 Test data creation completed!")
        print("📋 Expected scenario:")
        print("   - STU_TEST_001: Complete student record (deleted)")
        print("   - STU_TEST_002: Only user record (no student record, deleted user)")
        print("   - STU_TEST_003: Incomplete student record + complete user record (both deleted)")
        
        # Verify the test data
        print()
        print("🔍 Verifying test data...")
        
        # Check deleted students
        response = requests.get('http://localhost:5000/api/admin/students/deleted')
        if response.status_code == 200:
            students = response.json()
            print(f"📊 Deleted students: {len(students)}")
            for s in students:
                print(f"   {s.get('studentId')}: {s.get('name')} ({s.get('email')})")
        
        # Check deleted users
        response = requests.get('http://localhost:5000/api/admin/users/deleted')
        if response.status_code == 200:
            users = response.json()
            student_users = [u for u in users if u.get('role') == 'student']
            print(f"📊 Deleted student users: {len(student_users)}")
            for u in student_users:
                print(f"   {u.get('userId', u.get('id'))}: {u.get('name')} ({u.get('email')})")
                
        print()
        print("✅ Test data ready for enhanced fallback testing!")
        
    except Exception as e:
        print(f"❌ Error creating test data: {e}")

if __name__ == "__main__":
    create_test_deleted_data()
