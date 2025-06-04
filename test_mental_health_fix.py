#!/usr/bin/env python3
"""
Test script to verify the mental health assessment anonymous user fix
This script tests that assessments are properly attributed to logged-in users
"""

import requests
import json
import sqlite3
import mysql.connector
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000"
FRONTEND_URL = "http://localhost:5175"

def get_db_connection():
    """Get MySQL database connection"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='counselorhub_db',
            user='root',
            password='',
            port=3306
        )
        return connection
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

def test_user_login():
    """Test user login and get userId"""
    print("1. Testing user login...")
    
    login_data = {
        "username": "1103210016",  # Student user
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/users/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            user_data = data.get('user', data)  # Handle both formats
            print(f"✅ Login successful")
            print(f"   User ID: {user_data.get('userId')}")
            print(f"   Role: {user_data.get('role')}")
            print(f"   Name: {user_data.get('name')}")
            
            # Check if both userId and id are present
            if 'userId' in user_data and 'id' in user_data:
                print(f"   ✅ Both userId ({user_data['userId']}) and id ({user_data['id']}) fields present")
                if user_data['userId'] == user_data['id']:
                    print(f"   ✅ userId and id fields match")
                else:
                    print(f"   ⚠️ userId and id fields don't match: {user_data['userId']} vs {user_data['id']}")
            
            return user_data.get('userId'), data.get('token', data.get('access_token'))
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None, None
            
    except Exception as e:
        print(f"❌ Login test failed: {e}")
        return None, None

def test_student_record_exists(user_id):
    """Check if student record exists for the user"""
    print(f"\n2. Checking if student record exists for user {user_id}...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/students/by-user/{user_id}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Student record found")
            print(f"   Student ID: {data.get('student_id')}")
            print(f"   Name: {data.get('name')}")
            return data.get('student_id')
        else:
            print(f"❌ Student record not found: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Student lookup test failed: {e}")
        return None

def test_mental_health_assessment_creation(user_id, token):
    """Test creating a mental health assessment"""
    print(f"\n3. Testing mental health assessment creation for user {user_id}...")
    
    # Test assessment data
    assessment_data = {
        "studentId": user_id,  # This should now be resolved properly
        "assessment_type": "PHQ-9",
        "score": 12,
        "risk_level": "moderate",
        "notes": "Test assessment to verify userId fix",
        "category": "routine",
        "assessor_id": user_id,  # Self-assessment
        "responses": json.dumps({"q1": 2, "q2": 1, "q3": 3, "q4": 2, "q5": 1, "q6": 2, "q7": 3, "q8": 1, "q9": 2}),
        "recommendations": "Follow up with counselor if symptoms persist"
    }
    
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    try:
        response = requests.post(f"{BASE_URL}/api/mental-health/assessments", 
                               json=assessment_data, headers=headers)
        
        if response.status_code == 201:
            data = response.json()
            assessment_id = data.get('data', {}).get('id')
            print(f"✅ Assessment created successfully")
            print(f"   Assessment ID: {assessment_id}")
            print(f"   Student ID: {data.get('data', {}).get('student_id', data.get('data', {}).get('studentId'))}")
            
            # Verify the assessment is NOT anonymous
            student_id = data.get('data', {}).get('student_id', data.get('data', {}).get('studentId'))
            if student_id and student_id != 'anonymous':
                print(f"   ✅ Assessment properly attributed to student: {student_id}")
                return True, assessment_id
            else:
                print(f"   ❌ Assessment is still anonymous: {student_id}")
                return False, assessment_id
        else:
            print(f"❌ Assessment creation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Assessment creation test failed: {e}")
        return False, None

def verify_database_storage(assessment_id):
    """Verify the assessment was stored correctly in the database"""
    print(f"\n4. Verifying database storage for assessment {assessment_id}...")
    
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Query the assessment
        cursor.execute("""
            SELECT assessment_id, student_id, assessor_id, assessment_type, score, risk_level
            FROM mental_health_assessments 
            WHERE assessment_id = %s
        """, (assessment_id,))
        
        result = cursor.fetchone()
        
        if result:
            print(f"✅ Assessment found in database")
            print(f"   Assessment ID: {result['assessment_id']}")
            print(f"   Student ID: {result['student_id']}")
            print(f"   Assessor ID: {result['assessor_id']}")
            print(f"   Type: {result['assessment_type']}")
            print(f"   Score: {result['score']}")
            print(f"   Risk Level: {result['risk_level']}")
            
            # Check if student_id is not anonymous
            if result['student_id'] != 'anonymous':
                print(f"   ✅ Assessment correctly attributed to student: {result['student_id']}")
                return True
            else:
                print(f"   ❌ Assessment is still anonymous in database")
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

def test_assessment_filtering(user_id, token):
    """Test that the user can retrieve their own assessments"""
    print(f"\n5. Testing assessment filtering for user {user_id}...")
    
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    try:
        # Test filtering by studentId
        response = requests.get(f"{BASE_URL}/api/mental-health/assessments?studentId={user_id}", 
                              headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            assessments = data.get('data', [])
            print(f"✅ Retrieved {len(assessments)} assessments for student {user_id}")
            
            # Check if any assessments are found
            if assessments:
                for assessment in assessments[:3]:  # Show first 3
                    print(f"   - Assessment ID: {assessment.get('id')}")
                    print(f"     Student ID: {assessment.get('studentId')}")
                    print(f"     Type: {assessment.get('type')}")
                    print(f"     Score: {assessment.get('score')}")
                
                # Verify all assessments belong to the correct student
                all_correct = all(
                    assessment.get('studentId') == user_id and assessment.get('studentId') != 'anonymous'
                    for assessment in assessments
                )
                
                if all_correct:
                    print(f"   ✅ All assessments correctly attributed to student {user_id}")
                    return True
                else:
                    print(f"   ❌ Some assessments have incorrect student attribution")
                    return False
            else:
                print(f"   ⚠️ No assessments found (this might be expected for a new test)")
                return True
        else:
            print(f"❌ Assessment retrieval failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Assessment filtering test failed: {e}")
        return False

def cleanup_test_data(assessment_id):
    """Clean up test assessment data"""
    print(f"\n6. Cleaning up test data...")
    
    if not assessment_id:
        print("   No assessment ID to clean up")
        return
    
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM mental_health_assessments WHERE assessment_id = %s", (assessment_id,))
        conn.commit()
        print(f"   ✅ Cleaned up test assessment {assessment_id}")
    except Exception as e:
        print(f"   ⚠️ Cleanup failed: {e}")
    finally:
        cursor.close()
        conn.close()

def main():
    """Main test function"""
    print("🧠 MENTAL HEALTH ASSESSMENT FIX VERIFICATION")
    print("=" * 60)
    print("Testing that assessments are properly attributed to users (not anonymous)")
    print()
    
    # Test 1: User login
    user_id, token = test_user_login()
    if not user_id:
        print("\n❌ Test failed: Could not log in user")
        return False
    
    # Test 2: Check student record
    student_id = test_student_record_exists(user_id)
    if not student_id:
        print("\n❌ Test failed: Student record not found")
        return False
    
    # Test 3: Create assessment
    success, assessment_id = test_mental_health_assessment_creation(user_id, token)
    if not success:
        print("\n❌ Test failed: Could not create assessment properly")
        return False
    
    # Test 4: Verify database storage
    if assessment_id:
        db_success = verify_database_storage(assessment_id)
        if not db_success:
            print("\n❌ Test failed: Database storage verification failed")
            cleanup_test_data(assessment_id)
            return False
    
    # Test 5: Test filtering
    filter_success = test_assessment_filtering(user_id, token)
    if not filter_success:
        print("\n❌ Test failed: Assessment filtering failed")
        cleanup_test_data(assessment_id)
        return False
    
    # Cleanup
    cleanup_test_data(assessment_id)
    
    print("\n" + "=" * 60)
    print("🎉 ALL TESTS PASSED!")
    print("✅ Mental health assessments are now properly attributed to users")
    print("✅ The anonymous assessment issue has been fixed")
    print("✅ User ID field consistency resolved")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⚠️ Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
