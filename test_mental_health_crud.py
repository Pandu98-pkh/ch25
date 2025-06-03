#!/usr/bin/env python3
"""
Check existing students and fix CRUD test
"""

import mysql.connector
import os
from datetime import datetime

def get_db_connection():
    """Get database connection"""
    config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', 'admin123'),
        'database': os.getenv('DB_NAME', 'counselorhub'),
        'charset': 'utf8mb4',
        'collation': 'utf8mb4_unicode_ci'
    }
    
    try:
        connection = mysql.connector.connect(**config)
        return connection
    except mysql.connector.Error as err:
        print(f"❌ Database connection failed: {err}")
        return None

def check_students_and_users():
    """Check existing students and users"""
    connection = get_db_connection()
    if not connection:
        return
    
    cursor = connection.cursor()
    
    print("📋 Checking existing students...")
    cursor.execute("SELECT student_id, name FROM students LIMIT 5")
    students = cursor.fetchall()
    
    if students:
        print("✅ Found students:")
        for student_id, name in students:
            print(f"   - Student ID: {student_id}, Name: {name}")
    else:
        print("❌ No students found in database")
    
    print("\n📋 Checking existing users...")
    cursor.execute("SELECT user_id, name FROM users LIMIT 5")
    users = cursor.fetchall()
    
    if users:
        print("✅ Found users:")
        for user_id, name in users:
            print(f"   - User ID: {user_id}, Name: {name}")
    else:
        print("❌ No users found in database")
    
    print("\n📋 Checking existing mental health assessments...")
    cursor.execute("SELECT id, student_id, assessor_id, assessment_type, score FROM mental_health_assessments")
    assessments = cursor.fetchall()
    
    if assessments:
        print("✅ Found assessments:")
        for assessment_id, student_id, assessor_id, assessment_type, score in assessments:
            print(f"   - ID: {assessment_id}, Student: {student_id}, Assessor: {assessor_id}, Type: {assessment_type}, Score: {score}")
    else:
        print("❌ No assessments found in database")
    
    # Now test with valid student and assessor IDs
    if students and users:
        print(f"\n🔄 Testing CRUD with valid IDs...")
        student_id = students[0][0]
        assessor_id = users[0][0]
        
        try:
            # Test INSERT with valid IDs
            insert_query = """
            INSERT INTO mental_health_assessments 
            (assessment_id, student_id, assessor_id, score, assessment_type, risk_level, category, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            test_data = (
                f"test-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                student_id,
                assessor_id,
                75,
                'PHQ-9',
                'moderate',
                'test',
                'Database connectivity test with valid foreign keys'
            )
            
            cursor.execute(insert_query, test_data)
            test_assessment_id = cursor.lastrowid
            connection.commit()
            print(f"✅ INSERT successful - Assessment ID: {test_assessment_id}")
            
            # Test SELECT
            cursor.execute("SELECT * FROM mental_health_assessments WHERE id = %s", (test_assessment_id,))
            result = cursor.fetchone()
            
            if result:
                print("✅ SELECT successful")
            
            # Test UPDATE
            cursor.execute(
                "UPDATE mental_health_assessments SET score = %s WHERE id = %s",
                (80, test_assessment_id)
            )
            connection.commit()
            print("✅ UPDATE successful")
            
            # Test DELETE
            cursor.execute("DELETE FROM mental_health_assessments WHERE id = %s", (test_assessment_id,))
            connection.commit()
            print("✅ DELETE successful")
            
            print("\n🎉 ALL CRUD OPERATIONS SUCCESSFUL!")
            print("✅ Mental Health database connection is FULLY FUNCTIONAL")
            
        except Exception as e:
            print(f"❌ CRUD test failed: {e}")
    
    cursor.close()
    connection.close()

if __name__ == "__main__":
    check_students_and_users()
