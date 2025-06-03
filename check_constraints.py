#!/usr/bin/env python3
"""
Check indexes and constraints before migration
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

def check_constraints():
    """Check all constraints and indexes"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("🔍 CHECKING DATABASE CONSTRAINTS AND INDEXES")
        print("="*50)
        
        # Check all indexes on classes table
        print("\n📋 INDEXES ON CLASSES TABLE:")
        cursor.execute("SHOW INDEX FROM classes")
        indexes = cursor.fetchall()
        for idx in indexes:
            print(f"   {idx[2]}: {idx[4]} ({idx[10]})")
        
        # Check all constraints
        print("\n🔗 FOREIGN KEY CONSTRAINTS:")
        cursor.execute("""
            SELECT 
                CONSTRAINT_NAME,
                TABLE_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = 'counselorhub'
        """)
        constraints = cursor.fetchall()
        for constraint in constraints:
            print(f"   {constraint[0]}: {constraint[1]}.{constraint[2]} -> {constraint[3]}.{constraint[4]}")
        
        # Check unique constraints
        print("\n🔑 UNIQUE CONSTRAINTS:")
        cursor.execute("""
            SELECT DISTINCT
                TABLE_NAME,
                INDEX_NAME,
                COLUMN_NAME
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = 'counselorhub'
            AND NON_UNIQUE = 0
            AND INDEX_NAME != 'PRIMARY'
        """)
        unique_constraints = cursor.fetchall()
        for constraint in unique_constraints:
            print(f"   {constraint[0]}.{constraint[1]}: {constraint[2]}")
            
    except Error as e:
        print(f"❌ Error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    check_constraints()
