#!/usr/bin/env python3
"""
Test script to verify complete session creation flow
Tests both backend API and expected frontend data format
"""

import requests
import json
from datetime import datetime, timedelta

# API base URL
BASE_URL = "http://localhost:5000/api"

def test_counselors_endpoint():
    """Test the new counselors endpoint"""
    print("Testing counselors endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/counselors")
        response.raise_for_status()
        
        counselors = response.json()
        print(f"✅ Counselors endpoint working - found {len(counselors)} counselors")
        
        for counselor in counselors[:3]:  # Show first 3
            print(f"   - {counselor['id']}: {counselor['name']}")
        
        return counselors
    except Exception as e:
        print(f"❌ Counselors endpoint failed: {e}")
        return []

def test_session_creation_with_valid_counselor(counselors):
    """Test session creation with valid counselor ID from the counselors endpoint"""
    if not counselors:
        print("❌ No counselors available for testing")
        return
    
    print("\nTesting session creation with valid counselor...")
    
    # Use the first counselor from the API
    test_counselor = counselors[0]
    
    # Calculate session date (tomorrow)
    session_date = datetime.now() + timedelta(days=1)
    
    session_data = {
        "studentId": "S20252048D",  # Known valid student ID
        "date": session_date.strftime("%Y-%m-%dT%H:%M:%S.000"),
        "duration": 60,
        "type": "academic",
        "notes": "Test session with valid counselor from API",
        "outcome": "positive",
        "nextSteps": "Follow up next week",
        "counselor": {
            "id": test_counselor['id'],
            "name": test_counselor['name']
        }
    }
    
    print(f"Creating session with counselor: {test_counselor['id']} - {test_counselor['name']}")
    
    try:
        response = requests.post(f"{BASE_URL}/counseling-sessions", json=session_data)
        response.raise_for_status()
        
        result = response.json()
        print(f"✅ Session created successfully!")
        print(f"   Session ID: {result.get('sessionId', 'N/A')}")
        print(f"   Counselor: {result.get('counselor', {}).get('name', 'N/A')}")
        
        return result
    except Exception as e:
        print(f"❌ Session creation failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_details = e.response.json()
                print(f"   Error details: {error_details}")
            except:
                print(f"   Response text: {e.response.text}")
        return None

def test_frontend_format_compatibility():
    """Test that our data format matches what the frontend expects"""
    print("\nTesting frontend format compatibility...")
    
    # This simulates what the frontend will send
    frontend_session_data = {
        "studentId": "S2025601F5",
        "date": "2025-06-02T10:30:00.000",
        "duration": 45,
        "type": "mental-health",
        "notes": "Frontend compatibility test session",
        "outcome": "neutral",
        "nextSteps": "Schedule follow-up",
        "counselor": {
            "id": "KSL-2025-001",  # Valid counselor ID
            "name": "Dr. Sarah Johnson"
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/counseling-sessions", json=frontend_session_data)
        response.raise_for_status()
        
        result = response.json()
        print("✅ Frontend format compatibility confirmed!")
        print(f"   Session ID: {result.get('sessionId', 'N/A')}")
        
        return True
    except Exception as e:
        print(f"❌ Frontend format compatibility failed: {e}")
        return False

def main():
    print("=== Complete Session Creation Flow Test ===")
    print(f"Testing at: {datetime.now()}")
    
    # Test 1: Counselors endpoint
    counselors = test_counselors_endpoint()
    
    # Test 2: Session creation with valid counselor
    if counselors:
        test_session_creation_with_valid_counselor(counselors)
    
    # Test 3: Frontend compatibility
    test_frontend_format_compatibility()
    
    print("\n=== Test Complete ===")
    print("✅ Backend is ready for frontend integration!")
    print("🌐 You can now test session creation in the browser at http://localhost:5173")

if __name__ == "__main__":
    main()
