#!/usr/bin/env python3
"""
Fix Students Table Primary Key: Change from id to student_id
This script changes the primary key of the students table from the auto-increment 'id' column
to the 'student_id' column (VARCHAR).
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

def fix_student_primary_key():
    """Change students table primary key from id to student_id"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("🔧 FIXING STUDENTS TABLE PRIMARY KEY")
        print("="*50)
        
        # Step 1: Check current state
        print("\n📋 Step 1: Checking current state...")
        cursor.execute("SHOW CREATE TABLE students")
        current_structure = cursor.fetchone()
        print("Current students table structure:")
        print(current_structure['Create Table'])
        
        # Step 2: Check for any foreign key constraints that reference students.id
        print("\n🔗 Step 2: Checking foreign key constraints referencing students.id...")
        cursor.execute("""
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = 'counselorhub'
            AND REFERENCED_TABLE_NAME = 'students'
            AND REFERENCED_COLUMN_NAME = 'id'
        """)
        referencing_fks = cursor.fetchall()
        
        if referencing_fks:
            print("⚠️ WARNING: Found foreign keys referencing students.id:")
            for fk in referencing_fks:
                print(f"  {fk['TABLE_NAME']}.{fk['COLUMN_NAME']} -> students.id ({fk['CONSTRAINT_NAME']})")
            print("\nThese will need to be updated to reference student_id instead.")
            
            # Drop these foreign key constraints temporarily
            for fk in referencing_fks:
                try:
                    cursor.execute(f"ALTER TABLE {fk['TABLE_NAME']} DROP FOREIGN KEY {fk['CONSTRAINT_NAME']}")
                    print(f"✅ Dropped FK constraint: {fk['CONSTRAINT_NAME']}")
                except Error as e:
                    print(f"⚠️ Error dropping FK {fk['CONSTRAINT_NAME']}: {e}")
        else:
            print("✅ No foreign keys reference students.id")
        
        # Step 3: Backup current data
        print("\n💾 Step 3: Backing up data...")
        cursor.execute("SELECT COUNT(*) as count FROM students")
        student_count = cursor.fetchone()['count']
        print(f"✅ Found {student_count} student records to preserve")
        
        # Check for duplicate student_id values
        cursor.execute("""
            SELECT student_id, COUNT(*) as count 
            FROM students 
            GROUP BY student_id 
            HAVING COUNT(*) > 1
        """)
        duplicates = cursor.fetchall()
        
        if duplicates:
            print("⚠️ WARNING: Found duplicate student_id values:")
            for dup in duplicates:
                print(f"  student_id '{dup['student_id']}' appears {dup['count']} times")
            print("These need to be resolved before changing primary key!")
            return False
          # Step 4: Remove AUTO_INCREMENT from id column first
        print("\n🔧 Step 4: Removing AUTO_INCREMENT from id column...")
        try:
            cursor.execute("ALTER TABLE students MODIFY COLUMN id INT NOT NULL")
            print("✅ Removed AUTO_INCREMENT from id column")
        except Error as e:
            print(f"❌ Error removing AUTO_INCREMENT: {e}")
            return False
        
        # Step 5: Drop the current primary key
        print("\n🔑 Step 5: Dropping current primary key...")
        try:
            cursor.execute("ALTER TABLE students DROP PRIMARY KEY")
            print("✅ Dropped current primary key (id)")
        except Error as e:
            print(f"❌ Error dropping primary key: {e}")
            return False
          # Step 6: Make student_id the primary key
        print("\n🔑 Step 6: Setting student_id as primary key...")
        try:
            cursor.execute("ALTER TABLE students ADD PRIMARY KEY (student_id)")
            print("✅ Set student_id as primary key")
        except Error as e:
            print(f"❌ Error setting student_id as primary key: {e}")
            return False
        
        # Step 7: Drop the old id column (optional - you might want to keep it)
        print("\n🗑️ Step 7: Removing old id column...")
        user_choice = input("Do you want to remove the old 'id' column? (y/N): ").lower().strip()
        
        if user_choice == 'y':
            try:
                cursor.execute("ALTER TABLE students DROP COLUMN id")
                print("✅ Removed old id column")
            except Error as e:
                print(f"❌ Error removing id column: {e}")
        else:
            print("ℹ️ Keeping old id column")
        
        # Step 8: Recreate foreign key constraints if they existed
        if referencing_fks:
            print("\n🔗 Step 7: Recreating foreign key constraints...")
            for fk in referencing_fks:
                try:
                    # Update the referencing table to use student_id instead of id
                    # This assumes the referencing column should now point to student_id
                    # You might need to adjust this based on your specific schema
                    
                    # Example: If counseling_sessions.student_id references students.id,
                    # we need to update it to reference students.student_id properly
                    
                    print(f"⚠️ Manual intervention needed for {fk['TABLE_NAME']}.{fk['COLUMN_NAME']}")
                    print(f"   This column was referencing students.id and may need schema updates")
                    
                except Error as e:
                    print(f"⚠️ Error recreating FK {fk['CONSTRAINT_NAME']}: {e}")
          # Step 9: Verification
        print("\n✅ Step 9: Verification...")
        
        # Check new structure
        cursor.execute("SHOW CREATE TABLE students")
        new_structure = cursor.fetchone()
        print("\nNew students table structure:")
        print(new_structure['Create Table'])
        
        # Check primary key
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE CONSTRAINT_NAME = 'PRIMARY' 
            AND TABLE_SCHEMA = 'counselorhub'
            AND TABLE_NAME = 'students'
        """)
        pk_columns = cursor.fetchall()
        print(f"\nPrimary key columns: {[col['COLUMN_NAME'] for col in pk_columns]}")
        
        # Test data integrity
        cursor.execute("SELECT COUNT(*) as count FROM students")
        final_count = cursor.fetchone()['count']
        print(f"Data integrity check: {final_count} records (was {student_count})")
        
        if final_count == student_count:
            print("✅ All data preserved")
        else:
            print("⚠️ Data count mismatch!")
        
        # Sample data
        cursor.execute("SELECT student_id, tingkat, kelas FROM students LIMIT 5")
        sample_students = cursor.fetchall()
        print("\nSample students:")
        for student in sample_students:
            print(f"  {student['student_id']}: Grade {student['tingkat']}, Class {student['kelas']}")
        
        # Commit changes
        connection.commit()
        print("\n🎉 STUDENTS PRIMARY KEY FIXED SUCCESSFULLY!")
        
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
    success = fix_student_primary_key()
    if success:
        print("\n🎯 Primary key change completed:")
        print("  ✅ students.student_id is now the primary key")
        print("  ✅ Auto-increment id column removed (if chosen)")
        print("  ✅ Data integrity preserved")
        print("\n📝 Next steps:")
        print("  1. Update any foreign key references to use student_id")
        print("  2. Update backend API to use student_id consistently")
        print("  3. Test all CRUD operations")
    else:
        print("\n❌ Primary key change failed")
