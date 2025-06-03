#!/usr/bin/env python3
"""
Test script to simulate exactly what frontend sends and debug the issue
"""

import requests
import json

def test_add_student():
    """Test the add student endpoint with exact frontend data"""
    
    # First, get classes data like frontend does
    print("🔍 Getting classes data from API...")
    response = requests.get('http://localhost:5000/api/classes?page=1&limit=1000')
    
    if response.status_code != 200:
        print(f"❌ Failed to get classes: {response.status_code}")
        return
    
    classes_data = response.json()
    print(f"✅ Got {len(classes_data['data'])} classes")
    
    # Show some class data
    for cls in classes_data['data'][:5]:
        print(f"  - ID: {cls.get('classId', 'No classId')}, Name: {cls.get('name')}, Grade: {cls.get('gradeLevel')}")
    
    # Find a class for XI IPA-1 
    target_grade = 'XI'
    target_class = 'IPA-1'
    
    matching_class = None
    for cls in classes_data['data']:
        grade = cls.get('gradeLevel', '')
        name = cls.get('name', '')
        
        # Convert numeric grades to Roman numerals if needed
        if grade == '10': grade = 'X'
        elif grade == '11': grade = 'XI'
        elif grade == '12': grade = 'XII'
        
        grade_only = grade.split(' ')[0]
        if grade_only == target_grade and name == target_class:
            matching_class = cls
            break
    
    if not matching_class:
        print(f"❌ Could not find class for {target_grade} {target_class}")
        return
    
    print(f"✅ Found matching class: {matching_class}")
    
    # Now test student creation with the exact data frontend would send
    student_data = {
        "studentId": "TEST2025999",
        "name": "Test Student Debug",
        "email": "testdebug@example.com",
        "tingkat": target_grade,
        "kelas": target_class,
        "classId": matching_class['classId'],  # This should be the correct classId
        "academicStatus": "good",
        "avatar": "",
        "grade": target_grade,
        "class": target_class,
        "photo": "",
        "avatar_type": "url",
        "avatar_filename": None
    }
    
    print(f"\n🚀 Testing student creation with data:")
    print(json.dumps(student_data, indent=2))
    
    response = requests.post('http://localhost:5000/api/students', json=student_data)
    
    print(f"\n📊 Response status: {response.status_code}")
    
    if response.status_code == 201:
        print("✅ Student created successfully!")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"❌ Failed to create student:")
        print(response.text)

if __name__ == "__main__":
    test_add_student()
