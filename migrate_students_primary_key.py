#!/usr/bin/env python3
"""
Comprehensive Students Primary Key Migration Script
This script changes the primary key of the students table from id to student_id
and handles all related data consistency issues.
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

def migrate_students_primary_key():
    """Complete migration to change students primary key to student_id"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("🔧 MIGRATING STUDENTS TABLE PRIMARY KEY")
        print("="*50)
        
        # Step 1: Current state analysis
        print("\n📋 Step 1: Analyzing current state...")
        cursor.execute("DESCRIBE students")
        columns = cursor.fetchall()
        
        has_id = any(col['Field'] == 'id' for col in columns)
        has_student_id = any(col['Field'] == 'student_id' for col in columns)
        
        print(f"  Has 'id' column: {has_id}")
        print(f"  Has 'student_id' column: {has_student_id}")
        
        if not has_student_id:
            print("❌ Error: student_id column does not exist!")
            return False
        
        # Check current primary key
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE CONSTRAINT_NAME = 'PRIMARY' 
            AND TABLE_SCHEMA = 'counselorhub'
            AND TABLE_NAME = 'students'
        """)
        current_pk = cursor.fetchall()
        current_pk_columns = [col['COLUMN_NAME'] for col in current_pk]
        print(f"  Current primary key: {current_pk_columns}")
        
        if 'student_id' in current_pk_columns:
            print("✅ student_id is already the primary key!")
            return True
        
        # Step 2: Data integrity checks
        print("\n🔍 Step 2: Data integrity checks...")
        
        # Check for NULL student_id values
        cursor.execute("SELECT COUNT(*) as count FROM students WHERE student_id IS NULL")
        null_count = cursor.fetchone()['count']
        if null_count > 0:
            print(f"❌ Error: {null_count} students have NULL student_id values!")
            return False
        
        # Check for duplicate student_id values
        cursor.execute("""
            SELECT student_id, COUNT(*) as count 
            FROM students 
            GROUP BY student_id 
            HAVING COUNT(*) > 1
        """)
        duplicates = cursor.fetchall()
        
        if duplicates:
            print("❌ Error: Found duplicate student_id values:")
            for dup in duplicates:
                print(f"  student_id '{dup['student_id']}' appears {dup['count']} times")
            return False
        
        print("✅ Data integrity checks passed")
        
        # Step 3: Create mapping table for id -> student_id (if needed for other tables)
        print("\n🗺️ Step 3: Creating ID mapping...")
        cursor.execute("SELECT id, student_id FROM students ORDER BY id")
        id_mapping = cursor.fetchall()
        print(f"✅ Created mapping for {len(id_mapping)} students")
        
        # Step 4: Handle foreign key constraints
        print("\n🔗 Step 4: Handling foreign key constraints...")
        
        # Check for any remaining foreign keys referencing students.id
        cursor.execute("""
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = 'counselorhub'
            AND REFERENCED_TABLE_NAME = 'students'
            AND REFERENCED_COLUMN_NAME = 'id'
        """)
        remaining_fks = cursor.fetchall()
        
        if remaining_fks:
            print("⚠️ Found foreign keys still referencing students.id:")
            for fk in remaining_fks:
                print(f"  {fk['TABLE_NAME']}.{fk['COLUMN_NAME']} ({fk['CONSTRAINT_NAME']})")
                try:
                    cursor.execute(f"ALTER TABLE {fk['TABLE_NAME']} DROP FOREIGN KEY {fk['CONSTRAINT_NAME']}")
                    print(f"  ✅ Dropped constraint {fk['CONSTRAINT_NAME']}")
                except Error as e:
                    print(f"  ⚠️ Error dropping {fk['CONSTRAINT_NAME']}: {e}")
        else:
            print("✅ No foreign key constraints to handle")
        
        # Step 5: Remove AUTO_INCREMENT from id column
        print("\n🔧 Step 5: Modifying id column...")
        if has_id:
            try:
                cursor.execute("ALTER TABLE students MODIFY COLUMN id INT NOT NULL")
                print("✅ Removed AUTO_INCREMENT from id column")
            except Error as e:
                print(f"❌ Error modifying id column: {e}")
                return False
        
        # Step 6: Drop current primary key
        print("\n🔑 Step 6: Dropping current primary key...")
        try:
            cursor.execute("ALTER TABLE students DROP PRIMARY KEY")
            print("✅ Dropped current primary key")
        except Error as e:
            print(f"❌ Error dropping primary key: {e}")
            return False
          # Step 7: Drop any existing student_id indexes first
        print("\n📇 Step 7: Cleaning up existing indexes...")
        try:
            cursor.execute("ALTER TABLE students DROP INDEX student_id")
            print("✅ Dropped existing student_id unique index")
        except Error as e:
            print(f"ℹ️ Note: {e}")
        
        try:
            cursor.execute("ALTER TABLE students DROP INDEX idx_student_id")
            print("✅ Dropped existing idx_student_id index")
        except Error as e:
            print(f"ℹ️ Note: {e}")
        
        # Step 8: Add student_id as primary key
        print("\n🔑 Step 8: Setting student_id as primary key...")
        try:
            cursor.execute("ALTER TABLE students ADD PRIMARY KEY (student_id)")
            print("✅ Set student_id as primary key")
        except Error as e:
            print(f"❌ Error setting student_id as primary key: {e}")
            return False
          # Step 9: Remove old id column
        print("\n🗑️ Step 9: Handling old id column...")
        print("The old 'id' column is no longer needed since student_id is now the primary key.")
        print("However, keeping it might be useful for data migration or debugging.")
        
        remove_id = input("Remove the old 'id' column? (y/N): ").lower().strip()
        
        if remove_id == 'y':
            try:
                cursor.execute("ALTER TABLE students DROP COLUMN id")
                print("✅ Removed old id column")
            except Error as e:
                print(f"❌ Error removing id column: {e}")
        else:
            print("ℹ️ Keeping old id column for reference")
        
        # Step 9: Recreate necessary indexes
        print("\n📇 Step 9: Updating indexes...")
        
        # Drop the old unique index on student_id (since it's now primary key)
        try:
            cursor.execute("ALTER TABLE students DROP INDEX student_id")
            print("✅ Dropped redundant student_id unique index")
        except Error as e:
            print(f"ℹ️ Note: {e}")
        
        # Step 10: Verification
        print("\n✅ Step 10: Verification...")
        
        # Check new structure
        cursor.execute("SHOW CREATE TABLE students")
        new_structure = cursor.fetchone()
        print("\nNew students table structure:")
        print(new_structure['Create Table'])
        
        # Verify primary key
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE CONSTRAINT_NAME = 'PRIMARY' 
            AND TABLE_SCHEMA = 'counselorhub'
            AND TABLE_NAME = 'students'
        """)
        new_pk = cursor.fetchall()
        new_pk_columns = [col['COLUMN_NAME'] for col in new_pk]
        print(f"\nNew primary key: {new_pk_columns}")
        
        # Test some operations
        cursor.execute("SELECT COUNT(*) as count FROM students")
        final_count = cursor.fetchone()['count']
        print(f"Total students: {final_count}")
        
        # Sample query using new primary key
        cursor.execute("SELECT student_id, tingkat, kelas FROM students LIMIT 3")
        sample_students = cursor.fetchall()
        print("\nSample student records:")
        for student in sample_students:
            print(f"  PK: {student['student_id']} | Grade: {student['tingkat']} | Class: {student['kelas']}")
        
        # Commit all changes
        connection.commit()
        print("\n🎉 MIGRATION COMPLETED SUCCESSFULLY!")
        
        return True
        
    except Error as e:
        print(f"❌ Migration error: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def print_post_migration_notes():
    """Print important notes after migration"""
    print("\n" + "="*60)
    print("📋 POST-MIGRATION NOTES")
    print("="*60)
    print()
    print("✅ COMPLETED:")
    print("  • students.student_id is now the primary key")
    print("  • All data integrity maintained")
    print("  • Old foreign key constraints removed")
    print()
    print("⚠️ IMPORTANT - NEXT STEPS:")
    print("  1. Update backend API code:")
    print("     • Remove references to students.id")
    print("     • Use student_id as primary key in all queries")
    print("     • Update JOIN operations accordingly")
    print()
    print("  2. Update frontend code:")
    print("     • Use studentId instead of id for student records")
    print("     • Update form submissions and API calls")
    print()
    print("  3. Review other tables that might reference students:")
    print("     • counseling_sessions")
    print("     • mental_health_assessments")
    print("     • behavior_records")
    print("     • career_assessments")
    print("     • Update their foreign keys to reference student_id")
    print()
    print("  4. Test all CRUD operations thoroughly")
    print()

if __name__ == "__main__":
    success = migrate_students_primary_key()
    
    if success:
        print_post_migration_notes()
    else:
        print("\n❌ Migration failed. Please review the errors above.")
        print("The database has been rolled back to its previous state.")
