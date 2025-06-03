#!/usr/bin/env python3
"""
Check for any remaining references to students.id that should be updated to students.student_id
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

def check_student_references():
    """Check for references to students table"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("=== CHECKING TABLES THAT MIGHT REFERENCE STUDENTS ===")
        
        # Get all tables
        cursor.execute("SHOW TABLES")
        tables = [table[f"Tables_in_counselorhub"] for table in cursor.fetchall()]
        
        # Check each table for columns that might reference students
        for table in tables:
            if table == 'students':
                continue
                
            cursor.execute(f"DESCRIBE {table}")
            columns = cursor.fetchall()
            
            student_ref_columns = []
            for col in columns:
                if 'student' in col['Field'].lower():
                    student_ref_columns.append(col)
            
            if student_ref_columns:
                print(f"\nTable: {table}")
                for col in student_ref_columns:
                    print(f"  Column: {col['Field']} ({col['Type']})")
                
                # Check sample data to see what format is used
                if student_ref_columns:
                    sample_col = student_ref_columns[0]['Field']
                    cursor.execute(f"SELECT {sample_col} FROM {table} WHERE {sample_col} IS NOT NULL LIMIT 3")
                    sample_data = cursor.fetchall()
                    if sample_data:
                        print(f"  Sample values: {[row[sample_col] for row in sample_data]}")
        
        print("\n=== FOREIGN KEY CONSTRAINTS INVOLVING STUDENTS ===")
        cursor.execute("""
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE REFERENCED_TABLE_SCHEMA = 'counselorhub'
            AND (TABLE_NAME LIKE '%student%' OR REFERENCED_TABLE_NAME = 'students')
            ORDER BY TABLE_NAME, COLUMN_NAME
        """)
        
        foreign_keys = cursor.fetchall()
        for fk in foreign_keys:
            print(f"Table: {fk['TABLE_NAME']}.{fk['COLUMN_NAME']} -> {fk['REFERENCED_TABLE_NAME']}.{fk['REFERENCED_COLUMN_NAME']}")
        
    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    check_student_references()
