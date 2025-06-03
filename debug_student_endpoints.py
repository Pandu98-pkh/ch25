#!/usr/bin/env python3
"""
Debug student endpoints specifically
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def debug_student_update():
    """Debug student update endpoint"""
    print("=== DEBUGGING STUDENT UPDATE ===")
    
    # Get a student first
    response = requests.get(f"{BASE_URL}/api/students")
    if response.status_code == 200:
        students_data = response.json()
        students = students_data.get('data', students_data) if isinstance(students_data, dict) else students_data
        
        if students:
            student = students[0]
            student_id = student.get('id') or student.get('studentId')
            print(f"Testing update with student ID: {student_id}")
            print(f"Student data: {json.dumps(student, indent=2)}")
            
            # Try a simple update
            update_data = {
                'name': student.get('name', 'Test Student'),
                'email': student.get('email', 'test@example.com')
            }
            
            print(f"\nUpdate data: {json.dumps(update_data, indent=2)}")
            
            response = requests.put(f"{BASE_URL}/api/students/{student_id}", json=update_data)
            print(f"\nUpdate response status: {response.status_code}")
            print(f"Update response: {response.text}")

def debug_student_create():
    """Debug student create endpoint"""
    print("\n=== DEBUGGING STUDENT CREATE ===")
    
    # Get existing classes first
    response = requests.get(f"{BASE_URL}/api/classes")
    if response.status_code == 200:
        classes_data = response.json()
        classes = classes_data.get('data', classes_data) if isinstance(classes_data, dict) else classes_data
        
        if classes:
            class_id = classes[0].get('id') or classes[0].get('schoolId')
            print(f"Using class ID: {class_id}")
            
            # Try creating a student
            create_data = {
                'name': 'Debug Test Student',
                'email': 'debugtest@example.com',
                'classId': class_id,
                'tingkat': '10',
                'kelas': 'A',
                'academicStatus': 'good'
            }
            
            print(f"Create data: {json.dumps(create_data, indent=2)}")
            
            response = requests.post(f"{BASE_URL}/api/students", json=create_data)
            print(f"\nCreate response status: {response.status_code}")
            print(f"Create response: {response.text}")

if __name__ == "__main__":
    debug_student_update()
    debug_student_create()
