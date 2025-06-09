#!/usr/bin/env python3
"""
Debug script untuk mengecek mapping user-student yang menyebabkan error 404
"""

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def connect_to_database():
    """Connect to MySQL database"""
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'counselorhub'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            port=int(os.getenv('DB_PORT', 3306))
        )
        return connection
    except Error as e:
        print(f"❌ Error connecting to database: {e}")
        return None

def debug_user_student_mapping():
    """Debug user-student mapping issue"""
    connection = connect_to_database()
    if not connection:
        return
    
    cursor = connection.cursor()
    
    print("🔍 DEBUGGING USER-STUDENT MAPPING")
    print("=" * 50)
    
    # 1. Check all users
    print("\n1. ALL USERS:")
    cursor.execute("SELECT user_id, name, email, role FROM users ORDER BY user_id")
    users = cursor.fetchall()
    for user in users:
        print(f"   User ID: {user[0]}, Name: {user[1]}, Email: {user[2]}, Role: {user[3]}")
      # 2. Check students table structure first
    print("\n2. STUDENTS TABLE STRUCTURE:")
    cursor.execute("DESCRIBE students")
    columns = cursor.fetchall()
    for col in columns:
        print(f"   Column: {col[0]}, Type: {col[1]}, Null: {col[2]}, Key: {col[3]}")
    
    # 3. Check all students with correct column names
    print("\n3. ALL STUDENTS:")
    cursor.execute("SELECT * FROM students ORDER BY student_id LIMIT 10")
    students = cursor.fetchall()
    for student in students:
        print(f"   Student: {student}")
    
    # 4. Check user-student mapping
    print("\n4. USER-STUDENT MAPPING:")
    cursor.execute("""
        SELECT u.user_id, u.name as user_name, u.role, s.student_id
        FROM users u
        LEFT JOIN students s ON u.user_id = s.user_id
        WHERE u.role = 'student'
        ORDER BY u.user_id
        LIMIT 10
    """)
    mappings = cursor.fetchall()
    for mapping in mappings:
        user_id, user_name, role, student_id = mapping
        if student_id:
            print(f"   ✅ User {user_id} ({user_name}) -> Student {student_id}")
        else:
            print(f"   ❌ User {user_id} ({user_name}, {role}) -> NO STUDENT RECORD")
      # 5. Check specific problematic user (ID 1)
    print("\n5. SPECIFIC CHECK FOR USER ID 1:")
    cursor.execute("SELECT user_id, name, email, role FROM users WHERE user_id = '1'")
    user_1 = cursor.fetchone()
    if user_1:
        print(f"   User 1 found: {user_1}")
        
        cursor.execute("SELECT * FROM students WHERE user_id = '1'")
        student_1 = cursor.fetchone()
        if student_1:
            print(f"   ✅ Student record found: {student_1}")
        else:
            print("   ❌ NO STUDENT RECORD for user_id = '1'")
    else:
        print("   ❌ User ID '1' not found!")
        
        # Check if there's a user with numeric ID 1
        cursor.execute("SELECT user_id, name, email, role FROM users WHERE user_id = 1")
        user_1_numeric = cursor.fetchone()
        if user_1_numeric:
            print(f"   Found numeric user ID 1: {user_1_numeric}")
        else:
            print("   No numeric user ID 1 either")
    
    # 6. Check what the API endpoint actually queries
    print("\n6. SIMULATING API ENDPOINT /api/students/by-user/1:")
    cursor.execute("SELECT * FROM students WHERE user_id = %s", ('1',))
    result = cursor.fetchone()
    if result:
        print(f"   ✅ API would return: {result}")
    else:
        print("   ❌ API returns 404 - No student found for user_id = '1'")
    
    # 7. Check if we need to find the logged-in user
    print("\n7. CHECKING FOR ACTIVE SESSION OR COMMON USER:")
    # Check for users that might be used in testing
    test_users = ['1', 'student1', 'test', 'STU001', '1103210016']
    for user_id in test_users:
        cursor.execute("SELECT user_id, name, role FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        if user:
            print(f"   Found user {user_id}: {user}")
            cursor.execute("SELECT student_id FROM students WHERE user_id = %s", (user_id,))
            student = cursor.fetchone()
            if student:
                print(f"     ✅ Has student record: {student[0]}")
            else:
                print(f"     ❌ No student record")
        else:
            print(f"   User {user_id}: Not found")
    
    cursor.close()
    connection.close()

if __name__ == "__main__":
    debug_user_student_mapping()
