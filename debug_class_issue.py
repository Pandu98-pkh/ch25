#!/usr/bin/env python3
"""
Debug script to check class data and find the foreign key constraint issue
"""

import mysql.connector
from mysql.connector import Error
import json

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'database': 'counselorhub',
    'charset': 'utf8mb4'
}

def debug_classes():
    """Debug class data and foreign key constraints"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("🔍 Checking current classes in database...")
        cursor.execute("SELECT class_id, name, grade_level FROM classes WHERE is_active = TRUE ORDER BY grade_level, name")
        classes = cursor.fetchall()
        
        print(f"\n📊 Found {len(classes)} active classes:")
        for cls in classes:
            print(f"  - ID: {cls['class_id']}, Name: {cls['name']}, Grade: {cls['grade_level']}")
        
        print("\n🔍 Checking foreign key constraints on students table...")
        cursor.execute("SHOW CREATE TABLE students")
        result = cursor.fetchone()
        print(f"\nStudents table structure:\n{result['Create Table']}")
        
        print("\n🔍 Checking if there are any students with invalid class_id...")
        cursor.execute("""
            SELECT s.student_id, s.class_id 
            FROM students s 
            LEFT JOIN classes c ON s.class_id = c.class_id 
            WHERE s.is_active = TRUE AND c.class_id IS NULL
        """)
        invalid_students = cursor.fetchall()
        
        if invalid_students:
            print(f"\n❌ Found {len(invalid_students)} students with invalid class_id:")
            for student in invalid_students:
                print(f"  - Student: {student['student_id']}, Invalid class_id: {student['class_id']}")
        else:
            print("\n✅ All students have valid class_id references")
        
        print("\n🔍 Testing what happens when we try to create a student with specific class_ids...")
        
        # Test common class_ids that frontend might send
        test_class_ids = ['CLS001', 'C2025-XI-IPA-1', 'XI-IPA-1', 'C2025-XI-IPA1']
        
        for test_id in test_class_ids:
            cursor.execute("SELECT class_id FROM classes WHERE class_id = %s", (test_id,))
            result = cursor.fetchone()
            status = "✅ EXISTS" if result else "❌ NOT FOUND"
            print(f"  - class_id '{test_id}': {status}")
        
        connection.close()
        
    except Error as e:
        print(f"❌ Database error: {e}")

if __name__ == "__main__":
    debug_classes()
