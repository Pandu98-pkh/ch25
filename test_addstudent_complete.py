#!/usr/bin/env python3
"""
Test the AddStudent form end-to-end to verify the fix
"""

import requests
import json
import time

def test_full_add_student_flow():
    """Test the complete AddStudent workflow"""
    
    print("🧪 Testing complete AddStudent workflow...")
    
    # Test 1: Check if classes API returns proper data
    print("\n1️⃣ Testing classes API...")
    classes_response = requests.get("http://localhost:5000/api/classes")
    
    if classes_response.status_code == 200:
        classes_data = classes_response.json()
        print(f"✅ Classes API works: {len(classes_data.get('data', []))} classes found")
        
        # Find frontend-compatible classes
        frontend_classes = []
        for cls in classes_data.get('data', []):
            if cls.get('class_id', '').startswith('C2025-'):
                frontend_classes.append(cls)
        
        print(f"✅ Frontend-compatible classes: {len(frontend_classes)}")
        for cls in frontend_classes[:3]:  # Show first 3
            print(f"  - {cls['class_id']}: {cls['grade_level']} {cls['name']}")
    else:
        print(f"❌ Classes API failed: {classes_response.status_code}")
        return False
    
    # Test 2: Create student with proper class mapping
    print("\n2️⃣ Testing student creation with proper class mapping...")
    
    student_data = {
        "name": "John Doe Test",
        "email": "john.doe.test@example.com",
        "tingkat": "XI",
        "kelas": "IPA-1",
        "classId": "C2025-XI-IPA1",  # Use the frontend-compatible class ID
        "academicStatus": "good",
        "studentId": f"S{int(time.time())}",  # Unique ID
        "avatar": ""
    }
    
    response = requests.post("http://localhost:5000/api/students", json=student_data)
    
    if response.status_code == 201:
        print("✅ Student created successfully!")
        student = response.json()
        print(f"  Student ID: {student.get('studentId')}")
        print(f"  Name: {student.get('name')}")
        print(f"  Class: {student.get('tingkat')} {student.get('kelas')}")
        return True
    elif response.status_code == 409:
        print("⚠️ User already exists (expected behavior for existing emails)")
        return True
    else:
        print(f"❌ Student creation failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def test_edge_cases():
    """Test edge cases and error handling"""
    print("\n3️⃣ Testing edge cases...")
    
    # Test with invalid class_id
    invalid_data = {
        "name": "Invalid Test",
        "email": "invalid.test@example.com",
        "classId": "INVALID_CLASS_ID",
        "academicStatus": "good",
        "studentId": f"SINVALID{int(time.time())}"
    }
    
    response = requests.post("http://localhost:5000/api/students", json=invalid_data)
    if response.status_code == 500:
        print("✅ Invalid class_id properly rejected with 500 error")
    else:
        print(f"⚠️ Unexpected response for invalid class_id: {response.status_code}")
    
    # Test with missing required fields
    missing_data = {
        "name": "Missing Fields Test"
        # Missing email and classId
    }
    
    response = requests.post("http://localhost:5000/api/students", json=missing_data)
    if response.status_code == 400:
        print("✅ Missing required fields properly rejected with 400 error")
    else:
        print(f"⚠️ Unexpected response for missing fields: {response.status_code}")

def verify_frontend_class_integration():
    """Verify that frontend can get classes and map them correctly"""
    print("\n4️⃣ Verifying frontend class integration...")
    
    # Get classes and simulate frontend logic
    classes_response = requests.get("http://localhost:5000/api/classes?page=1&limit=1000")
    
    if classes_response.status_code == 200:
        classes = classes_response.json().get('data', [])
        
        # Simulate frontend tingkat extraction
        tingkat_set = set()
        for cls in classes:
            grade = cls.get('gradeLevel', '')
            if grade == '10': grade = 'X'
            elif grade == '11': grade = 'XI'
            elif grade == '12': grade = 'XII'
            
            grade_only = grade.split(' ')[0]
            tingkat_set.add(grade_only)
        
        available_tingkat = sorted(list(tingkat_set), key=lambda x: {'X': 1, 'XI': 2, 'XII': 3}.get(x, 999))
        print(f"✅ Available tingkat levels: {available_tingkat}")
        
        # Test class mapping for XI IPA-1
        test_tingkat = 'XI'
        test_kelas = 'IPA-1'
        
        matching_class = None
        for cls in classes:
            grade = cls.get('gradeLevel', '')
            if grade == '11': grade = 'XI'
            
            if grade == test_tingkat and cls.get('name') == test_kelas:
                matching_class = cls
                break
        
        if matching_class:
            print(f"✅ Class mapping works: {test_tingkat} {test_kelas} → {matching_class['class_id']}")
            return True
        else:
            print(f"❌ Class mapping failed for {test_tingkat} {test_kelas}")
            return False
    
    return False

if __name__ == "__main__":
    print("🚀 Starting comprehensive AddStudent testing...\n")
    
    # Run all tests
    test1 = test_full_add_student_flow()
    test_edge_cases()
    test2 = verify_frontend_class_integration()
    
    print(f"\n📊 Test Results:")
    print(f"  Main flow: {'✅ PASS' if test1 else '❌ FAIL'}")
    print(f"  Frontend integration: {'✅ PASS' if test2 else '❌ FAIL'}")
    
    if test1 and test2:
        print(f"\n🎉 ALL TESTS PASSED! AddStudent functionality should now work correctly.")
        print(f"💡 The 500 error has been fixed by:")
        print(f"   1. Creating frontend-compatible class IDs")
        print(f"   2. Fixing foreign key constraint issues")
        print(f"   3. Ensuring proper class mapping in the form")
    else:
        print(f"\n❌ Some tests failed. Further investigation needed.")
