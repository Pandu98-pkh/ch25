#!/usr/bin/env python3
"""
Comprehensive test of ALL backend API endpoints after user_id primary key migration
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_endpoint(method, endpoint, data=None, expected_status=200):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == 'GET':
            response = requests.get(url)
        elif method == 'POST':
            response = requests.post(url, json=data)
        elif method == 'PUT':
            response = requests.put(url, json=data)
        elif method == 'DELETE':
            response = requests.delete(url)
        else:
            print(f"❌ {method} {endpoint}: Unsupported HTTP method")
            return None
        
        status_ok = response.status_code == expected_status
        status_indicator = "✅" if status_ok else "❌"
        
        print(f"{status_indicator} {method} {endpoint}: {response.status_code}")
        
        if not status_ok:
            try:
                error_detail = response.json()
                print(f"   Error: {error_detail}")
            except:
                print(f"   Error: {response.text}")
        
        if status_ok and response.status_code < 300:
            try:
                result = response.json()
                if isinstance(result, list):
                    print(f"   Returned {len(result)} items")
                elif isinstance(result, dict):
                    if 'data' in result and isinstance(result['data'], list):
                        print(f"   Returned {len(result['data'])} items in data array")
                    else:
                        print(f"   Returned object with keys: {list(result.keys())}")
                return result
            except:
                print(f"   Response: {response.text[:100]}")
                return response.text
        
        return None
        
    except Exception as e:
        print(f"❌ {method} {endpoint}: Request failed - {e}")
        return None

def main():
    print("=== COMPREHENSIVE API ENDPOINT TEST ===")
    print("Testing all endpoints after user_id primary key migration\n")
    
    # Health check
    print("1. HEALTH CHECK")
    print("-" * 40)
    test_endpoint('GET', '/health')
    print()
    
    # User endpoints
    print("2. USER ENDPOINTS")
    print("-" * 40)
    users = test_endpoint('GET', '/api/users')
    
    if users:
        # Test getting a specific user
        sample_user = users[0] if isinstance(users, list) else users
        user_id = sample_user.get('userId') or sample_user.get('id')
        if user_id:
            print(f"   Testing with user ID: {user_id}")
            test_endpoint('GET', f'/api/users/{user_id}')
            
            # Test updating user
            update_data = {
                'name': sample_user.get('name', 'Test User') + ' Updated'
            }
            test_endpoint('PUT', f'/api/users/{user_id}', update_data)
    
    # Test creating new user
    new_user_data = {
        'name': 'API Test User',
        'email': f'apitest{int(time.time())}@example.com',
        'role': 'counselor'
    }
    created_user = test_endpoint('POST', '/api/users', new_user_data, 201)
    
    # Test user login
    if created_user:
        login_data = {
            'username': created_user.get('username'),
            'password': 'password123'  # Default password
        }
        test_endpoint('POST', '/api/users/auth/login', login_data)
    
    print()
    
    # Student endpoints
    print("3. STUDENT ENDPOINTS")
    print("-" * 40)
    students = test_endpoint('GET', '/api/students')
    
    if students:
        student_list = students.get('data', students) if isinstance(students, dict) else students
        if student_list:
            sample_student = student_list[0]
            student_id = sample_student.get('id') or sample_student.get('studentId')
            if student_id:
                print(f"   Testing with student ID: {student_id}")
                test_endpoint('GET', f'/api/students/{student_id}')
                
                # Test updating student
                update_data = {
                    'name': sample_student.get('name', 'Test Student'),
                    'email': sample_student.get('email', 'test@example.com'),
                    'tingkat': sample_student.get('tingkat', '10'),
                    'kelas': sample_student.get('kelas', 'A')
                }
                test_endpoint('PUT', f'/api/students/{student_id}', update_data)
    
    # Test creating new student
    new_student_data = {
        'name': 'API Test Student',
        'email': f'studenttest{int(time.time())}@example.com',
        'classId': 'CLS001',  # Use existing class
        'tingkat': '11',
        'kelas': 'B',
        'academicStatus': 'good'
    }
    created_student = test_endpoint('POST', '/api/students', new_student_data, 201)
    
    print()
    
    # Class endpoints
    print("4. CLASS ENDPOINTS")
    print("-" * 40)
    classes = test_endpoint('GET', '/api/classes')
    
    if classes:
        class_list = classes.get('data', classes) if isinstance(classes, dict) else classes
        if class_list:
            sample_class = class_list[0]
            class_id = sample_class.get('id') or sample_class.get('schoolId')
            if class_id:
                print(f"   Testing with class ID: {class_id}")
                test_endpoint('GET', f'/api/classes/{class_id}')
                test_endpoint('GET', f'/api/classes/{class_id}/students')
    
    # Test creating new class
    new_class_data = {
        'name': f'Test Class {int(time.time())}',
        'gradeLevel': '12',
        'academicYear': '2024/2025',
        'teacherName': 'Test Teacher'
    }
    created_class = test_endpoint('POST', '/api/classes', new_class_data, 201)
    
    print()
    
    # Admin endpoints
    print("5. ADMIN ENDPOINTS")
    print("-" * 40)
    test_endpoint('GET', '/api/admin/users/deleted')
    test_endpoint('GET', '/api/admin/students/deleted')
    test_endpoint('GET', '/api/admin/classes/deleted')
    
    print()
    
    # Pagination and filtering tests
    print("6. PAGINATION & FILTERING")
    print("-" * 40)
    test_endpoint('GET', '/api/users?page=1&limit=5')
    test_endpoint('GET', '/api/students?page=1&limit=5')
    test_endpoint('GET', '/api/students?searchQuery=test')
    test_endpoint('GET', '/api/classes?page=1&limit=3')
    
    print()
    
    # Cleanup - delete created records
    print("7. CLEANUP")
    print("-" * 40)
    if created_user:
        user_id = created_user.get('userId')
        if user_id:
            test_endpoint('DELETE', f'/api/users/{user_id}')
    
    if created_student:
        student_id = created_student.get('id') or created_student.get('studentId')
        if student_id:
            test_endpoint('DELETE', f'/api/students/{student_id}')
    
    if created_class:
        class_id = created_class.get('id')
        if class_id:
            test_endpoint('DELETE', f'/api/classes/{class_id}')
    
    print()
    print("=== TEST COMPLETE ===")
    print("All critical endpoints have been tested with user_id primary key schema.")

if __name__ == "__main__":
    main()
