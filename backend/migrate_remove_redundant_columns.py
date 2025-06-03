"""
Database Migration Script - Remove Redundant Columns from Students Table
Removes name, email, and avatar columns from students table since these
can be accessed through the users table via user_id foreign key.
"""

import mysql.connector
from mysql.connector import Error

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'database': 'counselorhub',
    'charset': 'utf8mb4',
    'collation': 'utf8mb4_unicode_ci'
}

def create_connection():
    """Create database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def backup_student_data():
    """Backup existing student data before migration"""
    connection = create_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Create backup table with current structure
        backup_query = """
        CREATE TABLE students_backup_before_migration AS 
        SELECT * FROM students
        """
        cursor.execute(backup_query)
        
        # Get count of backed up records
        cursor.execute("SELECT COUNT(*) FROM students_backup_before_migration")
        count = cursor.fetchone()[0]
        
        connection.commit()
        print(f"✓ Backed up {count} student records to 'students_backup_before_migration' table")
        return True
        
    except Error as e:
        print(f"Error creating backup: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def remove_redundant_columns():
    """Remove redundant columns from students table"""
    connection = create_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Check current structure
        cursor.execute("DESCRIBE students")
        columns_before = cursor.fetchall()
        print("Current students table structure:")
        for col in columns_before:
            print(f"  - {col[0]} ({col[1]})")
        
        # Remove redundant columns one by one
        redundant_columns = ['name', 'email', 'avatar']
        
        for column in redundant_columns:
            try:
                # Check if column exists before trying to drop it
                cursor.execute(f"""
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = 'counselorhub' 
                    AND TABLE_NAME = 'students' 
                    AND COLUMN_NAME = '{column}'
                """)
                
                if cursor.fetchone()[0] > 0:
                    cursor.execute(f"ALTER TABLE students DROP COLUMN {column}")
                    print(f"✓ Removed column: {column}")
                else:
                    print(f"⚠ Column {column} does not exist, skipping")
                    
            except Error as e:
                print(f"Error removing column {column}: {e}")
        
        # Verify the changes
        cursor.execute("DESCRIBE students")
        columns_after = cursor.fetchall()
        print("\nUpdated students table structure:")
        for col in columns_after:
            print(f"  - {col[0]} ({col[1]})")
        
        connection.commit()
        print("\n✓ Migration completed successfully!")
        return True
        
    except Error as e:
        print(f"Error during migration: {e}")
        connection.rollback()
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def verify_data_integrity():
    """Verify that student data can still be accessed through user joins"""
    connection = create_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Test query to join students with users
        test_query = """
        SELECT 
            s.id,
            s.student_id,
            s.tingkat,
            s.kelas,
            s.academic_status,
            u.name,
            u.email,
            u.photo as avatar
        FROM students s
        LEFT JOIN users u ON s.user_id = u.id
        LIMIT 5
        """
        
        cursor.execute(test_query)
        results = cursor.fetchall()
        
        print(f"\nData integrity check - Sample joined data ({len(results)} records):")
        print("ID | Student ID | Grade | Class | Status | Name | Email | Avatar")
        print("-" * 80)
        
        for row in results:
            print(f"{row[0]} | {row[1]} | {row[2]} | {row[3]} | {row[4]} | {row[5]} | {row[6]} | {'Yes' if row[7] else 'No'}")
        
        # Check for any students without user records
        cursor.execute("""
        SELECT COUNT(*) FROM students s 
        LEFT JOIN users u ON s.user_id = u.id 
        WHERE u.id IS NULL
        """)
        orphaned_students = cursor.fetchone()[0]
        
        if orphaned_students > 0:
            print(f"\n⚠ Warning: {orphaned_students} students have no corresponding user record")
        else:
            print(f"\n✓ All students have corresponding user records")
        
        return True
        
    except Error as e:
        print(f"Error during verification: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def main():
    """Main migration function"""
    print("=== CounselorHub Database Migration ===")
    print("Removing redundant columns from students table")
    print("Columns to remove: name, email, avatar")
    print("-" * 50)
    
    # Step 1: Backup data
    print("Step 1: Creating backup...")
    if not backup_student_data():
        print("❌ Backup failed. Aborting migration.")
        return
    
    # Step 2: Remove redundant columns
    print("\nStep 2: Removing redundant columns...")
    if not remove_redundant_columns():
        print("❌ Migration failed.")
        return
    
    # Step 3: Verify data integrity
    print("\nStep 3: Verifying data integrity...")
    if not verify_data_integrity():
        print("❌ Data integrity check failed.")
        return
    
    print("\n" + "=" * 50)
    print("✅ Migration completed successfully!")
    print("✅ Database normalization improved")
    print("✅ Data redundancy eliminated")
    print("\nNext steps:")
    print("- Update backend API endpoints to use JOIN queries")
    print("- Update frontend components to handle new data structure")

if __name__ == "__main__":
    main()
