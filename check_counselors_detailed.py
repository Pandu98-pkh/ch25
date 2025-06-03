#!/usr/bin/env python3
"""
Check what counselors exist in the users table
"""

import mysql.connector
import json

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'database': 'counselorhub'
}

def check_counselors():
    """Check what counselors exist in the users table"""
    try:
        print("🔍 Checking counselors in the database...")
        
        # Connect to database
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Check counselors in users table
        cursor.execute("""
            SELECT user_id, name, email, role 
            FROM users 
            WHERE role IN ('counselor', 'admin')
            ORDER BY role, user_id
        """)
        
        users = cursor.fetchall()
        
        print(f"\n📋 Found {len(users)} counselors/admins:")
        print("-" * 60)
        print(f"{'ID':<15} {'Name':<25} {'Email':<25} {'Role':<10}")
        print("-" * 60)
        
        for user_id, name, email, role in users:
            print(f"{user_id:<15} {name:<25} {email:<25} {role:<10}")
        
        # Also check what the constraint actually expects
        print("\n🔧 Checking foreign key constraints...")
        cursor.execute("""
            SELECT 
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'counseling_sessions'
            AND CONSTRAINT_NAME LIKE '%counselor%'
        """)
        
        constraints = cursor.fetchall()
        print("\n📝 Foreign key constraints for counselor_id:")
        for constraint in constraints:
            print(f"  - {constraint[0]}: {constraint[1]} → {constraint[2]}.{constraint[3]}")
        
        # Check current structure of counseling_sessions table
        print("\n🏗️ Counseling sessions table structure:")
        cursor.execute("DESCRIBE counseling_sessions")
        columns = cursor.fetchall()
        for column in columns:
            print(f"  - {column[0]}: {column[1]} {column[2] if column[2] else ''} {column[3] if column[3] else ''}")
        
        cursor.close()
        connection.close()
        
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_counselors()
