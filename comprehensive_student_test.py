#!/usr/bin/env python3
"""
Final comprehensive test of student creation functionality
"""

import requests
import json

def comprehensive_test():
    """Test student creation with multiple scenarios"""
    
    base_url = 'http://localhost:5000'
    
    print("🔍 Testing Add Student functionality comprehensively...")
    
    # Test scenarios
    test_cases = [
        {
            'name': 'Grade X IPA Student',
            'data': {
                "studentId": "TEST2025X01",
                "name": "Test Student Grade X IPA",
                "email": "testx@example.com",
                "tingkat": "X",
                "kelas": "IPA-1",
                "academicStatus": "good",
                "avatar": ""
            }
        },
        {
            'name': 'Grade XI IPS Student',
            'data': {
                "studentId": "TEST2025XI01",
                "name": "Test Student Grade XI IPS",
                "email": "testxi@example.com",
                "tingkat": "XI",
                "kelas": "IPS-1",
                "academicStatus": "warning",
                "avatar": ""
            }
        },
        {
            'name': 'Grade XII IPA Student',
            'data': {
                "studentId": "TEST2025XII01",
                "name": "Test Student Grade XII IPA",
                "email": "testxii@example.com",
                "tingkat": "XII",
                "kelas": "IPA-1",
                "academicStatus": "critical",
                "avatar": ""
            }
        }
    ]
    
    # First, get classes data
    print("\n📊 Getting classes data...")
    response = requests.get(f'{base_url}/api/classes?page=1&limit=1000')
    if response.status_code != 200:
        print(f"❌ Failed to get classes: {response.status_code}")
        return
    
    classes_data = response.json()
    print(f"✅ Got {len(classes_data['data'])} classes")
    
    # Function to find matching class
    def find_class_id(tingkat, kelas):
        for cls in classes_data['data']:
            grade = cls.get('gradeLevel', '')
            name = cls.get('name', '')
            
            # Convert numeric grades to Roman numerals if needed
            if grade == '10': grade = 'X'
            elif grade == '11': grade = 'XI'
            elif grade == '12': grade = 'XII'
            
            grade_only = grade.split(' ')[0]
            if grade_only == tingkat and name == kelas:
                return cls['classId']
        return None
    
    # Test each scenario
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}: {test_case['name']}")
        
        data = test_case['data'].copy()
        tingkat = data['tingkat']
        kelas = data['kelas']
        
        # Find matching classId
        class_id = find_class_id(tingkat, kelas)
        if not class_id:
            print(f"❌ Could not find classId for {tingkat} {kelas}")
            continue
        
        data['classId'] = class_id
        data['grade'] = tingkat
        data['class'] = kelas
        data['photo'] = data['avatar']
        data['avatar_type'] = 'url'
        data['avatar_filename'] = None
        
        print(f"   Using classId: {class_id}")
        
        # Test student creation
        response = requests.post(f'{base_url}/api/students', json=data)
        
        if response.status_code == 201:
            print(f"✅ {test_case['name']} created successfully!")
            result = response.json()
            print(f"   Student ID: {result.get('studentId')}")
            print(f"   Name: {result.get('name')}")
            print(f"   Class: {result.get('tingkat')} {result.get('kelas')}")
        elif response.status_code == 409:
            print(f"⚠️ {test_case['name']} - User already exists (expected for repeated tests)")
        else:
            print(f"❌ Failed to create {test_case['name']}: {response.status_code}")
            print(f"   Error: {response.text}")
    
    print("\n🎯 Test Summary Complete!")

if __name__ == "__main__":
    comprehensive_test()
