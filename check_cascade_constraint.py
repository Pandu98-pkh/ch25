#!/usr/bin/env python3
"""
Check the CASCADE constraint on mental_health_assessments table
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

def check_cascade_constraint():
    """Check the CASCADE constraint status"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("🔍 CHECKING MENTAL HEALTH ASSESSMENTS CONSTRAINTS")
        print("=" * 60)
        
        # Check table structure
        print("\n1. TABLE STRUCTURE:")
        cursor.execute("SHOW CREATE TABLE mental_health_assessments")
        result = cursor.fetchone()
        create_table = result['Create Table']
        print(create_table)
          # Check foreign key constraints specifically
        print("\n2. FOREIGN KEY CONSTRAINTS:")
        cursor.execute("""
            SELECT 
                rc.CONSTRAINT_NAME,
                kcu.COLUMN_NAME,
                rc.REFERENCED_TABLE_NAME,
                kcu.REFERENCED_COLUMN_NAME,
                rc.UPDATE_RULE,
                rc.DELETE_RULE
            FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
                ON rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
                AND rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
            WHERE rc.CONSTRAINT_SCHEMA = 'counselorhub'
            AND kcu.TABLE_NAME = 'mental_health_assessments'
        """)
        
        constraints = cursor.fetchall()
        for constraint in constraints:
            print(f"  Constraint: {constraint['CONSTRAINT_NAME']}")
            print(f"    Column: {constraint['COLUMN_NAME']} -> {constraint['REFERENCED_TABLE_NAME']}.{constraint['REFERENCED_COLUMN_NAME']}")
            print(f"    DELETE Rule: {constraint['DELETE_RULE']}")
            print(f"    UPDATE Rule: {constraint['UPDATE_RULE']}")
            print()
        
        # Check if students table exists and has correct primary key
        print("3. STUDENTS TABLE VERIFICATION:")
        cursor.execute("SHOW CREATE TABLE students")
        students_result = cursor.fetchone()
        students_create = students_result['Create Table']
        print("Students table structure:")
        print(students_create)
        
        # Check for sample data
        print("\n4. SAMPLE DATA VERIFICATION:")
        cursor.execute("SELECT student_id FROM students LIMIT 5")
        students = cursor.fetchall()
        print("Sample student_ids in students table:")
        for student in students:
            print(f"  - {student['student_id']}")
        
        cursor.execute("SELECT assessment_id, student_id FROM mental_health_assessments LIMIT 5")
        assessments = cursor.fetchall()
        print("\nSample assessments:")
        for assessment in assessments:
            print(f"  - {assessment['assessment_id']} -> student_id: {assessment['student_id']}")
        
        # Check for orphaned assessments
        print("\n5. ORPHANED ASSESSMENTS CHECK:")
        cursor.execute("""
            SELECT mha.assessment_id, mha.student_id
            FROM mental_health_assessments mha
            LEFT JOIN students s ON mha.student_id = s.student_id
            WHERE s.student_id IS NULL
        """)
        orphaned = cursor.fetchall()
        
        if orphaned:
            print("⚠️ Found orphaned assessments:")
            for orphan in orphaned:
                print(f"  - Assessment {orphan['assessment_id']} references non-existent student {orphan['student_id']}")
        else:
            print("✅ No orphaned assessments found")
        
        return True
        
    except Error as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    check_cascade_constraint()
