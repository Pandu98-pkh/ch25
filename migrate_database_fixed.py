#!/usr/bin/env python3
"""
Fixed Database Migration Script:
1. Change school_id column to class_id in classes table
2. Make class_id the primary key in classes table
3. Handle auto_increment properly
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

def migrate_database_fixed():
    """Perform database migration with proper handling"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("🚀 STARTING FIXED DATABASE MIGRATION")
        print("="*50)
        
        # Start transaction
        connection.start_transaction()
        
        # Step 1: Create backup
        print("\n🔧 Step 1: Creating backup...")
        cursor.execute("DROP TABLE IF EXISTS classes_backup")
        cursor.execute("DROP TABLE IF EXISTS students_backup")
        cursor.execute("CREATE TABLE classes_backup AS SELECT * FROM classes")
        cursor.execute("CREATE TABLE students_backup AS SELECT * FROM students")
        print("   ✅ Backup tables created")
        
        # Step 2: Drop foreign key constraint from students table
        print("\n🔧 Step 2: Dropping foreign key constraints...")
        try:
            # Get all foreign key constraints for students table
            cursor.execute("""
                SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = 'counselorhub' 
                AND TABLE_NAME = 'students' 
                AND REFERENCED_TABLE_NAME = 'classes'
            """)
            constraints = cursor.fetchall()
            
            for constraint in constraints:
                cursor.execute(f"ALTER TABLE students DROP FOREIGN KEY {constraint[0]}")
                print(f"   ✅ Dropped constraint: {constraint[0]}")
                
        except Error as e:
            print(f"   ℹ️  No foreign key constraints found: {e}")
        
        # Step 3: Remove auto_increment from id column first
        print("\n🔧 Step 3: Removing auto_increment from id column...")
        cursor.execute("""
            ALTER TABLE classes 
            MODIFY COLUMN id INT(11) NOT NULL
        """)
        print("   ✅ Auto_increment removed from id")
        
        # Step 4: Drop primary key
        print("\n🔧 Step 4: Dropping current primary key...")
        cursor.execute("ALTER TABLE classes DROP PRIMARY KEY")
        print("   ✅ Primary key dropped")
        
        # Step 5: Add class_id as primary key (rename school_id)
        print("\n🔧 Step 5: Setting class_id as primary key...")
        cursor.execute("""
            ALTER TABLE classes 
            CHANGE COLUMN school_id class_id VARCHAR(50) NOT NULL PRIMARY KEY
        """)
        print("   ✅ class_id set as primary key")
        
        # Step 6: Update students table to use class_id instead of numeric id
        print("\n🔧 Step 6: Updating students table...")
        
        # Add new column for class_id reference
        cursor.execute("ALTER TABLE students ADD COLUMN new_class_id VARCHAR(50)")
        
        # Update the new column with class_id values from classes table
        cursor.execute("""
            UPDATE students s 
            JOIN classes_backup cb ON s.class_id = cb.id 
            SET s.new_class_id = cb.school_id
        """)
        
        # Drop old class_id column and rename new one
        cursor.execute("ALTER TABLE students DROP COLUMN class_id")
        cursor.execute("ALTER TABLE students CHANGE COLUMN new_class_id class_id VARCHAR(50)")
        
        print("   ✅ Students table updated")
        
        # Step 7: Add foreign key constraint
        print("\n🔧 Step 7: Adding foreign key constraint...")
        cursor.execute("""
            ALTER TABLE students 
            ADD CONSTRAINT fk_students_class_id 
            FOREIGN KEY (class_id) REFERENCES classes(class_id)
        """)
        print("   ✅ Foreign key constraint added")
        
        # Step 8: Verify the changes
        print("\n🔍 Step 8: Verifying changes...")
        
        # Check classes table structure
        cursor.execute("DESCRIBE classes")
        classes_structure = cursor.fetchall()
        print("   📋 Classes table structure:")
        for col in classes_structure:
            if col[0] in ['id', 'class_id']:
                print(f"      {col[0]}: {col[1]}, Key: {col[3]}, Extra: {col[5] if len(col) > 5 else 'None'}")
        
        # Check students table structure
        cursor.execute("DESCRIBE students")
        students_structure = cursor.fetchall()
        print("   👥 Students table class_id column:")
        for col in students_structure:
            if col[0] == 'class_id':
                print(f"      {col[0]}: {col[1]}")
        
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
        
        # Sample data verification
        print("\n📊 Sample data verification:")
        cursor.execute("SELECT class_id, name FROM classes LIMIT 3")
        classes_sample = cursor.fetchall()
        for row in classes_sample:
            print(f"   Class: {row[0]} - {row[1]}")
        
        cursor.execute("SELECT student_id, class_id FROM students LIMIT 3")
        students_sample = cursor.fetchall()
        for row in students_sample:
            print(f"   Student: {row[0]} -> Class: {row[1]}")
        
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
    migrate_database_fixed()
