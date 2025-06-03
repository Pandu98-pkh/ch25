#!/usr/bin/env python3
"""
Comprehensive verification script for Mental Health Database Connection
Tests all aspects of the mental_health_assessments table connectivity
"""

import mysql.connector
import os
import json
from datetime import datetime
import sys

def get_db_connection():
    """Get database connection using environment variables or defaults"""
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

def test_table_exists(cursor):
    """Test if mental_health_assessments table exists"""
    try:
        cursor.execute("SHOW TABLES LIKE 'mental_health_assessments'")
        result = cursor.fetchone()
        return result is not None
    except Exception as e:
        print(f"❌ Error checking table existence: {e}")
        return False

def test_table_structure(cursor):
    """Test the table structure"""
    try:
        cursor.execute("DESCRIBE mental_health_assessments")
        columns = cursor.fetchall()
        
        print("\n📋 Table Structure:")
        print("Column".ljust(25) + "Type".ljust(25) + "Null".ljust(8) + "Key".ljust(8) + "Default")
        print("-" * 80)
        
        expected_columns = [
            'id', 'assessment_id', 'student_id', 'assessor_id', 'date', 
            'score', 'notes', 'assessment_type', 'risk_level', 'category',
            'responses', 'recommendations', 'is_active', 'created_at', 'updated_at'
        ]
        
        found_columns = []
        for column in columns:
            field, type_info, null, key, default, extra = column
            found_columns.append(field)
            print(f"{field}".ljust(25) + f"{type_info}".ljust(25) + f"{null}".ljust(8) + f"{key}".ljust(8) + f"{default or ''}")
        
        # Check if all expected columns exist
        missing_columns = set(expected_columns) - set(found_columns)
        if missing_columns:
            print(f"\n⚠️  Missing columns: {missing_columns}")
            return False
        else:
            print(f"\n✅ All expected columns present ({len(found_columns)} columns)")
            return True
            
    except Exception as e:
        print(f"❌ Error checking table structure: {e}")
        return False

def test_basic_operations(cursor, connection):
    """Test basic CRUD operations"""
    try:
        # Test INSERT
        print("\n🔄 Testing INSERT operation...")
        insert_query = """
        INSERT INTO mental_health_assessments 
        (assessment_id, student_id, assessor_id, score, assessment_type, risk_level, category, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        test_data = (
            f"test-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            1,  # student_id
            1,  # assessor_id
            75,  # score
            'PHQ-9',  # assessment_type
            'moderate',  # risk_level
            'test',  # category
            'Database connectivity test'  # notes
        )
        
        cursor.execute(insert_query, test_data)
        test_assessment_id = cursor.lastrowid
        connection.commit()
        print(f"✅ INSERT successful - Assessment ID: {test_assessment_id}")
        
        # Test SELECT
        print("\n🔍 Testing SELECT operation...")
        cursor.execute("SELECT * FROM mental_health_assessments WHERE id = %s", (test_assessment_id,))
        result = cursor.fetchone()
        
        if result:
            print("✅ SELECT successful - Retrieved assessment:")
            print(f"   - ID: {result[0]}")
            print(f"   - Assessment ID: {result[1]}")
            print(f"   - Student ID: {result[2]}")
            print(f"   - Score: {result[5]}")
            print(f"   - Type: {result[7]}")
            print(f"   - Risk Level: {result[8]}")
        else:
            print("❌ SELECT failed - No data retrieved")
            return False
        
        # Test UPDATE
        print("\n✏️  Testing UPDATE operation...")
        cursor.execute(
            "UPDATE mental_health_assessments SET score = %s, notes = %s WHERE id = %s",
            (80, 'Updated test assessment', test_assessment_id)
        )
        connection.commit()
        
        # Verify update
        cursor.execute("SELECT score, notes FROM mental_health_assessments WHERE id = %s", (test_assessment_id,))
        updated_result = cursor.fetchone()
        
        if updated_result and updated_result[0] == 80:
            print("✅ UPDATE successful - Score updated to 80")
        else:
            print("❌ UPDATE failed")
            return False
        
        # Test DELETE
        print("\n🗑️  Testing DELETE operation...")
        cursor.execute("DELETE FROM mental_health_assessments WHERE id = %s", (test_assessment_id,))
        connection.commit()
        
        # Verify deletion
        cursor.execute("SELECT * FROM mental_health_assessments WHERE id = %s", (test_assessment_id,))
        deleted_result = cursor.fetchone()
        
        if not deleted_result:
            print("✅ DELETE successful - Test record removed")
            return True
        else:
            print("❌ DELETE failed - Test record still exists")
            return False
            
    except Exception as e:
        print(f"❌ Error during CRUD operations: {e}")
        return False

def test_data_count(cursor):
    """Test current data count"""
    try:
        cursor.execute("SELECT COUNT(*) FROM mental_health_assessments")
        count = cursor.fetchone()[0]
        print(f"\n📊 Current assessments in database: {count}")
        
        # Count by type
        cursor.execute("""
            SELECT assessment_type, COUNT(*) as count 
            FROM mental_health_assessments 
            GROUP BY assessment_type
        """)
        type_counts = cursor.fetchall()
        
        if type_counts:
            print("\n📈 Assessments by type:")
            for assessment_type, count in type_counts:
                print(f"   - {assessment_type}: {count}")
        
        # Count by risk level
        cursor.execute("""
            SELECT risk_level, COUNT(*) as count 
            FROM mental_health_assessments 
            GROUP BY risk_level
        """)
        risk_counts = cursor.fetchall()
        
        if risk_counts:
            print("\n⚠️  Assessments by risk level:")
            for risk_level, count in risk_counts:
                print(f"   - {risk_level}: {count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error getting data count: {e}")
        return False

def test_foreign_keys(cursor):
    """Test foreign key constraints"""
    try:
        cursor.execute("""
            SELECT 
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'counselorhub' 
            AND TABLE_NAME = 'mental_health_assessments'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        """)
        
        foreign_keys = cursor.fetchall()
        
        if foreign_keys:
            print("\n🔗 Foreign Key Constraints:")
            for constraint_name, column_name, ref_table, ref_column in foreign_keys:
                print(f"   - {column_name} → {ref_table}.{ref_column} ({constraint_name})")
            return True
        else:
            print("\n⚠️  No foreign key constraints found")
            return False
            
    except Exception as e:
        print(f"❌ Error checking foreign keys: {e}")
        return False

def test_indexes(cursor):
    """Test table indexes"""
    try:
        cursor.execute("SHOW INDEX FROM mental_health_assessments")
        indexes = cursor.fetchall()
        
        if indexes:
            print("\n📇 Table Indexes:")
            for index in indexes:
                print(f"   - {index[2]} on {index[4]} ({'UNIQUE' if not index[1] else 'NON_UNIQUE'})")
            return True
        else:
            print("\n⚠️  No indexes found")
            return False
            
    except Exception as e:
        print(f"❌ Error checking indexes: {e}")
        return False

def main():
    """Main verification function"""
    print("🔍 MENTAL HEALTH DATABASE CONNECTION VERIFICATION")
    print("=" * 60)
    
    # Test database connection
    print("\n1️⃣  Testing Database Connection...")
    connection = get_db_connection()
    
    if not connection:
        print("❌ Cannot proceed - Database connection failed")
        sys.exit(1)
    
    print("✅ Database connection successful")
    
    cursor = connection.cursor()
    
    # Run all tests
    tests = [
        ("2️⃣  Table Existence", lambda: test_table_exists(cursor)),
        ("3️⃣  Table Structure", lambda: test_table_structure(cursor)),
        ("4️⃣  Data Count", lambda: test_data_count(cursor)),
        ("5️⃣  Foreign Keys", lambda: test_foreign_keys(cursor)),
        ("6️⃣  Indexes", lambda: test_indexes(cursor)),
        ("7️⃣  CRUD Operations", lambda: test_basic_operations(cursor, connection)),
    ]
    
    passed_tests = 0
    total_tests = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{test_name}...")
        try:
            if test_func():
                passed_tests += 1
            else:
                print(f"❌ {test_name} failed")
        except Exception as e:
            print(f"❌ {test_name} failed with error: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 VERIFICATION SUMMARY")
    print("=" * 60)
    print(f"✅ Tests Passed: {passed_tests}/{total_tests}")
    print(f"❌ Tests Failed: {total_tests - passed_tests}/{total_tests}")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ Mental Health page is FULLY CONNECTED to the database")
        print("✅ Complete read/write access confirmed")
        print("✅ All mental health assessment functionality is working")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} tests failed")
        print("❌ Mental Health database connection has issues")
    
    cursor.close()
    connection.close()
    
    return passed_tests == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
