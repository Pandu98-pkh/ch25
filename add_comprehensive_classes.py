#!/usr/bin/env python3
"""
Add more classes to ensure comprehensive testing coverage
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

def add_comprehensive_classes():
    """Add comprehensive set of classes for all grade levels"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        # Define comprehensive class data
        classes_to_add = [
            # Grade X (10)
            {'class_id': 'C2025-X-IPA1', 'name': 'IPA-1', 'grade_level': 'X', 'academic_year': '2024/2025', 'teacher_name': 'Guru Fisika'},
            {'class_id': 'C2025-X-IPA2', 'name': 'IPA-2', 'grade_level': 'X', 'academic_year': '2024/2025', 'teacher_name': 'Guru Kimia'},
            {'class_id': 'C2025-X-IPS1', 'name': 'IPS-1', 'grade_level': 'X', 'academic_year': '2024/2025', 'teacher_name': 'Guru Sejarah'},
            {'class_id': 'C2025-X-IPS2', 'name': 'IPS-2', 'grade_level': 'X', 'academic_year': '2024/2025', 'teacher_name': 'Guru Geografi'},
            
            # Grade XI (11) - Additional classes
            {'class_id': 'C2025-XI-IPA2', 'name': 'IPA-2', 'grade_level': 'XI', 'academic_year': '2024/2025', 'teacher_name': 'Guru Biologi'},
            {'class_id': 'C2025-XI-IPA3', 'name': 'IPA-3', 'grade_level': 'XI', 'academic_year': '2024/2025', 'teacher_name': 'Guru Matematika'},
            {'class_id': 'C2025-XI-IPS3', 'name': 'IPS-3', 'grade_level': 'XI', 'academic_year': '2024/2025', 'teacher_name': 'Guru Ekonomi'},
            
            # Grade XII (12) - Additional classes  
            {'class_id': 'C2025-XII-IPA2', 'name': 'IPA-2', 'grade_level': 'XII', 'academic_year': '2024/2025', 'teacher_name': 'Guru Fisika Senior'},
            {'class_id': 'C2025-XII-IPA3', 'name': 'IPA-3', 'grade_level': 'XII', 'academic_year': '2024/2025', 'teacher_name': 'Guru Kimia Senior'},
            {'class_id': 'C2025-XII-IPS1', 'name': 'IPS-1', 'grade_level': 'XII', 'academic_year': '2024/2025', 'teacher_name': 'Guru Sosiologi'},
            {'class_id': 'C2025-XII-IPS2', 'name': 'IPS-2', 'grade_level': 'XII', 'academic_year': '2024/2025', 'teacher_name': 'Guru Antropologi'},
        ]
        
        print(f"🔧 Adding {len(classes_to_add)} comprehensive classes...")
        
        added_count = 0
        for class_data in classes_to_add:
            try:
                # Check if class already exists
                cursor.execute("SELECT class_id FROM classes WHERE class_id = %s", (class_data['class_id'],))
                if cursor.fetchone():
                    print(f"⚠️ Class {class_data['class_id']} already exists, skipping...")
                    continue
                
                # Insert new class
                cursor.execute("""
                    INSERT INTO classes (class_id, name, grade_level, academic_year, teacher_name, student_count, is_active)
                    VALUES (%s, %s, %s, %s, %s, 0, TRUE)
                """, (
                    class_data['class_id'],
                    class_data['name'], 
                    class_data['grade_level'],
                    class_data['academic_year'],
                    class_data['teacher_name']
                ))
                
                print(f"✅ Added class: {class_data['class_id']} - {class_data['grade_level']} {class_data['name']}")
                added_count += 1
                
            except Error as e:
                print(f"❌ Error adding class {class_data['class_id']}: {e}")
        
        connection.commit()
        print(f"\n🎉 Successfully added {added_count} new classes!")
        
        # Show current classes summary
        cursor.execute("""
            SELECT grade_level, COUNT(*) as count 
            FROM classes 
            WHERE is_active = TRUE 
            GROUP BY grade_level 
            ORDER BY grade_level
        """)
        summary = cursor.fetchall()
        
        print("\n📊 Current classes summary:")
        for row in summary:
            print(f"  - Grade {row['grade_level']}: {row['count']} classes")
        
        connection.close()
        
    except Error as e:
        print(f"❌ Database error: {e}")

if __name__ == "__main__":
    add_comprehensive_classes()
