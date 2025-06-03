#!/usr/bin/env python3
"""
Test if students are being created with proper class_id references
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

def check_student_class_references():
    """Check if students have proper class_id references"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("🔍 CHECKING STUDENT-CLASS REFERENCES")
        print("="*50)
        
        # Get count of students with class_id references
        cursor.execute("""
            SELECT 
                COUNT(*) as total_students,
                SUM(CASE WHEN class_id IS NOT NULL THEN 1 ELSE 0 END) as with_class_id,
                SUM(CASE WHEN class_id IS NULL THEN 1 ELSE 0 END) as without_class_id
            FROM students
            WHERE is_active = 1
        """)
        counts = cursor.fetchone()
        total, with_class_id, without_class_id = counts
        
        print(f"\n📊 STUDENT REFERENCE STATS:")
        print(f"  Total active students: {total}")
        print(f"  With class_id: {with_class_id} ({with_class_id/total*100 if total > 0 else 0:.1f}%)")
        print(f"  Without class_id: {without_class_id} ({without_class_id/total*100 if total > 0 else 0:.1f}%)")
        
        # Check if class_id references are valid
        cursor.execute("""
            SELECT s.student_id, s.class_id, s.tingkat, s.kelas, 
                   c.class_id IS NOT NULL as valid_reference,
                   c.name as class_name,
                   c.grade_level
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE s.class_id IS NOT NULL AND s.is_active = 1
            LIMIT 10
        """)
        references = cursor.fetchall()
        
        print("\n🔗 SAMPLE CLASS REFERENCES:")
        print("  STUDENT_ID | CLASS_ID | TINGKAT | KELAS | VALID | CLASS_NAME | GRADE_LEVEL")
        for ref in references:
            student_id, class_id, tingkat, kelas, valid, class_name, grade_level = ref
            print(f"  {student_id:<10} | {class_id:<8} | {tingkat:<7} | {kelas:<5} | {'✅' if valid else '❌'} | {class_name or 'N/A':<10} | {grade_level or 'N/A'}")
        
        # Check for inconsistencies between tingkat/kelas and class reference
        cursor.execute("""
            SELECT s.student_id, s.class_id, s.tingkat, s.kelas,
                   c.name as class_name, c.grade_level
            FROM students s
            JOIN classes c ON s.class_id = c.class_id
            WHERE s.is_active = 1
              AND (
                  (s.tingkat = 'X' AND c.grade_level != '10' AND c.grade_level != 'X') OR
                  (s.tingkat = 'XI' AND c.grade_level != '11' AND c.grade_level != 'XI') OR
                  (s.tingkat = 'XII' AND c.grade_level != '12' AND c.grade_level != 'XII') OR
                  (s.tingkat = '10' AND c.grade_level != '10' AND c.grade_level != 'X') OR
                  (s.tingkat = '11' AND c.grade_level != '11' AND c.grade_level != 'XI') OR
                  (s.tingkat = '12' AND c.grade_level != '12' AND c.grade_level != 'XII')
              )
            LIMIT 10
        """)
        inconsistencies = cursor.fetchall()
        
        if inconsistencies:
            print("\n⚠️ TINGKAT/CLASS INCONSISTENCIES:")
            print("  STUDENT_ID | CLASS_ID | STUDENT_TINGKAT | STUDENT_KELAS | CLASS_NAME | CLASS_GRADE")
            for inc in inconsistencies:
                student_id, class_id, tingkat, kelas, class_name, grade_level = inc
                print(f"  {student_id:<10} | {class_id:<8} | {tingkat:<14} | {kelas:<13} | {class_name:<10} | {grade_level}")
        else:
            print("\n✅ No tingkat/class inconsistencies found")
            
    except Error as e:
        print(f"❌ Database error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    check_student_class_references()
