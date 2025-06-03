#!/usr/bin/env python3
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

def check_students_table_structure():
    """Check the structure of the students table"""
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        # Get table structure
        cursor.execute("DESCRIBE students")
        columns = cursor.fetchall()
        
        print("Students table structure:")
        print("-" * 50)
        for col in columns:
            print(f"{col['Field']:<20} {col['Type']:<20} {col['Null']:<5} {col['Default']}")
        
        # Check if is_active column exists
        has_is_active = any(col['Field'] == 'is_active' for col in columns)
        print(f"\nhas is_active column: {has_is_active}")
        
        # Try to find the student TST999
        cursor.execute("SELECT * FROM students WHERE student_id = 'TST999' OR id = 'TST999'")
        student = cursor.fetchone()
        
        if student:
            print(f"\nFound student TST999:")
            for key, value in student.items():
                print(f"  {key}: {value}")
        else:
            print("\nStudent TST999 not found")
            
        # Show all students to see the current data
        cursor.execute("SELECT id, student_id, name FROM students LIMIT 5")
        students = cursor.fetchall()
        print(f"\nFirst 5 students:")
        for student in students:
            print(f"  id: {student['id']}, student_id: {student['student_id']}, name: {student['name']}")
        
    except Error as e:
        print(f"Database error: {e}")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    check_students_table_structure()
