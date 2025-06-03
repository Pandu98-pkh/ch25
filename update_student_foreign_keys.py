#!/usr/bin/env python3
"""
Update foreign key references in related tables to use students.student_id instead of students.id
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

def update_foreign_key_references():
    """Update tables that reference students to use student_id (varchar) instead of id (int)"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("=== ANALYZING CURRENT STATE ===")
        
        # Tables that need to be updated
        tables_to_update = [
            'behavior_records',
            'career_assessments', 
            'counseling_sessions',
            'mental_health_assessments'
        ]
        
        for table in tables_to_update:
            print(f"\n--- Checking {table} ---")
            
            # Check current structure
            cursor.execute(f"DESCRIBE {table}")
            columns = cursor.fetchall()
            student_id_col = None
            for col in columns:
                if col['Field'] == 'student_id':
                    student_id_col = col
                    break
            
            if not student_id_col:
                print(f"No student_id column found in {table}")
                continue
                
            print(f"Current student_id column: {student_id_col['Type']} {student_id_col['Key']}")
            
            # Check current data
            cursor.execute(f"SELECT student_id, COUNT(*) as count FROM {table} GROUP BY student_id LIMIT 5")
            sample_data = cursor.fetchall()
            print(f"Sample student_id values: {[row['student_id'] for row in sample_data]}")
            
            # Check if this is an integer referencing students.id
            if 'int' in student_id_col['Type'].lower():
                print(f"✅ {table}.student_id needs to be updated from int to varchar")
                
                # Get mapping from students.id to students.student_id
                cursor.execute("""
                    SELECT id, student_id 
                    FROM students 
                    WHERE id IN (SELECT DISTINCT student_id FROM {})
                """.format(table))
                
                id_mapping = cursor.fetchall()
                print(f"Found {len(id_mapping)} students to map")
                
                if id_mapping:
                    # Create mapping dictionary
                    mapping = {row['id']: row['student_id'] for row in id_mapping}
                    print(f"Mapping: {mapping}")
                    
                    # Check for any unmapped records
                    cursor.execute(f"""
                        SELECT DISTINCT student_id 
                        FROM {table} 
                        WHERE student_id NOT IN (SELECT id FROM students WHERE id IS NOT NULL)
                    """)
                    unmapped = cursor.fetchall()
                    if unmapped:
                        print(f"⚠️ Warning: Found unmapped student_id values: {[r['student_id'] for r in unmapped]}")
                        
                        # Remove or handle orphaned records
                        cursor.execute(f"SELECT COUNT(*) as count FROM {table} WHERE student_id NOT IN (SELECT id FROM students WHERE id IS NOT NULL)")
                        orphan_count = cursor.fetchone()['count']
                        if orphan_count > 0:
                            print(f"Found {orphan_count} orphaned records. Deleting them...")
                            cursor.execute(f"DELETE FROM {table} WHERE student_id NOT IN (SELECT id FROM students WHERE id IS NOT NULL)")
                            
                else:
                    print(f"No valid student references found in {table}")
            else:
                print(f"✅ {table}.student_id already appears to be varchar/text type")
        
        print("\n=== UPDATING SCHEMA ===")
        
        for table in tables_to_update:
            print(f"\n--- Updating {table} ---")
            
            # Check if needs updating
            cursor.execute(f"DESCRIBE {table}")
            columns = cursor.fetchall()
            student_id_col = None
            for col in columns:
                if col['Field'] == 'student_id':
                    student_id_col = col
                    break
            
            if not student_id_col or 'int' not in student_id_col['Type'].lower():
                print(f"Skipping {table} - already correct type or no student_id column")
                continue
            
            try:
                # Step 1: Add temporary column
                print(f"Step 1: Adding temporary column to {table}")
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN student_id_new VARCHAR(50) DEFAULT NULL")
                
                # Step 2: Populate with mapped values
                print(f"Step 2: Populating new column with mapped values")
                cursor.execute(f"""
                    UPDATE {table} t
                    JOIN students s ON t.student_id = s.id
                    SET t.student_id_new = s.student_id
                """)
                
                # Step 3: Verify all records were mapped
                cursor.execute(f"SELECT COUNT(*) as count FROM {table} WHERE student_id_new IS NULL AND student_id IS NOT NULL")
                unmapped_count = cursor.fetchone()['count']
                if unmapped_count > 0:
                    print(f"⚠️ Warning: {unmapped_count} records could not be mapped. They will be set to NULL.")
                
                # Step 4: Drop old column and rename new one
                print(f"Step 3: Dropping old column and renaming new one")
                cursor.execute(f"ALTER TABLE {table} DROP COLUMN student_id")
                cursor.execute(f"ALTER TABLE {table} CHANGE COLUMN student_id_new student_id VARCHAR(50) DEFAULT NULL")
                
                # Step 5: Add foreign key constraint if needed
                print(f"Step 4: Adding foreign key constraint")
                try:
                    cursor.execute(f"""
                        ALTER TABLE {table} 
                        ADD CONSTRAINT fk_{table}_student_id 
                        FOREIGN KEY (student_id) REFERENCES students(student_id) 
                        ON DELETE SET NULL ON UPDATE CASCADE
                    """)
                    print(f"✅ Foreign key constraint added for {table}")
                except Error as fk_error:
                    print(f"⚠️ Could not add foreign key constraint: {fk_error}")
                
                print(f"✅ Successfully updated {table}")
                
            except Error as e:
                print(f"❌ Error updating {table}: {e}")
                # Try to clean up on error
                try:
                    cursor.execute(f"ALTER TABLE {table} DROP COLUMN IF EXISTS student_id_new")
                except:
                    pass
        
        # Commit all changes
        connection.commit()
        print("\n=== UPDATE COMPLETE ===")
        
        # Verify final state
        print("\n=== VERIFICATION ===")
        for table in tables_to_update:
            cursor.execute(f"DESCRIBE {table}")
            columns = cursor.fetchall()
            for col in columns:
                if col['Field'] == 'student_id':
                    print(f"{table}.student_id: {col['Type']} {col['Key']}")
                    
                    # Show sample data
                    cursor.execute(f"SELECT student_id FROM {table} WHERE student_id IS NOT NULL LIMIT 3")
                    sample = cursor.fetchall()
                    if sample:
                        print(f"  Sample values: {[row['student_id'] for row in sample]}")
                    break
        
    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    print("This script will update foreign key references to use students.student_id")
    print("Press Enter to continue or Ctrl+C to cancel...")
    input()
    update_foreign_key_references()
