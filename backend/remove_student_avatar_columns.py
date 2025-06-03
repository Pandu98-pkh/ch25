#!/usr/bin/env python3
"""
Remove unnecessary avatar-related columns from students table
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

def remove_student_avatar_columns():
    """Remove avatar-related columns from students table"""
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("🗑️ Removing unnecessary avatar-related columns from students table...")
        
        # Check current columns first
        cursor.execute("DESCRIBE students")
        current_columns = [row[0] for row in cursor.fetchall()]
        print(f"Current columns: {current_columns}")
        
        # Drop the avatar columns if they exist
        columns_to_remove = ['avatar_type', 'avatar_filename', 'avatar_url', 'user_id']
        
        for column in columns_to_remove:
            if column in current_columns:
                try:
                    cursor.execute(f"ALTER TABLE students DROP COLUMN {column}")
                    print(f"✅ Removed column: {column}")
                except Error as e:
                    print(f"❌ Error removing column {column}: {e}")
        
        connection.commit()
        print("✅ Avatar columns removed successfully!")
        
        # Show current table structure
        cursor.execute("DESCRIBE students")
        columns = cursor.fetchall()
        print("\n📋 Current students table structure:")
        for column in columns:
            print(f"  - {column[0]}: {column[1]}")
            
    except Error as e:
        print(f"❌ Error removing avatar columns: {e}")
        if connection:
            connection.rollback()
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    remove_student_avatar_columns()
