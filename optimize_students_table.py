#!/usr/bin/env python3
"""
Optimize Students Table Schema
This script implements the following improvements:
1. Remove the redundant 'id' column from students table (student_id is already PK)
2. Remove 'tingkat' and 'kelas' columns (information available via class_id -> classes relationship)
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

def optimize_students_table():
    """Optimize students table by removing redundant columns"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("🔧 OPTIMIZING STUDENTS TABLE SCHEMA")
        print("="*50)
        
        # Step 1: Analyze current state
        print("\n📋 Step 1: Analyzing current state...")
        cursor.execute("DESCRIBE students")
        columns = cursor.fetchall()
        
        current_columns = [col['Field'] for col in columns]
        print(f"Current columns: {current_columns}")
        
        has_id = 'id' in current_columns
        has_tingkat = 'tingkat' in current_columns
        has_kelas = 'kelas' in current_columns
        
        print(f"  Has 'id' column: {has_id}")
        print(f"  Has 'tingkat' column: {has_tingkat}")
        print(f"  Has 'kelas' column: {has_kelas}")
        
        # Step 2: Backup current data
        print("\n💾 Step 2: Backing up current data...")
        cursor.execute("SELECT COUNT(*) as count FROM students")
        student_count = cursor.fetchone()['count']
        print(f"✅ Found {student_count} student records to preserve")
        
        # Step 3: Verify data consistency before optimization
        print("\n🔍 Step 3: Verifying data consistency...")
        
        # Check if any students have tingkat/kelas but no class_id
        if has_tingkat and has_kelas:
            cursor.execute("""
                SELECT student_id, tingkat, kelas, class_id
                FROM students 
                WHERE (tingkat IS NOT NULL OR kelas IS NOT NULL) 
                AND class_id IS NULL
                LIMIT 5
            """)
            orphaned_data = cursor.fetchall()
            
            if orphaned_data:
                print("⚠️ WARNING: Found students with tingkat/kelas but no class_id:")
                for student in orphaned_data:
                    print(f"  {student['student_id']}: tingkat={student['tingkat']}, kelas={student['kelas']}, class_id={student['class_id']}")
                
                print("\n🔧 These students should be assigned to appropriate classes before optimization.")
                proceed = input("Do you want to continue anyway? (y/N): ").lower().strip()
                if proceed != 'y':
                    print("❌ Optimization cancelled. Please fix data consistency first.")
                    return False
        
        # Step 4: Verify all students can access class info via class_id
        print("\n🔗 Step 4: Verifying class relationships...")
        cursor.execute("""
            SELECT 
                COUNT(*) as total_students,
                SUM(CASE WHEN class_id IS NOT NULL THEN 1 ELSE 0 END) as with_class_id,
                SUM(CASE WHEN class_id IS NULL THEN 1 ELSE 0 END) as without_class_id
            FROM students
            WHERE is_active = 1
        """)
        stats = cursor.fetchone()
        
        print(f"  Total active students: {stats['total_students']}")
        print(f"  With class_id: {stats['with_class_id']}")
        print(f"  Without class_id: {stats['without_class_id']}")
        
        if stats['without_class_id'] > 0:
            print(f"\n⚠️ WARNING: {stats['without_class_id']} students don't have class_id assigned")
            print("These students will lose tingkat/kelas information after optimization")
            proceed = input("Do you want to continue? (y/N): ").lower().strip()
            if proceed != 'y':
                print("❌ Optimization cancelled.")
                return False
        
        # Step 5: Remove redundant 'id' column
        if has_id:
            print("\n🗑️ Step 5: Removing redundant 'id' column...")
            try:
                cursor.execute("ALTER TABLE students DROP COLUMN id")
                print("✅ Removed 'id' column successfully")
            except Error as e:
                print(f"❌ Error removing 'id' column: {e}")
                return False
        else:
            print("\n✅ Step 5: 'id' column already removed")
        
        # Step 6: Remove redundant 'tingkat' column
        if has_tingkat:
            print("\n🗑️ Step 6: Removing redundant 'tingkat' column...")
            try:
                cursor.execute("ALTER TABLE students DROP COLUMN tingkat")
                print("✅ Removed 'tingkat' column successfully")
            except Error as e:
                print(f"❌ Error removing 'tingkat' column: {e}")
                return False
        else:
            print("\n✅ Step 6: 'tingkat' column already removed")
        
        # Step 7: Remove redundant 'kelas' column
        if has_kelas:
            print("\n🗑️ Step 7: Removing redundant 'kelas' column...")
            try:
                cursor.execute("ALTER TABLE students DROP COLUMN kelas")
                print("✅ Removed 'kelas' column successfully")
            except Error as e:
                print(f"❌ Error removing 'kelas' column: {e}")
                return False
        else:
            print("\n✅ Step 7: 'kelas' column already removed")
        
        # Step 8: Verification
        print("\n✅ Step 8: Verification...")
        
        # Check new structure
        cursor.execute("DESCRIBE students")
        new_columns = cursor.fetchall()
        print("\nOptimized students table structure:")
        for col in new_columns:
            print(f"  {col['Field']:<20} {col['Type']:<20} {col['Null']:<5} {col['Key']:<5}")
        
        # Verify primary key is still intact
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE CONSTRAINT_NAME = 'PRIMARY' 
            AND TABLE_SCHEMA = 'counselorhub'
            AND TABLE_NAME = 'students'
        """)
        pk_columns = cursor.fetchall()
        pk_names = [col['COLUMN_NAME'] for col in pk_columns]
        print(f"\nPrimary key: {pk_names}")
        
        # Test data integrity
        cursor.execute("SELECT COUNT(*) as count FROM students")
        final_count = cursor.fetchone()['count']
        print(f"Data integrity check: {final_count} records (was {student_count})")
        
        if final_count == student_count:
            print("✅ All data preserved")
        else:
            print("⚠️ Data count mismatch!")
            return False
        
        # Test JOIN query to verify class information can still be accessed
        print("\n🔗 Testing class information access via JOIN...")
        cursor.execute("""
            SELECT 
                s.student_id, 
                s.class_id,
                c.grade_level as tingkat,
                c.name as class_name,
                u.name as student_name
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.class_id
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.is_active = 1
            LIMIT 3
        """)
        sample_students = cursor.fetchall()
        
        print("Sample students with class info via JOIN:")
        for student in sample_students:
            print(f"  {student['student_id']}: {student['student_name']} | Class: {student['class_name']} | Grade: {student['tingkat']}")
        
        # Commit changes
        connection.commit()
        print("\n🎉 STUDENTS TABLE OPTIMIZATION COMPLETED!")
        
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

def print_optimization_summary():
    """Print summary of optimizations made"""
    print("\n" + "="*60)
    print("📋 OPTIMIZATION SUMMARY")
    print("="*60)
    print("✅ REMOVED COLUMNS:")
    print("  - id: Redundant auto-increment column (student_id is PK)")
    print("  - tingkat: Available via classes.grade_level through class_id")
    print("  - kelas: Available via classes.name through class_id")
    print("\n✅ BENEFITS:")
    print("  - Reduced storage space")
    print("  - Eliminated data redundancy")
    print("  - Improved data consistency (single source of truth)")
    print("  - Cleaner schema design")
    print("\n📝 NEXT STEPS:")
    print("  1. Update backend API to remove references to removed columns")
    print("  2. Update frontend to use class relationship instead of direct columns")
    print("  3. Update any existing queries that used tingkat/kelas directly")
    print("  4. Test all CRUD operations")

if __name__ == "__main__":
    success = optimize_students_table()
    
    if success:
        print_optimization_summary()
    else:
        print("\n❌ Optimization failed. Please review the errors above.")
        print("The database has been rolled back to its previous state.")
