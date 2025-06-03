#!/usr/bin/env python3
"""
Final Mental Health Database Connection Verification
Tests with valid existing data to confirm full functionality
"""

import sqlite3
import json
from datetime import datetime

def test_mental_health_with_valid_data():
    """Test mental health assessments with valid existing student data"""
    try:
        # Connect to database
        conn = sqlite3.connect('backend/counselorhub.db')
        cursor = conn.cursor()
        
        print("🔍 FINAL MENTAL HEALTH VERIFICATION")
        print("=" * 50)
        
        # 1. Check existing students
        print("1️⃣  Checking existing students...")
        cursor.execute("SELECT student_id, username FROM students LIMIT 5")
        students = cursor.fetchall()
        
        if not students:
            print("⚠️  No students found in database - checking if we need sample data")
            # Create a sample student for testing
            cursor.execute("""
                INSERT INTO students (student_id, username, email, password_hash, full_name)
                VALUES ('TEST001', 'test_student', 'test@example.com', 'hash123', 'Test Student')
            """)
            conn.commit()
            students = [('TEST001', 'test_student')]
            print("✅ Created test student for verification")
        
        valid_student_id = students[0][0]
        print(f"✅ Using student ID: {valid_student_id}")
        
        # 2. Test INSERT with valid student ID
        print("\n2️⃣  Testing INSERT with valid data...")
        test_assessment = {
            'assessment_id': f'TEST_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
            'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'score': 12,
            'notes': 'Test assessment for verification',
            'assessment_type': 'PHQ-9',
            'risk_level': 'moderate',
            'category': 'Depression',
            'responses': json.dumps([2, 1, 3, 2, 1, 2, 3, 1, 2]),
            'recommendations': 'Follow up in 2 weeks',
            'student_id': valid_student_id,
            'assessor_id': 'COUNSELOR001'
        }
        
        cursor.execute("""
            INSERT INTO mental_health_assessments 
            (assessment_id, date, score, notes, assessment_type, risk_level, 
             category, responses, recommendations, student_id, assessor_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            test_assessment['assessment_id'],
            test_assessment['date'],
            test_assessment['score'],
            test_assessment['notes'],
            test_assessment['assessment_type'],
            test_assessment['risk_level'],
            test_assessment['category'],
            test_assessment['responses'],
            test_assessment['recommendations'],
            test_assessment['student_id'],
            test_assessment['assessor_id']
        ))
        conn.commit()
        print("✅ INSERT successful")
        
        # 3. Test READ
        print("\n3️⃣  Testing READ...")
        cursor.execute("""
            SELECT * FROM mental_health_assessments 
            WHERE assessment_id = ?
        """, (test_assessment['assessment_id'],))
        
        result = cursor.fetchone()
        if result:
            print("✅ READ successful - Assessment found")
        else:
            print("❌ READ failed - Assessment not found")
            return False
        
        # 4. Test UPDATE
        print("\n4️⃣  Testing UPDATE...")
        cursor.execute("""
            UPDATE mental_health_assessments 
            SET score = ?, notes = ?
            WHERE assessment_id = ?
        """, (15, 'Updated test notes', test_assessment['assessment_id']))
        conn.commit()
        
        # Verify update
        cursor.execute("""
            SELECT score, notes FROM mental_health_assessments 
            WHERE assessment_id = ?
        """, (test_assessment['assessment_id'],))
        
        updated_result = cursor.fetchone()
        if updated_result and updated_result[0] == 15:
            print("✅ UPDATE successful")
        else:
            print("❌ UPDATE failed")
            return False
        
        # 5. Test filtering by student
        print("\n5️⃣  Testing student-specific queries...")
        cursor.execute("""
            SELECT COUNT(*) FROM mental_health_assessments 
            WHERE student_id = ?
        """, (valid_student_id,))
        
        student_count = cursor.fetchone()[0]
        print(f"✅ Student has {student_count} assessment(s)")
        
        # 6. Test assessment type filtering
        print("\n6️⃣  Testing assessment type filtering...")
        cursor.execute("""
            SELECT assessment_type, COUNT(*) as count
            FROM mental_health_assessments 
            GROUP BY assessment_type
        """)
        
        type_counts = cursor.fetchall()
        print("📊 Assessment types in database:")
        for assessment_type, count in type_counts:
            print(f"   - {assessment_type}: {count}")
        
        # 7. Test DELETE (cleanup)
        print("\n7️⃣  Testing DELETE (cleanup)...")
        cursor.execute("""
            DELETE FROM mental_health_assessments 
            WHERE assessment_id = ?
        """, (test_assessment['assessment_id'],))
        conn.commit()
        
        # Verify deletion
        cursor.execute("""
            SELECT COUNT(*) FROM mental_health_assessments 
            WHERE assessment_id = ?
        """, (test_assessment['assessment_id'],))
        
        if cursor.fetchone()[0] == 0:
            print("✅ DELETE successful")
        else:
            print("❌ DELETE failed")
            return False
        
        # 8. Final database state
        print("\n8️⃣  Final database state...")
        cursor.execute("SELECT COUNT(*) FROM mental_health_assessments")
        total_assessments = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM students")
        total_students = cursor.fetchone()[0]
        
        print(f"📊 Total assessments: {total_assessments}")
        print(f"👥 Total students: {total_students}")
        
        conn.close()
        
        print("\n" + "=" * 50)
        print("🎉 FINAL VERIFICATION COMPLETE")
        print("✅ All CRUD operations successful!")
        print("✅ Mental Health system is FULLY FUNCTIONAL")
        print("✅ Database connection is WORKING PERFECTLY")
        print("=" * 50)
        
        return True
        
    except Exception as e:
        print(f"❌ Error during verification: {e}")
        return False

if __name__ == "__main__":
    success = test_mental_health_with_valid_data()
    exit(0 if success else 1)
