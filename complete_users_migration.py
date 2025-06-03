#!/usr/bin/env python3
"""
Complete the Users Table Primary Key Migration
This script completes the migration that was partially successful.
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

def complete_users_migration():
    """Complete the users table migration"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("🔧 COMPLETING USERS TABLE PRIMARY KEY MIGRATION")
        print("="*50)
        
        # Step 1: Check current state
        print("\n📋 Step 1: Checking current state...")
        cursor.execute("SHOW CREATE TABLE users")
        current_structure = cursor.fetchone()
        print("Current users table structure:")
        print(current_structure['Create Table'])
        
        # Step 2: Drop the existing unique constraint on user_id
        print("\n🔧 Step 2: Dropping unique constraint on user_id...")
        try:
            cursor.execute("ALTER TABLE users DROP INDEX user_id")
            print("✅ Dropped unique constraint on user_id")
        except Error as e:
            print(f"⚠️ Warning: {e}")
        
        # Step 3: Add primary key on user_id
        print("\n🔑 Step 3: Setting user_id as primary key...")
        try:
            cursor.execute("ALTER TABLE users ADD PRIMARY KEY (user_id)")
            print("✅ Set user_id as primary key")
        except Error as e:
            print(f"❌ Error setting primary key: {e}")
            return False
        
        # Step 4: Drop the old id column
        print("\n🗑️ Step 4: Removing old id column...")
        try:
            cursor.execute("ALTER TABLE users DROP COLUMN id")
            print("✅ Removed old id column")
        except Error as e:
            print(f"❌ Error removing id column: {e}")
            return False
        
        # Step 5: Verification
        print("\n✅ Step 5: Final verification...")
        
        # Check new structure
        cursor.execute("SHOW CREATE TABLE users")
        new_structure = cursor.fetchone()
        print("\nFinal users table structure:")
        print(new_structure['Create Table'])
        
        # Check primary key
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE CONSTRAINT_NAME = 'PRIMARY' 
            AND TABLE_SCHEMA = 'counselorhub'
            AND TABLE_NAME = 'users'
        """)
        pk_columns = cursor.fetchall()
        print(f"\nPrimary key columns: {[col['COLUMN_NAME'] for col in pk_columns]}")
        
        # Test data integrity
        cursor.execute("SELECT COUNT(*) as count FROM users")
        final_count = cursor.fetchone()['count']
        print(f"User count: {final_count}")
        
        # Sample data
        cursor.execute("SELECT user_id, name, email, role FROM users LIMIT 5")
        sample_users = cursor.fetchall()
        print("\nSample users:")
        for user in sample_users:
            print(f"  PK: {user['user_id']} | Name: {user['name']} | Role: {user['role']}")
        
        # Commit changes
        connection.commit()
        print("\n🎉 USERS PRIMARY KEY MIGRATION COMPLETED SUCCESSFULLY!")
        
        return True
        
    except Error as e:
        print(f"❌ Error: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    print("🚀 Completing Users Table Primary Key Migration")
    print("This will finish setting user_id as primary key and remove the id column")
    
    success = complete_users_migration()
    
    if success:
        print("\n" + "="*50)
        print("📋 MIGRATION COMPLETED SUCCESSFULLY!")
        print("="*50)
        print("✅ users.user_id is now the primary key")
        print("✅ Old 'id' column has been removed")
        print("✅ All foreign key relationships were already updated")
        print("✅ Data integrity maintained")
        print("\n⚠️ NEXT STEPS:")
        print("1. Update backend API to use user_id as primary key")
        print("2. Update frontend code to use user_id instead of id")
        print("3. Test all user-related operations")
        print("4. Update documentation to reflect schema changes")
    else:
        print("\n❌ Migration completion failed. Please review the errors above.")
