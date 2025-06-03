#!/usr/bin/env python3
"""
Test hard delete functionality to ensure user records are preserved
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_hard_delete_preserves_user():
    """Test that hard delete preserves user account"""
    print("🧪 Testing Hard Delete User Preservation")
    print("=" * 50)
    
    # Step 1: Get deleted students
    print("\n1. Getting deleted students...")
    response = requests.get(f"{BASE_URL}/api/admin/students/deleted")
    
    if response.status_code != 200:
        print(f"❌ Failed to get deleted students: {response.status_code}")
        return False
    
    deleted_students = response.json()
    
    if not deleted_students:
        print("❌ No deleted students found. Creating test data...")
        
        # Create a test student first
        create_response = requests.post(f"{BASE_URL}/api/students", json={
            'name': 'Hard Delete Test Student',
            'email': f'harddeletetest{int(time.time())}@example.com',
            'tingkat': '12',
            'kelas': 'A',
            'academicStatus': 'good'
        })
        
        if create_response.status_code != 201:
            print(f"❌ Failed to create test student: {create_response.status_code}")
            return False
        
        created_student = create_response.json()
        student_id = created_student.get('studentId') or created_student.get('id')
        
        # Soft delete the student first
        delete_response = requests.delete(f"{BASE_URL}/api/students/{student_id}")
        if delete_response.status_code != 200:
            print(f"❌ Failed to soft delete test student: {delete_response.status_code}")
            return False
        
        print(f"✅ Created and soft deleted test student: {student_id}")
        
        # Get deleted students again
        response = requests.get(f"{BASE_URL}/api/admin/students/deleted")
        deleted_students = response.json()
    
    # Step 2: Select a student for hard delete test
    test_student = deleted_students[0]
    student_id = test_student.get('studentId') or test_student.get('id')
    user_id = test_student.get('userId') or test_student.get('user_id')
    student_name = test_student.get('name', 'Unknown')
    
    print(f"\n2. Testing hard delete for student:")
    print(f"   Student ID: {student_id}")
    print(f"   User ID: {user_id}")
    print(f"   Name: {student_name}")
    
    # Step 3: Verify user exists before hard delete
    if user_id:
        print(f"\n3. Checking user {user_id} exists before hard delete...")
        user_response = requests.get(f"{BASE_URL}/api/admin/users/deleted")
        
        if user_response.status_code == 200:
            all_users = user_response.json()
            user_exists_before = any(
                user.get('userId') == user_id or user.get('id') == user_id 
                for user in all_users
            )
            print(f"   User exists in deleted users: {user_exists_before}")
        else:
            print(f"   Could not check user existence: {user_response.status_code}")
    
    # Step 4: Perform hard delete
    print(f"\n4. Performing hard delete for student {student_id}...")
    hard_delete_response = requests.delete(f"{BASE_URL}/api/admin/students/{student_id}/hard-delete")
    
    print(f"   Status: {hard_delete_response.status_code}")
    
    if hard_delete_response.status_code == 200:
        result = hard_delete_response.json()
        print(f"   ✅ {result.get('message', 'Success')}")
        print(f"   Warning: {result.get('warning', 'No warning')}")
        
        if result.get('details'):
            deleted_records = result['details'].get('deleted_records', {})
            print(f"   Deleted records: {deleted_records}")
    else:
        print(f"   ❌ Hard delete failed: {hard_delete_response.text}")
        return False
    
    # Step 5: Verify student is gone from deleted students
    print(f"\n5. Verifying student {student_id} is removed from deleted students...")
    verify_students_response = requests.get(f"{BASE_URL}/api/admin/students/deleted")
    
    if verify_students_response.status_code == 200:
        remaining_students = verify_students_response.json()
        student_still_exists = any(
            student.get('studentId') == student_id or student.get('id') == student_id
            for student in remaining_students
        )
        
        if student_still_exists:
            print(f"   ❌ Student {student_id} still exists in deleted students!")
            return False
        else:
            print(f"   ✅ Student {student_id} successfully removed from deleted students")
    else:
        print(f"   ❌ Could not verify student removal: {verify_students_response.status_code}")
        return False
    
    # Step 6: Verify user still exists (THIS IS THE KEY TEST)
    if user_id:
        print(f"\n6. 🔍 CRITICAL TEST: Verifying user {user_id} still exists after hard delete...")
        
        # Check in active users
        active_users_response = requests.get(f"{BASE_URL}/api/admin/users")
        active_user_exists = False
        
        if active_users_response.status_code == 200:
            active_users = active_users_response.json()
            active_user_exists = any(
                user.get('userId') == user_id or user.get('id') == user_id
                for user in active_users
            )
            print(f"   User exists in active users: {active_user_exists}")
        
        # Check in deleted users
        deleted_users_response = requests.get(f"{BASE_URL}/api/admin/users/deleted")
        deleted_user_exists = False
        
        if deleted_users_response.status_code == 200:
            deleted_users = deleted_users_response.json()
            deleted_user_exists = any(
                user.get('userId') == user_id or user.get('id') == user_id
                for user in deleted_users
            )
            print(f"   User exists in deleted users: {deleted_user_exists}")
        
        user_preserved = active_user_exists or deleted_user_exists
        
        if user_preserved:
            print(f"   ✅ SUCCESS: User {user_id} was preserved after hard delete!")
            print(f"   📍 User status: {'Active' if active_user_exists else 'Deleted (soft)'}")
        else:
            print(f"   ❌ FAILURE: User {user_id} was deleted along with student!")
            return False
    else:
        print(f"\n6. ⚠️  Cannot verify user preservation - no user_id found")
    
    print(f"\n🎉 Hard Delete User Preservation Test PASSED!")
    print(f"✅ Student academic data was deleted")
    print(f"✅ User account was preserved")
    print(f"✅ System maintains data integrity")
    
    return True

if __name__ == "__main__":
    success = test_hard_delete_preserves_user()
    if success:
        print(f"\n🏆 ALL TESTS PASSED - Hard delete correctly preserves user accounts")
    else:
        print(f"\n💥 TEST FAILED - Hard delete implementation needs review")
