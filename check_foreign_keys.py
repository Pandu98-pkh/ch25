#!/usr/bin/env python3
"""
Check foreign key relationships in the database
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

def check_foreign_keys():
    """Check foreign key relationships"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("=== FOREIGN KEY CONSTRAINTS ===")
        cursor.execute("""
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE REFERENCED_TABLE_SCHEMA = 'counselorhub'
            AND REFERENCED_TABLE_NAME IS NOT NULL
            ORDER BY TABLE_NAME, COLUMN_NAME
        """)
        
        foreign_keys = cursor.fetchall()
        for fk in foreign_keys:
            print(f"Table: {fk['TABLE_NAME']}")
            print(f"  Column: {fk['COLUMN_NAME']} -> {fk['REFERENCED_TABLE_NAME']}.{fk['REFERENCED_COLUMN_NAME']}")
            print(f"  Constraint: {fk['CONSTRAINT_NAME']}")
            print()
        
        print("=== STUDENTS TABLE STRUCTURE ===")
        cursor.execute("DESCRIBE students")
        students_columns = cursor.fetchall()
        for col in students_columns:
            print(f"{col['Field']}: {col['Type']} {'(PK)' if col['Key'] == 'PRI' else ''} {'NULL' if col['Null'] == 'YES' else 'NOT NULL'}")
        
        print("\n=== USERS TABLE STRUCTURE ===")
        cursor.execute("DESCRIBE users")
        users_columns = cursor.fetchall()
        for col in users_columns:
            print(f"{col['Field']}: {col['Type']} {'(PK)' if col['Key'] == 'PRI' else ''} {'NULL' if col['Null'] == 'YES' else 'NOT NULL'}")
        
        print("\n=== SAMPLE DATA VERIFICATION ===")
        cursor.execute("""
            SELECT s.student_id, s.user_id, u.id as user_table_id, u.user_id as user_user_id, u.name
            FROM students s
            LEFT JOIN users u ON s.user_id = u.id
            LIMIT 5
        """)
        
        sample_data = cursor.fetchall()
        print("Sample student-user relationships:")
        for row in sample_data:
            print(f"Student {row['student_id']} -> user_id: {row['user_id']} -> users.id: {row['user_table_id']} -> users.user_id: {row['user_user_id']} -> name: {row['name']}")
        
    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    check_foreign_keys()
