#!/usr/bin/env python3
"""
Debug script to check student_id foreign key constraint issue
"""

import mysql.connector
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

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None

def check_user_and_student_records():
    """Check if user exists and has corresponding student record"""
    connection = get_db_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check all users
        print("=== CHECKING USERS TABLE ===")
        cursor.execute("SELECT user_id, username, name, role FROM users WHERE is_active = TRUE LIMIT 10")
        users = cursor.fetchall()
        
        for user in users:
            print(f"User ID: {user['user_id']}, Username: {user['username']}, Name: {user['name']}, Role: {user['role']}")
            
            # Check if this user has a student record
            cursor.execute("SELECT student_id, user_id FROM students WHERE user_id = %s AND is_active = TRUE", (user['user_id'],))
            student = cursor.fetchone()
            
            if student:
                print(f"  ✅ Has student record: student_id = {student['student_id']}")
            else:
                print(f"  ❌ NO student record found")
            print()
        
        # Check students table structure
        print("\n=== CHECKING STUDENTS TABLE STRUCTURE ===")
        cursor.execute("DESCRIBE students")
        columns = cursor.fetchall()
        for col in columns:
            print(f"Column: {col['Field']}, Type: {col['Type']}, Key: {col['Key']}")
        
        # Check foreign key constraints
        print("\n=== CHECKING FOREIGN KEY CONSTRAINTS ===")
        cursor.execute("""
            SELECT 
                CONSTRAINT_NAME, 
                TABLE_NAME, 
                COLUMN_NAME, 
                REFERENCED_TABLE_NAME, 
                REFERENCED_COLUMN_NAME
            FROM 
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE 
                REFERENCED_TABLE_SCHEMA = 'counselorhub' 
                AND TABLE_NAME = 'mental_health_assessments'
        """)
        constraints = cursor.fetchall()
        
        for constraint in constraints:
            print(f"Constraint: {constraint['CONSTRAINT_NAME']}")
            print(f"  {constraint['TABLE_NAME']}.{constraint['COLUMN_NAME']} -> {constraint['REFERENCED_TABLE_NAME']}.{constraint['REFERENCED_COLUMN_NAME']}")
        
        # Check what student_ids exist
        print("\n=== CHECKING EXISTING STUDENT IDs ===")
        cursor.execute("SELECT student_id, user_id FROM students WHERE is_active = TRUE LIMIT 10")
        students = cursor.fetchall()
        
        for student in students:
            print(f"Student ID: {student['student_id']}, User ID: {student['user_id']}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def test_mental_health_with_valid_student():
    """Test creating mental health assessment with valid student_id"""
    connection = get_db_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get a valid student_id
        cursor.execute("SELECT student_id, user_id FROM students WHERE is_active = TRUE LIMIT 1")
        student = cursor.fetchone()
        
        if not student:
            print("❌ No active students found in database")
            return
        
        print(f"\n=== TESTING WITH VALID STUDENT ===")
        print(f"Testing with student_id: {student['student_id']}, user_id: {student['user_id']}")
        
        # Test assessment data
        assessment_data = {
            "student_id": student['student_id'],  # Use actual student_id
            "assessment_type": "PHQ-9",
            "score": 10,
            "risk_level": "moderate",
            "notes": "Debug test assessment",
            "category": "routine",
            "assessor_id": student['user_id'],  # Use the user as assessor
            "responses": json.dumps({"q1": 2, "q2": 1, "q3": 2}),
            "recommendations": "Follow up recommended"
        }
        
        # Test via API
        response = requests.post(
            "http://localhost:5000/api/mental-health/assessments",
            json=assessment_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            print("✅ Assessment created successfully with valid student_id")
            data = response.json()
            print(f"   Assessment ID: {data.get('data', {}).get('id')}")
        else:
            print(f"❌ Assessment creation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def test_frontend_user_to_student_resolution():
    """Test how frontend resolves user_id to student_id"""
    print("\n=== TESTING FRONTEND USER TO STUDENT RESOLUTION ===")
    
    connection = get_db_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get some users and check if they have student records
        cursor.execute("""
            SELECT u.user_id, u.username, u.name, u.role, s.student_id
            FROM users u
            LEFT JOIN students s ON u.user_id = s.user_id AND s.is_active = TRUE
            WHERE u.is_active = TRUE
            LIMIT 10
        """)
        
        users_with_students = cursor.fetchall()
        
        print("User -> Student mapping:")
        for user in users_with_students:
            if user['student_id']:
                print(f"✅ User {user['user_id']} ({user['username']}) -> Student {user['student_id']}")
            else:
                print(f"❌ User {user['user_id']} ({user['username']}) -> NO STUDENT RECORD")
                
        # Find users without student records
        print("\n=== USERS WITHOUT STUDENT RECORDS ===")
        cursor.execute("""
            SELECT u.user_id, u.username, u.name, u.role
            FROM users u
            LEFT JOIN students s ON u.user_id = s.user_id AND s.is_active = TRUE
            WHERE u.is_active = TRUE AND s.student_id IS NULL
        """)
        
        users_without_students = cursor.fetchall()
        
        for user in users_without_students:
            print(f"User {user['user_id']} ({user['username']}, {user['role']}) has no student record")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def create_missing_student_records():
    """Create student records for users who don't have them"""
    print("\n=== CREATING MISSING STUDENT RECORDS ===")
    
    connection = get_db_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Find users without student records who should have them (role = 'student')
        cursor.execute("""
            SELECT u.user_id, u.username, u.name
            FROM users u
            LEFT JOIN students s ON u.user_id = s.user_id AND s.is_active = TRUE
            WHERE u.is_active = TRUE 
            AND u.role = 'student'
            AND s.student_id IS NULL
        """)
        
        users_needing_students = cursor.fetchall()
        
        if not users_needing_students:
            print("✅ All student users already have student records")
            return
        
        print(f"Found {len(users_needing_students)} users needing student records:")
        
        for user in users_needing_students:
            # Generate student_id
            student_id = f"STU{user['user_id']:06d}"
            
            try:
                cursor.execute("""
                    INSERT INTO students (student_id, user_id, academic_status, program, class_id)
                    VALUES (%s, %s, %s, %s, %s)
                """, (student_id, user['user_id'], 'active', 'General', 'X-1'))
                
                print(f"✅ Created student record: {student_id} for user {user['user_id']} ({user['username']})")
                
            except Exception as e:
                print(f"❌ Failed to create student record for user {user['user_id']}: {e}")
        
        connection.commit()
        print(f"\n✅ Student record creation completed")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    print("🔍 DEBUGGING STUDENT_ID FOREIGN KEY CONSTRAINT ISSUE")
    print("=" * 60)
    
    # Step 1: Check current state
    check_user_and_student_records()
    
    # Step 2: Test with valid student
    test_mental_health_with_valid_student()
    
    # Step 3: Check user to student resolution
    test_frontend_user_to_student_resolution()
    
    # Step 4: Create missing student records if needed
    create_missing_student_records()
    
    # Step 5: Test again after creating missing records
    print("\n" + "=" * 60)
    print("🔄 TESTING AGAIN AFTER CREATING MISSING STUDENT RECORDS")
    test_mental_health_with_valid_student()
