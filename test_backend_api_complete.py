#!/usr/bin/env python3
"""
Comprehensive test of all backend API endpoints after student_id primary key migration
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
        
        print(f"{method} {endpoint}: {response.status_code}")
        
        if response.status_code == expected_status:
            try:
                result = response.json()
                if isinstance(result, dict) and 'data' in result:
                    print(f"  ✅ Success - {len(result['data'])} records")
                elif isinstance(result, list):
                    print(f"  ✅ Success - {len(result)} records")
                else:
                    print(f"  ✅ Success - Response: {str(result)[:100]}...")
                return result
            except:
                print(f"  ✅ Success - Non-JSON response")
                return True
        else:
            print(f"  ❌ Failed - Expected {expected_status}, got {response.status_code}")
            try:
                error = response.json()
                print(f"     Error: {error}")
            except:
                print(f"     Raw response: {response.text[:200]}")
            return None
            
    except Exception as e:
        print(f"  ❌ Exception: {e}")
        return None

def main():
    print("=== BACKEND API COMPREHENSIVE TEST ===")
    print("Testing all endpoints after student_id primary key migration\n")
    
    # Test health check
    print("1. Health Check")
    test_endpoint('GET', '/health')
    print()
    
    # Test student endpoints
    print("2. Student Endpoints")
    
    # Get all students
    students = test_endpoint('GET', '/api/students')
    if students:
        student_list = students.get('data', students) if isinstance(students, dict) else students
        if student_list:
            sample_student = student_list[0]
            student_id = sample_student.get('id') or sample_student.get('studentId')
            print(f"     Sample student ID: {student_id}")
            
            # Get specific student
            if student_id:
                test_endpoint('GET', f'/api/students/{student_id}')
            
            # Test update student
            if student_id:
                update_data = {
                    'name': sample_student.get('name', 'Test Student'),
                    'email': sample_student.get('email', 'test@example.com'),
                    'tingkat': sample_student.get('tingkat', '10'),
                    'kelas': sample_student.get('kelas', 'A')
                }
                test_endpoint('PUT', f'/api/students/{student_id}', update_data)
    
    # Test create new student
    new_student_data = {
        'name': 'API Test Student',
        'email': f'apitest{int(time.time())}@example.com',
        'tingkat': '11',
        'kelas': 'B',
        'academicStatus': 'good'
    }
    created_student = test_endpoint('POST', '/api/students', new_student_data, 201)
    
    # Test delete the created student
    if created_student:
        new_student_id = created_student.get('id') or created_student.get('studentId')
        if new_student_id:
            test_endpoint('DELETE', f'/api/students/{new_student_id}')
    
    print()
    
    # Test class endpoints
    print("3. Class Endpoints")
    classes = test_endpoint('GET', '/api/classes')
    if classes:
        class_list = classes.get('data', classes) if isinstance(classes, dict) else classes
        if class_list:
            sample_class = class_list[0]
            class_id = sample_class.get('id') or sample_class.get('schoolId')
            print(f"     Sample class ID: {class_id}")
            
            # Get specific class
            if class_id:
                test_endpoint('GET', f'/api/classes/{class_id}')
            
            # Get students in class
            if class_id:
                test_endpoint('GET', f'/api/classes/{class_id}/students')
    
    print()
    
    # Test user endpoints  
    print("4. User Endpoints")
    test_endpoint('GET', '/api/users')
    
    print()
    
    # Test admin endpoints
    print("5. Admin Endpoints")
    test_endpoint('GET', '/api/admin/students/deleted')
    test_endpoint('GET', '/api/admin/classes/deleted')
    test_endpoint('GET', '/api/admin/users/deleted')
    
    print()
    
    # Test with pagination and filtering
    print("6. Pagination and Filtering Tests")
    test_endpoint('GET', '/api/students?page=1&limit=5')
    test_endpoint('GET', '/api/students?searchQuery=test')
    test_endpoint('GET', '/api/classes?page=1&limit=3')
    
    print()
    print("=== TEST COMPLETE ===")
    print("All endpoints have been tested with the new student_id primary key schema.")

if __name__ == "__main__":
    main()
