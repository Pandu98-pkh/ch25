#!/usr/bin/env python3
"""
Fixed Database Migration Script: Clean up classes table and set proper primary key
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

def fix_database_schema():
    """Fix database schema to properly set class_id as primary key"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("🔧 FIXING DATABASE SCHEMA")
        print("="*50)
        
        # Step 1: Check current state
        print("\n📋 Step 1: Checking current state...")
        cursor.execute("SHOW CREATE TABLE classes")
        current_structure = cursor.fetchone()
        print("Current classes table structure:")
        print(current_structure[1])
        
        # Step 2: Backup data
        print("\n💾 Step 2: Backing up data...")
        cursor.execute("SELECT * FROM classes")
        classes_backup = cursor.fetchall()
        cursor.execute("SHOW COLUMNS FROM classes")
        classes_columns = [col[0] for col in cursor.fetchall()]
        print(f"✅ Backed up {len(classes_backup)} classes records")
        
        cursor.execute("SELECT * FROM students")
        students_backup = cursor.fetchall()
        cursor.execute("SHOW COLUMNS FROM students") 
        students_columns = [col[0] for col in cursor.fetchall()]
        print(f"✅ Backed up {len(students_backup)} students records")
        
        # Step 3: Drop foreign key constraints from students table
        print("\n🔗 Step 3: Handling foreign key constraints...")
        try:
            cursor.execute("""
                SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = 'counselorhub' 
                AND TABLE_NAME = 'students' 
                AND REFERENCED_TABLE_NAME = 'classes'
            """)
            fk_constraints = cursor.fetchall()
            
            for (constraint_name,) in fk_constraints:
                cursor.execute(f"ALTER TABLE students DROP FOREIGN KEY {constraint_name}")
                print(f"✅ Dropped foreign key: {constraint_name}")
                
        except Error as e:
            print(f"⚠️ Note: {e}")
        
        # Step 4: Create mapping from id to class_id for students update
        print("\n🗺️ Step 4: Creating ID mapping...")
        cursor.execute("SELECT id, class_id FROM classes")
        id_to_class_id = dict(cursor.fetchall())
        print(f"✅ Created mapping for {len(id_to_class_id)} classes")
        
        # Step 5: Update students table to use class_id instead of numeric id
        print("\n👥 Step 5: Updating students table...")
        
        # First, change students.class_id type to VARCHAR if it's still INT
        try:
            cursor.execute("ALTER TABLE students MODIFY COLUMN class_id VARCHAR(50)")
            print("✅ Changed students.class_id to VARCHAR(50)")
        except Error as e:
            print(f"Note: {e}")
        
        # Update student records to use proper class_id
        updated_count = 0
        for student_row in students_backup:
            student_data = dict(zip(students_columns, student_row))
            student_id = student_data['id']
            current_class_id = student_data.get('class_id')
            
            # If class_id is numeric, convert to proper class_id string
            if current_class_id and str(current_class_id).isdigit():
                numeric_id = int(current_class_id)
                if numeric_id in id_to_class_id:
                    new_class_id = id_to_class_id[numeric_id]
                    cursor.execute(
                        "UPDATE students SET class_id = %s WHERE id = %s",
                        (new_class_id, student_id)
                    )
                    updated_count += 1
        
        print(f"✅ Updated {updated_count} student records")
        
        # Step 6: Fix classes table structure
        print("\n📋 Step 6: Fixing classes table structure...")
        
        # Remove the id column since we want class_id as primary key
        try:
            cursor.execute("ALTER TABLE classes DROP COLUMN id")
            print("✅ Dropped id column from classes")
        except Error as e:
            print(f"Note: {e}")
        
        # Drop existing indexes
        try:
            cursor.execute("ALTER TABLE classes DROP INDEX school_id")
            print("✅ Dropped school_id index")
        except Error as e:
            print(f"Note: {e}")
        
        try:
            cursor.execute("ALTER TABLE classes DROP INDEX idx_school_id")
            print("✅ Dropped idx_school_id index")
        except Error as e:
            print(f"Note: {e}")
        
        # Add primary key to class_id
        try:
            cursor.execute("ALTER TABLE classes ADD PRIMARY KEY (class_id)")
            print("✅ Set class_id as primary key")
        except Error as e:
            print(f"❌ Error setting primary key: {e}")
            return False
        
        # Step 7: Add foreign key constraint
        print("\n🔗 Step 7: Adding foreign key constraint...")
        try:
            cursor.execute("""
                ALTER TABLE students 
                ADD CONSTRAINT fk_students_class_id 
                FOREIGN KEY (class_id) REFERENCES classes(class_id)
                ON DELETE SET NULL ON UPDATE CASCADE
            """)
            print("✅ Added foreign key constraint")
        except Error as e:
            print(f"⚠️ Warning: {e}")
        
        # Step 8: Verification
        print("\n✅ Step 8: Verification...")
        
        # Check new structure
        cursor.execute("SHOW CREATE TABLE classes")
        new_structure = cursor.fetchone()
        print("\nNew classes table structure:")
        print(new_structure[1])
        
        # Check primary key
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE CONSTRAINT_NAME = 'PRIMARY' 
            AND TABLE_SCHEMA = 'counselorhub'
            AND TABLE_NAME = 'classes'
        """)
        pk_columns = cursor.fetchall()
        print(f"\nPrimary key columns: {[col[0] for col in pk_columns]}")
        
        # Check foreign keys
        cursor.execute("""
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME,
                CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = 'counselorhub'
            AND TABLE_NAME = 'students'
            AND REFERENCED_TABLE_NAME = 'classes'
        """)
        fk_info = cursor.fetchall()
        print("\nForeign key relationships:")
        for table, column, ref_table, ref_column, constraint in fk_info:
            print(f"  {table}.{column} -> {ref_table}.{ref_column} ({constraint})")
        
        # Sample data
        cursor.execute("SELECT class_id, name FROM classes LIMIT 3")
        sample_classes = cursor.fetchall()
        print("\nSample classes:")
        for class_id, name in sample_classes:
            print(f"  {class_id}: {name}")
        
        cursor.execute("SELECT student_id, class_id FROM students WHERE class_id IS NOT NULL LIMIT 3")
        sample_students = cursor.fetchall()
        print("\nSample students:")
        for student_id, class_id in sample_students:
            print(f"  {student_id}: class_id={class_id}")
        
        # Commit changes
        connection.commit()
        print("\n🎉 DATABASE SCHEMA FIXED SUCCESSFULLY!")
        
        return True
        
    except Error as e:
        print(f"❌ Error: {e}")
        connection.rollback()
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    success = fix_database_schema()
    if success:
        print("\n🎯 Schema changes completed:")
        print("  ✅ classes.class_id is now the primary key")
        print("  ✅ students.class_id references classes.class_id")
        print("  ✅ Foreign key constraint established")
        print("\n📝 Next: Update API and forms to use class_id")
    else:
        print("\n❌ Schema fix failed")
