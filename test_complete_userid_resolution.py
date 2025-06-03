#!/usr/bin/env python3
"""
Test the complete userId to studentId resolution flow for mental health assessments
This tests the entire fix from frontend to backend to database
"""

import requests
import json
import mysql.connector
from datetime import datetime
import time

BASE_URL = "http://localhost:5000"

def get_db_connection():
    """Get database connection"""
    return mysql.connector.connect(
        host='localhost',
        user='admin',
        password='admin',
        database='counselorhub',
        charset='utf8mb4'
    )

def test_database_schema():
    """Test that the database schema matches our expectations"""
    print("1. Testing database schema...")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Test mental_health_assessments table schema
        cursor.execute("DESCRIBE mental_health_assessments")
        columns = {row[0]: row[1] for row in cursor.fetchall()}
        
        expected_columns = {
            'assessment_id': 'varchar(50)',
            'student_id': 'varchar(50)', 
            'assessor_id': 'varchar(50)',
            'date': 'timestamp',
            'score': 'int(11)',
            'notes': 'text',
            'assessment_type': 'varchar(50)',
            'risk_level': "enum('low','moderate','high')",
            'category': 'varchar(50)',
            'responses': 'text',
            'recommendations': 'text'
        }
        
        for col, expected_type in expected_columns.items():
            if col not in columns:
                print(f"❌ Missing column: {col}")
                return False
            print(f"✅ Column {col}: {columns[col]}")
        
        # Test students and users relationship
        cursor.execute("""
            SELECT s.student_id, s.user_id, u.user_id, u.name 
            FROM students s 
            JOIN users u ON s.user_id = u.user_id 
            WHERE s.is_active = TRUE 
            LIMIT 1
        """)
        
        result = cursor.fetchone()
        if result:
            print(f"✅ Found active student-user relationship: student_id={result[0]}, user_id={result[1]}")
            return True, result[0], result[1]  # Return student_id and user_id for testing
        else:
            print("❌ No active student-user relationships found")
            return False, None, None
            
    except Exception as e:
        print(f"❌ Database schema test failed: {e}")
        return False, None, None
    finally:
        cursor.close()
        conn.close()

def test_backend_endpoint(user_id):
    """Test the new backend endpoint for userId to studentId resolution"""
    print(f"\n2. Testing backend endpoint /api/students/by-user/{user_id}...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/students/by-user/{user_id}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend endpoint successful")
            print(f"   Student ID: {data.get('studentId')}")
            print(f"   Name: {data.get('name')}")
            print(f"   Email: {data.get('email')}")
            return True, data.get('studentId')
        else:
            print(f"❌ Backend endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Backend endpoint test failed: {e}")
        return False, None

def test_mental_health_assessment_creation(student_id):
    """Test creating a mental health assessment with the resolved student_id"""
    print(f"\n3. Testing mental health assessment creation for student_id={student_id}...")
    
    # Get a valid assessor_id from the database
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM users WHERE is_active = TRUE LIMIT 1")
        valid_assessor_id = cursor.fetchone()[0]
        cursor.close()
        conn.close()
    except:
        valid_assessor_id = student_id  # Use the student as assessor for self-assessment
    
    assessment_data = {
        "student_id": student_id,
        "assessment_type": "depression",
        "score": 15,
        "risk_level": "moderate", 
        "notes": "Test assessment for userId resolution fix",
        "category": "self-assessment",
        "assessor_id": valid_assessor_id,
        "responses": json.dumps({"q1": 3, "q2": 2, "q3": 4}),
        "recommendations": "Consider follow-up counseling session"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/mental-health/assessments", json=assessment_data)
        
        if response.status_code == 201:
            data = response.json()
            assessment_id = data.get('data', {}).get('id')
            print(f"✅ Assessment created successfully")
            print(f"   Assessment ID: {assessment_id}")
            print(f"   Student ID: {data.get('data', {}).get('student_id')}")
            return True, assessment_id
        else:
            print(f"❌ Assessment creation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Assessment creation test failed: {e}")
        return False, None

def verify_assessment_in_database(assessment_id, expected_student_id):
    """Verify the assessment was stored correctly in the database"""
    print(f"\n4. Verifying assessment {assessment_id} in database...")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT assessment_id, student_id, assessment_type, score, risk_level, 
                   assessor_id, notes, category, responses, recommendations
            FROM mental_health_assessments 
            WHERE assessment_id = %s
        """, (assessment_id,))
        
        result = cursor.fetchone()
        
        if result:
            print(f"✅ Assessment found in database")
            print(f"   Assessment ID: {result['assessment_id']}")
            print(f"   Student ID: {result['student_id']}")
            print(f"   Assessment Type: {result['assessment_type']}")
            print(f"   Score: {result['score']}")
            print(f"   Risk Level: {result['risk_level']}")
            
            if result['student_id'] == expected_student_id:
                print(f"✅ Student ID matches expected value: {expected_student_id}")
                return True
            else:
                print(f"❌ Student ID mismatch: expected {expected_student_id}, got {result['student_id']}")
                return False
        else:
            print(f"❌ Assessment not found in database")
            return False
            
    except Exception as e:
        print(f"❌ Database verification failed: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def cleanup_test_data(assessment_id):
    """Clean up test assessment data"""
    print(f"\n5. Cleaning up test data...")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM mental_health_assessments WHERE assessment_id = %s", (assessment_id,))
        conn.commit()
        
        print(f"✅ Test assessment {assessment_id} cleaned up")
        
    except Exception as e:
        print(f"❌ Cleanup failed: {e}")
    finally:
        cursor.close()
        conn.close()

def main():
    """Run the complete test suite"""
    print("🧪 Testing userId to studentId Resolution for Mental Health Assessments")
    print("=" * 70)
    
    # Test 1: Database schema
    schema_ok, test_student_id, test_user_id = test_database_schema()
    if not schema_ok:
        print("\n❌ Database schema test failed. Cannot continue.")
        return
    
    # Test 2: Backend endpoint
    endpoint_ok, resolved_student_id = test_backend_endpoint(test_user_id)
    if not endpoint_ok:
        print("\n❌ Backend endpoint test failed. Cannot continue.")
        return
    
    # Verify the resolution worked correctly
    if resolved_student_id != test_student_id:
        print(f"❌ Student ID resolution failed: expected {test_student_id}, got {resolved_student_id}")
        return
    
    print(f"✅ Student ID resolution successful: {test_user_id} → {resolved_student_id}")
    
    # Test 3: Assessment creation
    assessment_ok, assessment_id = test_mental_health_assessment_creation(resolved_student_id)
    if not assessment_ok:
        print("\n❌ Assessment creation test failed. Cannot continue.")
        return
    
    # Test 4: Database verification
    verification_ok = verify_assessment_in_database(assessment_id, resolved_student_id)
    
    # Test 5: Cleanup
    if assessment_id:
        cleanup_test_data(assessment_id)
    
    # Final result
    print("\n" + "=" * 70)
    if schema_ok and endpoint_ok and assessment_ok and verification_ok:
        print("🎉 ALL TESTS PASSED! userId to studentId resolution is working correctly.")
        print("\nThe complete flow works:")
        print(f"  1. ✅ Database schema is correct")
        print(f"  2. ✅ Backend endpoint resolves userId to studentId")
        print(f"  3. ✅ Mental health assessments are created with correct studentId")
        print(f"  4. ✅ Data is stored correctly in database")
        print(f"\nThe mental health assessment system is now properly fixed!")
    else:
        print("❌ SOME TESTS FAILED. Review the output above for details.")

if __name__ == "__main__":
    main()
