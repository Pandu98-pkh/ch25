#!/usr/bin/env python3
"""
Test script to verify custom user ID functionality
"""

import requests
import json
import uuid

API_BASE = 'http://localhost:5000/api'

def test_custom_user_id():
    """Test creating a user with a custom user ID"""
    
    # Generate unique data to avoid conflicts
    random_suffix = str(uuid.uuid4())[:8]
    
    # Test 1: Create counselor with custom ID
    print("🧪 Testing Custom User ID Creation")
    print("=" * 50)
    
    counselor_data = {
        'userId': 'KSL-2025-999',  # Custom counselor ID
        'name': f'Test Counselor {random_suffix}',
        'email': f'testcounselor{random_suffix}@counselorhub.edu',
        'role': 'counselor',
        'username': f'testcounselor{random_suffix}',
        'password': 'testpass123'
    }
    
    try:
        response = requests.post(f'{API_BASE}/users', json=counselor_data)
        print(f"Create Counselor with Custom ID: {response.status_code}")
        
        if response.status_code == 201:
            created_user = response.json()
            print(f"✅ Created counselor: {created_user['name']}")
            print(f"✅ Custom User ID: {created_user['userId']}")
            counselor_id = created_user['userId']
        else:
            print(f"❌ Error: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False
    
    # Test 2: Create student with custom ID  
    student_data = {
        'userId': '2025999888',  # Custom student ID (NIS)
        'name': f'Test Student {random_suffix}',
        'email': f'teststudent{random_suffix}@school.edu',
        'role': 'student',
        'username': f'teststudent{random_suffix}',
        'password': 'testpass123'
    }
    
    try:
        response = requests.post(f'{API_BASE}/users', json=student_data)
        print(f"\nCreate Student with Custom ID: {response.status_code}")
        
        if response.status_code == 201:
            created_user = response.json()
            print(f"✅ Created student: {created_user['name']}")
            print(f"✅ Custom User ID: {created_user['userId']}")
            student_id = created_user['userId']
        else:
            print(f"❌ Error: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False
    
    # Test 3: Try to create user with duplicate custom ID
    print(f"\nTesting Duplicate Custom ID Prevention...")
    duplicate_data = {
        'userId': 'KSL-2025-999',  # Same as counselor above
        'name': f'Duplicate Test {random_suffix}',
        'email': f'duplicate{random_suffix}@counselorhub.edu',
        'role': 'counselor',
        'username': f'duplicate{random_suffix}',
        'password': 'testpass123'
    }
    
    try:
        response = requests.post(f'{API_BASE}/users', json=duplicate_data)
        print(f"Create User with Duplicate ID: {response.status_code}")
        
        if response.status_code == 400:
            error = response.json()
            print(f"✅ Correctly rejected duplicate ID: {error['error']}")
        else:
            print(f"❌ Should have rejected duplicate ID but got: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False
    
    # Test 4: Create user without custom ID (auto-generation)
    print(f"\nTesting Auto-generation Fallback...")
    auto_data = {
        'name': f'Auto ID Test {random_suffix}',
        'email': f'autoid{random_suffix}@counselorhub.edu',
        'role': 'counselor',
        'username': f'autoid{random_suffix}',
        'password': 'testpass123'
        # No userId provided
    }
    
    try:
        response = requests.post(f'{API_BASE}/users', json=auto_data)
        print(f"Create User with Auto ID: {response.status_code}")
        
        if response.status_code == 201:
            created_user = response.json()
            print(f"✅ Created user: {created_user['name']}")
            print(f"✅ Auto-generated User ID: {created_user['userId']}")
            auto_id = created_user['userId']
        else:
            print(f"❌ Error: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False
    
    # Cleanup - delete test users
    print(f"\nCleaning up test users...")
    for user_id in [counselor_id, student_id, auto_id]:
        try:
            response = requests.delete(f'{API_BASE}/users/{user_id}')
            if response.status_code == 200:
                print(f"✅ Deleted user {user_id}")
            else:
                print(f"⚠️ Could not delete user {user_id}: {response.status_code}")
        except Exception as e:
            print(f"⚠️ Error deleting user {user_id}: {e}")
    
    print(f"\n🎉 All tests passed! Custom User ID functionality is working correctly.")
    return True

if __name__ == '__main__':
    test_custom_user_id()
