#!/usr/bin/env python3
"""
Test script to verify soft delete functionality
"""

import requests
import json
import uuid
import mysql.connector

API_BASE = 'http://localhost:5000/api'

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'database': 'counselorhub',
    'charset': 'utf8mb4'
}

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def test_soft_delete():
    """Test soft delete functionality"""
    
    print("🧪 Testing Soft Delete Functionality")
    print("=" * 50)
    
    # Generate unique data to avoid conflicts
    random_suffix = str(uuid.uuid4())[:8]
    
    # Step 1: Create a test user
    test_user_data = {
        'userId': f'TEST-{random_suffix}',
        'name': f'Test Delete User {random_suffix}',
        'email': f'testdelete{random_suffix}@counselorhub.edu',
        'role': 'counselor',
        'username': f'testdelete{random_suffix}',
        'password': 'testpass123'
    }
    
    try:
        response = requests.post(f'{API_BASE}/users', json=test_user_data)
        if response.status_code != 201:
            print(f"❌ Failed to create test user: {response.json()}")
            return False
        
        created_user = response.json()
        user_id = created_user['userId']
        print(f"✅ Created test user: {created_user['name']} with ID: {user_id}")
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        return False
    
    # Step 2: Verify user appears in API list
    try:
        response = requests.get(f'{API_BASE}/users')
        if response.status_code == 200:
            users = response.json()
            user_found = any(user['userId'] == user_id for user in users)
            if user_found:
                print(f"✅ User {user_id} appears in API user list")
            else:
                print(f"❌ User {user_id} NOT found in API user list")
                return False
        else:
            print(f"❌ Failed to get users list: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error getting users list: {e}")
        return False
    
    # Step 3: Check user in database (should be active)
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT user_id, name, is_active FROM users WHERE user_id = %s", (user_id,))
            db_user = cursor.fetchone()
            
            if db_user:
                print(f"✅ User found in database: {db_user['name']}, is_active: {db_user['is_active']}")
                if db_user['is_active'] != 1:
                    print(f"❌ User should be active but is_active = {db_user['is_active']}")
                    return False
            else:
                print(f"❌ User {user_id} not found in database")
                return False
                
        except Exception as e:
            print(f"❌ Database query error: {e}")
            return False
        finally:
            connection.close()
    
    # Step 4: Delete the user via API
    try:
        response = requests.delete(f'{API_BASE}/users/{user_id}')
        if response.status_code == 200:
            print(f"✅ User {user_id} deleted via API")
        else:
            print(f"❌ Failed to delete user: {response.status_code} - {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Error deleting user: {e}")
        return False
    
    # Step 5: Verify user no longer appears in API list
    try:
        response = requests.get(f'{API_BASE}/users')
        if response.status_code == 200:
            users = response.json()
            user_found = any(user['userId'] == user_id for user in users)
            if not user_found:
                print(f"✅ User {user_id} correctly removed from API user list")
            else:
                print(f"❌ User {user_id} still appears in API user list after deletion")
                return False
        else:
            print(f"❌ Failed to get users list after deletion: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error getting users list after deletion: {e}")
        return False
    
    # Step 6: Check user still exists in database but is inactive
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT user_id, name, is_active FROM users WHERE user_id = %s", (user_id,))
            db_user = cursor.fetchone()
            
            if db_user:
                print(f"✅ User still exists in database: {db_user['name']}, is_active: {db_user['is_active']}")
                if db_user['is_active'] == 0:
                    print(f"✅ User correctly marked as inactive (soft delete)")
                else:
                    print(f"❌ User should be inactive but is_active = {db_user['is_active']}")
                    return False
            else:
                print(f"❌ User {user_id} completely removed from database (should be soft delete)")
                return False
                
        except Exception as e:
            print(f"❌ Database query error: {e}")
            return False
        finally:
            connection.close()
    
    # Step 7: Try to access deleted user via API (should return 404)
    try:
        response = requests.get(f'{API_BASE}/users/{user_id}')
        if response.status_code == 404:
            print(f"✅ Deleted user correctly returns 404 when accessed")
        else:
            print(f"❌ Deleted user should return 404 but returned {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing deleted user access: {e}")
        return False
    
    print(f"\n🎉 Soft delete is working correctly!")
    print(f"📝 Summary:")
    print(f"   - User data remains in database for audit purposes")
    print(f"   - User is marked as inactive (is_active = 0)")
    print(f"   - User no longer appears in API responses")
    print(f"   - Direct access to deleted user returns 404")
    
    return True

if __name__ == '__main__':
    test_soft_delete()
