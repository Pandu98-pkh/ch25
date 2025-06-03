#!/usr/bin/env python3
"""
Simple script to set student_id as primary key for students table
Handles the current state where the table has no primary key
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

def fix_students_primary_key():
    """Set student_id as primary key for students table"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("🔧 SETTING STUDENT_ID AS PRIMARY KEY")
        print("="*40)
        
        # Check current state
        cursor.execute("SHOW CREATE TABLE students")
        current_structure = cursor.fetchone()
        print("\nCurrent table structure:")
        print(current_structure['Create Table'])
        
        # Step 1: Check for duplicates
        print("\n🔍 Step 1: Checking for duplicate student_id values...")
        cursor.execute("""
            SELECT student_id, COUNT(*) as count 
            FROM students 
            GROUP BY student_id 
            HAVING COUNT(*) > 1
        """)
        duplicates = cursor.fetchall()
        
        if duplicates:
            print("❌ Found duplicate student_id values:")
            for dup in duplicates:
                print(f"  '{dup['student_id']}' appears {dup['count']} times")
            return False
        
        print("✅ No duplicates found")
        
        # Step 2: Remove redundant indexes
        print("\n📇 Step 2: Cleaning up existing indexes...")
        
        # Remove the unique constraint on student_id since it will become primary key
        try:
            cursor.execute("ALTER TABLE students DROP INDEX student_id")
            print("✅ Dropped student_id unique index")
        except Error as e:
            print(f"ℹ️ Note: {e}")
        
        try:
            cursor.execute("ALTER TABLE students DROP INDEX idx_student_id")
            print("✅ Dropped idx_student_id index")
        except Error as e:
            print(f"ℹ️ Note: {e}")
        
        # Step 3: Add primary key
        print("\n🔑 Step 3: Adding student_id as primary key...")
        try:
            cursor.execute("ALTER TABLE students ADD PRIMARY KEY (student_id)")
            print("✅ Successfully set student_id as primary key!")
        except Error as e:
            print(f"❌ Error setting primary key: {e}")
            return False
        
        # Step 4: Remove old id column if desired
        print("\n🗑️ Step 4: Handle old id column...")
        cursor.execute("SELECT COUNT(*) as count FROM students")
        student_count = cursor.fetchone()['count']
        
        print(f"Current students count: {student_count}")
        print("The old 'id' column is no longer needed.")
        
        remove_id = input("\nRemove the old 'id' column? (y/N): ").lower().strip()
        
        if remove_id == 'y':
            try:
                cursor.execute("ALTER TABLE students DROP COLUMN id")
                print("✅ Removed old id column")
            except Error as e:
                print(f"❌ Error removing id column: {e}")
        else:
            print("ℹ️ Keeping old id column")
        
        # Step 5: Verification
        print("\n✅ Step 5: Verification...")
        
        # Check new structure
        cursor.execute("SHOW CREATE TABLE students")
        new_structure = cursor.fetchone()
        print("\nNew table structure:")
        print(new_structure['Create Table'])
        
        # Verify primary key
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE CONSTRAINT_NAME = 'PRIMARY' 
            AND TABLE_SCHEMA = 'counselorhub'
            AND TABLE_NAME = 'students'
        """)
        pk_columns = cursor.fetchall()
        pk_names = [col['COLUMN_NAME'] for col in pk_columns]
        print(f"\nPrimary key columns: {pk_names}")
        
        # Test a simple query
        cursor.execute("SELECT student_id, tingkat, kelas FROM students LIMIT 3")
        sample_students = cursor.fetchall()
        print("\nSample students using new primary key:")
        for student in sample_students:
            print(f"  PK: {student['student_id']} | Grade: {student['tingkat']} | Class: {student['kelas']}")
        
        # Commit changes
        connection.commit()
        print("\n🎉 PRIMARY KEY MIGRATION COMPLETED!")
        
        return True
        
    except Error as e:
        print(f"❌ Error: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    success = fix_students_primary_key()
    
    if success:
        print("\n" + "="*50)
        print("📋 MIGRATION SUCCESS!")
        print("="*50)
        print("✅ student_id is now the primary key for students table")
        print("✅ All data integrity maintained")
        print("\n⚠️ NEXT STEPS:")
        print("1. Update backend API to use student_id as primary key")
        print("2. Update any foreign key references in other tables")
        print("3. Test all student CRUD operations")
        print("4. Update frontend to use studentId consistently")
    else:
        print("\n❌ Migration failed!")
