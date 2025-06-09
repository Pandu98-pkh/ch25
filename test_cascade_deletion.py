#!/usr/bin/env python3
"""
Debug the specific student deletion issue
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

def test_student_deletion():
    """Test deleting a specific student and see what happens"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("🧪 TESTING STUDENT DELETION WITH CASCADE")
        print("=" * 50)
        
        # First, let's create a test student
        test_student_id = "TEST_STUDENT_DELETE"
        test_user_id = "TEST_USER_DELETE"
        
        print("1. Creating test student and user...")
        
        # Create test user first
        try:
            cursor.execute("""
                INSERT INTO users (user_id, username, email, password_hash, name, role, is_active)
                VALUES (%s, 'testuser', 'test@example.com', 'hash', 'Test User', 'student', TRUE)
            """, (test_user_id,))
            print(f"✅ Created test user: {test_user_id}")
        except Error as e:
            if "Duplicate entry" in str(e):
                print(f"ℹ️ Test user already exists: {test_user_id}")
            else:
                print(f"❌ Error creating test user: {e}")
                return
        
        # Create test student
        try:
            cursor.execute("""
                INSERT INTO students (student_id, user_id, academic_status, is_active)
                VALUES (%s, %s, 'good', TRUE)
            """, (test_student_id, test_user_id))
            print(f"✅ Created test student: {test_student_id}")
        except Error as e:
            if "Duplicate entry" in str(e):
                print(f"ℹ️ Test student already exists: {test_student_id}")
            else:
                print(f"❌ Error creating test student: {e}")
                return
        
        # Create test mental health assessment
        test_assessment_id = "TEST_ASSESSMENT_DELETE"
        try:
            cursor.execute("""
                INSERT INTO mental_health_assessments 
                (assessment_id, student_id, assessor_id, score, assessment_type, risk_level, category, notes)
                VALUES (%s, %s, %s, 10, 'PHQ-9', 'low', 'test', 'Test assessment for deletion')
            """, (test_assessment_id, test_student_id, test_user_id))
            print(f"✅ Created test assessment: {test_assessment_id}")
        except Error as e:
            if "Duplicate entry" in str(e):
                print(f"ℹ️ Test assessment already exists: {test_assessment_id}")
            else:
                print(f"❌ Error creating test assessment: {e}")
                return
        
        connection.commit()
        
        # Now check what we have
        print("\n2. Verifying test data...")
        cursor.execute("SELECT student_id FROM students WHERE student_id = %s", (test_student_id,))
        if cursor.fetchone():
            print(f"✅ Test student exists")
        
        cursor.execute("SELECT assessment_id FROM mental_health_assessments WHERE student_id = %s", (test_student_id,))
        assessment = cursor.fetchone()
        if assessment:
            print(f"✅ Test assessment exists: {assessment['assessment_id']}")
        
        # Now try to delete the student
        print("\n3. Attempting to delete student...")
        try:
            cursor.execute("DELETE FROM students WHERE student_id = %s", (test_student_id,))
            affected_rows = cursor.rowcount
            print(f"✅ Student deletion successful, affected rows: {affected_rows}")
            
            # Check if assessment was cascaded
            cursor.execute("SELECT assessment_id FROM mental_health_assessments WHERE student_id = %s", (test_student_id,))
            remaining_assessment = cursor.fetchone()
            if remaining_assessment:
                print(f"❌ Assessment still exists after CASCADE: {remaining_assessment['assessment_id']}")
                print("This indicates the CASCADE is NOT working properly!")
            else:
                print("✅ Assessment was properly cascaded (deleted)")
            
            connection.commit()
            
        except Error as e:
            print(f"❌ Error deleting student: {e}")
            connection.rollback()
        
        # Cleanup - delete test user
        print("\n4. Cleaning up test data...")
        try:
            cursor.execute("DELETE FROM users WHERE user_id = %s", (test_user_id,))
            print("✅ Cleaned up test user")
            connection.commit()
        except Error as e:
            print(f"⚠️ Error cleaning up test user: {e}")
        
        return True
        
    except Error as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def check_mysql_version():
    """Check MySQL version and foreign key settings"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("\n" + "=" * 50)
        print("MYSQL CONFIGURATION CHECK")
        print("=" * 50)
        
        # Check MySQL version
        cursor.execute("SELECT VERSION() as version")
        version = cursor.fetchone()
        print(f"MySQL Version: {version['version']}")
        
        # Check foreign key checks setting
        cursor.execute("SHOW VARIABLES LIKE 'foreign_key_checks'")
        fk_checks = cursor.fetchone()
        print(f"Foreign Key Checks: {fk_checks['Value']}")
        
        # Check storage engine
        cursor.execute("SHOW VARIABLES LIKE 'default_storage_engine'")
        engine = cursor.fetchone()
        print(f"Default Storage Engine: {engine['Value']}")
        
        return True
        
    except Error as e:
        print(f"❌ Error checking MySQL config: {e}")
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    test_student_deletion()
    check_mysql_version()
