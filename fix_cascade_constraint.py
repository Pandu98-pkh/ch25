#!/usr/bin/env python3
"""
Fix the CASCADE constraint issue by recreating it properly
"""

import mysql.connector
from mysql.connector import Error

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'database': 'counselorhub',
    'charset': 'utf8mb4'
}

def fix_cascade_constraint():
    """Fix the CASCADE constraint that's not working"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("🔧 FIXING CASCADE CONSTRAINT ISSUE")
        print("=" * 50)
        
        # First, let's check if there are any transactions or locks
        print("1. Checking for locks and transactions...")
        cursor.execute("SHOW PROCESSLIST")
        processes = cursor.fetchall()
        for process in processes:
            if process.get('Command') not in ['Sleep', 'Query']:
                print(f"Active process: {process}")
        
        # Check the exact constraint definition
        print("\n2. Current constraint details...")
        cursor.execute("""
            SELECT 
                rc.CONSTRAINT_NAME,
                rc.DELETE_RULE,
                rc.UPDATE_RULE,
                kcu.COLUMN_NAME,
                kcu.REFERENCED_TABLE_NAME,
                kcu.REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
                ON rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
                AND rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
            WHERE rc.CONSTRAINT_SCHEMA = 'counselorhub'
            AND kcu.TABLE_NAME = 'mental_health_assessments'
            AND kcu.COLUMN_NAME = 'student_id'
        """)
        
        constraint_info = cursor.fetchone()
        if constraint_info:
            print(f"Current constraint: {constraint_info['CONSTRAINT_NAME']}")
            print(f"DELETE Rule: {constraint_info['DELETE_RULE']}")
            print(f"UPDATE Rule: {constraint_info['UPDATE_RULE']}")
        
        # Try to recreate the constraint
        print("\n3. Recreating the constraint...")
        
        # Drop the existing constraint
        try:
            cursor.execute("ALTER TABLE mental_health_assessments DROP FOREIGN KEY mental_health_assessments_ibfk_1")
            print("✅ Dropped existing constraint")
        except Error as e:
            print(f"⚠️ Error dropping constraint: {e}")
        
        # Add the constraint back
        try:
            cursor.execute("""
                ALTER TABLE mental_health_assessments 
                ADD CONSTRAINT mental_health_assessments_student_fk 
                FOREIGN KEY (student_id) REFERENCES students(student_id) 
                ON DELETE CASCADE ON UPDATE CASCADE
            """)
            print("✅ Added new CASCADE constraint")
        except Error as e:
            print(f"❌ Error adding constraint: {e}")
            return False
        
        connection.commit()
        
        # Test the new constraint
        print("\n4. Testing new constraint...")
        
        # Create test data
        test_student_id = "TEST_CASCADE_FIX"
        test_user_id = "TEST_USER_CASCADE_FIX"
        
        try:
            # Create test user
            cursor.execute("""
                INSERT IGNORE INTO users (user_id, username, email, password_hash, name, role, is_active)
                VALUES (%s, 'testcascade', 'testcascade@example.com', 'hash', 'Test Cascade User', 'student', TRUE)
            """, (test_user_id,))
            
            # Create test student
            cursor.execute("""
                INSERT IGNORE INTO students (student_id, user_id, academic_status, is_active)
                VALUES (%s, %s, 'good', TRUE)
            """, (test_student_id, test_user_id))
            
            # Create test assessment
            cursor.execute("""
                INSERT IGNORE INTO mental_health_assessments 
                (assessment_id, student_id, assessor_id, score, assessment_type, risk_level, category, notes)
                VALUES ('TEST_CASCADE_ASSESSMENT', %s, %s, 10, 'PHQ-9', 'low', 'test', 'Test cascade')
            """, (test_student_id, test_user_id))
            
            connection.commit()
            print("✅ Created test data")
            
            # Try to delete the student
            cursor.execute("DELETE FROM students WHERE student_id = %s", (test_student_id,))
            affected = cursor.rowcount
            print(f"✅ Deleted student, affected rows: {affected}")
            
            # Check if assessment was cascaded
            cursor.execute("SELECT COUNT(*) as count FROM mental_health_assessments WHERE student_id = %s", (test_student_id,))
            remaining = cursor.fetchone()['count']
            if remaining == 0:
                print("✅ CASCADE is working! Assessment was deleted automatically")
            else:
                print(f"❌ CASCADE failed! {remaining} assessments still remain")
            
            # Cleanup test user
            cursor.execute("DELETE FROM users WHERE user_id = %s", (test_user_id,))
            connection.commit()
            print("✅ Cleaned up test data")
            
        except Error as e:
            print(f"❌ Test failed: {e}")
            connection.rollback()
        
        return True
        
    except Error as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    fix_cascade_constraint()
