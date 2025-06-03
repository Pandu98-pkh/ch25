#!/usr/bin/env python3
"""
Test script for the CounselorHub API endpoints
"""

import requests
import json

API_BASE = 'http://localhost:5000/api'

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get('http://localhost:5000/health')
        print(f"Health Check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_get_users():
    """Test get all users endpoint"""
    try:
        response = requests.get(f'{API_BASE}/users')
        print(f"\nGet Users: {response.status_code}")
        if response.status_code == 200:
            users = response.json()
            print(f"Found {len(users)} users:")
            for user in users:
                print(f"  - {user['name']} ({user['role']}) - {user['email']}")
        else:
            print(f"Error: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Get users failed: {e}")
        return False

def test_authentication():
    """Test authentication endpoint"""
    try:
        # Test with admin credentials
        auth_data = {
            'username': 'admin',
            'password': 'admin123'
        }
        response = requests.post(f'{API_BASE}/users/auth/login', json=auth_data)
        print(f"\nAuthentication Test: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            user = result['user']
            print(f"Logged in as: {user['name']} ({user['role']})")
        else:
            print(f"Auth Error: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Authentication failed: {e}")
        return False

def test_create_user():
    """Test create user endpoint"""
    try:
        new_user = {
            'name': 'Test User',
            'email': 'test@counselorhub.edu',
            'role': 'counselor',
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = requests.post(f'{API_BASE}/users', json=new_user)
        print(f"\nCreate User Test: {response.status_code}")
        if response.status_code == 201:
            created_user = response.json()
            print(f"Created user: {created_user['name']} with ID: {created_user['userId']}")
            return created_user['userId']
        else:
            print(f"Create Error: {response.json()}")
        return None
    except Exception as e:
        print(f"Create user failed: {e}")
        return None

def test_update_user(user_id):
    """Test update user endpoint"""
    try:
        update_data = {
            'name': 'Updated Test User',
            'email': 'updated@counselorhub.edu'
        }
        response = requests.put(f'{API_BASE}/users/{user_id}', json=update_data)
        print(f"\nUpdate User Test: {response.status_code}")
        if response.status_code == 200:
            updated_user = response.json()
            print(f"Updated user: {updated_user['name']}")
        else:
            print(f"Update Error: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Update user failed: {e}")
        return False

def test_delete_user(user_id):
    """Test delete user endpoint"""
    try:
        response = requests.delete(f'{API_BASE}/users/{user_id}')
        print(f"\nDelete User Test: {response.status_code}")
        if response.status_code == 200:
            print("User deleted successfully")
        else:
            print(f"Delete Error: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Delete user failed: {e}")
        return False

def main():
    """Run all API tests"""
    print("🧪 Testing CounselorHub API Endpoints")
    print("=" * 50)
    
    # Test health
    if not test_health():
        print("❌ API server is not healthy!")
        return
    
    # Test get users
    if not test_get_users():
        print("❌ Get users failed!")
        return
    
    # Test authentication
    if not test_authentication():
        print("❌ Authentication failed!")
        return
    
    # Test CRUD operations
    user_id = test_create_user()
    if user_id:
        test_update_user(user_id)
        test_delete_user(user_id)
    
    print("\n✅ API testing completed!")

if __name__ == '__main__':
    main()
