#!/usr/bin/env python3
"""
Analyze current database structure for classes and students tables
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

def analyze_database():
    """Analyze current database structure"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("🔍 ANALYZING DATABASE STRUCTURE")
        print("="*50)
        
        # Check classes table structure
        print("\n📋 CLASSES TABLE STRUCTURE:")
        cursor.execute("DESCRIBE classes")
        classes_columns = cursor.fetchall()
        for column in classes_columns:
            print(f"  {column[0]:<15} {column[1]:<20} {column[2]:<10} {column[3]:<10} {column[4]}")
        
        # Check students table structure
        print("\n👥 STUDENTS TABLE STRUCTURE:")
        cursor.execute("DESCRIBE students")
        students_columns = cursor.fetchall()
        for column in students_columns:
            print(f"  {column[0]:<15} {column[1]:<20} {column[2]:<10} {column[3]:<10} {column[4]}")
        
        # Check current primary keys
        print("\n🔑 PRIMARY KEYS:")
        cursor.execute("""
            SELECT TABLE_NAME, COLUMN_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE CONSTRAINT_NAME = 'PRIMARY' 
            AND TABLE_SCHEMA = 'counselorhub'
            AND TABLE_NAME IN ('classes', 'students')
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        """)
        pk_info = cursor.fetchall()
        for table, column in pk_info:
            print(f"  {table}: {column}")
        
        # Check foreign keys
        print("\n🔗 FOREIGN KEYS:")
        cursor.execute("""
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = 'counselorhub'
            AND TABLE_NAME IN ('students', 'classes')
        """)
        fk_info = cursor.fetchall()
        for table, column, ref_table, ref_column in fk_info:
            print(f"  {table}.{column} -> {ref_table}.{ref_column}")
        
        # Sample data from classes
        print("\n📊 SAMPLE CLASSES DATA:")
        cursor.execute("SELECT * FROM classes LIMIT 5")
        classes_data = cursor.fetchall()
        cursor.execute("SHOW COLUMNS FROM classes")
        classes_cols = [col[0] for col in cursor.fetchall()]
        print(f"  Columns: {', '.join(classes_cols)}")
        for row in classes_data:
            print(f"  {row}")
        
        # Sample data from students
        print("\n📊 SAMPLE STUDENTS DATA:")
        cursor.execute("SELECT student_id, class_id, tingkat, kelas FROM students LIMIT 5")
        students_data = cursor.fetchall()
        print("  student_id, class_id, tingkat, kelas")
        for row in students_data:
            print(f"  {row}")
            
    except Error as e:
        print(f"❌ Database error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    analyze_database()
