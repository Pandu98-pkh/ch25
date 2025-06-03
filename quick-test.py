#!/usr/bin/env python3
"""
Simple test to verify basic user functionality is still working
"""

import requests
import json

API_BASE = 'http://localhost:5000/api'

def quick_test():
    """Quick test of basic user endpoints"""
    
    print("🔍 Quick User API Test")
    print("=" * 30)
    
    # Test 1: Create user
    print("\n1️⃣ Testing user creation...")
    test_user = {
        'name': 'Quick Test User',
        'email': 'quicktest@example.com',
        'role': 'student',
        'username': 'quicktest',
        'password': 'test123'
    }
    
    try:
        response = requests.post(f'{API_BASE}/users', json=test_user)
        print(f"   Status: {response.status_code}")
        if response.status_code == 201:
            user_data = response.json()
            user_id = user_data['userId']
            print(f"   ✅ User created: {user_id}")
            
            # Test 2: Update user
            print(f"\n2️⃣ Testing user update...")
            update_data = {'name': 'Updated Quick Test User'}
            response = requests.put(f'{API_BASE}/users/{user_id}', json=update_data)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                print(f"   ✅ User updated successfully")
            else:
                print(f"   ❌ Update failed: {response.text}")
            
            # Test 3: Delete user
            print(f"\n3️⃣ Cleaning up...")
            response = requests.delete(f'{API_BASE}/users/{user_id}')
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                print(f"   ✅ User deleted successfully")
        else:
            print(f"   ❌ Creation failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print(f"\n✅ Quick test completed!")

if __name__ == '__main__':
    quick_test()
