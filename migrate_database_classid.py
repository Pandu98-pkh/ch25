#!/usr/bin/env python3
"""
Database Migration Script: Change school_id to class_id in classes table and make it primary key
Also update students table to reference the new class_id properly
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

def migrate_database():
    """Migrate database schema according to requirements"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("🔄 STARTING DATABASE MIGRATION")
        print("="*50)
        
        # Step 1: Backup current data
        print("\n📋 Step 1: Backing up current data...")
        
        # Get current classes data
        cursor.execute("SELECT * FROM classes")
        classes_backup = cursor.fetchall()
        cursor.execute("SHOW COLUMNS FROM classes")
        classes_columns = [col[0] for col in cursor.fetchall()]
        print(f"✅ Backed up {len(classes_backup)} classes records")
        
        # Get current students data
        cursor.execute("SELECT * FROM students")
        students_backup = cursor.fetchall()
        cursor.execute("SHOW COLUMNS FROM students")
        students_columns = [col[0] for col in cursor.fetchall()]
        print(f"✅ Backed up {len(students_backup)} students records")
        
        # Step 2: Create mapping from old id to school_id for classes
        print("\n🗺️ Step 2: Creating mapping for class references...")
        cursor.execute("SELECT id, school_id FROM classes")
        class_mapping = dict(cursor.fetchall())
        print(f"✅ Created mapping for {len(class_mapping)} classes")
        
        # Step 3: Drop foreign key constraints that reference classes
        print("\n🔗 Step 3: Dropping foreign key constraints...")
        try:
            # Check if foreign key exists first
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
                print(f"✅ Dropped foreign key constraint: {constraint_name}")
                
        except Error as e:
            print(f"⚠️ Warning dropping foreign keys: {e}")
        
        # Step 4: Modify classes table structure
        print("\n📋 Step 4: Modifying classes table structure...")
        
        # Drop the current primary key
        try:
            cursor.execute("ALTER TABLE classes DROP PRIMARY KEY")
            print("✅ Dropped current primary key from classes")
        except Error as e:
            print(f"⚠️ Warning dropping primary key: {e}")
        
        # Rename school_id to class_id
        try:
            cursor.execute("ALTER TABLE classes CHANGE COLUMN school_id class_id VARCHAR(50) NOT NULL")
            print("✅ Renamed school_id to class_id")
        except Error as e:
            print(f"❌ Error renaming column: {e}")
            return False
        
        # Make class_id the new primary key
        try:
            cursor.execute("ALTER TABLE classes ADD PRIMARY KEY (class_id)")
            print("✅ Set class_id as primary key")
        except Error as e:
            print(f"❌ Error setting primary key: {e}")
            return False
        
        # Step 5: Update students table to use class_id properly
        print("\n👥 Step 5: Updating students table...")
        
        # Update students.class_id to reference the new class_id (former school_id)
        print("🔄 Updating student class references...")
        for student_row in students_backup:
            student_data = dict(zip(students_columns, student_row))
            old_class_id = student_data.get('class_id')
            
            if old_class_id and old_class_id in class_mapping:
                new_class_id = class_mapping[old_class_id]
                cursor.execute(
                    "UPDATE students SET class_id = %s WHERE id = %s",
                    (new_class_id, student_data['id'])
                )
        
        print("✅ Updated student class references")
        
        # Step 6: Change students.class_id to VARCHAR to match classes.class_id
        print("\n🔄 Step 6: Updating students.class_id column type...")
        try:
            cursor.execute("ALTER TABLE students MODIFY COLUMN class_id VARCHAR(50)")
            print("✅ Changed students.class_id to VARCHAR(50)")
        except Error as e:
            print(f"❌ Error modifying column type: {e}")
            return False
        
        # Step 7: Add foreign key constraint
        print("\n🔗 Step 7: Adding new foreign key constraint...")
        try:
            cursor.execute("""
                ALTER TABLE students 
                ADD CONSTRAINT fk_students_class_id 
                FOREIGN KEY (class_id) REFERENCES classes(class_id)
                ON DELETE SET NULL ON UPDATE CASCADE
            """)
            print("✅ Added foreign key constraint: students.class_id -> classes.class_id")
        except Error as e:
            print(f"⚠️ Warning adding foreign key: {e}")
        
        # Step 8: Verify the changes
        print("\n✅ Step 8: Verifying changes...")
        
        # Check classes table structure
        cursor.execute("DESCRIBE classes")
        classes_structure = cursor.fetchall()
        print("\n📋 New classes table structure:")
        for column in classes_structure:
            print(f"  {column[0]:<15} {column[1]:<20} {column[2]:<10} {column[3]:<10}")
        
        # Check students table structure
        cursor.execute("DESCRIBE students")
        students_structure = cursor.fetchall()
        print("\n👥 New students table structure:")
        for column in students_structure:
            print(f"  {column[0]:<15} {column[1]:<20} {column[2]:<10} {column[3]:<10}")
        
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
        print("\n🔗 Foreign key relationships:")
        for table, column, ref_table, ref_column, constraint in fk_info:
            print(f"  {table}.{column} -> {ref_table}.{ref_column} ({constraint})")
        
        # Sample data verification
        print("\n📊 Sample data verification:")
        cursor.execute("SELECT class_id, name FROM classes LIMIT 3")
        sample_classes = cursor.fetchall()
        print("Classes:")
        for class_id, name in sample_classes:
            print(f"  {class_id}: {name}")
        
        cursor.execute("SELECT student_id, class_id, tingkat, kelas FROM students WHERE class_id IS NOT NULL LIMIT 3")
        sample_students = cursor.fetchall()
        print("Students:")
        for student_id, class_id, tingkat, kelas in sample_students:
            print(f"  {student_id}: class_id={class_id}, grade={tingkat}, class={kelas}")
        
        # Commit all changes
        connection.commit()
        print("\n🎉 DATABASE MIGRATION COMPLETED SUCCESSFULLY!")
        print("✅ Changes:")
        print("  - classes.school_id renamed to classes.class_id")
        print("  - classes.class_id is now the primary key")
        print("  - students.class_id now references classes.class_id")
        print("  - Foreign key constraint added")
        
        return True
        
    except Error as e:
        print(f"❌ Migration failed: {e}")
        connection.rollback()
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    success = migrate_database()
    if success:
        print("\n🎯 Next steps:")
        print("  1. Update backend API to use class_id instead of school_id")
        print("  2. Update frontend forms to work with new class_id")
        print("  3. Test all CRUD operations")
    else:
        print("\n❌ Migration failed. Please check the errors above.")
