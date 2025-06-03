#!/usr/bin/env python3
"""
Verify Students Table Primary Key Status
This script checks if student_id is already the primary key and confirms the current state.
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

def verify_students_primary_key():
    """Verify the current primary key status of the students table"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("🔍 VERIFYING STUDENTS TABLE PRIMARY KEY STATUS")
        print("="*60)
        
        # Check current primary key
        print("\n📋 Current Primary Key:")
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE CONSTRAINT_NAME = 'PRIMARY' 
            AND TABLE_SCHEMA = 'counselorhub'
            AND TABLE_NAME = 'students'
        """)
        pk_columns = cursor.fetchall()
        
        if pk_columns:
            pk_list = [col['COLUMN_NAME'] for col in pk_columns]
            print(f"  Primary Key: {pk_list}")
            
            if 'student_id' in pk_list:
                print("  ✅ student_id IS the primary key!")
                migration_needed = False
            else:
                print("  ⚠️ student_id is NOT the primary key")
                migration_needed = True
        else:
            print("  ❌ NO primary key found!")
            migration_needed = True
        
        # Check table structure
        print("\n📋 Table Structure:")
        cursor.execute("DESCRIBE students")
        columns = cursor.fetchall()
        
        has_id = False
        has_student_id = False
        
        for col in columns:
            if col['Field'] == 'id':
                has_id = True
                print(f"  id column: {col['Type']} | Key: {col['Key']} | Extra: {col['Extra']}")
            elif col['Field'] == 'student_id':
                has_student_id = True
                print(f"  student_id column: {col['Type']} | Key: {col['Key']} | Extra: {col['Extra']}")
        
        print(f"\n📊 Column Analysis:")
        print(f"  Has 'id' column: {has_id}")
        print(f"  Has 'student_id' column: {has_student_id}")
        
        # Check for any issues
        print("\n🔍 Data Integrity Check:")
        cursor.execute("SELECT COUNT(*) as total FROM students")
        total_count = cursor.fetchone()['total']
        print(f"  Total students: {total_count}")
        
        if has_student_id:
            cursor.execute("SELECT COUNT(DISTINCT student_id) as unique_count FROM students")
            unique_count = cursor.fetchone()['unique_count']
            print(f"  Unique student_ids: {unique_count}")
            
            if total_count == unique_count:
                print("  ✅ No duplicate student_id values")
            else:
                print(f"  ⚠️ Found {total_count - unique_count} duplicate student_id values")
        
        # Sample data
        print("\n📊 Sample Data:")
        if has_student_id:
            cursor.execute("SELECT student_id, tingkat, kelas FROM students LIMIT 3")
            samples = cursor.fetchall()
            for student in samples:
                print(f"  {student['student_id']}: Grade {student['tingkat']}, Class {student['kelas']}")
        
        # Check foreign key constraints
        print("\n🔗 Foreign Key Analysis:")
        cursor.execute("""
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = 'counselorhub'
            AND REFERENCED_TABLE_NAME = 'students'
        """)
        foreign_keys = cursor.fetchall()
        
        if foreign_keys:
            print("  Tables referencing students:")
            for fk in foreign_keys:
                print(f"    {fk['TABLE_NAME']}.{fk['COLUMN_NAME']} -> students.{fk['REFERENCED_COLUMN_NAME']}")
        else:
            print("  No foreign key references found")
        
        # Summary
        print("\n" + "="*60)
        print("📋 SUMMARY")
        print("="*60)
        
        if not migration_needed:
            print("✅ MIGRATION IS COMPLETE!")
            print("   • student_id is already the primary key")
            print("   • Database structure is correct")
            print("   • No further action needed")
        else:
            print("⚠️ MIGRATION NEEDED!")
            print("   • student_id is not the primary key")
            print("   • Run migration script to fix this")
        
        return not migration_needed
        
    except Error as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    success = verify_students_primary_key()
    
    if success:
        print("\n🎯 VERIFICATION COMPLETE - No action needed!")
    else:
        print("\n⚠️ VERIFICATION SHOWS ISSUES - Migration may be needed!")
