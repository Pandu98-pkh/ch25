#!/usr/bin/env python3
"""
Test script for admin user management endpoints
"""

import requests
import json

API_BASE = 'http://localhost:5000/api'

def test_admin_user_management():
    """Test admin user management endpoints"""
    
    print("🔧 Testing Admin User Management Endpoints")
    print("=" * 60)
    
    # Test 1: Get deleted users
    print("\n1. Testing GET deleted users endpoint...")
    try:
        response = requests.get(f'{API_BASE}/admin/users/deleted')
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            deleted_users = response.json()
            print(f"   ✅ Found {len(deleted_users)} deleted users:")
            for user in deleted_users:
                print(f"      - {user['userId']}: {user['name']} ({user['email']}) - Role: {user['role']}")
                print(f"        Deleted at: {user.get('deletedAt', 'Unknown')}")
            
            # Store first deleted user ID for testing restore
            test_user_id = deleted_users[0]['userId'] if deleted_users else None
            
        else:
            print(f"   ❌ Error: {response.json()}")
            return False
            
    except Exception as e:
        print(f"   ❌ Request failed: {e}")
        return False
    
    if not test_user_id:
        print("   ⚠️ No deleted users found to test restore functionality")
        return True
    
    # Test 2: Restore a deleted user
    print(f"\n2. Testing restore user endpoint with ID: {test_user_id}")
    try:
        response = requests.put(f'{API_BASE}/admin/users/{test_user_id}/restore')
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ {result['message']}")
            restored_user = result['user']
            print(f"   ✅ Restored user: {restored_user['name']} ({restored_user['email']})")
        else:
            print(f"   ❌ Error: {response.json()}")
            return False
            
    except Exception as e:
        print(f"   ❌ Request failed: {e}")
        return False
    
    # Test 3: Verify user appears in active users list
    print(f"\n3. Verifying user appears in active users list...")
    try:
        response = requests.get(f'{API_BASE}/users')
        if response.status_code == 200:
            active_users = response.json()
            user_found = any(user['userId'] == test_user_id for user in active_users)
            if user_found:
                print(f"   ✅ User {test_user_id} correctly appears in active users list")
            else:
                print(f"   ❌ User {test_user_id} NOT found in active users list")
                return False
        else:
            print(f"   ❌ Failed to get active users: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test 4: Try to restore already active user (should fail)
    print(f"\n4. Testing restore already active user (should fail)...")
    try:
        response = requests.put(f'{API_BASE}/admin/users/{test_user_id}/restore')
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 400:
            error = response.json()
            print(f"   ✅ Correctly rejected: {error['error']}")
        else:
            print(f"   ❌ Should have returned 400 but got: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Request failed: {e}")
        return False
    
    # Test 5: Delete the user again for cleanup
    print(f"\n5. Cleaning up - deleting test user again...")
    try:
        response = requests.delete(f'{API_BASE}/users/{test_user_id}')
        if response.status_code == 200:
            print(f"   ✅ User {test_user_id} deleted again (soft delete)")
        else:
            print(f"   ⚠️ Could not delete user: {response.status_code}")
    except Exception as e:
        print(f"   ⚠️ Error deleting user: {e}")
    
    print(f"\n🎉 All admin user management tests passed!")
    
    # Show summary of available endpoints
    print(f"\n📋 Available Admin Endpoints:")
    print(f"   GET  /api/admin/users/deleted          - View deleted users")
    print(f"   PUT  /api/admin/users/<id>/restore     - Restore deleted user") 
    print(f"   DEL  /api/admin/users/<id>/hard-delete - Permanently delete user (DANGEROUS)")
    
    return True

if __name__ == '__main__':
    test_admin_user_management()
