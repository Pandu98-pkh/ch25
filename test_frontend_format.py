#!/usr/bin/env python3
"""
Test the exact format that frontend sends to backend
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_exact_frontend_format():
    """Test with the exact format that frontend sends"""
    print("🧪 TESTING EXACT FRONTEND FORMAT")
    print("=" * 50)
    
    # This is exactly what frontend service sends
    assessment_data = {
        "studentId": "1103220016",
        "type": "PHQ-9", 
        "score": 15,
        "risk": "moderate",
        "notes": "Frontend format test",
        "date": "2025-06-09T12:00:00Z",
        "category": "self-assessment",
        "assessor": "system",
        "responses": {
            "1": 2,
            "2": 1, 
            "3": 3,
            "4": 2,
            "5": 1,
            "6": 0,
            "7": 2,
            "8": 1,
            "9": 1
        },
        "recommendations": ["Monitor symptoms", "Consider follow-up"]
    }
    
    print("📤 Sending data:")
    print(json.dumps(assessment_data, indent=2))
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/mental-health/assessments",
            json=assessment_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print("✅ SUCCESS: Assessment created with frontend format")
            print("📋 Response:", json.dumps(result, indent=2))
            
            # Test retrieval
            print(f"\n🔍 Testing retrieval for student {assessment_data['studentId']}...")
            get_response = requests.get(f"{BASE_URL}/api/mental-health/assessments?studentId={assessment_data['studentId']}")
            
            if get_response.status_code == 200:
                assessments = get_response.json()
                print(f"✅ Retrieved {len(assessments.get('data', []))} assessments")
                if assessments.get('data'):
                    latest = assessments['data'][0]
                    print("📋 Latest assessment:")
                    print(f"   ID: {latest.get('id')}")
                    print(f"   Type: {latest.get('type')}")
                    print(f"   Score: {latest.get('score')}")
                    print(f"   Risk: {latest.get('risk')}")
                    print(f"   Student ID: {latest.get('studentId')}")
            else:
                print(f"❌ Retrieval failed: {get_response.status_code}")
                print(f"❌ Error: {get_response.text}")
            
        else:
            print("❌ FAILED: Assessment creation failed")
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_exact_frontend_format()
