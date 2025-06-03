#!/usr/bin/env python3
"""
Remove avatar-related columns from users table
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

def remove_avatar_columns():
    """Remove avatar-related columns from users table"""
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("🗑️ Removing avatar-related columns from users table...")
        
        # Drop the avatar columns
        cursor.execute("ALTER TABLE users DROP COLUMN IF EXISTS avatar_type")
        cursor.execute("ALTER TABLE users DROP COLUMN IF EXISTS avatar_filename") 
        cursor.execute("ALTER TABLE users DROP COLUMN IF EXISTS avatar_url")
        
        connection.commit()
        print("✅ Avatar columns removed successfully!")
        
        # Show current table structure
        cursor.execute("DESCRIBE users")
        columns = cursor.fetchall()
        print("\n📋 Current users table structure:")
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
    remove_avatar_columns()
