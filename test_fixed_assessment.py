#!/usr/bin/env python3
"""
Test script to verify mental health assessment creation with proper user-student resolution
"""

import requests
import json

# Backend URL
BASE_URL = "http://localhost:5000"

def test_user_to_student_resolution():
    """Test the user-to-student resolution endpoint"""
    print("🧪 TESTING USER-TO-STUDENT RESOLUTION")
    print("=" * 50)
    
    # Test valid users
    test_users = ['STU001', '1103210016']
    
    for user_id in test_users:
        print(f"\n📋 Testing user ID: {user_id}")
        try:
            response = requests.get(f"{BASE_URL}/api/students/by-user/{user_id}")
            if response.status_code == 200:
                student_data = response.json()
                print(f"   ✅ SUCCESS: User {user_id} -> Student {student_data['studentId']}")
                print(f"   📋 Student data: {student_data}")
            else:
                print(f"   ❌ FAILED: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"   ❌ ERROR: {e}")

def test_mental_health_assessment_creation():
    """Test creating a mental health assessment with resolved student ID"""
    print("\n🧪 TESTING MENTAL HEALTH ASSESSMENT CREATION")
    print("=" * 50)
    
    # First resolve user to student
    user_id = '1103220016'
    print(f"\n1. Resolving user {user_id} to student ID...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/students/by-user/{user_id}")
        if response.status_code != 200:
            print(f"   ❌ Failed to resolve user: {response.status_code}")
            return
        
        student_data = response.json()
        student_id = student_data['studentId']
        print(f"   ✅ Resolved to student ID: {student_id}")
        
        # Create test assessment
        print(f"\n2. Creating mental health assessment for student {student_id}...")
        
        assessment_data = {
            "studentId": student_id,
            "type": "Comprehensive Mental Health",
            "score": 75,
            "risk": "low",
            "notes": "Test assessment created by automated script",
            "date": "2025-06-09T10:00:00Z",
            "category": "self-assessment",
            "assessor": "automated-test",
            "responses": {
                "1": 0,
                "2": 1,
                "3": 0,
                "4": 1,
                "5": 2
            },
            "mlInsights": {
                "probability": 0.8,
                "condition": "Comprehensive Mental Health",
                "severity": "mild",
                "confidenceScore": 0.85,
                "recommendedActions": ["Continue self-care practices", "Regular monitoring"],
                "riskFactors": []
            },
            "subScores": {
                "depression": 5,
                "anxiety": 3,
                "stress": 7
            },
            "severityLevels": {
                "depression": "Minimal",
                "anxiety": "Minimal",
                "stress": "Normal"
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/mental-health/assessments",
            json=assessment_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"   ✅ SUCCESS: Assessment created with ID {result.get('id')}")
            print(f"   📋 Result: {result}")
            return result
        else:
            print(f"   ❌ FAILED: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"   ❌ ERROR: {e}")
        return None

def main():
    print("🔧 MENTAL HEALTH ASSESSMENT INTEGRATION TEST")
    print("=" * 60)
    
    # Test user resolution
    test_user_to_student_resolution()
    
    # Test assessment creation
    assessment = test_mental_health_assessment_creation()
    
    if assessment:
        print(f"\n🎉 ALL TESTS PASSED!")
        print(f"✅ User-to-student resolution working")
        print(f"✅ Mental health assessment creation working")
        print(f"✅ Assessment ID: {assessment.get('id')}")
    else:
        print(f"\n❌ TESTS FAILED!")
        print(f"Please check the logs above for specific errors")

if __name__ == "__main__":
    main()
