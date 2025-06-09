#!/usr/bin/env python3
"""
Debug Assessment Creation Issue
Comprehensive debugging script to identify why mental health assessments are not being saved
"""

import sqlite3
import json
from datetime import datetime

def check_database_state():
    """Check the current state of the database"""
    print("🔍 DEBUGGING ASSESSMENT CREATION ISSUE")
    print("=" * 60)
    
    try:
        # Connect to database
        conn = sqlite3.connect('counselorhub.sql')
        cursor = conn.cursor()
        
        # 1. Check if students table exists and has data
        print("\n1. CHECKING STUDENTS TABLE:")
        cursor.execute("SELECT COUNT(*) FROM students")
        student_count = cursor.fetchone()[0]
        print(f"   Total students: {student_count}")
        
        if student_count > 0:
            cursor.execute("SELECT student_id, name, user_id FROM students LIMIT 5")
            students = cursor.fetchall()
            print("   Sample students:")
            for student in students:
                print(f"   - ID: {student[0]}, Name: {student[1]}, User ID: {student[2]}")
        
        # 2. Check users table
        print("\n2. CHECKING USERS TABLE:")
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'student'")
        user_count = cursor.fetchone()[0]
        print(f"   Total student users: {user_count}")
        
        if user_count > 0:
            cursor.execute("SELECT user_id, name, email FROM users WHERE role = 'student' LIMIT 5")
            users = cursor.fetchall()
            print("   Sample student users:")
            for user in users:
                print(f"   - User ID: {user[0]}, Name: {user[1]}, Email: {user[2]}")
        
        # 3. Check mental_health_assessments table
        print("\n3. CHECKING MENTAL HEALTH ASSESSMENTS TABLE:")
        cursor.execute("SELECT COUNT(*) FROM mental_health_assessments")
        assessment_count = cursor.fetchone()[0]
        print(f"   Total assessments: {assessment_count}")
        
        if assessment_count > 0:
            cursor.execute("""
                SELECT id, student_id, type, score, date, risk 
                FROM mental_health_assessments 
                ORDER BY date DESC 
                LIMIT 5
            """)
            assessments = cursor.fetchall()
            print("   Recent assessments:")
            for assessment in assessments:
                print(f"   - ID: {assessment[0]}, Student: {assessment[1]}, Type: {assessment[2]}, Score: {assessment[3]}")
        
        # 4. Check foreign key constraints
        print("\n4. CHECKING FOREIGN KEY CONSTRAINTS:")
        cursor.execute("PRAGMA foreign_key_list(mental_health_assessments)")
        fk_constraints = cursor.fetchall()
        print("   Foreign key constraints:")
        for fk in fk_constraints:
            print(f"   - Column: {fk[3]} references {fk[2]}({fk[4]})")
        
        # 5. Test user-to-student resolution
        print("\n5. TESTING USER-TO-STUDENT RESOLUTION:")
        cursor.execute("""
            SELECT u.user_id, u.name as user_name, s.student_id, s.name as student_name
            FROM users u
            LEFT JOIN students s ON u.user_id = s.user_id
            WHERE u.role = 'student'
            LIMIT 5
        """)
        mappings = cursor.fetchall()
        print("   User-to-Student mappings:")
        for mapping in mappings:
            if mapping[2]:  # Has student record
                print(f"   ✅ User {mapping[0]} ({mapping[1]}) -> Student {mapping[2]} ({mapping[3]})")
            else:
                print(f"   ❌ User {mapping[0]} ({mapping[1]}) -> NO STUDENT RECORD")
        
        # 6. Check for any orphaned records
        print("\n6. CHECKING FOR ORPHANED RECORDS:")
        cursor.execute("""
            SELECT student_id FROM mental_health_assessments 
            WHERE student_id NOT IN (SELECT student_id FROM students)
        """)
        orphaned = cursor.fetchall()
        if orphaned:
            print(f"   ❌ Found {len(orphaned)} orphaned assessment records:")
            for record in orphaned:
                print(f"   - Student ID: {record[0]} (not found in students table)")
        else:
            print("   ✅ No orphaned assessment records found")
        
        # 7. Test a sample insert
        print("\n7. TESTING SAMPLE ASSESSMENT INSERT:")
        try:
            # Get first student
            cursor.execute("SELECT student_id FROM students LIMIT 1")
            first_student = cursor.fetchone()
            
            if first_student:
                test_student_id = first_student[0]
                test_data = {
                    'student_id': test_student_id,
                    'type': 'TEST_DASS21',
                    'score': 42,
                    'risk': 'moderate',
                    'date': datetime.now().isoformat(),
                    'category': 'self-assessment',
                    'assessor': 'debug-test',
                    'notes': 'Debug test assessment',
                    'responses': json.dumps({'1': 2, '2': 1, '3': 3}),
                    'ml_insights': json.dumps({
                        'severity': 'moderate',
                        'confidence_score': 0.85,
                        'recommended_actions': ['Consider counseling']
                    })
                }
                
                cursor.execute("""
                    INSERT INTO mental_health_assessments 
                    (student_id, type, score, risk, date, category, assessor, notes, responses, ml_insights)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    test_data['student_id'], test_data['type'], test_data['score'], 
                    test_data['risk'], test_data['date'], test_data['category'],
                    test_data['assessor'], test_data['notes'], test_data['responses'],
                    test_data['ml_insights']
                ))
                
                conn.commit()
                print(f"   ✅ Successfully inserted test assessment for student {test_student_id}")
                
                # Verify the insert
                cursor.execute("SELECT COUNT(*) FROM mental_health_assessments WHERE type = 'TEST_DASS21'")
                test_count = cursor.fetchone()[0]
                print(f"   ✅ Verified: {test_count} test assessment(s) in database")
                
                # Clean up test data
                cursor.execute("DELETE FROM mental_health_assessments WHERE type = 'TEST_DASS21'")
                conn.commit()
                print("   ✅ Cleaned up test data")
                
            else:
                print("   ❌ No students found to test with")
                
        except Exception as e:
            print(f"   ❌ Test insert failed: {e}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Database error: {e}")

def check_api_endpoints():
    """Check if API endpoints are responding"""
    print("\n" + "=" * 60)
    print("🌐 CHECKING API ENDPOINTS")
    
    import requests
    
    base_url = "http://localhost:5000/api"
    
    endpoints_to_test = [
        "/students",
        "/students/by-user/1",  # Test user resolution
        "/mental-health/assessments"
    ]
    
    for endpoint in endpoints_to_test:
        try:
            url = base_url + endpoint
            print(f"\n   Testing: {url}")
            response = requests.get(url, timeout=5)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    print(f"   Response: List with {len(data)} items")
                elif isinstance(data, dict):
                    print(f"   Response: Object with keys: {list(data.keys())}")
                else:
                    print(f"   Response: {type(data)}")
            else:
                print(f"   Error: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print(f"   ❌ Connection failed - backend might not be running")
        except Exception as e:
            print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    check_database_state()
    check_api_endpoints()
    
    print("\n" + "=" * 60)
    print("🎯 SUMMARY & RECOMMENDATIONS:")
    print("1. Check if backend is running on port 5000")
    print("2. Verify user is logged in before creating assessment")
    print("3. Check browser console for JavaScript errors")
    print("4. Verify student record exists for logged-in user")
    print("5. Check network tab for failed API calls")
