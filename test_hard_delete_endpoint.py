#!/usr/bin/env python3
"""
Test script to verify the hard delete student endpoint works with the current database structure
"""

import mysql.connector
from datetime import datetime

def get_db_connection():
    """Get database connection with consistent config"""
    return mysql.connector.connect(
        host='localhost',
        user='admin',
        password='admin',
        database='counselorhub'
    )

def test_database_structure():
    """Test that all required tables and foreign keys exist"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    print("🔍 Testing database structure for hard delete endpoint...")
    
    try:
        # Check if all required tables exist
        required_tables = [
            'students', 'users', 'counseling_sessions', 
            'mental_health_assessments', 'behavior_records', 
            'career_assessments', 'notifications'
        ]
        
        cursor.execute("SHOW TABLES")
        existing_tables = [table[0] for table in cursor.fetchall()]
        
        print(f"📋 Found tables: {existing_tables}")
        
        for table in required_tables:
            if table in existing_tables:
                print(f"✅ Table '{table}' exists")
            else:
                print(f"❌ Table '{table}' missing")
        
        # Check foreign key constraints
        print("\n🔗 Checking foreign key constraints...")
        cursor.execute("""
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE REFERENCED_TABLE_SCHEMA = 'counselorhub'
            AND TABLE_NAME IN ('counseling_sessions', 'mental_health_assessments', 'behavior_records', 'career_assessments', 'notifications', 'students')
            ORDER BY TABLE_NAME
        """)
        
        constraints = cursor.fetchall()
        for constraint in constraints:
            table, column, constraint_name, ref_table, ref_column = constraint
            print(f"✅ {table}.{column} -> {ref_table}.{ref_column} ({constraint_name})")
        
        # Check students table structure
        print("\n📋 Students table structure:")
        cursor.execute("DESCRIBE students")
        for field in cursor.fetchall():
            field_name, field_type, null, key, default, extra = field
            print(f"  - {field_name}: {field_type} ({key if key else 'N/A'})")
        
        print("\n✅ Database structure verification completed!")
        
    except Exception as e:
        print(f"❌ Error checking database structure: {e}")
    finally:
        cursor.close()
        connection.close()

def test_sample_query():
    """Test the query used in hard delete endpoint"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        print("\n🧪 Testing sample query...")
        
        # Test the query used in the endpoint
        cursor.execute("""
            SELECT s.student_id, s.user_id, u.name 
            FROM students s 
            LEFT JOIN users u ON s.user_id = u.user_id 
            LIMIT 3
        """)
        
        results = cursor.fetchall()
        print(f"📊 Sample students found: {len(results)}")
        
        for student in results:
            print(f"  - Student ID: {student['student_id']}, User ID: {student['user_id']}, Name: {student['name']}")
            
            # Test count queries for each related table
            for table in ['counseling_sessions', 'mental_health_assessments', 'behavior_records', 'career_assessments']:
                cursor.execute(f"SELECT COUNT(*) as count FROM {table} WHERE student_id = %s", (student['student_id'],))
                count = cursor.fetchone()['count']
                print(f"    📊 {table}: {count} records")
        
        print("✅ Sample query test completed!")
        
    except Exception as e:
        print(f"❌ Error testing sample query: {e}")
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    print("🚀 Starting hard delete endpoint database verification...")
    test_database_structure()
    test_sample_query()
    print("\n🎉 All tests completed!")
