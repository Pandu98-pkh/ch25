"""
Add user_id foreign key to students table
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

def add_user_id_column():
    """Add user_id column and foreign key constraint"""
    connection = create_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Check if user_id column already exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'counselorhub' 
            AND TABLE_NAME = 'students' 
            AND COLUMN_NAME = 'user_id'
        """)
        
        if cursor.fetchone()[0] == 0:
            # Add user_id column
            cursor.execute("ALTER TABLE students ADD COLUMN user_id INT")
            print("✓ Added user_id column to students table")
            
            # Add foreign key constraint
            cursor.execute("""
                ALTER TABLE students 
                ADD CONSTRAINT fk_students_user_id 
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            """)
            print("✓ Added foreign key constraint for user_id")
            
            # Add index for performance
            cursor.execute("CREATE INDEX idx_students_user_id ON students(user_id)")
            print("✓ Added index for user_id column")
        else:
            print("⚠ user_id column already exists")
        
        connection.commit()
        return True
        
    except Error as e:
        print(f"Error adding user_id column: {e}")
        connection.rollback()
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def populate_user_id_mapping():
    """Populate user_id based on existing student data"""
    connection = create_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Get all students without user_id
        cursor.execute("SELECT id, student_id FROM students WHERE user_id IS NULL")
        students = cursor.fetchall()
        
        print(f"Found {len(students)} students without user_id")
        
        # Create user records for existing students if they don't exist
        for student_db_id, student_id in students:
            # Check if user already exists for this student
            cursor.execute("SELECT id FROM users WHERE user_id = %s", (student_id,))
            user_result = cursor.fetchone()
            
            if user_result:
                # User exists, link it
                user_id = user_result[0]
                cursor.execute("UPDATE students SET user_id = %s WHERE id = %s", (user_id, student_db_id))
                print(f"✓ Linked student {student_id} to existing user {user_id}")
            else:
                # Create new user for this student
                import bcrypt
                password_hash = bcrypt.hashpw(f'{student_id.lower()}123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                
                cursor.execute("""
                    INSERT INTO users (user_id, username, email, password_hash, name, role) 
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    student_id,
                    student_id.lower(),
                    f"{student_id.lower()}@student.edu",
                    password_hash,
                    f"Student {student_id}",
                    'student'
                ))
                
                # Get the new user's ID
                new_user_id = cursor.lastrowid
                
                # Link student to new user
                cursor.execute("UPDATE students SET user_id = %s WHERE id = %s", (new_user_id, student_db_id))
                print(f"✓ Created new user and linked student {student_id} to user {new_user_id}")
        
        connection.commit()
        return True
        
    except Error as e:
        print(f"Error populating user_id mapping: {e}")
        connection.rollback()
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def verify_mapping():
    """Verify all students have user_id"""
    connection = create_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Check for students without user_id
        cursor.execute("SELECT COUNT(*) FROM students WHERE user_id IS NULL")
        orphaned_count = cursor.fetchone()[0]
        
        if orphaned_count == 0:
            print("✓ All students have user_id assigned")
        else:
            print(f"⚠ {orphaned_count} students still without user_id")
        
        # Test JOIN query
        cursor.execute("""
            SELECT s.student_id, u.name, s.tingkat, s.kelas 
            FROM students s 
            JOIN users u ON s.user_id = u.id 
            LIMIT 3
        """)
        results = cursor.fetchall()
        
        print("\nSample joined data:")
        for student_id, name, tingkat, kelas in results:
            print(f"  {student_id}: {name} (Grade {tingkat}, Class {kelas})")
        
        return True
        
    except Error as e:
        print(f"Error verifying mapping: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def main():
    """Main function"""
    print("=== Adding user_id Foreign Key to Students Table ===")
    print("-" * 50)
    
    print("Step 1: Adding user_id column...")
    if not add_user_id_column():
        print("❌ Failed to add user_id column")
        return
    
    print("\nStep 2: Populating user_id mapping...")
    if not populate_user_id_mapping():
        print("❌ Failed to populate user_id mapping")
        return
    
    print("\nStep 3: Verifying mapping...")
    if not verify_mapping():
        print("❌ Failed to verify mapping")
        return
    
    print("\n✅ user_id foreign key setup completed successfully!")

if __name__ == "__main__":
    main()
