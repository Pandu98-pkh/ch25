#!/usr/bin/env python3
"""
Fix the class_id mapping issue by using existing valid class IDs
"""

import mysql.connector
from mysql.connector import Error
import requests
import json

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'database': 'counselorhub',
    'charset': 'utf8mb4'
}

def get_valid_class_id():
    """Get a valid class_id from the database"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("🔍 Finding valid class IDs...")
        
        # Get classes with grade 11 or XI
        cursor.execute("""
            SELECT class_id, name, grade_level, academic_year 
            FROM classes 
            WHERE grade_level IN ('11', 'XI') 
            LIMIT 5
        """)
        classes = cursor.fetchall()
        
        if classes:
            print("✅ Found valid classes for grade 11/XI:")
            for cls in classes:
                print(f"  {cls['class_id']}: {cls['grade_level']} {cls['name']}")
            return classes[0]['class_id']
        else:
            print("⚠️ No grade 11/XI classes found, getting any valid class...")
            cursor.execute("SELECT class_id, name, grade_level FROM classes LIMIT 1")
            any_class = cursor.fetchone()
            if any_class:
                print(f"✅ Using class: {any_class['class_id']}")
                return any_class['class_id']
        
        return None
        
    except Error as e:
        print(f"❌ Database error: {e}")
        return None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def test_student_creation_with_valid_class():
    """Test student creation with a valid class_id"""
    valid_class_id = get_valid_class_id()
    
    if not valid_class_id:
        print("❌ No valid class_id found!")
        return False
    
    # Test data with valid class_id
    test_student_data = {
        "name": "Test Student Fix",
        "email": "test.fix@example.com",
        "tingkat": "XI",
        "kelas": "IPA-1",
        "classId": valid_class_id,  # Use the valid class_id
        "academicStatus": "good",
        "studentId": "S12345FIX",
        "avatar": ""
    }
    
    print(f"\n🧪 Testing student creation with valid class_id: {valid_class_id}")
    
    url = "http://localhost:5000/api/students"
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=test_student_data, headers=headers)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ SUCCESS! Student created successfully!")
            result = response.json()
            print(f"Created Student ID: {result.get('studentId')}")
            return True
        elif response.status_code == 409:
            print("⚠️ Conflict - User already exists (expected behavior)")
            result = response.json()
            print(f"Response: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"❌ Failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def create_proper_classes_for_frontend():
    """Create classes that match frontend expectations"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("\n🔧 Creating classes that match frontend expectations...")
        
        # Classes that match the frontend tingkat/kelas combinations
        frontend_classes = [
            {
                'class_id': 'C2025-X-IPA1',
                'name': 'IPA-1',
                'grade_level': 'X',
                'academic_year': '2024/2025',
                'teacher_name': 'Guru Fisika'
            },
            {
                'class_id': 'C2025-XI-IPA1',
                'name': 'IPA-1',
                'grade_level': 'XI',
                'academic_year': '2024/2025',
                'teacher_name': 'Guru Kimia'
            },
            {
                'class_id': 'C2025-XII-IPA1',
                'name': 'IPA-1',
                'grade_level': 'XII',
                'academic_year': '2024/2025',
                'teacher_name': 'Guru Biologi'
            },
            {
                'class_id': 'C2025-XI-IPS1',
                'name': 'IPS-1',
                'grade_level': 'XI',
                'academic_year': '2024/2025',
                'teacher_name': 'Guru Sejarah'
            },
            {
                'class_id': 'C2025-XI-IPS2',
                'name': 'IPS-2',
                'grade_level': 'XI',
                'academic_year': '2024/2025',
                'teacher_name': 'Guru Geografi'
            }
        ]
        
        for cls in frontend_classes:
            # Check if class already exists
            cursor.execute("SELECT class_id FROM classes WHERE class_id = %s", (cls['class_id'],))
            if cursor.fetchone():
                print(f"  ⚠️ Class {cls['class_id']} already exists")
                continue
            
            try:
                cursor.execute("""
                    INSERT INTO classes (class_id, name, grade_level, academic_year, teacher_name, student_count, is_active)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    cls['class_id'],
                    cls['name'],
                    cls['grade_level'],
                    cls['academic_year'],
                    cls['teacher_name'],
                    0,
                    True
                ))
                print(f"  ✅ Created: {cls['class_id']} - {cls['grade_level']} {cls['name']}")
            except Error as e:
                print(f"  ❌ Failed to create {cls['class_id']}: {e}")
        
        connection.commit()
        print("✅ Frontend-compatible classes created!")
        
    except Error as e:
        print(f"❌ Error creating frontend classes: {e}")
        if connection.is_connected():
            connection.rollback()
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    # First try with existing valid class_id
    success = test_student_creation_with_valid_class()
    
    if success:
        print("\n✅ Student creation works with existing class IDs!")
        print("🔧 Now creating frontend-compatible classes...")
        create_proper_classes_for_frontend()
        
        # Test again with frontend format
        print("\n🧪 Testing with frontend-compatible class ID...")
        test_data_frontend = {
            "name": "Frontend Test Student",
            "email": "frontend.test@example.com",
            "tingkat": "XI",
            "kelas": "IPA-1",
            "classId": "C2025-XI-IPA1",
            "academicStatus": "good",
            "studentId": "S12345FRONT",
            "avatar": ""
        }
        
        response = requests.post("http://localhost:5000/api/students", json=test_data_frontend)
        if response.status_code in [201, 409]:
            print("✅ Frontend format also works!")
        else:
            print(f"❌ Frontend format failed: {response.status_code} - {response.text}")
    else:
        print("❌ Basic student creation failed. Need to investigate further.")
