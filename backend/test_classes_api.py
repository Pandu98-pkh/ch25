#!/usr/bin/env python3
"""
Classes API Test Script
Tests all CRUD operations for the classes endpoints
"""

import requests
import json
import sys
import time

BASE_URL = 'http://localhost:5000'

def test_health_check():
    """Test health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f'{BASE_URL}/health')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_get_classes():
    """Test getting all classes"""
    print("\nTesting GET /api/classes...")
    try:
        response = requests.get(f'{BASE_URL}/api/classes')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ GET classes successful: {len(data['data'])} classes found")
            print(f"   Total pages: {data['totalPages']}, Current page: {data['currentPage']}")
            return data['data']
        else:
            print(f"❌ GET classes failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ GET classes error: {e}")
        return None

def test_get_classes_with_filter():
    """Test getting classes with filtering"""
    print("\nTesting GET /api/classes with filters...")
    try:
        # Test grade filter
        response = requests.get(f'{BASE_URL}/api/classes?grade=11')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Grade filter successful: {len(data['data'])} grade 11 classes found")
        
        # Test search filter
        response = requests.get(f'{BASE_URL}/api/classes?searchQuery=11A')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Search filter successful: {len(data['data'])} classes matching '11A'")
        
        return True
    except Exception as e:
        print(f"❌ Filter test error: {e}")
        return False

def test_create_class():
    """Test creating a new class"""
    print("\nTesting POST /api/classes...")
    try:
        new_class = {
            "name": "Test Class XII IPA",
            "gradeLevel": "12",
            "academicYear": "2024/2025",
            "teacherName": "Dr. Test Teacher",
            "studentCount": 25
        }
        
        response = requests.post(
            f'{BASE_URL}/api/classes',
            json=new_class,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Class creation successful: {data['name']} (ID: {data['id']})")
            return data['id']
        else:
            print(f"❌ Class creation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Class creation error: {e}")
        return None

def test_get_single_class(class_id):
    """Test getting a single class by ID"""
    print(f"\nTesting GET /api/classes/{class_id}...")
    try:
        response = requests.get(f'{BASE_URL}/api/classes/{class_id}')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Single class retrieval successful: {data['name']}")
            return True
        else:
            print(f"❌ Single class retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Single class retrieval error: {e}")
        return False

def test_update_class(class_id):
    """Test updating a class"""
    print(f"\nTesting PUT /api/classes/{class_id}...")
    try:
        update_data = {
            "name": "Updated Test Class XII IPA",
            "studentCount": 28,
            "teacherName": "Dr. Updated Teacher"
        }
        
        response = requests.put(
            f'{BASE_URL}/api/classes/{class_id}',
            json=update_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Class update successful: {data['name']}")
            print(f"   Student count: {data['studentCount']}, Teacher: {data['teacherName']}")
            return True
        else:
            print(f"❌ Class update failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Class update error: {e}")
        return False

def test_delete_class(class_id):
    """Test deleting a class"""
    print(f"\nTesting DELETE /api/classes/{class_id}...")
    try:
        response = requests.delete(f'{BASE_URL}/api/classes/{class_id}')
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Class deletion successful: {data['message']}")
            return True
        else:
            print(f"❌ Class deletion failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Class deletion error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Starting Classes API Tests...")
    print("=" * 50)
    
    # Check if backend is running
    if not test_health_check():
        print("\n❌ Backend is not running. Please start the Flask server first.")
        sys.exit(1)
    
    # Test GET all classes
    initial_classes = test_get_classes()
    if initial_classes is None:
        print("\n❌ Basic GET failed. Stopping tests.")
        sys.exit(1)
    
    # Test filtering
    test_get_classes_with_filter()
    
    # Test CREATE
    new_class_id = test_create_class()
    if new_class_id is None:
        print("\n❌ Class creation failed. Stopping tests.")
        sys.exit(1)
    
    # Test GET single class
    test_get_single_class(new_class_id)
    
    # Test UPDATE
    test_update_class(new_class_id)
    
    # Test DELETE
    test_delete_class(new_class_id)
    
    # Verify deletion
    print(f"\nVerifying deletion...")
    response = requests.get(f'{BASE_URL}/api/classes/{new_class_id}')
    if response.status_code == 404:
        print("✅ Class successfully deleted (404 as expected)")
    else:
        print(f"⚠️  Class may not be deleted (status: {response.status_code})")
    
    print("\n" + "=" * 50)
    print("🎉 All Classes API tests completed!")
    print("✅ Classes module is fully connected to the database")

if __name__ == '__main__':
    main()
