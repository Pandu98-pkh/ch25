#!/usr/bin/env python3
"""
Check database classes and fix the foreign key constraint issue
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

def check_classes_table():
    """Check what's actually in the classes table"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("🔍 Checking classes table structure and data...")
        
        # Show table structure
        cursor.execute("DESCRIBE classes")
        structure = cursor.fetchall()
        print("\n📋 Classes table structure:")
        for col in structure:
            print(f"  {col['Field']}: {col['Type']} {col['Null']} {col['Key']} {col['Default']}")
        
        # Count total classes
        cursor.execute("SELECT COUNT(*) as total FROM classes")
        total = cursor.fetchone()['total']
        print(f"\n📊 Total classes in database: {total}")
        
        # Show actual data
        cursor.execute("SELECT * FROM classes LIMIT 10")
        classes = cursor.fetchall()
        print(f"\n📄 Sample classes data:")
        for cls in classes:
            print(f"  ID: {cls['class_id']}, Name: {cls['name']}, Grade: {cls['grade_level']}, Year: {cls['academic_year']}")
            
        return classes
        
    except Error as e:
        print(f"❌ Database error: {e}")
        return []
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def create_sample_classes():
    """Create sample classes that match what the frontend expects"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("\n🔧 Creating sample classes for testing...")
        
        sample_classes = [
            {
                'class_id': 'C2025-X-IPA-1',
                'name': 'IPA-1',
                'grade_level': 'X',
                'academic_year': '2024/2025',
                'teacher_name': 'Pak Budi'
            },
            {
                'class_id': 'C2025-XI-IPA-1',
                'name': 'IPA-1',
                'grade_level': 'XI',
                'academic_year': '2024/2025',
                'teacher_name': 'Bu Sari'
            },
            {
                'class_id': 'C2025-XII-IPA-1',
                'name': 'IPA-1',
                'grade_level': 'XII',
                'academic_year': '2024/2025',
                'teacher_name': 'Pak Joko'
            },
            {
                'class_id': 'C2025-XI-IPS-1',
                'name': 'IPS-1',
                'grade_level': 'XI',
                'academic_year': '2024/2025',
                'teacher_name': 'Bu Ani'
            },
            {
                'class_id': 'C2025-XI-IPS-2',
                'name': 'IPS-2',
                'grade_level': 'XI',
                'academic_year': '2024/2025',
                'teacher_name': 'Pak Tono'
            }
        ]
        
        for cls in sample_classes:
            # Check if class already exists
            cursor.execute("SELECT class_id FROM classes WHERE class_id = %s", (cls['class_id'],))
            if cursor.fetchone():
                print(f"  ⚠️ Class {cls['class_id']} already exists, skipping...")
                continue
                
            cursor.execute("""
                INSERT INTO classes (class_id, name, grade_level, academic_year, teacher_name, student_count)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                cls['class_id'],
                cls['name'],
                cls['grade_level'],
                cls['academic_year'],
                cls['teacher_name'],
                0
            ))
            print(f"  ✅ Created class: {cls['class_id']} - {cls['grade_level']} {cls['name']}")
        
        connection.commit()
        print(f"\n✅ Sample classes created successfully!")
        
    except Error as e:
        print(f"❌ Error creating classes: {e}")
        if connection.is_connected():
            connection.rollback()
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def test_foreign_key_constraint():
    """Test if we can create a student with the new class_id"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("\n🧪 Testing foreign key constraint...")
        
        # Try to insert a test student
        test_student_data = {
            'student_id': 'TEST123',
            'user_id': 'TESTUSER001',
            'class_id': 'C2025-XI-IPA-1',
            'academic_status': 'good'
        }
        
        # First create a test user
        cursor.execute("""
            INSERT IGNORE INTO users (user_id, username, email, password_hash, name, role)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            test_student_data['user_id'],
            'testuser',
            'test@example.com',
            'dummy_hash',
            'Test User',
            'student'
        ))
        
        # Now try to create the student
        cursor.execute("""
            INSERT INTO students (student_id, user_id, class_id, academic_status)
            VALUES (%s, %s, %s, %s)
        """, (
            test_student_data['student_id'],
            test_student_data['user_id'],
            test_student_data['class_id'],
            test_student_data['academic_status']
        ))
        
        connection.commit()
        print("✅ Foreign key constraint test passed!")
        
        # Clean up test data
        cursor.execute("DELETE FROM students WHERE student_id = %s", (test_student_data['student_id'],))
        cursor.execute("DELETE FROM users WHERE user_id = %s", (test_student_data['user_id'],))
        connection.commit()
        print("🧹 Test data cleaned up")
        
    except Error as e:
        print(f"❌ Foreign key constraint test failed: {e}")
        if connection.is_connected():
            connection.rollback()
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    # Check current state
    classes = check_classes_table()
    
    # Create sample classes if needed
    if len(classes) == 0 or all(cls.get('class_id') is None for cls in classes):
        print("\n⚠️ Classes table appears to have issues. Creating sample data...")
        create_sample_classes()
        
        # Check again
        print("\n🔄 Rechecking classes table...")
        check_classes_table()
    
    # Test foreign key constraint
    test_foreign_key_constraint()
