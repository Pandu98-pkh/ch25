#!/usr/bin/env python3
"""
Test script for user photo upload functionality
"""

import requests
import json
import base64
import uuid

API_BASE = 'http://localhost:5000/api'

def test_user_photo_upload():
    """Test complete user photo upload workflow"""
    
    print("🧪 Testing User Photo Upload Functionality")
    print("=" * 60)
    
    # Step 1: Create a user with photo upload
    print("\n1️⃣ Creating user with photo upload...")
    random_suffix = str(uuid.uuid4())[:6]
    
    # Create a simple base64 test image (1x1 pixel PNG)
    test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHBTAaSkgAAAABJRU5ErkJggg=="
    
    demo_user = {
        'userId': f'TEST-{random_suffix}',
        'name': f'Photo Test User {random_suffix}',
        'email': f'phototest{random_suffix}@counselorhub.edu',
        'role': 'student',
        'username': f'phototest{random_suffix}',
        'password': 'test123',
        'avatar': f'data:image/png;base64,{test_image_base64}',
        'avatarType': 'base64',
        'avatarFilename': f'test_avatar_{random_suffix}.png'
    }
    
    try:
        response = requests.post(f'{API_BASE}/users', json=demo_user)
        if response.status_code == 201:
            created_user = response.json()
            user_id = created_user['userId']
            print(f"   ✅ User created successfully: {created_user['name']} (ID: {user_id})")
            print(f"   📷 Avatar Type: {created_user.get('avatarType', 'Not set')}")
            print(f"   📁 Avatar Filename: {created_user.get('avatarFilename', 'Not set')}")
        else:
            print(f"   ❌ Failed to create user: {response.json()}")
            return None
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None
    
    # Step 2: Update user photo via PUT endpoint
    print(f"\n2️⃣ Testing photo update for user {user_id}...")
    
    # Create another test image
    update_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAD0lEQVR42mP8/5+hnoEIAAP8AxN4cjKuAAAAAElFTkSuQmCC"
    
    update_data = {
        'name': f'Updated Photo Test User {random_suffix}',
        'avatar': f'data:image/png;base64,{update_image_base64}',
        'avatarType': 'base64',
        'avatarFilename': f'updated_avatar_{random_suffix}.png'
    }
    
    try:
        response = requests.put(f'{API_BASE}/users/{user_id}', json=update_data)
        if response.status_code == 200:
            updated_user = response.json()
            print(f"   ✅ User updated successfully: {updated_user['name']}")
            print(f"   📷 Avatar Type: {updated_user.get('avatarType', 'Not set')}")
            print(f"   📁 Avatar Filename: {updated_user.get('avatarFilename', 'Not set')}")
        else:
            print(f"   ❌ Failed to update user: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Step 3: Test URL-based avatar
    print(f"\n3️⃣ Testing URL-based avatar for user {user_id}...")
    
    url_update_data = {
        'avatar': 'https://via.placeholder.com/150/0000FF/808080?text=Test',
        'avatarType': 'url',
        'avatarFilename': None
    }
    
    try:
        response = requests.put(f'{API_BASE}/users/{user_id}', json=url_update_data)
        if response.status_code == 200:
            updated_user = response.json()
            print(f"   ✅ URL avatar updated successfully")
            print(f"   📷 Avatar Type: {updated_user.get('avatarType', 'Not set')}")
            print(f"   🌐 Avatar URL: {updated_user.get('avatar', 'Not set')}")
        else:
            print(f"   ❌ Failed to update URL avatar: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Step 4: Retrieve user and verify photo data
    print(f"\n4️⃣ Retrieving user to verify photo data...")
    
    try:
        response = requests.get(f'{API_BASE}/users/{user_id}')
        if response.status_code == 200:
            user_data = response.json()
            print(f"   ✅ User retrieved successfully")
            print(f"   📷 Avatar: {user_data.get('avatar', 'Not set')[:50]}...")
            print(f"   🏷️ Avatar Type: {user_data.get('avatarType', 'Not set')}")
            print(f"   📁 Avatar Filename: {user_data.get('avatarFilename', 'Not set')}")
        else:
            print(f"   ❌ Failed to retrieve user: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Step 5: Clean up - delete test user
    print(f"\n5️⃣ Cleaning up - deleting test user...")
    
    try:
        response = requests.delete(f'{API_BASE}/users/{user_id}')
        if response.status_code == 200:
            print(f"   ✅ Test user deleted successfully")
        else:
            print(f"   ❌ Failed to delete user: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print(f"\n🎉 Photo upload functionality test completed!")
    return user_id

if __name__ == '__main__':
    test_user_photo_upload()
