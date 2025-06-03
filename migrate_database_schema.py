#!/usr/bin/env python3
"""
Database Migration Script:
1. Change school_id column to class_id in classes table
2. Make class_id the primary key in classes table
3. Update foreign key references accordingly
"""

import mysql.connector
from mysql.connector import Error
import sys

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'database': 'counselorhub',
    'charset': 'utf8mb4'
}

def migrate_database():
    """Perform database migration"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("🚀 STARTING DATABASE MIGRATION")
        print("="*50)
        
        # Start transaction
        connection.start_transaction()
        
        # Step 1: Drop foreign key constraint from students table
        print("\n🔧 Step 1: Dropping foreign key constraint...")
        try:
            cursor.execute("""
                ALTER TABLE students 
                DROP FOREIGN KEY students_ibfk_1
            """)
            print("   ✅ Foreign key constraint dropped")
        except Error as e:
            if "doesn't exist" in str(e).lower():
                print("   ℹ️  Foreign key constraint doesn't exist")
            else:
                raise e
        
        # Step 2: Drop index on class_id in students table
        print("\n🔧 Step 2: Dropping index on class_id...")
        try:
            cursor.execute("DROP INDEX class_id ON students")
            print("   ✅ Index dropped")
        except Error as e:
            if "can't drop" in str(e).lower():
                print("   ℹ️  Index doesn't exist")
            else:
                raise e
        
        # Step 3: Create backup of current data
        print("\n🔧 Step 3: Creating backup...")
        cursor.execute("CREATE TABLE classes_backup AS SELECT * FROM classes")
        cursor.execute("CREATE TABLE students_backup AS SELECT * FROM students")
        print("   ✅ Backup tables created")
        
        # Step 4: Drop current primary key from classes
        print("\n🔧 Step 4: Dropping current primary key...")
        cursor.execute("ALTER TABLE classes DROP PRIMARY KEY")
        print("   ✅ Primary key dropped")
        
        # Step 5: Drop unique constraint on school_id
        print("\n🔧 Step 5: Dropping unique constraint on school_id...")
        try:
            cursor.execute("ALTER TABLE classes DROP INDEX school_id")
            print("   ✅ Unique constraint dropped")
        except Error as e:
            print(f"   ℹ️  Unique constraint may not exist: {e}")
        
        # Step 6: Rename school_id to class_id and make it primary key
        print("\n🔧 Step 6: Renaming school_id to class_id...")
        cursor.execute("""
            ALTER TABLE classes 
            CHANGE COLUMN school_id class_id VARCHAR(50) NOT NULL PRIMARY KEY
        """)
        print("   ✅ Column renamed and set as primary key")
        
        # Step 7: Update students table foreign key reference
        print("\n🔧 Step 7: Updating students table...")
        
        # First, we need to update the class_id values in students table to match class_id (old school_id)
        cursor.execute("""
            UPDATE students s 
            JOIN classes_backup c ON s.class_id = c.id 
            SET s.class_id_temp = c.school_id
        """)
        
        # Add temporary column to store new class_id values
        cursor.execute("ALTER TABLE students ADD COLUMN class_id_temp VARCHAR(50)")
        
        # Update the temporary column with correct class_id values
        cursor.execute("""
            UPDATE students s 
            JOIN classes_backup c ON s.class_id = c.id 
            SET s.class_id_temp = c.school_id
        """)
        
        # Drop old class_id column and rename temp column
        cursor.execute("ALTER TABLE students DROP COLUMN class_id")
        cursor.execute("ALTER TABLE students CHANGE COLUMN class_id_temp class_id VARCHAR(50)")
        
        print("   ✅ Students table updated")
        
        # Step 8: Add foreign key constraint
        print("\n🔧 Step 8: Adding foreign key constraint...")
        cursor.execute("""
            ALTER TABLE students 
            ADD CONSTRAINT fk_students_class_id 
            FOREIGN KEY (class_id) REFERENCES classes(class_id)
        """)
        print("   ✅ Foreign key constraint added")
        
        # Step 9: Verify the changes
        print("\n🔍 Step 9: Verifying changes...")
        
        # Check classes table structure
        cursor.execute("DESCRIBE classes")
        classes_structure = cursor.fetchall()
        print("   📋 Classes table structure:")
        for col in classes_structure:
            if col[0] == 'class_id':
                print(f"      ✅ {col[0]}: {col[1]}, Key: {col[3]}")
        
        # Check foreign key
        cursor.execute("""
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = 'counselorhub'
            AND TABLE_NAME = 'students'
            AND COLUMN_NAME = 'class_id'
        """)
        fk_info = cursor.fetchone()
        if fk_info:
            print(f"   ✅ Foreign key: students.class_id -> {fk_info[2]}.{fk_info[3]}")
        
        # Commit transaction
        connection.commit()
        print("\n🎉 MIGRATION COMPLETED SUCCESSFULLY!")
        
        # Clean up backup tables
        cursor.execute("DROP TABLE classes_backup")
        cursor.execute("DROP TABLE students_backup")
        print("   🧹 Cleanup completed")
        
    except Error as e:
        print(f"❌ Migration failed: {e}")
        connection.rollback()
        print("🔄 Rollback completed")
        
        # Clean up backup tables if they exist
        try:
            cursor.execute("DROP TABLE IF EXISTS classes_backup")
            cursor.execute("DROP TABLE IF EXISTS students_backup")
        except:
            pass
        
        sys.exit(1)
        
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    migrate_database()
